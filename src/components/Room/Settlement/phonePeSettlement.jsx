/**
 * True PhonePe-style settlement
 * - Settles EACH expense independently
 * - No global netting
 * - Produces many small payer → receiver transfers
 */
export function phonePeSettlement(expenses) {
  const settlements = [];

  expenses.forEach((expense) => {
    const payers = expense.spentBy;
    const beneficiaries = expense.spentFor;

    beneficiaries.forEach((beneficiary) => {
      payers.forEach((payer) => {
        // Skip self payments
        if (beneficiary.name === payer.name) return;

        // Calculate proportional amount
        // beneficiary.amount = what this person owes for this expense
        // payer.amount = what this payer paid
        const totalPaid = payers.reduce(
          (sum, p) => sum + p.amount,
          0
        );

        const shareRatio = payer.amount / totalPaid;
        const amountToPay = beneficiary.amount * shareRatio;

        if (amountToPay > 0) {
          settlements.push({
            from: beneficiary.name,
            to: payer.name,
            amount: Number(amountToPay.toFixed(2)),
            expense: expense.description,
          });
        }
      });
    });
  });

  return settlements;
}
