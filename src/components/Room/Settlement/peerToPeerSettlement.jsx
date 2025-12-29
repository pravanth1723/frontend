export function peerToPeerSettlement(expenses) {
  const rawTransfers = [];

  /* ---------------- Step 1: Expense-wise transfers ---------------- */

  expenses.forEach((expense) => {
    const payers = expense.spentBy || [];
    const beneficiaries = expense.spentFor || [];

    if (!payers.length || !beneficiaries.length) return;

    const totalPaid = payers.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid === 0) return;

    beneficiaries.forEach((beneficiary) => {
      payers.forEach((payer) => {
        // Skip self-payment
        if (beneficiary.name === payer.name) return;

        const shareRatio = payer.amount / totalPaid;
        const amountToPay = beneficiary.amount * shareRatio;

        if (amountToPay > 0) {
          rawTransfers.push({
            from: beneficiary.name,
            to: payer.name,
            amount: amountToPay,
          });
        }
      });
    });
  });

  /* ---------------- Step 2: Aggregate per (from -> to) ---------------- */

  const pairMap = {};

  rawTransfers.forEach(({ from, to, amount }) => {
    const key = `${from}→${to}`;
    if (!pairMap[key]) {
      pairMap[key] = { from, to, amount: 0 };
    }
    pairMap[key].amount += amount;
  });

  /* ---------------- Step 3: Net bidirectional payments ---------------- */

  const finalMap = {};
  const visited = new Set();

  Object.values(pairMap).forEach(({ from, to, amount }) => {
    const forwardKey = `${from}→${to}`;
    const reverseKey = `${to}→${from}`;

    if (visited.has(forwardKey)) return;

    const reverse = pairMap[reverseKey];

    if (reverse) {
      const net = amount - reverse.amount;

      if (net > 0) {
        finalMap[forwardKey] = {
          from,
          to,
          amount: Number(net.toFixed(2)),
        };
      } else if (net < 0) {
        finalMap[reverseKey] = {
          from: to,
          to: from,
          amount: Number(Math.abs(net).toFixed(2)),
        };
      }

      visited.add(forwardKey);
      visited.add(reverseKey);
    } else {
      finalMap[forwardKey] = {
        from,
        to,
        amount: Number(amount.toFixed(2)),
      };
      visited.add(forwardKey);
    }
  });

  /* ---------------- Step 4: Return normalized list ---------------- */

  return Object.values(finalMap);
}
