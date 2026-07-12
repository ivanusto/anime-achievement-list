// OTAKU | 動漫解鎖成就清單 - 核心互動與邏輯
document.addEventListener("DOMContentLoaded", () => {
  // --- 狀態變數 ---
  let userChoices = {
    pa: {}, // 解鎖狀態: { achievementId: 'unlocked' | 'want' | 'locked' }
    nickname: "無名宅宅",
    avatar: "🧙‍♀️"
  };

  const STORAGE_KEY = "otaku_achievement_choices_v1";
  let activeTab = "achievements";
  let activeCategory = "all";
  let activeStatusFilter = "all";
  let searchQuery = "";

  // --- 粒子特效引擎 (慶祝動畫) ---
  const canvas = document.getElementById("sparkleCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 6 + 4;
      this.speedX = Math.random() * 8 - 4;
      this.speedY = Math.random() * -8 - 3;
      this.gravity = 0.2;
      this.color = color;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.alpha -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      // Draw stars or circles
      if (Math.random() > 0.5) {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      } else {
        // Draw standard small diamond star
        const r = this.size;
        ctx.moveTo(this.x, this.y - r);
        ctx.lineTo(this.x + r/2, this.y);
        ctx.lineTo(this.x, this.y + r);
        ctx.lineTo(this.x - r/2, this.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function triggerSparkles() {
    const colors = ["#ff2a5f", "#a855f7", "#00e5ff", "#f59e0b", "#10b981", "#ffffff"];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 80; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new Particle(centerX, centerY, color));
    }
    animateParticles();
  }

  let animationId;
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animateParticles);
    } else {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // --- 本地資料存取 ---
  function loadLocalData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.pa) {
          userChoices = parsed;
          // Fallbacks for profile
          if (!userChoices.nickname) userChoices.nickname = "無名宅宅";
          if (!userChoices.avatar) userChoices.avatar = "🧙‍♀️";
        }
      } catch (e) {
        console.error("讀取本地進度失敗:", e);
      }
    }
    syncProfileUI();
  }

  function saveLocalData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userChoices));
    calculateProgress();
  }

  function syncProfileUI() {
    // Sync Nickname Input
    const nameInput = document.getElementById("nicknameInput");
    if (nameInput) nameInput.value = userChoices.nickname;

    // Sync Avatar Buttons
    const avatarBtns = document.querySelectorAll(".avatar-btn");
    avatarBtns.forEach(btn => {
      if (btn.innerText === userChoices.avatar) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  // --- Toast 提示訊息系統 ---
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  let toastTimeout;

  function showToast(message, isCelebration = false) {
    clearTimeout(toastTimeout);
    toastText.innerText = message;
    
    if (isCelebration) {
      toast.className = "toast show match-toast";
      toast.querySelector("i").className = "bx bxs-star-half";
      triggerSparkles();
    } else {
      toast.className = "toast show";
      toast.querySelector("i").className = "bx bx-info-circle";
    }

    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, isCelebration ? 4000 : 2500);
  }

  // --- 分頁導覽切換 ---
  const navItems = document.querySelectorAll(".nav-item");
  const tabs = document.querySelectorAll(".tab-content");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.dataset.tab;
      
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      tabs.forEach(tab => {
        tab.classList.remove("active");
        if (tab.id === `${targetTab}Tab`) {
          tab.classList.add("active");
        }
      });

      activeTab = targetTab;
      
      if (activeTab === "matcher") {
        renderMatchedGrid();
      } else if (activeTab === "achievements") {
        renderAchievements();
      }
    });
  });

  // --- 動態渲染分類篩選按鈕 ---
  function renderCategoryFilters() {
    const container = document.getElementById("categoryFilterContainer");
    container.innerHTML = `
      <button class="filter-btn active" data-category="all">
        <i class="bx bx-grid-alt"></i> 全部領域
      </button>
    `;

    window.animeData.categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.category = cat.id;
      btn.innerHTML = `${cat.icon} ${cat.name.split(' (')[0]}`;
      container.appendChild(btn);
    });

    // 點擊事件
    const filterBtns = container.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.category;
        renderAchievements();
      });
    });
  }

  // 狀態篩選 Tabs
  const statusBtns = document.querySelectorAll(".status-btn");
  statusBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      statusBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeStatusFilter = btn.dataset.filter;
      renderAchievements();
    });
  });

  // 搜尋框輸入事件
  const searchBar = document.getElementById("searchBar");
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderAchievements();
    });
  }

  // --- 渲染成就卡片網格 ---
  const achievementsGrid = document.getElementById("achievementsGrid");

  function renderAchievements() {
    achievementsGrid.innerHTML = "";
    let filteredList = window.animeData.achievements;

    // 1. 分類篩選
    if (activeCategory !== "all") {
      filteredList = filteredList.filter(item => item.category === activeCategory);
    }

    // 2. 狀態篩選
    if (activeStatusFilter !== "all") {
      filteredList = filteredList.filter(item => {
        const state = userChoices.pa[item.id] || "locked";
        return state === activeStatusFilter;
      });
    }

    // 3. 搜尋篩選
    if (searchQuery !== "") {
      filteredList = filteredList.filter(item => {
        return item.title.toLowerCase().includes(searchQuery) || 
               item.description.toLowerCase().includes(searchQuery) ||
               (item.tips && item.tips.toLowerCase().includes(searchQuery));
      });
    }

    if (filteredList.length === 0) {
      achievementsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <i class="bx bx-ghost" style="font-size: 3.5rem; margin-bottom: 0.5rem; display: block; color: var(--text-muted);"></i>
          沒有符合篩選條件的成就項目
        </div>`;
      return;
    }

    filteredList.forEach(item => {
      const card = document.createElement("div");
      card.className = "glass-panel achievement-card";
      
      const state = userChoices.pa[item.id] || "locked";
      if (state === "unlocked") {
        card.classList.add("matched");
      } else if (state === "want") {
        card.classList.add("want-to-try");
      }

      const catObj = window.animeData.categories.find(c => c.id === item.category);

      card.innerHTML = `
        ${state === "unlocked" ? `<div class="match-badge unlocked">已解鎖 🔓</div>` : (state === "want" ? `<div class="match-badge want">想挑戰 💖</div>` : "")}
        <div class="card-top">
          <span class="category-tag">${catObj ? catObj.icon : ""} ${catObj ? catObj.name.split(' (')[0] : ""}</span>
          <span class="difficulty-tag">${item.difficulty}</span>
        </div>
        <div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc" id="desc-${item.id}">${item.description}</p>
          <div class="card-tips-content" id="tips-${item.id}">${item.tips}</div>
          <button class="card-tips-toggle" id="toggle-${item.id}"><i class="bx bx-bulb"></i> 點擊查看御宅秘訣</button>
        </div>
        <div class="card-actions">
          <div class="couple-controls">
            <div class="action-select-wrapper">
              <button class="state-btn ${state === 'unlocked' ? 'active-unlocked' : ''}" data-state="unlocked" title="標記為已解鎖"><i class="bx bx-check-circle"></i> 已解鎖</button>
              <button class="state-btn ${state === 'want' ? 'active-want' : ''}" data-state="want" title="標記為想挑戰"><i class="bx bx-heart"></i> 想挑戰</button>
            </div>
          </div>
        </div>
      `;

      // 秘訣展開收合
      const toggleBtn = card.querySelector(`#toggle-${item.id}`);
      const tipsDiv = card.querySelector(`#tips-${item.id}`);
      const descP = card.querySelector(`#desc-${item.id}`);
      
      toggleBtn.addEventListener("click", () => {
        if (tipsDiv.style.display === "block") {
          tipsDiv.style.display = "none";
          descP.style.display = "-webkit-box";
          toggleBtn.innerHTML = `<i class="bx bx-bulb"></i> 點擊查看御宅秘訣`;
        } else {
          tipsDiv.style.display = "block";
          descP.style.display = "none";
          toggleBtn.innerHTML = `<i class="bx bx-hide"></i> 隱藏秘訣`;
        }
      });

      // 點擊變更狀態按鈕
      const stateBtns = card.querySelectorAll(".state-btn");
      stateBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const targetState = btn.dataset.state;
          const currentVal = userChoices.pa[item.id] || "locked";
          
          let newVal;
          if (currentVal === targetState) {
            newVal = "locked"; // 重複點擊則取消
          } else {
            newVal = targetState;
          }

          userChoices.pa[item.id] = newVal;
          saveLocalData();

          if (newVal === "unlocked") {
            showToast(`🎉 恭喜！解鎖成就「${item.title}」`, true);
          } else {
            showToast(`已更新「${item.title}」狀態`);
          }

          renderAchievements();
        });
      });

      achievementsGrid.appendChild(card);
    });
  }

  // --- 渲染願望清單網格 (想要挑戰的項目) ---
  const matchedGrid = document.getElementById("matchedAchievementsGrid");
  const matcherIntro = document.getElementById("matcherIntro");

  function renderMatchedGrid() {
    matchedGrid.innerHTML = "";
    
    const matchedList = window.animeData.achievements.filter(item => {
      const state = userChoices.pa[item.id] || "locked";
      return state === "want";
    });

    if (matchedList.length === 0) {
      matcherIntro.style.display = "grid";
      matchedGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: 20px; border: 1px dashed var(--border-light);">
          <i class="bx bx-heart" style="font-size: 3.5rem; margin-bottom: 0.8rem; display: block; color: var(--primary-pink); animation: pulse-glow 2s infinite;"></i>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 700;">挑戰願望單空空如也</p>
          <p style="font-size: 0.88rem;">在清單挑戰中對想做的事情勾選「想挑戰」，它們就會亮起出現在這，成為你的日常攻略目標！</p>
        </div>`;
      return;
    }

    matcherIntro.style.display = "none";

    matchedList.forEach(item => {
      const card = document.createElement("div");
      card.className = "glass-panel achievement-card want-to-try";
      const catObj = window.animeData.categories.find(c => c.id === item.category);

      card.innerHTML = `
        <div class="match-badge want" style="animation: pulse-glow 1.5s infinite;">想挑戰 💖</div>
        <div class="card-top">
          <span class="category-tag">${catObj ? catObj.icon : ""} ${catObj ? catObj.name.split(' (')[0] : ""}</span>
          <span class="difficulty-tag">${item.difficulty}</span>
        </div>
        <div>
          <h3 class="card-title" style="color: var(--primary-pink);">${item.title}</h3>
          <p class="card-desc" id="m-desc-${item.id}">${item.description}</p>
          <div class="card-tips-content" id="m-tips-${item.id}" style="display: block; margin-top: 1rem; height: auto; max-height: 100px;">
            <strong>💡 御宅攻略秘訣：</strong>${item.tips}
          </div>
        </div>
        <div class="card-actions" style="grid-template-columns: 1fr;">
          <button class="action-btn matched-complete-btn" style="background: linear-gradient(135deg, var(--primary-pink), var(--primary-violet)); border: none; color: #fff; padding: 0.7rem;" data-id="${item.id}">
            <i class="bx bx-check-double"></i> 標記為「已順利解鎖」
          </button>
        </div>
      `;

      card.querySelector(".matched-complete-btn").addEventListener("click", () => {
        userChoices.pa[item.id] = "unlocked";
        saveLocalData();
        showToast(`🎉 恭喜！解鎖成就「${item.title}」`, true);
        renderMatchedGrid();
      });

      matchedGrid.appendChild(card);
    });
  }

  // --- 等級與稱號稱呼系統 ---
  const milestones = [
    { count: 0, title: "動漫新鮮人", icon: "🌱", desc: "剛剛開看動漫的萌新，對各種經典名詞與經典作品充滿好奇。" },
    { count: 10, title: "輕小說玩家", icon: "📖", desc: "開始熱衷追當季新番，偶爾會買實體漫畫和輕小說信仰充值。" },
    { count: 20, title: "奇幻冒險者", icon: "🗡️", desc: "熟知各種動漫名梗，僅憑聲線就能認出著名日本配音聲優。" },
    { count: 40, title: "資深漫遊者", icon: "🎒", desc: "御宅資歷豐厚，開始嘗試線下二次元同人會場與經典地標參訪。" },
    { count: 60, title: "聖地巡禮狂熱者", icon: "⛩️", desc: "踏足多個動漫現地，在三次元裡完美重現二次元名景點的足跡。" },
    { count: 80, title: "領域展開大師", icon: "🌀", desc: "御宅界的絕對元老，動漫信仰已經深深融入了你日常生活點滴。" },
    { count: 100, title: "傳奇大漫導士", icon: "👑", desc: "究極宅魂的傳奇化身！閱片千部，信仰不滅，二次元的守護天神。" }
  ];

  const progressValA = document.getElementById("progressValA");
  const progressBarA = document.getElementById("progressBarA");
  const badgeIcon = document.getElementById("badgeIcon");
  const badgeTitle = document.getElementById("badgeTitle");
  const badgeDesc = document.getElementById("badgeDesc");

  function calculateProgress() {
    const total = window.animeData.achievements.length;
    if (total === 0) return;

    let unlockedCount = 0;
    window.animeData.achievements.forEach(item => {
      const state = userChoices.pa[item.id] || "locked";
      if (state === "unlocked") unlockedCount++;
    });

    const percent = Math.round((unlockedCount / total) * 100);

    progressValA.innerText = `${percent}% (${unlockedCount}/${total})`;
    progressBarA.style.width = `${percent}%`;

    // 更新稱號 Badge
    let activeMilestone = milestones[0];
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (unlockedCount >= milestones[i].count) {
        activeMilestone = milestones[i];
        break;
      }
    }

    badgeIcon.innerText = activeMilestone.icon;
    badgeTitle.innerText = activeMilestone.title;
    badgeDesc.innerText = activeMilestone.desc;
  }

  // --- 動漫抽卡邏輯 ---
  const drawCategorySelect = document.getElementById("drawCategory");
  const drawBtn = document.getElementById("drawBtn");
  const sexCardScene = document.getElementById("sexCardScene");
  const sexCardInner = document.getElementById("sexCardInner");

  const drawnCategory = document.getElementById("drawnCategory");
  const drawnTitle = document.getElementById("drawnTitle");
  const drawnDesc = document.getElementById("drawnDesc");
  const drawnTips = document.getElementById("drawnTips");

  function initDrawDropdown() {
    drawCategorySelect.innerHTML = '<option value="all">任意主題</option>';
    window.animeData.categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.innerText = cat.name.split(' (')[0];
      drawCategorySelect.appendChild(opt);
    });
  }

  let isDrawing = false;
  drawBtn.addEventListener("click", () => {
    if (isDrawing) return;
    isDrawing = true;

    // 1. 篩選抽卡池
    const selectedCat = drawCategorySelect.value;
    let pool = window.animeData.achievements;
    if (selectedCat !== "all") {
      pool = pool.filter(item => item.category === selectedCat);
    }

    if (pool.length === 0) {
      showToast("此分類下暫無卡片可抽");
      isDrawing = false;
      return;
    }

    // 2. 隨機選取
    const randomItem = pool[Math.floor(Math.random() * pool.length)];

    // 3. 翻面動畫
    sexCardInner.classList.remove("flipped");
    
    setTimeout(() => {
      // 填入背面內容
      const catObj = window.animeData.categories.find(c => c.id === randomItem.category);
      drawnCategory.innerText = catObj ? catObj.name.split(' (')[0] : "動漫卡";
      drawnTitle.innerText = randomItem.title;
      drawnDesc.innerText = randomItem.description;
      drawnTips.innerText = `攻略秘訣：${randomItem.tips}`;

      // 執行翻面
      sexCardInner.classList.add("flipped");
      isDrawing = false;
    }, 350);
  });

  // 點擊卡片正面也可以翻牌抽取
  sexCardScene.addEventListener("click", (e) => {
    if (e.target.closest(".draw-controls") || isDrawing) return;
    if (!sexCardInner.classList.contains("flipped")) {
      drawBtn.click();
    } else {
      sexCardInner.classList.remove("flipped");
    }
  });

  // --- Q&A真心話靈魂共鳴邏輯 ---
  const qaCardInner = document.getElementById("qaCardInner");
  const qaCardScene = document.getElementById("qaCardScene");
  const qaQuestionText = document.getElementById("qaQuestionText");
  const nextQaBtn = document.getElementById("nextQaBtn");

  function drawRandomQuestion() {
    const qList = window.animeData.questions;
    if (!qList || qList.length === 0) return;
    const randQ = qList[Math.floor(Math.random() * qList.length)];
    qaQuestionText.innerText = randQ;
  }

  nextQaBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    qaCardInner.classList.remove("flipped");
    setTimeout(() => {
      drawRandomQuestion();
      qaCardInner.classList.add("flipped");
    }, 350);
  });

  qaCardScene.addEventListener("click", () => {
    if (!qaCardInner.classList.contains("flipped")) {
      drawRandomQuestion();
      qaCardInner.classList.add("flipped");
    } else {
      qaCardInner.classList.remove("flipped");
    }
  });

  // --- 設定分頁互動 (暱稱、頭像、資料備份備份還原) ---
  const nameInput = document.getElementById("nicknameInput");
  nameInput.addEventListener("input", (e) => {
    userChoices.nickname = e.target.value.trim() || "無名宅宅";
    saveLocalData();
  });

  // 頭像點擊
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      avatarBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      userChoices.avatar = btn.innerText;
      saveLocalData();
      showToast(`頭像已更新為 ${userChoices.avatar}`);
    });
  });

  // 備份還原 controls
  const backupDataTextarea = document.getElementById("backupData");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const resetBtn = document.getElementById("resetBtn");

  exportBtn.addEventListener("click", () => {
    const encrypted = btoa(encodeURIComponent(JSON.stringify(userChoices)));
    backupDataTextarea.value = encrypted;
    showToast("💾 備份金鑰已成功複製/生成，請妥善保存！");
  });

  importBtn.addEventListener("click", () => {
    const rawVal = backupDataTextarea.value.trim();
    if (!rawVal) {
      showToast("⚠️ 請先貼上要還原的進度金鑰！");
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(rawVal)));
      if (decoded && decoded.pa) {
        userChoices = decoded;
        // Fallbacks
        if (!userChoices.nickname) userChoices.nickname = "無名宅宅";
        if (!userChoices.avatar) userChoices.avatar = "🧙‍♀️";
        
        saveLocalData();
        syncProfileUI();
        showToast("🎮 動漫挑戰進度還原成功！", true);
        backupDataTextarea.value = "";
        renderAchievements();
      } else {
        showToast("⚠️ 貼上的資料格式有誤，請確認是否完整複製！");
      }
    } catch (e) {
      showToast("⚠️ 解析失敗，請檢查金鑰字串是否正確！");
    }
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("⚠️ 確定要清除所有本地動漫成就解鎖紀錄與設定嗎？此動作將無法還原！")) {
      userChoices = { pa: {}, nickname: "無名宅宅", avatar: "🧙‍♀️" };
      saveLocalData();
      syncProfileUI();
      showToast("🗑️ 所有本地數據已重置清除！");
      renderAchievements();
    }
  });

  // --- Canvas 繪製個人分享名片 ---
  const openShareBtn = document.getElementById("openShareBtn");
  const shareModalBackdrop = document.getElementById("shareModalBackdrop");
  const previewCanvas = document.getElementById("sharingPreviewCanvas");
  const previewImg = document.getElementById("sharingPreviewImg");
  const downloadShareCardBtn = document.getElementById("downloadShareCardBtn");

  openShareBtn.addEventListener("click", () => {
    generateShareCard();
  });

  function getAchievementTotals() {
    const total = window.animeData.achievements.length;
    let unlocked = 0;
    let wishes = 0;
    window.animeData.achievements.forEach(item => {
      const state = userChoices.pa[item.id] || "locked";
      if (state === "unlocked") unlocked++;
      if (state === "want") wishes++;
    });
    return { total, unlocked, wishes };
  }

  function generateShareCard() {
    const canvasElement = previewCanvas;
    const ctx = canvasElement.getContext("2d");
    
    // 1. 繪製精美背景 (深紫黑漸層霓虹)
    const grad = ctx.createLinearGradient(0, 0, 0, 1200);
    grad.addColorStop(0, '#06030c');
    grad.addColorStop(0.5, '#120c24');
    grad.addColorStop(1, '#06030c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1200);

    // 繪製背景裝飾性發光圓 (Neon Glow Circles)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.beginPath();
    ctx.arc(150, 250, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 42, 95, 0.08)';
    ctx.beginPath();
    ctx.arc(680, 880, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.06)';
    ctx.beginPath();
    ctx.arc(380, 600, 220, 0, Math.PI * 2);
    ctx.fill();

    // 2. 標題與裝飾線
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#ff2a5f';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 42, 95, 0.6)';
    ctx.fillText("O T A K U", 400, 120);
    ctx.shadowBlur = 0; // 重置 shadow

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText("✦ 動漫領域解鎖成就探索卡 ✦", 400, 175);

    ctx.beginPath();
    ctx.moveTo(80, 205);
    ctx.lineTo(720, 205);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. 個人資訊面板
    // 繪製玩家頭像與名字
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(80, 235, 640, 140, 20);
    ctx.fill();
    ctx.stroke();

    // 繪製頭像 Emoji
    ctx.font = '75px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(userChoices.avatar, 160, 330);

    // 繪製名字、等級稱號
    const stats = getAchievementTotals();
    const pct = Math.round((stats.unlocked / stats.total) * 100) || 0;
    const level = Math.floor(stats.unlocked / 10) + 1;
    
    let activeMilestone = milestones[0];
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (stats.unlocked >= milestones[i].count) {
        activeMilestone = milestones[i];
        break;
      }
    }

    ctx.textAlign = 'left';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(userChoices.nickname, 240, 290);
    
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`等級 LV.${level} - ${activeMilestone.title} ${activeMilestone.icon}`, 240, 328);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(activeMilestone.desc.substring(0, 25) + "...", 240, 355);

    // 4. 進度數據盒
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(80, 400, 640, 110, 15);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText("個人宅力解鎖進度", 240, 442);
    
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${pct}%`, 240, 488);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText("累積解鎖成就", 560, 442);
    
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${stats.unlocked} / ${stats.total}`, 560, 488);

    // 5. 亮點想挑戰的願望清單
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ff2a5f';
    ctx.fillText("💖 我的動漫挑戰攻略目標 💖", 400, 565);

    ctx.beginPath();
    ctx.moveTo(80, 585);
    ctx.lineTo(720, 585);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    const wishesList = window.animeData.achievements.filter(item => {
      return (userChoices.pa[item.id] || "locked") === "want";
    });

    ctx.textAlign = 'center';
    if (wishesList.length === 0) {
      ctx.font = 'italic 18px sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText("尚無特別想挑戰的項目，快去勾選您感興趣的清單吧！", 400, 690);
      ctx.fillText("在清單頁面中，點擊項目底部的『想挑戰』即可在此亮起 🌟", 400, 725);
    } else {
      let startY = 635;
      const drawCount = Math.min(wishesList.length, 5);
      
      for (let i = 0; i < drawCount; i++) {
        const item = wishesList[i];
        const catObj = window.animeData.categories.find(c => c.id === item.category);
        const catIcon = catObj ? catObj.icon : "🎬";
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.beginPath();
        ctx.roundRect(80, startY - 30, 640, 50, 10);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#00e5ff';
        ctx.fillText(`${catIcon}  ${item.title}`, 110, startY + 2);
        
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#ff2a5f';
        ctx.fillText("TARGET 🎯", 690, startY + 2);
        
        startY += 62;
      }

      if (wishesList.length > 5) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`... 以及其他共 ${wishesList.length - 5} 個已勾選目標 ...`, 400, startY + 2);
      }
    }

    // 6. 金句
    ctx.textAlign = 'center';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText("「二次元的感動，是我們無悔的青春與信仰。」", 400, 980);

    // 7. 二維碼與底欄連結
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(575, 1015, 140, 140, 10);
    ctx.fill();

    // QR Code 渲染器 (動態生成目前網頁 QR)
    const qrContainer = document.createElement("div");
    new QRCode(qrContainer, {
      text: window.location.href || "https://anime-achievement.pages.dev",
      width: 130,
      height: 130,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    setTimeout(() => {
      const qrCanvas = qrContainer.querySelector("canvas");
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, 580, 1020, 130, 130);
      }
      // 繪製 QR 綠色外邊框
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.strokeRect(575, 1015, 140, 140);
    }, 50);

    ctx.textAlign = 'left';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ff2a5f';
    ctx.fillText("OTAKU 動漫解鎖成就清單", 80, 1052);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(window.location.host || "anime-achievement.pages.dev", 80, 1088);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText("掃描右側二維碼，挑戰你的動漫宅力等級", 80, 1120);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText("100% 瀏覽器本地安全隱私保護 • 網頁參考自開發者成就清單", 80, 1150);

    setTimeout(() => {
      previewImg.src = canvasElement.toDataURL("image/png");
      shareModalBackdrop.style.display = "flex";
    }, 150);
  }

  // 下載名片圖片
  downloadShareCardBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `otaku_achievements_${userChoices.nickname}.png`;
    link.href = previewCanvas.toDataURL("image/png");
    link.click();
  });

  // 社群分享轉導連結
  document.getElementById("shareThreadsBtn").addEventListener("click", () => {
    const text = encodeURIComponent(`我已在 OTAKU 解鎖了動漫成就！我的宅力等級是 LV.${Math.floor(getAchievementTotals().unlocked / 10) + 1} 🚀 快來挑戰你的動漫解鎖成就清單 🔓\n👉 ${window.location.href}`);
    window.open(`https://threads.net/intent/post?text=${text}`, "_blank");
  });
  document.getElementById("shareFacebookBtn").addEventListener("click", () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  });
  document.getElementById("shareTwitterBtn").addEventListener("click", () => {
    const text = encodeURIComponent(`我已在 OTAKU 解鎖了動漫成就！我的宅力等級是 LV.${Math.floor(getAchievementTotals().unlocked / 10) + 1} 🚀 快來挑戰你的動漫解鎖成就清單 🔓\n👉 ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  });

  // --- 初始化加載 ---
  loadLocalData();
  renderAchievements();
  renderCategoryFilters();
  initDrawDropdown();
  calculateProgress();
});
