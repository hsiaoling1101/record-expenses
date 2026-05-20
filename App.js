import { StatusBar } from "expo-status-bar";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const {
  buildMonthlySummary,
  formatSignedAmount,
  groupTransactionsByDate
} = require("./src/utils/transactions");

const MOCK_TRANSACTIONS = [
  {
    id: "mock-20260520-001",
    date: "2026-05-20",
    type: "expense",
    amount: 100,
    category: "餐飲",
    note: "鹹水雞"
  },
  {
    id: "mock-20260520-002",
    date: "2026-05-20",
    type: "expense",
    amount: 45,
    category: "飲料",
    note: "珍珠青茶"
  },
  {
    id: "mock-20260520-003",
    date: "2026-05-20",
    type: "expense",
    amount: 30,
    category: "零食",
    note: "起酥蛋糕"
  },
  {
    id: "mock-20260521-001",
    date: "2026-05-21",
    type: "income",
    amount: 1200,
    category: "兼職",
    note: "翻譯案"
  },
  {
    id: "mock-20260518-001",
    date: "2026-05-18",
    type: "expense",
    amount: 553,
    category: "購物",
    note: "生活用品"
  }
];

const QUICK_ACTIONS = [
  { label: "帳單", icon: "▤" },
  { label: "預算", icon: "◎" },
  { label: "資產", icon: "◇" },
  { label: "發票", icon: "▣" },
  { label: "匯率", icon: "$" }
];

const NAV_ITEMS = [
  { label: "明細", icon: "☰" },
  { label: "圖表", icon: "↗" },
  { label: "發現", icon: "○" },
  { label: "我的", icon: "♙" }
];

const CATEGORY_ICONS = {
  餐飲: "🍽",
  飲料: "☕",
  零食: "♡",
  購物: "▢",
  兼職: "¥"
};

function getSelectedMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthTitle(selectedMonth) {
  const [year, month] = selectedMonth.split("-");
  return `${year}年 ${month}月 ▾`;
}

function formatMoney(amount) {
  return amount.toFixed(2);
}

function formatDailyTotal(amount) {
  if (amount === 0) {
    return "0";
  }

  return amount > 0 ? `+${amount}` : String(amount);
}

async function migrateDbIfNeeded(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS Transactions (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT
    );
  `);

  const row = await db.getFirstAsync("SELECT COUNT(*) AS count FROM Transactions");
  if (row?.count > 0) {
    return;
  }

  const statement = await db.prepareAsync(
    "INSERT INTO Transactions (id, date, type, amount, category, note) VALUES ($id, $date, $type, $amount, $category, $note)"
  );

  try {
    for (const transaction of MOCK_TRANSACTIONS) {
      await statement.executeAsync({
        $id: transaction.id,
        $date: transaction.date,
        $type: transaction.type,
        $amount: transaction.amount,
        $category: transaction.category,
        $note: transaction.note
      });
    }
  } finally {
    await statement.finalizeAsync();
  }
}

function ExpenseHome() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedMonth = getSelectedMonth();

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    const rows = await db.getAllAsync(
      "SELECT id, date, type, amount, category, note FROM Transactions ORDER BY date DESC, id ASC"
    );
    setTransactions(rows);
    setIsLoading(false);
  }, [db]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date.startsWith(selectedMonth)),
    [selectedMonth, transactions]
  );
  const summary = useMemo(
    () => buildMonthlySummary(monthTransactions, selectedMonth),
    [monthTransactions, selectedMonth]
  );
  const sections = useMemo(() => groupTransactionsByDate(monthTransactions), [monthTransactions]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{formatMonthTitle(selectedMonth)}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>收入</Text>
            <Text style={styles.summaryValue}>{formatMoney(summary.income)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>支出</Text>
            <Text style={styles.summaryValue}>{formatMoney(summary.expense)}</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionList}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickAction}>
              <View style={styles.quickIcon}>
                <Text style={styles.quickIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#df7f80" />
          <Text style={styles.loadingText}>讀取帳單中</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionTotal}>結餘 {formatDailyTotal(section.dailyTotal)}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryIconText}>{CATEGORY_ICONS[item.category] || "•"}</Text>
              </View>
              <View style={styles.transactionTextWrap}>
                <Text style={styles.transactionTitle}>{item.note || item.category}</Text>
                <Text style={styles.transactionCategory}>{item.category}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  item.type === "income" && styles.incomeAmount
                ]}
              >
                {formatSignedAmount(item)}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.navItem, index === 1 && styles.navItemBeforeCenter]}
          >
            <Text style={[styles.navIcon, index === 0 && styles.activeNavIcon]}>{item.icon}</Text>
            <Text style={[styles.navLabel, index === 0 && styles.activeNavLabel]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} activeOpacity={0.82}>
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SQLiteProvider databaseName="record-expenses.db" onInit={migrateDbIfNeeded}>
      <ExpenseHome />
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6f8"
  },
  header: {
    backgroundColor: "#fff0dc",
    paddingHorizontal: 22,
    paddingBottom: 18,
    paddingTop: 16
  },
  monthTitle: {
    color: "#272527",
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center"
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18
  },
  summaryItem: {
    alignItems: "center",
    minWidth: 120
  },
  summaryDivider: {
    backgroundColor: "rgba(42, 38, 36, 0.18)",
    height: 34,
    width: 1
  },
  summaryLabel: {
    color: "#77716e",
    fontSize: 14
  },
  summaryValue: {
    color: "#2f2b2b",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 6
  },
  quickActionList: {
    gap: 14,
    paddingRight: 22,
    paddingTop: 20
  },
  quickAction: {
    alignItems: "center",
    width: 72
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  quickIconText: {
    color: "#3e3a3a",
    fontSize: 23,
    fontWeight: "700"
  },
  quickLabel: {
    color: "#5d5654",
    fontSize: 13,
    marginTop: 8
  },
  loadingWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  loadingText: {
    color: "#8a8584",
    marginTop: 10
  },
  listContent: {
    paddingBottom: 118
  },
  sectionHeader: {
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 10,
    paddingTop: 18
  },
  sectionTitle: {
    color: "#2c2929",
    fontSize: 17,
    fontWeight: "700"
  },
  sectionTotal: {
    color: "#8b8583",
    fontSize: 14
  },
  transactionItem: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomColor: "#f0eeee",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 22
  },
  categoryIcon: {
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  categoryIconText: {
    color: "#403d3d",
    fontSize: 21
  },
  transactionTextWrap: {
    flex: 1,
    marginLeft: 14
  },
  transactionTitle: {
    color: "#2e2b2b",
    fontSize: 17,
    fontWeight: "600"
  },
  transactionCategory: {
    color: "#9b9694",
    fontSize: 13,
    marginTop: 4
  },
  transactionAmount: {
    color: "#333030",
    fontSize: 20,
    fontWeight: "500"
  },
  incomeAmount: {
    color: "#418a64"
  },
  bottomNav: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopColor: "#ededed",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    height: 78,
    justifyContent: "space-around",
    left: 0,
    paddingBottom: 8,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0
  },
  navItem: {
    alignItems: "center",
    flex: 1
  },
  navItemBeforeCenter: {
    marginRight: 72
  },
  navIcon: {
    color: "#7f7a78",
    fontSize: 25
  },
  activeNavIcon: {
    color: "#df7f80"
  },
  navLabel: {
    color: "#817c7a",
    fontSize: 12,
    marginTop: 3
  },
  activeNavLabel: {
    color: "#312d2d",
    fontWeight: "700"
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#df7f80",
    borderColor: "#ffffff",
    borderRadius: 38,
    borderWidth: 6,
    bottom: 36,
    height: 76,
    justifyContent: "center",
    left: "50%",
    marginLeft: -38,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    width: 76
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 42,
    lineHeight: 48
  }
});
