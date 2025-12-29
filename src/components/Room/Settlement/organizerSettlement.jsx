export function organizerSettlement(finalBalance, organizer) {
  const settlements = [];

  Object.entries(finalBalance).forEach(([user, bal]) => {
    if (user === organizer || bal === 0) return;

    if (bal > 0) {
      settlements.push({
        from: user,
        to: organizer,
        amount: bal,
      });
    } else {
      settlements.push({
        from: organizer,
        to: user,
        amount: Math.abs(bal),
      });
    }
  });

  return settlements;
}
