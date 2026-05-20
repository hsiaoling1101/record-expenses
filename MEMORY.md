# MEMORY.md

## 專案記憶

### 2026-05-21
- 建立專案基礎記憶檔。
- 目前資料夾內已有 `AGENTS.md`，用來規範 AI 助手的回覆語言、任務流程與安全守則。
- 新增 `MEMORY.md`，用來記錄每日進度、重要決策與待辦事項。
- 新增 `STRUCTURE.md`，用來維護目前資料夾的檔案結構地圖。
- 已建立 React Native (Expo) 記帳 APP 第一版骨架，包含 `App.js`、Expo 設定檔、SQLite mock data 初始化、首頁 UI 與交易資料計算工具。
- 已新增 `src/utils/transactions.test.js`，使用 Node 內建測試工具驗證收入 / 支出總和、日期分組與支出負號顯示。
- 因 Google 雲端硬碟中文路徑會造成 `npm install` 解壓 React Native 依賴時逾時或寫入錯誤，決定將正式開發路徑改為 `D:\VibeCodingProjects\record-expenses`。
- GitHub repository 定為 `https://github.com/hsiaoling1101/record-expenses.git`，之後以 GitHub pull / commit / push 取代 Google Drive 同步開發資料夾。
- 已將專案複製到 `D:\VibeCodingProjects\record-expenses`。在清除損壞的 npm 快取後，`npm install --prefer-online` 成功，並產生 `package-lock.json`。

## 目前狀態
- 專案已有 Expo / React Native MVP 骨架。
- 第一版主畫面包含頂部月份與收支統計、快捷功能列、依日期分組的交易列表、底部導覽列與中央新增按鈕。
- 本地 SQLite 表格 `Transactions` 已在 `App.js` 中定義，啟動時會寫入 5 筆 mock data。
- 資料計算測試已通過；Expo 依賴已可在本機 D 槽正式路徑完成安裝。

## 待辦事項
- 確認 Git 可用並設定 GitHub remote。
- 啟動 Expo，使用手機 Expo Go 驗證首頁畫面。
- 下一階段規劃點擊中央 `+` 後的分類與金額輸入介面。
- 每次工作結束或總結進度時，依照 `AGENTS.md` 要求更新此檔案。
