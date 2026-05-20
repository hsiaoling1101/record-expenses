# STRUCTURE.md

## 資料夾結構地圖

```text
record expenses/
├── .gitignore
├── AGENTS.md
├── App.js
├── MEMORY.md
├── STRUCTURE.md
├── app.json
├── babel.config.js
├── index.js
├── package-lock.json
├── package.json
└── src/
    └── utils/
        ├── transactions.js
        └── transactions.test.js
```

## 檔案說明

### 專案正式路徑
- 正式開發路徑：`D:\VibeCodingProjects\record-expenses`
- GitHub repository：`https://github.com/hsiaoling1101/record-expenses.git`
- Google 雲端硬碟中的舊資料夾只作為備份或參考，不作為 Expo / React Native 的正式開發位置。

### `AGENTS.md`
- AI 助手行為準則。
- 規定回答語言、溝通方式、任務安全守則、正式開發路徑，以及 GitHub pull / commit / push 同步流程。

### `.gitignore`
- Git 忽略規則。
- 避免 `node_modules/`、Expo 暫存資料與除錯 log 被提交。

### `MEMORY.md`
- 專案記憶檔。
- 用來記錄完成進度、重要決策、目前狀態與待辦事項。

### `STRUCTURE.md`
- 檔案結構地圖。
- 用來追蹤資料夾內有哪些檔案，以及每個檔案的用途。

### `package.json`
- Expo / React Native 專案設定。
- 定義啟動指令、測試指令，以及 `expo-sqlite` 等必要依賴。

### `package-lock.json`
- npm 依賴鎖定檔。
- 確保不同電腦執行 `npm install` 時安裝到一致的套件版本。

### `app.json`
- Expo APP 設定檔。
- 定義 APP 名稱、slug、版本、螢幕方向與平台基本設定。

### `babel.config.js`
- Expo 使用的 Babel 設定。
- 讓 React Native 程式碼可以被 Expo 正確轉譯。

### `index.js`
- React Native 入口檔。
- 負責將 `App.js` 註冊成 APP 根元件。

### `App.js`
- 記帳 APP 第一版主畫面。
- 使用 `expo-sqlite` 建立 `Transactions` 表格、寫入 mock data，並渲染首頁 Header、交易列表、底部導覽列與中央新增按鈕。

### `src/utils/transactions.js`
- 交易資料計算工具。
- 負責月收入 / 支出 / 結餘計算、依日期分組，以及金額正負號格式化。

### `src/utils/transactions.test.js`
- 交易資料計算測試。
- 使用 Node 內建測試工具驗證收入支出總和、日期分組、支出負號顯示邏輯。

## 維護規則
- 新增、移動或刪除檔案後，應同步更新此檔案。
- 若資料夾結構變複雜，需在地圖中加入子資料夾與重點檔案說明。

## 最近確認
- 2026-05-21：第一階段 MVP 實機驗證後確認檔案結構仍為最新，未新增或刪除正式檔案。
