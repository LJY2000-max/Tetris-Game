# Tetris Game - 俄羅斯方塊遊戲

一個使用 Next.js、React 和 TypeScript 開發的經典俄羅斯方塊遊戲。

## 🎮 遊戲特色

- **經典玩法**：實現了俄羅斯方塊的經典遊戲機制
- **7-Bag 系統**：使用公平的隨機方塊生成系統，每 7 個方塊為一包，確保每包都包含所有 7 種方塊各一次
- **幽靈方塊**：半透明預覽顯示方塊的落下位置
- **牆踢機制**：智能旋轉系統，允許方塊在邊界附近旋轉
- **連擊系統（Combo）**：連續消除可獲得額外分數
- **等級系統**：隨著消除行數增加，遊戲速度會加快
- **響應式設計**：支援不同螢幕尺寸

## 🎯 遊戲規則

- 消除 1 行：1 分
- 消除 2 行：2 分
- 消除 3 行：3 分
- 消除 4 行（Tetris）：4 分
- 連擊獎勵：根據連擊數額外加分
- 每消除 10 行，等級提升 1 級，方塊下落速度加快

## 🕹️ 操作說明

| 按鍵 | 功能 |
|------|------|
| ← | 向左移動 |
| → | 向右移動 |
| ↓ | 軟降（加速下降）|
| ↑ / X | 順時針旋轉 |
| Z | 逆時針旋轉 |
| 空白鍵 | 硬降（直接落下）|
| ESC | 暫停/繼續 |

## 📦 技術棧

- **框架**：Next.js 14
- **語言**：TypeScript
- **UI**：React、Tailwind CSS
- **狀態管理**：React Hooks (useState, useEffect, useCallback)

## 🚀 安裝與運行

### 前置需求

- Node.js 16.x 或更高版本
- npm 或 yarn

### 安裝步驟

1. **Clone 專案**（如果是從 Git 倉庫）
```bash
git clone <your-repository-url>
cd <project-directory>
```

2. **安裝依賴**
```bash
npm install
```

### 開發模式
!!開發模式會導致遊戲發生異常，請用生產模式運行遊戲!!
如果你想在開發環境中運行（支援熱重載）：

```bash
npm run dev
```

然後在瀏覽器中打開 [http://localhost:3000](http://localhost:3000)

### 生產模式（推薦）

要以生產模式運行遊戲：

1. **構建專案**
```bash
npm run build
```

2. **啟動伺服器**
```bash
npm run start
```

3. **打開遊戲**

構建完成後，終端會顯示類似以下訊息：
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

在瀏覽器中打開顯示的網址（通常是 `http://localhost:3000`）即可開始遊戲！

## 📁 專案結構

```
src/
├── app/
│   ├── components/
│   │   ├── TetrisGame.tsx    # 主遊戲組件
│   │   ├── GameBoard.tsx     # 遊戲板組件
│   │   └── GameInfo.tsx      # 遊戲資訊面板
│   ├── hooks/
│   │   └── useTetris.ts      # 遊戲邏輯 Hook
│   ├── types/
│   │   └── tetris.ts         # TypeScript 型別定義
│   ├── utils/
│   │   └── tetris.ts         # 遊戲工具函數
│   ├── layout.tsx
│   └── page.tsx
```

## 🎨 核心功能實現

### 方塊生成系統
- 使用 7-Bag 隨機演算法，確保遊戲公平性
- 每包包含所有 7 種方塊（I、O、T、S、Z、J、L）各一個

### 旋轉系統
- 支援順時針和逆時針旋轉
- 實現牆踢（Wall Kick）機制，允許在邊界附近智能旋轉
- 每個方塊有 4 個旋轉狀態

### 計分系統
- 基礎消除分數
- 連擊獎勵機制
- 等級系統影響遊戲速度

## 🐛 已知問題

如果遇到任何問題，請確保：
1. Node.js 版本符合要求
2. 所有依賴都已正確安裝
3. 沒有其他服務佔用 3000 端口

## 📝 開發說明

### 修改端口

如果需要修改預設端口，可以在啟動時指定：

```bash
# 開發模式
npm run dev -- -p 3001

# 生產模式
PORT=3001 npm run start
```

### 自訂配置

可以修改 `src/types/tetris.ts` 中的常數來調整遊戲參數：
- `BOARD_WIDTH`：遊戲板寬度
- `BOARD_HEIGHT`：遊戲板高度
- `CLEAR_POINTS`：消除分數設定
- `COMBO_POINTS`：連擊分數設定

## 📄 授權

本專案為教育和娛樂目的開發。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📧 聯絡方式

如有問題或建議，請通過以下方式聯絡：
- 建立 Issue
- 提交 Pull Request

---

**享受遊戲！Have fun! 🎮**