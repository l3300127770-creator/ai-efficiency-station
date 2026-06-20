/* ========================================
   AI效率站 - 公共JS（完整版 v2）
   ======================================== */

/* ---------- 工具函数：节流 ---------- */
function throttle(fn, wait) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn();
    }
  };
}

/* ---------- Toast提示 ---------- */
function showToast(msg, duration) {
  duration = duration || 2500;
  var existing = document.querySelector(".toast");
  if (existing) existing.remove();
  var el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() { el.classList.add("toast-show"); }, 10);
  setTimeout(function() {
    el.classList.remove("toast-show");
    setTimeout(function() { el.remove(); }, 300);
  }, duration);
}

/* ---------- 移动端菜单切换 ---------- */
function toggleMenu() {
  var nav = document.getElementById("navLinks");
  if (nav) {
    nav.classList.toggle("open");
    if (nav.classList.contains("open")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

/* ---------- 点击外部关闭移动端菜单 ---------- */
document.addEventListener("click", function(e) {
  var nav = document.getElementById("navLinks");
  var toggle = document.querySelector(".menu-toggle");
  if (!nav || !nav.classList.contains("open")) return;
  if (nav.contains(e.target) || (toggle && toggle.contains(e.target))) return;
  nav.classList.remove("open");
  document.body.style.overflow = "";
});

/* ---------- 移动端菜单项点击后自动关闭 ---------- */
(function() {
  var nav = document.getElementById("navLinks");
  if (!nav) return;
  nav.addEventListener("click", function(e) {
    var link = e.target.closest("a");
    if (link && nav.classList.contains("open")) {
      e.stopPropagation();
      nav.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
})();

/* ---------- 阅读进度条（带节流） ---------- */
(function() {
  var bar = document.getElementById("readingBar");
  if (!bar) return;
  var update = function() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + "%";
  };
  window.addEventListener("scroll", throttle(update, 16));
})();

/* ---------- TOC高亮（带节流） ---------- */
(function() {
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length === 0) return;
  var targets = [];
  tocLinks.forEach(function(link) {
    var id = link.getAttribute("href");
    if (id && id.indexOf("#") === 0) {
      var el = document.getElementById(id.substring(1));
      if (el) targets.push({ link: link, el: el });
    }
  });
  if (targets.length === 0) return;
  var update = function() {
    var scrollPos = (window.scrollY || window.pageYOffset) + 120;
    var current = targets[0];
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.offsetTop <= scrollPos) {
        current = targets[i];
      }
    }
    tocLinks.forEach(function(l) { l.classList.remove("active"); });
    current.link.classList.add("active");
  };
  window.addEventListener("scroll", throttle(update, 100));
})();

/* ---------- 打赏金额选择（支持自定义） ---------- */
function selectAmount(btn) {
  var btns = document.querySelectorAll(".amount-btn");
  btns.forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  var amount = btn.getAttribute("data-amount");
  var customInput = document.getElementById("customAmount");
  if (customInput) customInput.value = "";
  updateDonateTip(amount);
}

function updateDonateTip(amount) {
  var tip = document.getElementById("donateTip");
  if (tip && amount) {
    tip.textContent = "请扫描上方二维码支付 ¥" + amount;
    tip.style.display = "block";
  }
}

/* ---------- 自定义金额输入 ---------- */
(function() {
  var customInput = document.getElementById("customAmount");
  if (!customInput) return;
  customInput.addEventListener("input", function() {
    var val = customInput.value.replace(/[^\d.]/g, "");
    customInput.value = val;
    if (val && parseInt(val) > 0) {
      var btns = document.querySelectorAll(".amount-btn");
      btns.forEach(function(b) { b.classList.remove("active"); });
      updateDonateTip(val);
    }
  });
  customInput.addEventListener("focus", function() {
    var btns = document.querySelectorAll(".amount-btn");
    btns.forEach(function(b) { b.classList.remove("active"); });
  });
})();

/* ---------- 商品模态框 ---------- */
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}
function closeModal(e) {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
}

/* ---------- ESC键关闭模态框 ---------- */
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" || e.keyCode === 27) {
    var openModals = document.querySelectorAll(".modal-overlay.open");
    openModals.forEach(function(m) {
      m.classList.remove("open");
    });
    if (openModals.length > 0) {
      document.body.style.overflow = "";
    }
  }
});

/* ---------- 购买与占位链接引导 ---------- */
document.addEventListener("click", function(e) {
  var link = e.target.closest('a[href="#"]');
  if (!link) return;
  var text = (link.textContent || "").trim();
  var isBuy = text.indexOf("购买") !== -1;
  var isPromo = text.indexOf("办理") !== -1 || text.indexOf("前往") !== -1 || text.indexOf("注册") !== -1 || text.indexOf("使用") !== -1;
  var isVip = text.indexOf("VIP") !== -1 || text.indexOf("加入") !== -1;

  if (isBuy || isVip) {
    e.preventDefault();
    openCheckout(text);
    return;
  }
  if (isPromo) {
    e.preventDefault();
    showToast("该推广链接暂未开放，敬请期待！");
  }
});

function extractPrice(text) {
  var m = (text || "").match(/¥\s*([0-9]+(?:\.[0-9]+)?)/);
  return m ? m[1] : "";
}

function openCheckout(buttonText) {
  var existing = document.querySelector(".checkout-guide");
  if (existing) existing.remove();

  var price = extractPrice(buttonText) || "咨询定价";
  var title = buttonText.replace(/^[\\s\\S]*?(?=[\\u4e00-\\u9fa5A-Za-z])/, "").replace(/\\s+/g, "");
  if (!title) title = "商品购买";
  title = title.replace("立即购买 · ", "").replace("加入VIP", "年度VIP会员");

  var el = document.createElement("div");
  el.className = "checkout-guide";
  el.innerHTML = '<div class="checkout-box">' +
    '<button type="button" class="purchase-guide-close" onclick="this.closest(\'.checkout-guide\').remove()">&times;</button>' +
    '<div style="margin-bottom:12px;">' +
      '<div style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">🧾 确认下单</div>' +
      '<div style="color:#64748b;font-size:.9rem;">商品：<strong>' + title + '</strong></div>' +
      '<div style="margin-top:6px;font-size:1.05rem;font-weight:800;color:var(--primary);">应付金额：¥' + price + '</div>' +
    '</div>' +
    '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-bottom:12px;">' +
      '<div style="font-size:.9rem;font-weight:600;margin-bottom:8px;text-align:center;">扫码付款（微信 / 支付宝）</div>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
        '<div style="text-align:center;">' +
          '<img src="' + resolveAsset('img/qrcodes/wechat-pay.png') + '" alt="微信收款码" style="width:150px;height:150px;object-fit:contain;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">' +
          '<div style="font-size:.8rem;color:#64748b;margin-top:6px;">微信</div>' +
        '</div>' +
        '<div style="text-align:center;">' +
          '<img src="' + resolveAsset('img/qrcodes/alipay.jpg') + '" alt="支付宝收款码" style="width:150px;height:150px;object-fit:contain;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">' +
          '<div style="font-size:.8rem;color:#64748b;margin-top:6px;">支付宝</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:10px;font-size:.8rem;color:#94a3b8;text-align:center;">建议在备注里填写你的联系邮箱，便于发货</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
      '<a href="https://form.wjx.com/vm/eOvZSHS.aspx" class="btn btn-primary" style="justify-content:center;" target="_blank" rel="noopener noreferrer">✅ 我已付款，提交发货信息（问卷星）</a>' +
      '<a href="https://f.wps.cn/" class="btn btn-outline" style="justify-content:center;" target="_blank" rel="noopener noreferrer">📝 备用：提交发货表单（金山表单）</a>' +
      '</div>' +
      '<a href="mailto:1683303069@qq.com?subject=付款确认-' + encodeURIComponent(title) + '" class="btn btn-outline" style="justify-content:center;">📧 发邮件确认</a>' +
    '</div>' +
    '<div style="margin-top:10px;font-size:.78rem;color:#94a3b8;text-align:center;">付款后建议点击上方按钮提交邮箱和付款截图，10分钟内人工核对发货。</div>' +
  '</div>';

  document.body.appendChild(el);
  setTimeout(function() { el.classList.add("checkout-guide-show"); }, 10);
}

function resolveAsset(path) {
  var base = document.baseURI || window.location.href;
  try {
    return new URL(path, base).href;
  } catch (err) {
    return path;
  }
}

function copyWechat() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText("1683303069@qq.com").then(function() {
      showToast("联系邮箱已复制：1683303069@qq.com");
    });
  }
}
/* ---------- 订阅表单反馈（Mailchimp集成） ---------- */
(function() {
  var forms = document.querySelectorAll("form.subscribe-form");
  forms.forEach(function(form) {
    form.addEventListener("submit", function(e) {
      var input = form.querySelector('input[type="email"]');
      if (!input) return;
      var email = input.value.trim();
      if (!email || email.indexOf("@") === -1) {
        e.preventDefault();
        showToast("请输入正确的邮箱地址");
        input.focus();
        return;
      }
      showToast("正在跳转，请在新页面完成订阅...", 3000);
      setTimeout(function() { input.value = ""; }, 1000);
    });
  });
})();

/* ---------- 商店筛选功能 ---------- */
(function() {
  var filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length === 0) return;
  var products = document.querySelectorAll("[data-category]");
  if (products.length === 0) return;

  filterBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filterBtns.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter") || "all";
      var visibleCount = 0;
      products.forEach(function(card) {
        var cat = card.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          card.style.display = "";
          visibleCount++;
        } else {
          card.style.display = "none";
        }
      });
      if (visibleCount === 0) {
        showToast("该分类暂无商品");
      }
    });
  });
})();

/* ---------- 分享功能（Web Share API + 降级） ---------- */
document.addEventListener("click", function(e) {
  var btn = e.target.closest(".share-btn");
  if (!btn) return;
  var text = btn.textContent || "";

  if (text.indexOf("复制链接") !== -1) {
    copyCurrentLink(btn);
  } else if (text.indexOf("微信") !== -1) {
    shareToWechat();
  } else if (text.indexOf("微博") !== -1) {
    shareToWeibo();
  } else if (text.indexOf("更多分享") !== -1) {
    nativeShare();
  }
});

function copyCurrentLink(btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(function() {
      btn.textContent = "✅ 已复制";
      setTimeout(function() { btn.textContent = "📋 复制链接"; }, 2000);
    });
  } else {
    var input = document.createElement("input");
    input.value = window.location.href;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    btn.textContent = "✅ 已复制";
    setTimeout(function() { btn.textContent = "📋 复制链接"; }, 2000);
  }
}

function shareToWechat() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(function() {
      showToast("链接已复制，请打开微信粘贴发送", 3000);
    });
  }
}

function shareToWeibo() {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title);
  window.open("https://service.weibo.com/share/share.php?url=" + url + "&title=" + title, "_blank", "width=600,height=500");
}

function nativeShare() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    }).catch(function() {});
  } else {
    copyCurrentLink(document.querySelector(".share-btn"));
    showToast("链接已复制到剪贴板");
  }
}

/* ---------- 站内搜索 ---------- */
(function() {
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  if (!searchInput || !searchResults) return;

  var articles = [
    { title: "2026年AI工具完整指南：小白入门必看", url: "articles/ai-knowledge.html", tags: "AI入门 工具推荐 新手", desc: "从零开始了解AI，手把手教你选对工具" },
    { title: "100+AI提示词模板：办公/写作/剪辑全覆盖", url: "articles/prompts-guide.html", tags: "提示词 模板 干货 办公 写作 剪辑", desc: "直接复制就能用的AI提示词模板" },
    { title: "AI副业实操：如何用AI月入3000+", url: "articles/ai-side-income.html", tags: "副业 赚钱 实战 变现", desc: "真实案例拆解，用AI做内容、卖模板、接单" },
    { title: "AI提示词模板包 ¥9.9", url: "pages/shop.html", tags: "提示词 购买 模板 产品", desc: "100+场景提示词，复制即用" },
    { title: "Notion个人管理系统模板 ¥19.9", url: "pages/shop.html", tags: "Notion 模板 管理 目标 记账", desc: "目标管理+习惯追踪+财务记录" },
    { title: "AI短视频全流程教程 ¥29.9", url: "pages/shop.html", tags: "视频 教程 剪辑 AI视频 短视频", desc: "从选题到发布，AI全流程" },
    { title: "年度VIP会员 ¥99", url: "pages/shop.html", tags: "VIP 会员 全部产品 免费下载", desc: "全部产品免费下载+专属社群" },
    { title: "精品流量卡推荐", url: "pages/recommend.html", tags: "流量卡 手机卡 电信 移动 广电", desc: "29元起，大流量低月租" },
    { title: "宽带套餐推荐", url: "pages/recommend.html", tags: "宽带 家庭宽带 移动宽带 千兆", desc: "多省宽带，最低21元/月" },
    { title: "推荐好物：AI工具和生产力软件", url: "pages/recommend.html", tags: "工具 推荐 AI 云服务 生产力", desc: "亲测好用的工具推荐" },
    { title: "打赏支持", url: "pages/donate.html", tags: "打赏 支持 咖啡 赞赏", desc: "请我喝杯咖啡" },
    { title: "关于AI效率站", url: "pages/about.html", tags: "关于 联系 合作 站长", desc: "了解站长和合作方式" }
  ];

  var debounceTimer = null;
  searchInput.addEventListener("input", function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchResults.style.display = "none";
        return;
      }
      var matches = articles.filter(function(a) {
        return (a.title + a.tags + a.desc).toLowerCase().indexOf(query) !== -1;
      });
      if (matches.length === 0) {
        searchResults.innerHTML = '<div style="padding:12px;color:#94a3b8;font-size:.9rem;">未找到相关内容</div>';
      } else {
        searchResults.innerHTML = matches.map(function(a) {
          return '<a href="' + a.url + '" style="display:block;padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:.9rem;color:#1e293b;text-decoration:none;">' +
            a.title + '<br><span style="font-size:.8rem;color:#94a3b8;">' + a.desc + '</span></a>';
        }).join("");
      }
      searchResults.style.display = "block";
    }, 200);
  });

  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });
})();

/* ---------- 返回顶部按钮 ---------- */
(function() {
  var btn = document.getElementById("backToTop");
  if (!btn) return;
  var toggle = throttle(function() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 300) {
      btn.classList.add("back-to-top-show");
    } else {
      btn.classList.remove("back-to-top-show");
    }
  }, 100);
  window.addEventListener("scroll", toggle);
  btn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ---------- 平滑滚动（排除#占位符） ---------- */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener("click", function(e) {
    var href = this.getAttribute("href");
    if (href === "#") return;
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* ---------- 控制台欢迎 ---------- */
console.log("%c🤖 AI效率站", "font-size:20px;font-weight:bold;color:#2563eb;");
console.log("%c用AI提效，用内容变现。", "font-size:14px;color:#64748b;");


/* ---------- 移动端折叠目录 ---------- */
function toggleToc(btn) {
  var toc = btn.nextElementSibling;
  if (toc) {
    toc.classList.toggle("toc-open");
    if (toc.classList.contains("toc-open")) {
      btn.textContent = "📑 收起目录";
    } else {
      btn.textContent = "📑 文章目录";
    }
  }
}