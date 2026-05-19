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

let editingId = null;
let currentMode = "manage";
let studyCards = [];

function getToken() {
  return localStorage.getItem("token");
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

  console.log("STATUS:", res.status);
  console.log("RESPONSE:", data);

  if (!res.ok) {
    alert(data.message || "Login failed");
    return;
  }

  if (!data.token) {
    alert("No token received");
    return;
  }

  localStorage.setItem("token", data.token);

auth.style.display = "none";
app.style.display = "block";

fetchCards();

  fetchCards();
});
//FETCH CARDS
async function fetchCards(search = "") {
  const token = getToken();

  if (!token) {
    setState(false);
    return;
  }

  const res = await fetch(`/api/flashcards?search=${search}`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  if (!res.ok) {
    showAuth();
    return;
  }

  const cards = await res.json();

  if (currentMode === "manage") renderManage(cards);
  else startStudyMode(cards);
}

//MANAGE MODE
function renderManage(cards) {
  cardsContainer.innerHTML = "";

  if (!cards.length) {
    cardsContainer.classList.add("no-cards");
    cardsContainer.innerHTML = `<div class="center-message">No cards</div>`;
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

//MODE SWITCH
manageBtn.addEventListener("click", () => {
  currentMode = "manage";

  app.classList.remove("study-mode");
  manageBtn.classList.add("active-mode");
  studyBtn.classList.remove("active-mode");

  fetchCards();
});

studyBtn.addEventListener("click", () => {
  currentMode = "study";

  app.classList.add("study-mode");
  studyBtn.classList.add("active-mode");
  manageBtn.classList.remove("active-mode");

  fetchCards();
});

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

  div.querySelector(".complete").addEventListener("click", (e) => {
    e.stopPropagation();
    studyCards.shift();
    showCard();
  });

  cardsContainer.appendChild(div);
}