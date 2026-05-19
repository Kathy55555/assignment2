const cardsContainer = document.getElementById("cards");
const questionInput = document.getElementById("question");
const answerInput = document.getElementById("answer");
const addBtn = document.getElementById("addBtn");

const manageBtn = document.getElementById("manageBtn");
const studyBtn = document.getElementById("studyBtn");
const progressDisplay = document.getElementById("progress");

const container = document.querySelector(".container");

const authBox = document.getElementById("auth");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");


let editingId = null;
let currentMode = "manage";
let studyCards = [];


async function fetchCards() {
  const res = await fetch("/api/flashcards");
  const cards = await res.json();

  if (currentMode === "manage") {
    renderManage(cards);
  } else {
    startStudyMode(cards);
  }
}

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

  localStorage.setItem("token", data.token);

  authBox.style.display = "none";

  fetchCards();
});

registerBtn.addEventListener("click", async () => {
  await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: regUsername.value,
      email: regEmail.value,
      password: regPassword.value
    })
  });

  alert("Registered! Now login.");
});

// Manage mode
function renderManage(cards) {
  cardsContainer.innerHTML = "";
  progressDisplay.textContent = "";

if (cards.length === 0) {
  cardsContainer.classList.add("no-cards"); 
  cardsContainer.innerHTML = `<div class="center-message">No cards.</div>`;
  return;
} else {
  cardsContainer.classList.remove("no-cards"); 
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
      if (e.target.tagName !== "BUTTON") wrapper.classList.toggle("flipped");
    });

    wrapper.querySelector(".delete-btn").addEventListener("click", async e => {
      e.stopPropagation();
      await fetch(`/api/flashcards/${card._id}`, { method: "DELETE" });
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

//add or update card
addBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) return alert("Both fields are required");

  if (editingId) {
    await fetch(`/api/flashcards/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    editingId = null;
    addBtn.textContent = "Add Flashcard";
  } else {
    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
  }

  questionInput.value = "";
  answerInput.value = "";
  fetchCards();
});

//Study mode
function startStudyMode(cards) {
  cardsContainer.innerHTML = "";
  progressDisplay.textContent = "";

  if (cards.length === 0) {
    cardsContainer.innerHTML = `<div class="center-message">No cards.</div>`;
    return;
  }

  studyCards = [...cards];
  showStudyCard();
}

function showStudyCard() {
  cardsContainer.innerHTML = "";

  if (studyCards.length === 0) {
    cardsContainer.innerHTML = `<div class="center-message">🎉 All cards completed!</div>`;
    return;
  }

  progressDisplay.textContent = `${studyCards.length} card(s) remaining`;

  const card = studyCards[0];
  const wrapper = document.createElement("div");
  wrapper.className = "card";

  wrapper.innerHTML = `
    <div class="card-inner">
      <div class="card-front">${card.question}</div>
      <div class="card-back">${card.answer}</div>
    </div>
    <div class="study-actions">
      <button class="complete-btn">Mark as Known ✓</button>
    </div>
  `;

  wrapper.addEventListener("click", e => {
    if (e.target.tagName !== "BUTTON") wrapper.classList.toggle("flipped");
  });

  wrapper.querySelector(".complete-btn").addEventListener("click", e => {
    e.stopPropagation();
    studyCards.shift();
    showStudyCard();
  });

  cardsContainer.appendChild(wrapper);
}

// Switch modes between study and manage
manageBtn.addEventListener("click", () => {
  currentMode = "manage";
  container.classList.remove("study-mode");
  manageBtn.classList.add("active-mode");
  studyBtn.classList.remove("active-mode");
  fetchCards();
});

studyBtn.addEventListener("click", () => {
  currentMode = "study";
  container.classList.add("study-mode");
  studyBtn.classList.add("active-mode");
  manageBtn.classList.remove("active-mode");
  fetchCards();
});

fetchCards();
