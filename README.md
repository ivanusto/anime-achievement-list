# 動漫領域解鎖成就清單 | Anime Achievement Checklist

一個結合 **動漫成就系統**、**御宅霓虹暗色風格** 與 **本機隱私保護** 的個人二次元宅力足跡打卡與分享圖卡生成網頁。專為動漫愛好者、補番狂熱者與聖地巡禮者量身打造！

🔗 **線上網址**: [https://ivanusto.github.io/anime-achievement-list/](https://ivanusto.github.io/anime-achievement-list/) 

本系統完全部署於雲端/瀏覽器端，玩家無需安裝任何程式或下載檔案，即可直接在瀏覽器中完成所有的打卡記錄，解鎖您的二次元生涯成就。

---

## 🌟 核心特色

1. **Dashboard 統計看板與宅力稱號**: 即時計算您的解鎖百分比與累計成就數，評估您的御宅等級（每 10 個成就為 1 級），並動態授予 7 大稱號（例如：`🌱 動漫新鮮人`、`📖 輕小說玩家`、`🗡️ 奇幻冒險者`、`🌀 領域展開大師`、`👑 傳奇大漫導士`）。
2. **105 項精心設計的動漫成就資料庫**: 包含 Beginner ★☆☆☆☆ 到 Legendary ★★★★★ 五大難度，劃分為：
   - **🎬 經典神作與觀影里程碑**（如 EVA、小圓、命運石之門等 25 項）
   - **🎒 宅活日常與信仰充值**（如自製痛包、痛車、購入等身抱枕等 25 項）
   - **⛩️ 聖地巡禮與地域探險**（20 項，分 L1-L5 級別的朝聖打卡）
   - **🎨 同人社群與二創魂**（如唱日文 KTV、擺攤、二創投稿等 15 項）
   - **👑 硬核修仙與究極宅度**（如日檢 N1 通過、千部斬等 20 項）
3. **🎯 攻略目標清單 (Targets / Wishlist)**：當您在清單中勾選「想挑戰」時，項目會自動亮起並收集至此頁面，作為您未來的追番與日本聖地群裡旅行朝聖計畫指南。
4. **🔮 命運卡牌 (Otaku Card Draw)**：透過 3D 翻轉卡片效果隨機抽取一項動漫任務或作品推薦，解決您的「補番選擇障礙」。
5. **💬 靈魂共鳴真心話 (Otaku Q&A)**：收錄了 20 題關於二次元回憶、聲優、神作、入坑作的真心話問題，適合自我反省或聚會時與同好深入談話。
6. **一鍵分享圖卡 (PNG)**：HTML5 Canvas 自動合成一張包含您的暱稱、代表頭像、等級、當前稱號、解鎖數據、最驕傲的想挑戰目標、與專屬二維碼 (QR Code) 的 800x1200 高解析度精美名片。
7. **🔐 100% 本地資料隱私保障**：無任何雲端資料庫上傳，數據安全加密存儲於瀏覽器 LocalStorage。
8. **備份與還原**：支援匯出與導入 Base64 加密的進度金鑰，方便跨裝置同步與永久保存。

---

## 🔗 成就系統系列連結

本專案與以下成就清單專案互為同系列，點擊連結前往解鎖您在其他領域的成就：

* 🌱 **[人生成就系統](https://ivanusto.github.io/life-achievement-list/)**
* 💻 **[開發者成就系統](https://ivanusto.github.io/developer-achievement-list/)**
* 🗺️ **[台灣旅行成就系統](https://ivanusto.github.io/taiwan-travel-achievement-list/)**
* 🗾 **[日本旅行成就系統](https://ivanusto.github.io/japan-travel-achievement-list/)**
* ✈️ **[地球旅行成就系統](https://ivanusto.github.io/travel-achievement-list/)**
* 💖 **[伴侶成就系統](https://ivanusto.github.io/couple-achievement-list/)**
* 🔞 **[伴侶親密成就清單](https://aura-intimacy-list.pages.dev/)**

---

## 🛠️ 技術實現

* **前端核心**: HTML5 / Vanilla CSS / Vanilla JavaScript (ES6)
* **圖卡繪製**: HTML5 Canvas API (動態高解析 Retina 縮放支援)
* **動畫與 3D 翻牌**: CSS 3D Transforms / `@keyframes`
* **QRcode 二維碼產生**: QRCode.js
* **資料庫結構**: 純靜態陣列 (achievements.js)

---

## 📄 授權條款

本專案基於 MIT 授權條款開源。
本專案靈感與架構源於 [developer-achievement-list](https://github.com/ivanusto/developer-achievement-list) 與 [single_male_sex_achievement_list](https://github.com/ivanusto/single_male_sex_achievement_list)。
