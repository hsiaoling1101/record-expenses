const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

const {
  buildMonthlySummary,
  formatSignedAmount,
  groupTransactionsByDate
} = require("./transactions.js");

const sampleTransactions = [
  {
    id: "t1",
    date: "2026-05-20",
    type: "expense",
    amount: 100,
    category: "餐飲",
    note: "鹹水雞"
  },
  {
    id: "t2",
    date: "2026-05-20",
    type: "expense",
    amount: 45,
    category: "飲料",
    note: "珍珠青茶"
  },
  {
    id: "t3",
    date: "2026-05-21",
    type: "income",
    amount: 1200,
    category: "兼職",
    note: "翻譯"
  },
  {
    id: "t4",
    date: "2026-05-18",
    type: "expense",
    amount: 30,
    category: "零食",
    note: "起酥蛋糕"
  }
];

describe("buildMonthlySummary", () => {
  test("sums income and expense separately for the selected month", () => {
    assert.deepEqual(buildMonthlySummary(sampleTransactions, "2026-05"), {
      income: 1200,
      expense: 175,
      balance: 1025
    });
  });
});

describe("groupTransactionsByDate", () => {
  test("groups records by date for SectionList rendering", () => {
    const sections = groupTransactionsByDate(sampleTransactions);

    assert.deepEqual(sections, [
      {
        title: "05月21日 星期四",
        date: "2026-05-21",
        dailyTotal: 1200,
        data: [sampleTransactions[2]]
      },
      {
        title: "05月20日 星期三",
        date: "2026-05-20",
        dailyTotal: -145,
        data: [sampleTransactions[0], sampleTransactions[1]]
      },
      {
        title: "05月18日 星期一",
        date: "2026-05-18",
        dailyTotal: -30,
        data: [sampleTransactions[3]]
      }
    ]);
  });
});

describe("formatSignedAmount", () => {
  test("keeps income positive and displays expense with a minus sign", () => {
    assert.equal(formatSignedAmount({ type: "income", amount: 1200 }), "1200");
    assert.equal(formatSignedAmount({ type: "expense", amount: 45 }), "-45");
  });
});
