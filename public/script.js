const auth = document.getElementById("auth");
const app = document.getElementById("app");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const cardsContainer = document.getElementById("cards");
const questionInput = document.getElementById("question");
const answerInput = document.getElementById("answer");
const addBtn = document.getElementById("addBtn");

const manageBtn = document.getElementById("manageBtn");
const studyBtn = document.getElementById("studyBtn");

const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const adminOutput = document.getElementById("adminOutput");

const searchInput = document.getElementById("searchInput");

let editingId = null;
let currentMode = "manage";
let studyCards = [];

function getRole() {
  return localStorage.getItem("role");
}

// LIVE SEARCH BAR 
searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim();
  fetchCards(value);
});

function bindAdminButtons() {
  const usersBtn = document.getElementById("loadUsersBtn");
  const historyBtn = document.getElementById("loadHistoryBtn");

  if (!usersBtn || !historyBtn) return;

usersBtn.onclick = async () => {
  const res = await fetch("/api/admin/users", {
    headers: { Authorization: "Bearer " + getToken() }
  });

  const data = await res.json();

  adminOutput.innerHTML =
    "<h3>Users</h3>" +
    data.map(u => `<p>${u.username} - ${u.email}</p>`).join("");
};

  historyBtn.onclick = async () => {
  try {
    const res = await fetch("/api/admin/history", {
      headers: { Authorization: "Bearer " + getToken() }
    });

    if (!res.ok) {
      adminOutput.innerHTML = "<p>Not authorized or error loading history</p>";
      return;
    }

    const data = await res.json();

    if (!data.length) {
      adminOutput.innerHTML = "<p>No history found</p>";
      return;
    }

    adminOutput.innerHTML =
      "<h3>All Flashcards Completed</h3>" +
      data.map(h => `
        <p>
          <strong>${h.userId?.username || "Unknown User"}</strong>
          completed "${h.question || "Deleted flashcard"}"
        </p>
      `).join("");

  } catch (err) {
    adminOutput.innerHTML = "<p>Failed to load history</p>";
  }
};
}
function getToken() {
  return localStorage.getItem("token");
}

function applyRoleUI() {
  const role = getRole();
  const adminBtn = document.getElementById("adminBtn");

  if (!adminBtn) return;

  if (role !== "admin") {
    adminBtn.style.display = "none";
  } else {
    adminBtn.style.display = "inline-block";
  }
}

function setState(loggedIn) {
  auth.classList.toggle("hidden", loggedIn);
  app.classList.toggle("hidden", !loggedIn);

  if (loggedIn) fetchCards();
}

function initApp() {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    auth.classList.remove("hidden");
    app.classList.add("hidden");
    return;
  }

  auth.classList.add("hidden");
  app.classList.remove("hidden");

  applyRoleUI();

  fetchCards();
}

document.addEventListener("DOMContentLoaded", initApp);

//REGISTER
registerBtn.addEventListener("click", async () => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: regUsername.value,
      email: regEmail.value,
      password: regPassword.value
    })
  });

  const data = await res.json();

  console.log("REGISTER:", data);

  if (!res.ok) {
    alert(data.message || "Register failed");
    return;
  }

  alert("Registered successfully");
});

//LOGIN
loginBtn.addEventListener("click", async () => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role);

  applyRoleUI();

  auth.style.display = "none";
  app.style.display = "block";

  resetModes();

  currentMode = "manage";
  manageBtn.classList.add("active-mode");
  fetchCards();
  bindAdminButtons();
});
let cachedCards = [];

//FETCH CARDS
async function fetchCards(search = "") {
  const token = getToken();
  if (!token) return setState(false);

  const res = await fetch(`/api/flashcards?search=${search}`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) return showAuth();

  cachedCards = await res.json();

  renderCurrentMode();
}

function renderCurrentMode() {
  if (currentMode === "manage") renderManage(cachedCards);
  if (currentMode === "study") startStudyMode(cachedCards);
}

//MANAGE MODE
function renderManage(cards) {
  cardsContainer.innerHTML = "";
  cardsContainer.classList.remove("empty");
  if (!cards.length) {
    cardsContainer.classList.add("empty");

    cardsContainer.innerHTML = `
      <div class="center-message">No cards</div>
    `;
    return;
  }

  cards.forEach(card => {
    const wrapper = document.createElement("div");
    wrapper.className = "card";

    wrapper.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${card.question}</div>
        <div class="card-back">${card.answer}</div>
      </div>
      <div class="card-buttons">
        <button class="edit-btn">✎</button>
        <button class="delete-btn">×</button>
      </div>
    `;

    wrapper.addEventListener("click", e => {
      if (e.target.tagName !== "BUTTON") {
        wrapper.classList.toggle("flipped");
      }
    });

    wrapper.querySelector(".delete-btn").addEventListener("click", async e => {
      e.stopPropagation();

      await fetch(`/api/flashcards/${card._id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + getToken()
        }
      });

      fetchCards();
    });

    wrapper.querySelector(".edit-btn").addEventListener("click", e => {
      e.stopPropagation();

      questionInput.value = card.question;
      answerInput.value = card.answer;
      editingId = card._id;
      addBtn.textContent = "Update Flashcard";
    });

    cardsContainer.appendChild(wrapper);
  });
}

//ADD / UPDATE
addBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) return alert("Fill both fields");

  const token = getToken();

  if (!token) {
    setState(false);
    return;
  }

  if (editingId) {
    await fetch(`/api/flashcards/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ question, answer })
    });

    editingId = null;
    addBtn.textContent = "Add Flashcard";
  } else {
    await fetch("/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ question, answer })
    });
  }

  questionInput.value = "";
  answerInput.value = "";

  fetchCards();
});

function resetModes() {
  manageBtn.classList.remove("active-mode");
  studyBtn.classList.remove("active-mode");
  adminBtn.classList.remove("active-mode");

  adminPanel.style.display = "none";
}

function switchMode(mode) {
  if (currentMode === mode) return; 

  resetModes();
  currentMode = mode;

  manageBtn.classList.toggle("active-mode", mode === "manage");
  studyBtn.classList.toggle("active-mode", mode === "study");
  adminBtn.classList.toggle("active-mode", mode === "admin");

  adminPanel.style.display = mode === "admin" ? "flex" : "none";

  renderCurrentMode(); 
}

manageBtn.addEventListener("click", () => switchMode("manage"));

studyBtn.addEventListener("click", () => {
  switchMode("study");
});

adminBtn.addEventListener("click", () => switchMode("admin"));

function setFormVisible(visible) {
  document.querySelector(".form").style.display = visible ? "flex" : "none";
}

//STUDY MODE
function startStudyMode(cards) {
  cardsContainer.innerHTML = "";

  if (!cards.length) {
    cardsContainer.classList.add("no-cards");
    cardsContainer.innerHTML = `<div class="center-message">No cards</div>`;
    return;
  }

  studyCards = [...cards];
  showCard();
}

function showCard() {
  cardsContainer.innerHTML = "";

  if (studyCards.length === 0) {
    const msg = document.createElement("div");
    msg.className = "center-message";
    msg.textContent = "All cards completed!";
    cardsContainer.appendChild(msg);
    return;
  }

  const card = studyCards[0];

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="card-inner">
      <div class="card-front">${card.question}</div>
      <div class="card-back">${card.answer}</div>
    </div>
    <button class="complete">Done</button>
  `;

  div.addEventListener("click", (e) => {
    if (e.target.classList.contains("complete")) return;
    div.classList.toggle("flipped");
  });

  div.querySelector(".complete").addEventListener("click", async (e) => {
    e.stopPropagation();

    await fetch("/api/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken()
      },
      body: JSON.stringify({ flashcardId: card._id })
    });

    studyCards.shift();
    showCard();
  });

  cardsContainer.appendChild(div);
}