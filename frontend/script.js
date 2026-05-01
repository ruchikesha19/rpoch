const roleRoutes = {
  volunteer: "volunteers.html",
  restaurant: "restaurants.html",
  ngo: "ngo.html"
};

const roleLabels = {
  volunteer: "Volunteer",
  restaurant: "Restaurant",
  ngo: "NGO"
};

const guardedPages = {
  "volunteers.html": ["volunteer"],
  "restaurants.html": ["restaurant"],
  "ngo.html": ["ngo"],
  "community.html": ["volunteer", "restaurant"]
};

function showToast(message) {
  let toast = document.querySelector(".app-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setButtonSaved(button, text = "Done") {
  if (!button) return;

  const originalText = button.textContent;
  button.textContent = text;
  button.classList.add("saved");

  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("saved");
  }, 1200);
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("feedNetSession") || "null");
  } catch {
    return null;
  }
}

function setSession(role) {
  localStorage.setItem("feedNetSession", JSON.stringify({ role, loggedInAt: Date.now() }));
}

function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function enforcePageAccess() {
  const page = getCurrentPage();
  const allowedRoles = guardedPages[page];
  if (!allowedRoles) return;

  const session = getSession();
  if (!session || !allowedRoles.includes(session.role)) {
    if (session?.role && roleRoutes[session.role]) {
      window.location.replace(roleRoutes[session.role]);
      return;
    }

    const redirectRole = allowedRoles.length === 1 ? `?role=${allowedRoles[0]}` : "";
    window.location.replace(`login.html${redirectRole}`);
  }
}

enforcePageAccess();

function buildRoleNav() {
  const nav = document.querySelector("[data-role-nav]");
  if (!nav) return;

  const session = getSession();
  const role = session?.role;
  const dashboard = roleRoutes[role] || "login.html";
  const dashboardText = roleLabels[role] || "Dashboard";
  const current = getCurrentPage();

  if (!["volunteer", "restaurant"].includes(role) && current === "community.html") {
    window.location.replace("login.html");
    return;
  }

  nav.innerHTML = `
    <a class="role-nav-link ${current === dashboard ? "active" : ""}" href="${dashboard}">${dashboardText}</a>
    <a class="role-nav-link ${current === "community.html" ? "active" : ""}" href="community.html">Community</a>
    <button class="role-nav-link" data-logout type="button">Logout</button>
  `;
}

function logout() {
  localStorage.removeItem("feedNetSession");
  window.location.href = "index.html";
}

buildRoleNav();

document.addEventListener("click", (event) => {
  const logoutButton = event.target.closest("[data-logout]");
  if (logoutButton) logout();
});

function activateTab(button) {
  const switcher = button.closest("[role='tablist']");
  if (!switcher) return;

  switcher.querySelectorAll(".tab-button").forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("active", isActive);
    item.classList.toggle("text-ocean-950", isActive);
    item.classList.toggle("text-slate-500", !isActive);
  });

  const scope = switcher.parentElement;
  scope.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === button.dataset.tabTarget);
  });
}

document.querySelectorAll("[role='tablist'] .tab-button").forEach((button) => {
  button.addEventListener("click", () => activateTab(button));
});

const queryRole = new URLSearchParams(window.location.search).get("role");
if (queryRole) {
  const requestedTab = document.querySelector(`[data-tab-target="${queryRole}-register"]`);
  const roleSelect = document.querySelector("[data-login-form] select[name='role']");

  if (requestedTab) activateTab(requestedTab);
  if (roleSelect && roleRoutes[queryRole]) roleSelect.value = queryRole;
}

document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    const role = form.dataset.role || "user";
    localStorage.setItem("feedNetProfile", JSON.stringify({ ...data, role, createdAt: Date.now() }));
    setSession(role);
    setButtonSaved(form.querySelector("button[type='submit']"), "Account created");
    showToast(`Registration saved. Opening your ${roleLabels[role]} page.`);

    window.setTimeout(() => {
      window.location.href = roleRoutes[role] || "index.html";
    }, 650);
  });
});

document.querySelectorAll("[data-login-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = new FormData(form).get("role");
    const route = roleRoutes[role] || "index.html";
    setSession(role);
    setButtonSaved(form.querySelector("button[type='submit']"), "Logged in");
    showToast("Login successful. Opening your dashboard.");

    window.setTimeout(() => {
      window.location.href = route;
    }, 650);
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function incrementStat(name, amount) {
  const stat = document.querySelector(`[data-stat='${name}']`);
  if (!stat) return;

  const nextValue = Number(stat.textContent.replace(/,/g, "")) + amount;
  stat.textContent = new Intl.NumberFormat("en-IN").format(nextValue);
}

function getRewardKey(role) {
  return `feedNetRewards:${role}`;
}

function getRewardHistory(role) {
  try {
    return JSON.parse(localStorage.getItem(getRewardKey(role)) || "[]");
  } catch {
    return [];
  }
}

function saveRewardHistory(role, history) {
  localStorage.setItem(getRewardKey(role), JSON.stringify(history));
}

function getRewardRole() {
  return document.querySelector("[data-reward-form]")?.dataset.rewardRole || getSession()?.role || "volunteer";
}

function isToday(timestamp) {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

function calculateRewardPoints(distanceKm, durationHours, todayCount) {
  const distancePoints = distanceKm * 2;
  const durationPoints = durationHours * 10;
  const dailyBonus = todayCount * 5;
  return Math.max(5, Math.round(distancePoints + durationPoints + dailyBonus));
}

function addRewardContribution(role, contribution) {
  const history = getRewardHistory(role);
  const todayCount = history.filter((item) => isToday(item.createdAt)).length;
  const distanceKm = Number(contribution.distanceKm) || 0;
  const durationHours = Number(contribution.durationHours) || 0;
  const points = calculateRewardPoints(distanceKm, durationHours, todayCount);
  const entry = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
    title: contribution.title || "Food contribution",
    meals: Number(contribution.meals) || 0,
    distanceKm,
    durationHours,
    points,
    createdAt: Date.now()
  };

  history.unshift(entry);
  saveRewardHistory(role, history.slice(0, 25));
  renderRewardSystem(role);
  return entry;
}

function renderRewardSystem(role = getRewardRole()) {
  const summary = document.querySelector("[data-reward-summary]");
  const list = document.querySelector("[data-reward-history]");
  if (!summary && !list) return;

  const history = getRewardHistory(role);
  const totalPoints = history.reduce((sum, item) => sum + Number(item.points || 0), 0);
  const todayCount = history.filter((item) => isToday(item.createdAt)).length;
  const totalKm = history.reduce((sum, item) => sum + Number(item.distanceKm || 0), 0);

  document.querySelectorAll("[data-stat='points']").forEach((stat) => {
    stat.textContent = new Intl.NumberFormat("en-IN").format(totalPoints);
  });
  document.querySelectorAll("[data-stat='todayContributions']").forEach((stat) => {
    stat.textContent = String(todayCount);
  });
  document.querySelectorAll("[data-stat='rewardKm']").forEach((stat) => {
    stat.textContent = totalKm.toFixed(1);
  });

  if (summary) {
    summary.innerHTML = `
      <article class="lift-card rounded-lg border border-ocean-100 bg-white p-5">
        <span class="text-sm font-black text-slate-500">Reward points</span>
        <strong class="mt-2 block text-3xl font-black text-ocean-950">${new Intl.NumberFormat("en-IN").format(totalPoints)}</strong>
      </article>
      <article class="lift-card rounded-lg border border-ocean-100 bg-white p-5">
        <span class="text-sm font-black text-slate-500">Contributions today</span>
        <strong class="mt-2 block text-3xl font-black text-ocean-950">${todayCount}</strong>
      </article>
      <article class="lift-card rounded-lg border border-ocean-100 bg-white p-5">
        <span class="text-sm font-black text-slate-500">Kilometers logged</span>
        <strong class="mt-2 block text-3xl font-black text-ocean-950">${totalKm.toFixed(1)}</strong>
      </article>
    `;
  }

  if (list) {
    const recent = history.slice(0, 5);
    list.innerHTML = recent.length ? recent.map((item) => `
      <article class="rounded-lg border border-ocean-100 bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-black text-ocean-950">${escapeHtml(item.title)}</h3>
            <p class="mt-1 text-sm leading-6 text-slate-600">${item.meals} meals - ${item.distanceKm} km - ${item.durationHours} hr</p>
          </div>
          <strong class="rounded-full bg-mint-100 px-3 py-1 text-sm font-black text-mint-700">+${item.points}</strong>
        </div>
      </article>
    `).join("") : `
      <article class="rounded-lg border border-ocean-100 bg-white p-4 text-sm font-bold leading-6 text-slate-600">
        No contribution history yet. Log a route or accept a pickup to start earning points.
      </article>
    `;
  }
}

document.querySelectorAll("[data-reward-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = form.dataset.rewardRole || getSession()?.role || "volunteer";
    const data = Object.fromEntries(new FormData(form).entries());
    const entry = addRewardContribution(role, {
      title: data.title,
      meals: data.meals,
      distanceKm: data.distanceKm,
      durationHours: data.durationHours
    });

    setButtonSaved(form.querySelector("button[type='submit']"), `+${entry.points} points`);
    showToast(`${entry.points} points added to your reward history.`);
    form.reset();
  });
});

renderRewardSystem();

function handlePickupAccept(button) {
  button.textContent = "Accepted";
  button.disabled = true;
  button.classList.add("opacity-70");

  const distanceKm = Number(button.dataset.distanceKm || 20);
  const durationHours = Number(button.dataset.durationHours || 1);
  const meals = Number(button.dataset.meals || 0);
  const title = button.dataset.title || "Accepted pickup";
  const entry = addRewardContribution("volunteer", { title, meals, distanceKm, durationHours });

  incrementStat("pickups", 1);
  incrementStat("meals", meals);
  showToast(`Pickup accepted. ${entry.points} reward points added.`);
}

document.querySelectorAll("[data-accept-pickup]").forEach((button) => {
  button.addEventListener("click", () => handlePickupAccept(button));
});

document.querySelectorAll("[data-refresh]").forEach((button) => {
  button.addEventListener("click", () => {
    const list = document.getElementById("volunteer-listings");
    if (!list) return;

    list.prepend(createVolunteerListing());
    setButtonSaved(button, "Updated");
    showToast("New nearby listing added.");
  });
});

function createVolunteerListing() {
  const article = document.createElement("article");
  article.className = "lift-card flex items-center justify-between gap-4 rounded-lg border border-ocean-100 bg-white p-5 max-sm:flex-col max-sm:items-start";
  article.innerHTML = `
    <div>
      <span class="rounded-full bg-mint-100 px-3 py-1 text-xs font-black text-mint-700">New</span>
      <h3 class="mt-3 text-lg font-black text-ocean-950">24 dinner packs, Garden Bowl</h3>
      <p class="mt-1 text-slate-600">Expires in 2 hr - 20 km route - estimated 1 hr</p>
    </div>
    <button class="outline-button" data-accept-pickup data-title="Garden Bowl dinner pickup" data-meals="24" data-distance-km="20" data-duration-hours="1" type="button">Accept</button>
  `;
  article.querySelector("[data-accept-pickup]").addEventListener("click", (event) => {
    handlePickupAccept(event.currentTarget);
  });
  return article;
}

const quickAddForm = document.getElementById("quick-add-form");
if (quickAddForm) {
  quickAddForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(quickAddForm);
    const food = String(formData.get("food") || "New food listing");
    const servings = String(formData.get("servings") || "0");
    const pickup = String(formData.get("pickup") || "soon");
    const distanceKm = Number(formData.get("distanceKm") || 20);
    const durationHours = Number(formData.get("durationHours") || 1);
    const list = document.getElementById("restaurant-listings");

    if (list) list.prepend(createRestaurantListing(food, servings, pickup, distanceKm, durationHours));
    incrementStat("restaurantListings", 1);
    incrementStat("restaurantMeals", Number(servings));

    const entry = addRewardContribution("restaurant", {
      title: `${food} donation listed`,
      meals: Number(servings),
      distanceKm,
      durationHours
    });

    setButtonSaved(quickAddForm.querySelector("button[type='submit']"), `+${entry.points} points`);
    showToast("Listing added, matching started, and reward points logged.");
    quickAddForm.reset();
  });
}

function createRestaurantListing(food, servings, pickup, distanceKm, durationHours) {
  const article = document.createElement("article");
  article.className = "lift-card flex items-center justify-between gap-4 rounded-lg border border-ocean-100 bg-white p-5 max-sm:flex-col max-sm:items-start";
  article.innerHTML = `
    <div>
      <span class="rounded-full bg-ocean-100 px-3 py-1 text-xs font-black text-ocean-800">Matching</span>
      <h3 class="mt-3 text-lg font-black text-ocean-950">${escapeHtml(servings)} ${escapeHtml(food)} servings</h3>
      <p class="mt-1 text-slate-600">Pickup ${escapeHtml(pickup)} - ${distanceKm} km route - ${durationHours} hr estimate</p>
    </div>
    <button class="outline-button" data-manage-listing type="button">Manage</button>
  `;
  article.querySelector("[data-manage-listing]").addEventListener("click", handleListingAction);
  return article;
}

function handleListingAction(event) {
  setButtonSaved(event.currentTarget, "Opened");
  showToast("Listing details opened for review.");
}

document.querySelectorAll("[data-manage-listing]").forEach((button) => {
  button.addEventListener("click", handleListingAction);
});

document.querySelectorAll(".chart-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const chart = document.getElementById(button.dataset.chartTarget);
    if (!chart) return;

    const values = button.dataset.chartValues.split(",").map(Number);
    const max = Math.max(...values);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    chart.querySelectorAll("span").forEach((bar, index) => {
      const value = values[index] || 0;
      bar.style.setProperty("--value", `${Math.max(8, Math.round((value / max) * 100))}%`);
      bar.querySelector("b").textContent = value;
      bar.querySelector("em").textContent = days[index];
    });

    button.parentElement.querySelectorAll(".chart-toggle").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("bg-white", isActive);
      item.classList.toggle("text-ocean-950", isActive);
      item.classList.toggle("text-slate-500", !isActive);
    });
  });
});

const defaultChatMessages = [
  {
    author: "Blue Plate Cafe",
    role: "restaurant",
    message: "We have 40 sealed dinner packs ready near Connaught Place. Can a volunteer confirm pickup by 7 PM?",
    createdAt: Date.now() - 1000 * 60 * 24
  },
  {
    author: "Volunteer Sanya",
    role: "volunteer",
    message: "I can take this route. Please keep the packages labeled with veg and non-veg counts.",
    createdAt: Date.now() - 1000 * 60 * 18
  }
];

function getChatMessages() {
  try {
    return JSON.parse(localStorage.getItem("feedNetCommunityChat") || "null") || defaultChatMessages;
  } catch {
    return defaultChatMessages;
  }
}

function saveChatMessages(messages) {
  localStorage.setItem("feedNetCommunityChat", JSON.stringify(messages.slice(-50)));
}

function getChatAuthor(role) {
  const profile = (() => {
    try {
      return JSON.parse(localStorage.getItem("feedNetProfile") || "{}");
    } catch {
      return {};
    }
  })();

  if (role === "restaurant") return profile.hotel || "Restaurant";
  if (role === "volunteer") return profile.name || "Volunteer";
  return roleLabels[role] || "Community";
}

function renderCommunityChat() {
  const chatLog = document.querySelector("[data-chat-log]");
  if (!chatLog) return;

  const messages = getChatMessages();
  chatLog.innerHTML = messages.map((item) => {
    const initials = item.author.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const isRestaurant = item.role === "restaurant";

    return `
      <article class="chat-message ${isRestaurant ? "restaurant" : "volunteer"}">
        <span class="chat-avatar">${escapeHtml(initials || "FN")}</span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-black text-ocean-950">${escapeHtml(item.author)}</h2>
            <span class="rounded-full ${isRestaurant ? "bg-ocean-100 text-ocean-800" : "bg-mint-100 text-mint-700"} px-3 py-1 text-xs font-black">${escapeHtml(roleLabels[item.role] || "Member")}</span>
          </div>
          <p class="mt-2 leading-7 text-slate-600">${escapeHtml(item.message)}</p>
        </div>
      </article>
    `;
  }).join("");
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.querySelectorAll("[data-chat-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const session = getSession();
    const role = session?.role;
    if (!["volunteer", "restaurant"].includes(role)) {
      showToast("Please login as a volunteer or restaurant to chat.");
      return;
    }

    const message = String(new FormData(form).get("message") || "").trim();
    if (!message) return;

    const messages = getChatMessages();
    messages.push({
      author: getChatAuthor(role),
      role,
      message,
      createdAt: Date.now()
    });
    saveChatMessages(messages);
    renderCommunityChat();
    setButtonSaved(form.querySelector("button[type='submit']"), "Sent");
    form.reset();
  });
});

renderCommunityChat();
