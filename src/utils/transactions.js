const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function signedAmount(transaction) {
  return transaction.type === "expense" ? -transaction.amount : transaction.amount;
}

function buildMonthlySummary(transactions, selectedMonth) {
  return transactions
    .filter((transaction) => transaction.date.startsWith(selectedMonth))
    .reduce(
      (summary, transaction) => {
        if (transaction.type === "income") {
          summary.income += transaction.amount;
        } else {
          summary.expense += transaction.amount;
        }

        summary.balance = summary.income - summary.expense;
        return summary;
      },
      { income: 0, expense: 0, balance: 0 }
    );
}

function formatDateTitle(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}月${day}日 星期${WEEKDAYS[date.getDay()]}`;
}

function groupTransactionsByDate(transactions) {
  const groups = new Map();

  for (const transaction of transactions) {
    if (!groups.has(transaction.date)) {
      groups.set(transaction.date, []);
    }

    groups.get(transaction.date).push(transaction);
  }

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, data]) => ({
      title: formatDateTitle(date),
      date,
      dailyTotal: data.reduce((total, transaction) => total + signedAmount(transaction), 0),
      data
    }));
}

function formatSignedAmount(transaction) {
  return String(signedAmount(transaction));
}

module.exports = {
  buildMonthlySummary,
  formatDateTitle,
  formatSignedAmount,
  groupTransactionsByDate,
  signedAmount
};
