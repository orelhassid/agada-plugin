/* global agadaAppData, agada_ajax_obj */
document.addEventListener("DOMContentLoaded", () => {
  // App settings come from PHP via wp_add_inline_script (agadaAppData).
  const appSettings = (typeof agadaAppData !== "undefined") ? agadaAppData : {};

  // WhatsApp number from config or fallback.
  const restaurantNumber =
    appSettings?.config?.whatsappNumber || "972552239120";

  const initialOrder = {
    customer: {
      name: "",
      phone: "",
      address: "",
      eventDate: "",
      notes: "",
      wantsQuote: false,
    },
    summary: {
      packageId: null,
      packageName: "",
      peopleCount: appSettings?.config?.orderMinimums?.defaultMinPortions || 30,
      totalPrice: 0,
      createdDate: null,
    },
    selections: {
      shabbatMorningChoice: null,
    },
    items: [],
  };

  const LOCAL_STORAGE_KEY = "agadaCateringOrder";
  let orderObject = JSON.parse(JSON.stringify(initialOrder));

  const screens = {
    orderForm: document.getElementById("screen-order-form"),
    checkout: document.getElementById("screen-checkout"),
    summary: document.getElementById("screen-summary"),
  };
  const sideCartContent = document.getElementById("side-cart-content");
  const mobileSummaryTrigger = document.getElementById("mobile-summary-trigger");
  const mobileSummaryPrice = document.getElementById("mobile-summary-price");
  const stickyNav = document.getElementById("sticky-nav");
  const navLinksContainer = document.getElementById("nav-links-container");
  const mainGrid = document.getElementById("main-grid");
  const resumeModal = document.getElementById("resume-order-modal");

  const checkmarkIcon = `<svg class="w-5 h-5 flex-shrink-0" style="color: var(--color-primary);" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 3.75C7.69329 3.75 4 7.44329 4 12C4 16.5558 7.69335 20.25 12.25 20.25C16.8067 20.25 20.5 16.5558 20.5 12C20.5 7.44329 16.8067 3.75 12.25 3.75ZM2.5 12C2.5 6.61487 6.86487 2.25 12.25 2.25C17.6351 2.25 22 6.61487 22 12C22 17.3841 17.6352 21.75 12.25 21.75C6.86481 21.75 2.5 17.3841 2.5 12Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2431 9.16108C16.5359 9.45397 16.5359 9.92884 16.2431 10.2217L11.6253 14.8395C11.3325 15.1323 10.8577 15.1324 10.5648 14.8396L8.25494 12.5307C7.96198 12.2379 7.96188 11.763 8.25471 11.4701C8.54755 11.1771 9.02242 11.177 9.31537 11.4698L11.0949 13.2486L15.1824 9.16108C15.4753 8.86818 15.9502 8.86818 16.2431 9.16108Z" fill="currentColor"></path></svg>`;

  // ---------------------------------------------------------------------------
  // Core Helpers
  // ---------------------------------------------------------------------------

  const sanitizeForId = (str) =>
    str.replace(/[\s()]/g, "-").replace(/--+/g, "-");

  function getActiveNotices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (appSettings?.config?.notices || []).filter((notice) => {
      let start = new Date(0);
      if (notice.startDate) {
        start = new Date(notice.startDate);
        start.setHours(0, 0, 0, 0);
      }
      let end = new Date("2099-12-31");
      if (notice.endDate) {
        end = new Date(notice.endDate);
        end.setHours(23, 59, 59, 999);
      }
      return today >= start && today <= end;
    });
  }

  function getRequiredMinPortions() {
    const minConfig = appSettings?.config?.orderMinimums || {};
    let minAllowed = minConfig.defaultMinPortions || 30;
    if (orderObject.customer.eventDate) {
      const specialDate = (minConfig.specialDates || []).find(
        (d) => d.date === orderObject.customer.eventDate
      );
      if (specialDate) {
        minAllowed = specialDate.minPortions;
      }
    }
    return minAllowed;
  }

  function saveOrder() {
    if (orderObject && orderObject.summary.packageId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderObject));
    }
  }

  function clearSavedOrder() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  function getCurrentScreenName() {
    const currentScreen = document.querySelector(".screen.active");
    return Object.keys(screens).find((key) => screens[key] === currentScreen);
  }

  function navigateTo(screenName) {
    Object.values(screens).forEach((screen) =>
      screen.classList.remove("active")
    );
    if (screens[screenName]) {
      screens[screenName].classList.add("active");
    }
    const isOrderFormScreen = screenName === "orderForm";
    const isPackageSelected = !!orderObject.summary.packageId;

    stickyNav.classList.toggle(
      "hidden",
      !isOrderFormScreen || !isPackageSelected
    );

    if (isOrderFormScreen && isPackageSelected) {
      mobileSummaryTrigger.style.transform = "translateY(0%)";
    } else {
      mobileSummaryTrigger.style.transform = "translateY(100%)";
    }
    updateSideCart();
  }

  function updateLayoutForPackageSelection() {
    const isPackageSelected = !!orderObject.summary.packageId;
    const sideCart = document.getElementById("side-cart");
    if (!sideCart) return;
    const mainContent = sideCart.previousElementSibling;
    if (isPackageSelected) {
      mainGrid.classList.add("lg:grid-cols-3");
      mainContent.classList.add("lg:col-span-2");
      sideCart.classList.remove("hidden");
    } else {
      mainGrid.classList.remove("lg:grid-cols-3");
      mainContent.classList.remove("lg:col-span-2");
      sideCart.classList.add("hidden");
    }
  }

  function handleBack() {
    const currentScreen = getCurrentScreenName();
    if (currentScreen === "checkout") {
      navigateTo("orderForm");
    } else if (
      currentScreen === "orderForm" &&
      orderObject.summary.packageId
    ) {
      orderObject = JSON.parse(JSON.stringify(initialOrder));
      clearSavedOrder();
      renderOrderForm();
      updateSideCart();
      navigateTo("orderForm");
    }
  }

  function calculatePrice() {
    if (!orderObject.summary.packageId) {
      orderObject.summary.totalPrice = 0;
      updateSideCart();
      return;
    }
    const pkg = appSettings.packages[orderObject.summary.packageId];
    const basePrice = pkg.basePricePerPerson * orderObject.summary.peopleCount;
    let extrasTotal = 0;
    orderObject.items.forEach((item) => {
      if (item.isExtra) {
        const itemInfo = appSettings.items[item.itemId];
        if (itemInfo.pricePerPerson) {
          extrasTotal += item.pricePerUnit * orderObject.summary.peopleCount;
        } else {
          extrasTotal += item.pricePerUnit * item.quantity;
        }
      }
    });
    orderObject.summary.totalPrice = basePrice + extrasTotal;
    updateSideCart();
    saveOrder();
  }

  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------

  const populateCart = (container, toggleMobileSummary) => {
    const currentScreen = getCurrentScreenName();
    const pkg = appSettings.packages[orderObject.summary.packageId];
    const extras = orderObject.items.filter((i) => i.isExtra);
    const basePriceTotal =
      pkg.basePricePerPerson * orderObject.summary.peopleCount;

    const reqMin = getRequiredMinPortions();
    let qtyWarningHtml = "";
    let isSubmitDisabled = false;

    if (orderObject.summary.peopleCount < reqMin) {
      qtyWarningHtml = `<div class="p-3 mb-4 text-sm font-semibold rounded-lg" style="background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid var(--color-danger);">שימו לב: לתאריך הנבחר נדרש מינימום של ${reqMin} מנות.</div>`;
      if (currentScreen === "checkout") {
        isSubmitDisabled = true;
      }
    }

    let extrasHtml = "";
    if (extras.length > 0) {
      extrasHtml = extras
        .map((item) => {
          const itemInfo = appSettings.items[item.itemId];
          let itemNameText = item.itemName;
          let itemPriceText = "";
          if (itemInfo.pricePerPerson) {
            const totalItemPrice = item.pricePerUnit * orderObject.summary.peopleCount;
            itemPriceText = `${totalItemPrice.toLocaleString()} ₪`;
          } else {
            itemNameText += ` (x${item.quantity})`;
            itemPriceText = `${(item.pricePerUnit * item.quantity).toLocaleString()} ₪`;
          }
          return `<div class="flex justify-between items-center text-sm"><p>${itemNameText}</p><p class="font-semibold">${itemPriceText}</p></div>`;
        })
        .join("");
    } else {
      extrasHtml = `<p class="text-sm text-center" style="color: var(--color-text-muted);">לא נוספו תוספות.</p>`;
    }

    let buttonHtml = "";
    if (currentScreen === "orderForm") {
      buttonHtml = `<button class="js-cart-next w-full mt-4 text-white font-bold py-3 px-4 rounded-lg text-lg btn-primary">המשך לפרטים</button>
                    <button class="js-cart-back-orderform w-full mt-2 text-center py-2 rounded-lg btn-secondary">חזור לבחירת חבילה</button>`;
    } else if (currentScreen === "checkout") {
      buttonHtml = `
        <button type="button" class="js-cart-submit w-full mt-4 text-white font-bold py-3 px-4 rounded-lg text-lg btn-primary" ${isSubmitDisabled ? "disabled" : ""}>
          <span class="submit-text">שליחת הזמנה</span>
          <span class="spinner hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
        </button>
        <button class="js-cart-back w-full mt-2 text-center py-2 rounded-lg btn-secondary">חזור לעריכה</button>`;
    }

    const activeNotices = getActiveNotices();
    let noticesHtml = "";
    if (activeNotices.length > 0) {
      noticesHtml =
        '<div class="space-y-3 mt-6 border-t pt-4" style="border-color: var(--color-border);">';
      activeNotices.forEach((n) => {
        noticesHtml += `<div class="p-3 text-md rounded-lg" style="background-color: var(--color-primary-faint); color: var(--color-primary-dark); border: 1px solid var(--color-primary-light);">${n.text}</div>`;
      });
      noticesHtml += "</div>";
    }

    container.innerHTML = `
      <h3 class="text-xl font-bold mb-4 pb-2 border-b" style="color: var(--color-text-strong); border-color: var(--color-border);">סיכום ההזמנה</h3>
      ${qtyWarningHtml}
      <div class="space-y-3 mb-4 pb-4 border-b" style="border-color: var(--color-border);">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="text-lg font-bold" style="color: var(--color-text-strong);">${pkg.name}</h4>
            <span class="text-sm" style="color: var(--color-text-muted);">מחיר בסיס (${pkg.basePricePerPerson.toLocaleString()} ₪ x ${orderObject.summary.peopleCount})</span>
          </div>
          <span class="text-lg font-bold" style="color: var(--color-text-strong);">${basePriceTotal.toLocaleString()} ₪</span>
        </div>
      </div>
      <h4 class="font-bold mb-2" style="color: var(--color-text-strong);">תוספות בתשלום:</h4>
      <div class="space-y-2 mb-4">${extrasHtml}</div>
      <div class="space-y-2 font-bold text-lg pt-4 border-t" style="border-color: var(--color-border);">
        <div class="flex justify-between">
          <span style="color: var(--color-text-strong);">סה"כ:</span>
          <span style="color: var(--color-primary);">${orderObject.summary.totalPrice.toLocaleString()} ₪</span>
        </div>
      </div>
      ${buttonHtml}
      ${noticesHtml}`;

    const nextBtn = container.querySelector(".js-cart-next");
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (container.closest("#mobile-summary-modal")) {
          toggleMobileSummary(false);
        }
        renderCheckoutScreen();
        navigateTo("checkout");
        scrollToTop();
      };
    }

    const backBtn = container.querySelector(".js-cart-back");
    if (backBtn) {
      backBtn.onclick = () => {
        if (container.closest("#mobile-summary-modal")) toggleMobileSummary(false);
        handleBack();
      };
    }

    const backBtnOrderForm = container.querySelector(".js-cart-back-orderform");
    if (backBtnOrderForm) {
      backBtnOrderForm.onclick = () => {
        if (container.closest("#mobile-summary-modal")) toggleMobileSummary(false);
        handleBack();
      };
    }

    const submitBtn = container.querySelector(".js-cart-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => handleSubmitOrder(submitBtn));
    }
  };

  const mobileSummaryModal = document.getElementById("mobile-summary-modal");
  const mobileSummaryContentContainer = document.getElementById(
    "mobile-summary-content-container"
  );

  const toggleMobileSummary = (show) => {
    if (show) {
      populateCart(mobileSummaryContentContainer, toggleMobileSummary);
      mobileSummaryModal.style.display = "block";
      setTimeout(() => mobileSummaryModal.classList.add("active"), 10);
    } else {
      mobileSummaryModal.classList.remove("active");
      setTimeout(() => (mobileSummaryModal.style.display = "none"), 300);
    }
  };

  function updateSideCart() {
    const currentScreen = getCurrentScreenName();
    const hasPackage = orderObject.summary.packageId;
    if (!hasPackage || currentScreen === "summary") {
      sideCartContent.innerHTML = `<p class="text-center" style="color: var(--color-text-muted);">בחר חבילה כדי להתחיל.</p>`;
      mobileSummaryPrice.textContent = "0 ₪";
      return;
    }
    populateCart(sideCartContent, toggleMobileSummary);
    mobileSummaryPrice.textContent = `${orderObject.summary.totalPrice.toLocaleString()} ₪`;
  }

  function scrollToTop() {
    const appHeader = document.getElementById("agada-order-app-header");
    if (appHeader) {
      appHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------------------------------------------------------------------------
  // Order Form
  // ---------------------------------------------------------------------------

  function handlePackageSelect(event) {
    const card = event.currentTarget;
    const pkgId = card.dataset.pkgId;
    orderObject.summary.packageId = pkgId;
    orderObject.summary.packageName = appSettings.packages[pkgId].name;
    orderObject.items = [];
    orderObject.selections.shabbatMorningChoice = null;
    renderOrderForm();
    calculatePrice();
    navigateTo("orderForm");
    scrollToTop();
  }

  function renderOrderForm() {
    const isPackageSelected = !!orderObject.summary.packageId;
    if (isPackageSelected) {
      const reqMin = getRequiredMinPortions();
      if (orderObject.summary.peopleCount < reqMin) {
        orderObject.summary.peopleCount = reqMin;
        calculatePrice();
      }
    }

    const container = screens.orderForm;
    let content = "";
    updateLayoutForPackageSelection();

    // Package selection section
    content += `<section id="package-selection-section">`;
    if (isPackageSelected) {
      const pkg = appSettings.packages[orderObject.summary.packageId];
      content += `
        <div class="rounded-lg overflow-hidden card flex flex-col sm:flex-row gap-4 relative p-0 sm:p-4 items-center">
          <button id="change-package-btn" class="absolute top-4 left-4 text-sm font-semibold flex items-center p-2 rounded-lg z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
            </svg>
            <span>שינוי</span>
          </button>
          <img src="${pkg.imageUrl}" alt="${pkg.name}" class="w-full h-40 sm:w-48 sm:h-32 object-cover !rounded-lg">
          <div class="p-0 md:p-4 flex flex-col gap-2 flex-grow text-center sm:text-right w-full">
            <h3 class="text-2xl font-bold" style="color: var(--color-text-strong);">${pkg.name}</h3>
            <ul class="space-y-3 text-right">
              ${(pkg.includes || []).map((item) => `<li class="flex items-center gap-3">${checkmarkIcon}<span class="text-sm" style="color: var(--color-text-default);">${item.trim()}</span></li>`).join("")}
            </ul>
          </div>
        </div>`;
    } else {
      content += `
        <div class="mb-6 text-center">
          <h2 class="text-3xl font-bold" style="color: var(--color-text-strong);">בחרו חבילה כדי להתחיל</h2>
          <p class="text-lg" style="color: var(--color-text-muted);">בחרו את החבילה המתאימה לאירוע שלכם.</p>
        </div>
        <div id="packages-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${Object.entries(appSettings.packages).map(([pkgId, pkg]) => `
            <div class="package-card p-0 card flex flex-col justify-between overflow-hidden cursor-pointer" data-pkg-id="${pkgId}">
              <div class="flex-grow">
                <img src="${pkg.imageUrl}" alt="${pkg.name}" class="w-full !h-48 object-cover">
                <div class="p-3">
                  <div class="flex justify-between items-baseline mb-4">
                    <h3 class="text-xl font-bold" style="color: var(--color-text-strong);">${pkg.name}</h3>
                  </div>
                  <ul class="space-y-3 text-right">
                    ${(pkg.includes || []).map((item) => `<li class="flex items-center gap-3">${checkmarkIcon}<span class="text-sm" style="color: var(--color-text-default);">${item.trim()}</span></li>`).join("")}
                  </ul>
                </div>
              </div>
              <div class="px-6 py-2">
                <div class="bg-primary-light p-2 rounded-lg">
                  <p class="text-2xl font-bold text-center" style="color: var(--color-primary);">${pkg.basePricePerPerson} ₪</p>
                </div>
              </div>
              <div class="p-6 pt-0">
                <button class="w-full text-white font-bold py-3 px-6 rounded-lg btn-primary">בחר חבילה</button>
              </div>
            </div>`).join("")}
        </div>`;
    }
    content += `</section>`;

    if (isPackageSelected) {
      const pkg = appSettings.packages[orderObject.summary.packageId];
      renderStickyNav(pkg);
      const reqMin = getRequiredMinPortions();

      content += `
        <section id="quantity-section" class="card quantity-selector">
          <h3 class="text-lg font-semibold mb-4 text-center" style="color: var(--color-text-strong);">כמה מנות תרצו להזמין? (מינימום ${reqMin})</h3>
          <div class="flex flex-col items-center justify-center">
            <div class="flex items-center justify-center gap-4">
              <button data-change="10" class="!p-1 h-14 w-14 rounded-full text-2xl font-bold btn-primary flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5Z" fill="currentColor"></path>
                </svg>
              </button>
              <input type="number" id="numberOfPeople" value="${orderObject.summary.peopleCount}" min="${reqMin}" class="!w-20 mr-3 text-center text-3xl font-bold !border-0 bg-transparent focus:ring-0" style="color: var(--color-text-strong);">
              <button data-change="-10" class="!p-1 h-14 w-14 rounded-full text-2xl font-bold flex items-center justify-center" style="background-color: var(--color-border); color: var(--color-text-muted);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path>
                </svg>
              </button>
            </div>
            <div id="min-qty-warning" class="hidden mt-4 text-sm font-bold bg-red-100 p-2 rounded-lg" style="color: var(--color-danger);"></div>
          </div>
        </section>`;

      pkg.meals.forEach((meal) => {
        content += `<section class="flex flex-col gap-4" id="meal-section-${sanitizeForId(meal.name)}">`;
        content += `<h3 class="section-title mt-4">${meal.name}</h3>`;

        if (meal.hasChoice) {
          const currentChoice = orderObject.selections.shabbatMorningChoice;
          content += `<div class="card p-6">
            <h4 class="text-lg font-semibold mb-4 text-center" style="color: var(--color-text-strong);">בחר אפשרות לסעודת שבת בבוקר</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${meal.options.map((option) => `
                <div class="choice-card ${currentChoice === option.id ? "selected" : ""}" data-meal-name="${meal.name}" data-choice-id="${option.id}">
                  <h5 class="font-bold text-lg" style="color: var(--color-text-strong);">${option.name}</h5>
                  <p class="text-sm mt-1" style="color: var(--color-text-muted);">${option.description}</p>
                </div>`).join("")}
            </div>
          </div>`;

          const selectedOption = meal.options.find((opt) => opt.id === currentChoice);
          if (selectedOption && selectedOption.categoryIds.length > 0) {
            selectedOption.categoryIds.forEach((catId) => {
              content += renderCategory(catId, meal);
            });
          }
        } else {
          meal.categoryIds.forEach((catId) => {
            content += renderCategory(catId, meal);
          });
        }

        content += `</section>`;
      });

      const extrasCat = appSettings.categories["cat_extras"];
      if (extrasCat && extrasCat.groups && extrasCat.groups.length > 0) {
        content += `<section id="category-section-extras" class="mb-8">`;
        content += `<h3 class="section-title">${extrasCat.name}</h3>`;

        extrasCat.groups.forEach((group) => {
          content += `<h4 class="text-lg font-bold mt-6 mb-3 flex items-center gap-2" style="color: var(--color-text-strong);">${group.emoji} <span>${group.name}</span></h4>`;

          if (group.isSpecial && group.id === "event-management") {
            const isChecked = orderObject.customer.wantsQuote ? "checked" : "";
            content += `<div class="card p-4 flex items-center justify-between">
              <label for="eventManagerQuote" class="flex-grow cursor-pointer font-semibold" style="color: var(--color-text-strong);">אני מעוניין בהצעת מחיר לניהול אירוע מלא</label>
              <input type="checkbox" id="eventManagerQuote" class="h-6 w-6 rounded" style="accent-color: var(--color-primary)" ${isChecked}>
            </div>`;
          } else if (group.itemIds) {
            content += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
            group.itemIds.forEach((itemId) => {
              const item = appSettings.items[itemId];
              const existingItem = orderObject.items.find((i) => i.itemId === itemId);

              if (item.pricePerPerson) {
                const isSelected = !!existingItem;
                content += `
                  <div class="p-4 flex justify-between items-center card cursor-pointer per-person-extra ${isSelected ? "selected" : ""}" data-item-id="${itemId}">
                    <div>
                      <p class="font-bold" style="color: var(--color-text-strong);">${item.name}</p>
                      <p class="text-lg font-semibold" style="color: var(--color-primary);">+${item.extraCost} ₪ <span class="text-sm font-normal" style="color: var(--color-text-muted);">לאדם</span></p>
                    </div>
                    <div class="h-8 w-8 rounded-full flex items-center justify-center text-white" style="background-color: ${isSelected ? "var(--color-primary)" : "var(--color-border)"};">
                      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                    </div>
                  </div>`;
              } else {
                const currentQty = existingItem ? existingItem.quantity : 0;
                content += `
                  <div class="p-4 flex justify-between items-center card">
                    <div>
                      <p class="font-bold" style="color: var(--color-text-strong);">${item.name}</p>
                      <p class="text-lg font-semibold" style="color: var(--color-primary);">${item.extraCost} ₪</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="!p-1 extra-btn h-8 w-8 rounded-full text-lg font-bold text-white flex-shrink-0 flex items-center justify-center" style="background-color: var(--color-primary);" data-item-id="${itemId}" data-change="1">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5Z" fill="currentColor"></path></svg>
                      </button>
                      <span id="extra-qty-${itemId}" class="font-bold text-lg w-8 text-center">${currentQty}</span>
                      <button class="!p-1 extra-btn h-8 w-8 rounded-full text-lg font-bold text-white flex-shrink-0 flex items-center justify-center" style="background-color: var(--color-danger);" data-item-id="${itemId}" data-change="-1">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12Z" fill="currentColor"></path></svg>
                      </button>
                    </div>
                  </div>`;
              }
            });
            content += `</div>`;
          }
        });

        content += `</section>`;
      }
    }

    container.innerHTML = content;

    // Attach event listeners after DOM is ready.
    if (isPackageSelected) {
      const changePackageBtn = document.getElementById("change-package-btn");
      if (changePackageBtn) changePackageBtn.addEventListener("click", handleBack);

      screens.orderForm.querySelectorAll(".quantity-selector button").forEach((btn) =>
        btn.addEventListener("click", handleQuantityChange)
      );

      const numberOfPeopleInput = screens.orderForm.querySelector("#numberOfPeople");
      if (numberOfPeopleInput)
        numberOfPeopleInput.addEventListener("change", handleQuantityInputChange);

      screens.orderForm.querySelectorAll(".item-card").forEach((card) =>
        card.addEventListener("click", handleItemSelect)
      );
      screens.orderForm.querySelectorAll(".choice-card").forEach((card) =>
        card.addEventListener("click", handleShabbatChoiceSelect)
      );
      screens.orderForm.querySelectorAll(".extra-btn").forEach((btn) =>
        btn.addEventListener("click", handleOptionalExtraChange)
      );
      screens.orderForm.querySelectorAll(".per-person-extra").forEach((card) =>
        card.addEventListener("click", handlePerPersonExtraToggle)
      );
      screens.orderForm.querySelectorAll(".btn-reset").forEach((btn) =>
        btn.addEventListener("click", handleResetCategory)
      );

      const eventManagerQuoteCheckbox = container.querySelector("#eventManagerQuote");
      if (eventManagerQuoteCheckbox) {
        eventManagerQuoteCheckbox.addEventListener("change", (e) => {
          orderObject.customer.wantsQuote = e.target.checked;
          saveOrder();
        });
      }

      updateAllCounters();
      setupScrollSpy();
    } else {
      screens.orderForm.querySelectorAll("[data-pkg-id]").forEach((card) =>
        card.addEventListener("click", handlePackageSelect)
      );
    }
  }

  function renderCategory(catId, meal) {
    const category = appSettings.categories[catId];
    const safeMealName = sanitizeForId(meal.name);
    return `
      <section class="p-6 mb-4 card" id="category-section-${safeMealName}-${catId}">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-semibold" style="color: var(--color-text-strong);">${category.name}</h4>
          <div class="flex items-center gap-2">
            <span id="counter-${safeMealName}-${catId}" class="text-sm font-medium px-3 py-1 rounded-full" style="background-color: var(--color-border); color: var(--color-text-muted);">בחירה: 0 / ${category.selectionLimit}</span>
            <button id="reset-btn-${safeMealName}-${catId}" class="btn-reset hidden" data-meal-name="${meal.name}" data-cat-id="${catId}">איפוס</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${category.itemIds.map((itemId) => {
            const item = appSettings.items[itemId];
            let imageContent = "";
            const imageUrl = item.imageUrl || category.imageUrl;
            if (imageUrl) {
              imageContent = `<img src="${imageUrl}" alt="${item.name}" class="item-image">`;
            } else {
              imageContent = `<span class="text-xl">${category.emoji || "🍽️"}</span>`;
            }
            return `<div class="item-card" data-item-id="${itemId}" data-cat-id="${catId}" data-meal-name="${meal.name}"><div class="item-card-icon">${imageContent}</div><p class="font-semibold text-right" style="color: var(--color-text-strong);">${item.name}</p></div>`;
          }).join("")}
        </div>
      </section>`;
  }

  function renderStickyNav(pkg) {
    navLinksContainer.innerHTML = "";

    const packageLink = document.createElement("a");
    packageLink.href = "#package-selection-section";
    packageLink.className = "nav-link whitespace-nowrap";
    packageLink.textContent = "החבילה";
    navLinksContainer.appendChild(packageLink);

    pkg.meals.forEach((meal) => {
      const safeMealName = sanitizeForId(meal.name);
      if (meal.hasChoice) {
        const link = document.createElement("a");
        link.href = `#meal-section-${safeMealName}`;
        link.className = "nav-link whitespace-nowrap";
        link.textContent = meal.name;
        navLinksContainer.appendChild(link);
      } else {
        meal.categoryIds.forEach((catId) => {
          const category = appSettings.categories[catId];
          if (!category) return;
          const sectionId = `category-section-${safeMealName}-${catId}`;
          const link = document.createElement("a");
          link.href = `#${sectionId}`;
          link.className = "nav-link whitespace-nowrap";
          link.textContent = category.name.includes("לחמניות")
            ? "לחמניות"
            : category.name.replace(/<[^>]*>/g, "");
          navLinksContainer.appendChild(link);
        });
      }
    });

    const extrasCat = appSettings.categories["cat_extras"];
    if (extrasCat && extrasCat.groups && extrasCat.groups.length > 0) {
      const link = document.createElement("a");
      link.href = "#category-section-extras";
      link.className = "nav-link whitespace-nowrap";
      link.textContent = "פינוקים";
      navLinksContainer.appendChild(link);
    }

    navLinksContainer.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offset = 100;
          const offsetPosition =
            targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Quantity handlers
  // ---------------------------------------------------------------------------

  function showMinQtyWarning(min) {
    const warning = document.getElementById("min-qty-warning");
    if (warning) {
      warning.textContent = `שימו לב: המינימום להזמנה הוא ${min} מנות.`;
      warning.classList.remove("hidden");
      setTimeout(() => warning.classList.add("hidden"), 3000);
    }
  }

  function hideMinQtyWarning() {
    const warning = document.getElementById("min-qty-warning");
    if (warning) warning.classList.add("hidden");
  }

  function handleQuantityChange(event) {
    const change = parseInt(event.currentTarget.dataset.change);
    const input = document.getElementById("numberOfPeople");
    if (!input) return;
    let newValue = parseInt(input.value) + change;
    const minAllowed = getRequiredMinPortions();
    if (newValue < minAllowed) {
      newValue = minAllowed;
      showMinQtyWarning(minAllowed);
    } else {
      hideMinQtyWarning();
    }
    input.value = newValue;
    orderObject.summary.peopleCount = newValue;
    calculatePrice();
  }

  function handleQuantityInputChange(event) {
    let newValue = parseInt(event.currentTarget.value);
    const minAllowed = getRequiredMinPortions();
    if (isNaN(newValue) || newValue < minAllowed) {
      newValue = minAllowed;
      event.currentTarget.value = newValue;
      showMinQtyWarning(minAllowed);
    } else {
      hideMinQtyWarning();
    }
    orderObject.summary.peopleCount = newValue;
    calculatePrice();
  }

  // ---------------------------------------------------------------------------
  // Item selection handlers
  // ---------------------------------------------------------------------------

  function handlePerPersonExtraToggle(event) {
    const card = event.currentTarget;
    const { itemId } = card.dataset;
    const itemInfo = appSettings.items[itemId];
    const existingItemIndex = orderObject.items.findIndex((i) => i.itemId === itemId);

    if (existingItemIndex > -1) {
      orderObject.items.splice(existingItemIndex, 1);
    } else {
      orderObject.items.push({
        itemId,
        itemName: itemInfo.name,
        isExtra: true,
        quantity: 1,
        pricePerUnit: itemInfo.extraCost,
      });
    }

    card.classList.toggle("selected");
    const checkmarkDiv = card.querySelector("div:last-child");
    checkmarkDiv.style.backgroundColor = card.classList.contains("selected")
      ? "var(--color-primary)"
      : "var(--color-border)";

    calculatePrice();
    saveOrder();
  }

  function handleShabbatChoiceSelect(event) {
    const card = event.currentTarget;
    const { choiceId, mealName } = card.dataset;

    orderObject.selections.shabbatMorningChoice = choiceId;

    const pkg = appSettings.packages[orderObject.summary.packageId];
    const meal = pkg.meals.find((m) => m.name === mealName);
    const selectedOption = meal.options.find((opt) => opt.id === choiceId);
    const otherOption = meal.options.find((opt) => opt.id !== choiceId);

    const itemsToRemove = new Set();
    if (otherOption) {
      otherOption.itemIdsToAdd.forEach((id) => itemsToRemove.add(id));
      otherOption.categoryIds.forEach((catId) => {
        const category = appSettings.categories[catId];
        orderObject.items.forEach((item) => {
          if (item.categoryName === category.name && item.mealName === mealName) {
            itemsToRemove.add(item.itemId);
          }
        });
      });
    }

    orderObject.items = orderObject.items.filter(
      (item) => !itemsToRemove.has(item.itemId)
    );

    if (selectedOption) {
      selectedOption.itemIdsToAdd.forEach((itemId) => {
        if (!orderObject.items.some((i) => i.itemId === itemId)) {
          const item = appSettings.items[itemId];
          orderObject.items.push({
            itemId,
            itemName: item.name,
            mealName,
            categoryName: "סעודת שבת בבוקר",
          });
        }
      });
    }

    renderOrderForm();
    saveOrder();
    calculatePrice();
  }

  function handleItemSelect(event) {
    const card = event.currentTarget;
    const { itemId, catId, mealName } = card.dataset;
    const category = appSettings.categories[catId];
    const item = appSettings.items[itemId];
    const itemIndexInOrder = orderObject.items.findIndex(
      (i) => i.itemId === itemId && i.mealName === mealName
    );

    if (itemIndexInOrder > -1) {
      orderObject.items.splice(itemIndexInOrder, 1);
    } else {
      const currentSelectionCount = orderObject.items.filter(
        (i) => i.categoryName === category.name && i.mealName === mealName
      ).length;
      if (currentSelectionCount < category.selectionLimit) {
        orderObject.items.push({
          itemId,
          itemName: item.name,
          mealName,
          categoryName: category.name,
        });
      }
    }

    updateCategoryUI(mealName, catId);
    saveOrder();
    calculatePrice();
  }

  function handleResetCategory(event) {
    const btn = event.currentTarget;
    const { catId, mealName } = btn.dataset;
    orderObject.items = orderObject.items.filter(
      (item) =>
        !(
          item.mealName === mealName &&
          item.categoryName === appSettings.categories[catId].name
        )
    );
    updateCategoryUI(mealName, catId);
    saveOrder();
    calculatePrice();
  }

  function handleOptionalExtraChange(event) {
    const btn = event.currentTarget;
    const { itemId, change } = btn.dataset;
    const itemInfo = appSettings.items[itemId];
    const existingItemIndex = orderObject.items.findIndex((i) => i.itemId === itemId);
    const currentQty = existingItemIndex > -1 ? orderObject.items[existingItemIndex].quantity : 0;
    const newQty = Math.max(0, currentQty + parseInt(change));

    if (newQty > 0) {
      if (existingItemIndex > -1) {
        orderObject.items[existingItemIndex].quantity = newQty;
      } else {
        orderObject.items.push({
          itemId,
          itemName: itemInfo.name,
          isExtra: true,
          quantity: newQty,
          pricePerUnit: itemInfo.extraCost,
        });
      }
    } else if (existingItemIndex > -1) {
      orderObject.items.splice(existingItemIndex, 1);
    }

    const qtyEl = document.getElementById(`extra-qty-${itemId}`);
    if (qtyEl) qtyEl.textContent = newQty;
    calculatePrice();
  }

  function updateCategoryUI(mealName, catId) {
    const category = appSettings.categories[catId];
    const limit = category.selectionLimit;
    const count = orderObject.items.filter(
      (i) => i.categoryName === category.name && i.mealName === mealName
    ).length;
    const safeMealName = sanitizeForId(mealName);

    const container = document.getElementById(`category-section-${safeMealName}-${catId}`);
    if (!container) return;

    const counter = container.querySelector(`#counter-${safeMealName}-${catId}`);
    const resetBtn = container.querySelector(`#reset-btn-${safeMealName}-${catId}`);
    const itemCards = container.querySelectorAll(".item-card");

    if (counter) {
      counter.textContent = `בחירה: ${count} / ${limit}`;
      counter.style.backgroundColor =
        count >= limit ? "var(--color-primary)" : "var(--color-border)";
      counter.style.color =
        count >= limit ? "var(--color-text-on-primary)" : "var(--color-text-muted)";
      counter.classList.toggle("hidden", count === limit);
    }

    if (resetBtn) {
      resetBtn.classList.toggle("hidden", count === 0);
    }

    itemCards.forEach((card) => {
      const isSelected = orderObject.items.some(
        (i) => i.itemId === card.dataset.itemId && i.mealName === mealName
      );
      card.classList.toggle("selected", isSelected);
      if (count >= limit && !isSelected) {
        card.classList.add("opacity-50", "pointer-events-none");
      } else {
        card.classList.remove("opacity-50", "pointer-events-none");
      }
    });
  }

  function updateAllCounters() {
    const pkg = appSettings.packages[orderObject.summary.packageId];
    if (!pkg) return;
    pkg.meals.forEach((meal) => {
      if (meal.hasChoice) {
        const choice = orderObject.selections.shabbatMorningChoice;
        const selectedOption = meal.options.find((opt) => opt.id === choice);
        if (selectedOption) {
          selectedOption.categoryIds.forEach((catId) =>
            updateCategoryUI(meal.name, catId)
          );
        }
      } else {
        meal.categoryIds.forEach((catId) => updateCategoryUI(meal.name, catId));
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Checkout
  // ---------------------------------------------------------------------------

  function generateDateOptions() {
    const options = [];
    const today = new Date();
    const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const display = `${dayNames[date.getDay()]} ${day}/${month}`;
      const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      options.push({ display, value });
    }
    return options;
  }

  function renderCheckoutScreen() {
    document.getElementById("fullName").value = orderObject.customer.name || "";
    document.getElementById("phone").value = orderObject.customer.phone || "";
    document.getElementById("address").value = orderObject.customer.address || "";
    document.getElementById("notes").value = orderObject.customer.notes || "";

    const dateOptionsContainer = document.getElementById("date-options-container");
    const eventDateInput = document.getElementById("eventDate");
    const dateOptions = generateDateOptions();

    let buttonsHtml = dateOptions
      .map((opt) => `<button type="button" class="date-choice-btn" data-value="${opt.value}">${opt.display}</button>`)
      .join("");
    buttonsHtml += `<button type="button" class="date-choice-btn" data-value="other">אחר</button>`;
    dateOptionsContainer.innerHTML = buttonsHtml;

    const dateButtons = dateOptionsContainer.querySelectorAll(".date-choice-btn");

    const handleDateSelectionUI = () => {
      const currentDate = orderObject.customer.eventDate;
      let isOptionSelected = false;
      dateButtons.forEach((btn) => {
        if (btn.dataset.value !== "other" && btn.dataset.value === currentDate) {
          btn.classList.add("selected");
          isOptionSelected = true;
        } else {
          btn.classList.remove("selected");
        }
      });
      const otherButton = dateOptionsContainer.querySelector('[data-value="other"]');
      if (currentDate && !isOptionSelected) {
        otherButton.classList.add("selected");
        eventDateInput.value = currentDate;
        eventDateInput.classList.remove("hidden");
      } else {
        otherButton.classList.remove("selected");
        eventDateInput.classList.add("hidden");
      }
      updateSideCart();
    };

    dateButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.value;
        if (value === "other") {
          eventDateInput.classList.remove("hidden");
          if (!eventDateInput.value || dateOptions.some((opt) => opt.value === eventDateInput.value)) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 8);
            eventDateInput.value = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;
          }
          orderObject.customer.eventDate = eventDateInput.value;
        } else {
          orderObject.customer.eventDate = value;
        }
        saveOrder();
        handleDateSelectionUI();
      });
    });

    eventDateInput.addEventListener("change", () => {
      orderObject.customer.eventDate = eventDateInput.value;
      saveOrder();
      handleDateSelectionUI();
    });

    handleDateSelectionUI();
  }

  async function handleSubmitOrder(submitBtn) {
    const checkoutForm = document.getElementById("checkout-form");
    const errorEl = document.getElementById("checkout-error");
    errorEl.classList.add("hidden");

    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    if (!orderObject.customer.eventDate) {
      errorEl.textContent = "אנא בחרו תאריך לאירוע.";
      errorEl.classList.remove("hidden");
      document.getElementById("date-options-container")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const reqMin = getRequiredMinPortions();
    if (orderObject.summary.peopleCount < reqMin) {
      errorEl.textContent = `לתאריך הנבחר נדרש מינימום של ${reqMin} מנות. אנא חזרו למסך הקודם לעדכון הכמות.`;
      errorEl.classList.remove("hidden");
      return;
    }

    const submitText = submitBtn.querySelector(".submit-text");
    const spinner = submitBtn.querySelector(".spinner");
    submitBtn.disabled = true;
    submitText.classList.add("hidden");
    spinner.classList.remove("hidden");

    orderObject.summary.createdDate = new Date().toLocaleString("he-IL");

    const dataToSend = {
      ...orderObject,
      whatsappSummary: generateSummaryText(),
    };

    try {
      if (typeof agada_ajax_obj === "undefined" || !agada_ajax_obj.nonce) {
        throw new Error("Security object (agada_ajax_obj) is missing.");
      }

      const formData = new FormData();
      formData.append("action", "submit_agada_order");
      formData.append("security", agada_ajax_obj.nonce);
      formData.append("order_data", JSON.stringify(dataToSend));

      const response = await fetch(agada_ajax_obj.ajax_url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Network error, status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.data?.message || "Server returned an error.");
      }

      showSummaryScreen(true);
      clearSavedOrder();
    } catch (error) {
      console.error("Failed to submit order:", error);
      showSummaryScreen(false);
    } finally {
      submitBtn.disabled = false;
      submitText.classList.remove("hidden");
      spinner.classList.add("hidden");
    }
  }

  // ---------------------------------------------------------------------------
  // Summary text generator
  // ---------------------------------------------------------------------------

  function generateSummaryText() {
    let summary = `🎉 *סיכום הזמנה חדשה* 🎉\n`;
    if (orderObject.summary.createdDate) {
      summary += `_נשלחה בתאריך: ${orderObject.summary.createdDate}_\n\n`;
    } else {
      summary += "\n";
    }

    summary += `📦 *פרטי החבילה:*\n`;
    summary += `• *שם החבילה:* ${orderObject.summary.packageName}\n`;
    summary += `• *כמות מנות:* ${orderObject.summary.peopleCount}\n\n`;

    summary += `👤 *פרטי הלקוח:*\n`;
    summary += `• *שם:* ${orderObject.customer.name || "לא הוזן"}\n`;
    summary += `• *טלפון:* ${orderObject.customer.phone || "לא הוזן"}\n`;
    summary += `• *כתובת:* ${orderObject.customer.address || "לא הוזן"}\n`;
    summary += `• *תאריך:* ${orderObject.customer.eventDate || "לא הוזן"}\n\n`;

    summary += `📋 *פירוט ההזמנה:*\n`;
    const itemsByMeal = {};
    const extras = [];

    orderObject.items.forEach((item) => {
      if (item.isExtra) {
        extras.push(item);
        return;
      }
      if (item.isPredefined) return;
      if (!itemsByMeal[item.mealName]) itemsByMeal[item.mealName] = {};
      if (!itemsByMeal[item.mealName][item.categoryName])
        itemsByMeal[item.mealName][item.categoryName] = [];
      itemsByMeal[item.mealName][item.categoryName].push(item.itemName);
    });

    const selectedPackage = appSettings.packages[orderObject.summary.packageId];
    selectedPackage.meals.forEach((meal) => {
      summary += `\n🍽️ *${meal.name}*\n`;
      if (meal.hasChoice) {
        const choiceId = orderObject.selections.shabbatMorningChoice;
        const choice = meal.options.find((o) => o.id === choiceId);
        if (choice) {
          summary += `*בחירה:* ${choice.name}\n`;
          if (itemsByMeal[meal.name]) {
            Object.entries(itemsByMeal[meal.name]).forEach(([catName, items]) => {
              const category = Object.values(appSettings.categories).find(
                (c) => c.name === catName
              );
              summary += `*${category?.emoji || ""} ${catName}:*\n`;
              items.forEach((itemName) => (summary += `  • ${itemName}\n`));
            });
          }
        }
      } else {
        if (itemsByMeal[meal.name]) {
          Object.entries(itemsByMeal[meal.name]).forEach(([catName, items]) => {
            const category = Object.values(appSettings.categories).find(
              (c) => c.name === catName
            );
            summary += `*${category?.emoji || ""} ${catName}:*\n`;
            items.forEach((itemName) => (summary += `  • ${itemName}\n`));
          });
        }
      }
    });

    if (extras.length > 0) {
      const extrasCat = appSettings.categories["cat_extras"];
      summary += `\n${extrasCat?.emoji || "✨"} *${extrasCat?.name || "תוספות"}:*\n`;
      extras.forEach((item) => {
        const itemInfo = appSettings.items[item.itemId];
        if (itemInfo?.pricePerPerson) {
          summary += `  • ${item.itemName}\n`;
        } else {
          summary += `  • ${item.itemName} (x${item.quantity})\n`;
        }
      });
      summary += "\n";
    }

    if (orderObject.customer.notes) {
      summary += `\n📝 *הערות:*\n${orderObject.customer.notes}\n\n`;
    }

    if (orderObject.customer.wantsQuote) {
      summary += `*✓ מעוניין בהצעת מחיר לניהול אירוע מלא.*\n\n`;
    }

    summary += `💰 *סה"כ לתשלום:* ${orderObject.summary.totalPrice.toLocaleString()} ₪\n\n`;
    summary += `תודה שבחרתם באגדה! ניצור קשר בהקדם לאישור סופי.`;
    return summary;
  }

  function renderFriendlySummary() {
    const summaryEl = document.getElementById("friendly-summary");
    if (summaryEl) {
      summaryEl.textContent = generateSummaryText()
        .replace(/\*/g, "")
        .replace(/<[^>]*>/g, "");
    }
  }

  function showSummaryScreen(isSuccess) {
    const successIcon = document.getElementById("summary-icon-success");
    const errorIcon = document.getElementById("summary-icon-error");
    const title = document.getElementById("summary-title");
    const subtitle = document.getElementById("summary-subtitle");

    if (isSuccess) {
      successIcon.classList.remove("hidden");
      errorIcon.classList.add("hidden");
      title.textContent = "ההזמנה התקבלה בהצלחה!";
      title.style.color = "var(--color-text-strong)";
      subtitle.textContent =
        "תודה שבחרתם בקייטרינג אגדה! נציג יחזור אליכם בהקדם לאישור סופי. זהו סיכום ההזמנה שלכם:";
    } else {
      successIcon.classList.add("hidden");
      errorIcon.classList.remove("hidden");
      title.textContent = "אירעה תקלה בשליחה";
      title.style.color = "var(--color-danger)";
      subtitle.innerHTML =
        "ההזמנה נשמרה אך לא נשלחה אלינו.<br>אנא שתפו את הסיכום ב-WhatsApp וצרו עמנו קשר.";
    }

    renderFriendlySummary();
    navigateTo("summary");
  }

  // ---------------------------------------------------------------------------
  // Scroll spy
  // ---------------------------------------------------------------------------

  function setupScrollSpy() {
    const sections = document.querySelectorAll("#screen-order-form section[id]");
    const navLinks = document.querySelectorAll("#nav-links-container a");
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinksContainer.querySelector(
            `a[href="#${entry.target.id}"]`
          );
          if (link && entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-100px 0px -85% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init() {
    // Apply dark mode based on system preference.
    const appContainer = document.getElementById("agada-order-app");
    if (
      appContainer &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      appContainer.classList.add("dark");
    }

    // Checkout form live save.
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("input", (e) => {
        const { id, value } = e.target;
        if (id === "fullName") {
          orderObject.customer.name = value;
        } else if (Object.prototype.hasOwnProperty.call(orderObject.customer, id)) {
          orderObject.customer[id] = value;
        }
        saveOrder();
      });
    }

    // Copy summary button.
    const copyBtn = document.getElementById("copy-summary-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text = generateSummaryText();
        const textArea = document.createElement("textarea");
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        const span = copyBtn.querySelector("span");
        if (span) {
          const original = span.textContent;
          span.textContent = "הועתק!";
          setTimeout(() => (span.textContent = original), 2000);
        }
      });
    }

    // WhatsApp share button.
    const whatsappBtn = document.getElementById("whatsapp-share-btn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const url = `https://wa.me/${restaurantNumber}?text=${encodeURIComponent(generateSummaryText())}`;
        window.open(url, "_blank");
      });
    }

    // Theme toggle.
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        document.getElementById("agada-order-app")?.classList.toggle("dark");
      });
    }

    // New order button.
    const newOrderBtn = document.getElementById("new-order-btn");
    if (newOrderBtn) {
      newOrderBtn.addEventListener("click", () => {
        orderObject = JSON.parse(JSON.stringify(initialOrder));
        clearSavedOrder();
        renderOrderForm();
        navigateTo("orderForm");
      });
    }

    renderOrderForm();
    navigateTo("orderForm");
    updateSideCart();

    // Resume saved order.
    const savedOrderJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedOrderJSON && resumeModal) {
      resumeModal.classList.remove("hidden");

      document.getElementById("resume-yes-btn")?.addEventListener("click", () => {
        try {
          orderObject = JSON.parse(savedOrderJSON);
          if (!orderObject.selections) {
            orderObject.selections = { shabbatMorningChoice: null };
          }
          const reqMin = getRequiredMinPortions();
          if (orderObject.summary.peopleCount < reqMin) {
            orderObject.summary.peopleCount = reqMin;
            saveOrder();
          }
        } catch (e) {
          orderObject = JSON.parse(JSON.stringify(initialOrder));
        }
        resumeModal.classList.add("hidden");
        renderOrderForm();
        navigateTo("orderForm");
      });

      document.getElementById("resume-no-btn")?.addEventListener("click", () => {
        clearSavedOrder();
        resumeModal.classList.add("hidden");
      });
    }

    // Mobile summary modal.
    const mobileTrigger = document.getElementById("mobile-summary-trigger");
    if (mobileTrigger) {
      mobileTrigger.addEventListener("click", () => toggleMobileSummary(true));
    }

    if (mobileSummaryModal) {
      document.getElementById("mobile-summary-overlay")?.addEventListener("click", () =>
        toggleMobileSummary(false)
      );
      document.getElementById("mobile-summary-close-btn")?.addEventListener("click", () =>
        toggleMobileSummary(false)
      );
    }
  }

  init();
});
