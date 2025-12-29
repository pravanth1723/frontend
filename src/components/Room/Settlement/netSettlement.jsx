export function netSettlement(finalBalance) {
  const creditors = [];
  const debtors = [];

  Object.entries(finalBalance).forEach(([user, bal]) => {
    if (bal < 0) creditors.push({ user, amount: -bal });
    if (bal > 0) debtors.push({ user, amount: bal });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result = [];
  let c = 0;

  for (const debtor of debtors) {
    let remaining = debtor.amount;

    while (remaining > 0 && c < creditors.length) {
      const pay = Math.min(remaining, creditors[c].amount);

      result.push({
        from: debtor.user,
        to: creditors[c].user,
        amount: pay,
      });

      remaining -= pay;
      creditors[c].amount -= pay;

      if (creditors[c].amount === 0) c++;
    }
  }

  return result;
}
