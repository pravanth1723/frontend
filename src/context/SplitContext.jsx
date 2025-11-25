import React, { createContext, useContext, useState, useMemo } from "react";

/**
 * SplitContext - in-memory split data for a room session.
 * This provider is intended to be mounted when a user navigates into a room route.
 * When unmounted, all data is cleared (temporary/local variable behavior).
 *
 * Data model:
 *  - splitTitle: string
 *  - users: string[]
 *  - organizer: string
 *  - expenses: { id, title, users:[], spentBy:[{user,amount}] }[]
 */
const SplitContext = createContext(null);

export function SplitProvider({ children, initial = {} }) {
  const [splitTitle, setSplitTitle] = useState(initial.splitTitle || "");
  const [users, setUsers] = useState(initial.users || []);
  const [organizer, setOrganizer] = useState(initial.organizer || "");
  const [expenses, setExpenses] = useState(initial.expenses || []);

  function addExpense(exp) {
    const id = `e_${Date.now()}`;
    setExpenses((s) => [...s, { ...exp, id }]);
  }
  function updateExpense(id, updated) {
    setExpenses((s) => s.map(e => e.id === id ? { ...e, ...updated } : e));
  }
  function removeExpense(id) {
    setExpenses((s) => s.filter(e => e.id !== id));
  }
  function resetAll() {
    setSplitTitle("");
    setUsers([]);
    setOrganizer("");
    setExpenses([]);
  }

  // Derived calculations
  const calculations = useMemo(() => {
    // userPaidMap
    const userPaidMap = {};
    users.forEach(u => userPaidMap[u] = 0);
    expenses.forEach(exp => {
      (exp.spentBy || []).forEach(sb => {
        userPaidMap[sb.user] = (userPaidMap[sb.user] || 0) + Number(sb.amount || 0);
      });
    });
    // user share per person
    const userShare = {};
    users.forEach(u => userShare[u] = 0);
    expenses.forEach(exp => {
      const total = (exp.spentBy || []).reduce((s, b) => s + Number(b.amount || 0), 0);
      const n = Math.max(1, exp.users.length);
      const per = total / n;
      exp.users.forEach(u => {
        userShare[u] = (userShare[u] || 0) + per;
      });
    });
    const userOwes = {};
    users.forEach(u => userOwes[u] = (userShare[u] || 0) - (userPaidMap[u] || 0));

    return { userPaidMap, userShare, userOwes };
  }, [users, expenses]);

  return (
    <SplitContext.Provider value={{
      splitTitle, setSplitTitle,
      users, setUsers,
      organizer, setOrganizer,
      expenses, addExpense, updateExpense, removeExpense,
      resetAll,
      calculations
    }}>
      {children}
    </SplitContext.Provider>
  );
}

export function useSplit() {
  return useContext(SplitContext);
}