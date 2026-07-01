const POINTS = [
  {
    code: "ST34",
    name: "梁丘",
    reading: "りょうきゅう",
    meridian: "ST",
    classification: ["胃経の郄穴"],
  },
  {
    code: "ST36",
    name: "足三里",
    reading: "あしさんり",
    meridian: "ST",
    classification: ["胃経の合土穴", "胃の下合穴", "四総穴"],
  },
  {
    code: "ST37",
    name: "上巨虚",
    reading: "じょうこきょ",
    meridian: "ST",
    classification: ["大腸の下合穴"],
  },
  {
    code: "ST39",
    name: "下巨虚",
    reading: "げこきょ",
    meridian: "ST",
    classification: ["小腸の下合穴"],
  },
  {
    code: "ST40",
    name: "豊隆",
    reading: "ほうりゅう",
    meridian: "ST",
    classification: ["胃経の絡穴"],
  },
  {
    code: "ST41",
    name: "解渓",
    reading: "かいけい",
    meridian: "ST",
    classification: ["胃経の経火穴"],
  },
  {
    code: "ST42",
    name: "衝陽",
    reading: "しょうよう",
    meridian: "ST",
    classification: ["胃経の原穴"],
  },
  {
    code: "ST43",
    name: "陥谷",
    reading: "かんこく",
    meridian: "ST",
    classification: ["胃経の兪木穴"],
  },
  {
    code: "ST44",
    name: "内庭",
    reading: "ないてい",
    meridian: "ST",
    classification: ["胃経の滎水穴"],
  },
  {
    code: "ST45",
    name: "厲兌",
    reading: "れいだ",
    meridian: "ST",
    classification: ["胃経の井金穴"],
  },
  {
    code: "SP1",
    name: "隠白",
    reading: "いんぱく",
    meridian: "SP",
    classification: ["脾経の井木穴"],
  },
  {
    code: "SP2",
    name: "大都",
    reading: "だいと",
    meridian: "SP",
    classification: ["脾経の滎火穴"],
  },
  {
    code: "SP3",
    name: "太白",
    reading: "たいはく",
    meridian: "SP",
    classification: ["脾経の原穴", "脾経の兪土穴"],
  },
  {
    code: "SP4",
    name: "公孫",
    reading: "こうそん",
    meridian: "SP",
    classification: ["脾経の絡穴", "八脈交会穴（衝脈）"],
  },
  {
    code: "SP5",
    name: "商丘",
    reading: "しょうきゅう",
    meridian: "SP",
    classification: ["脾経の経金穴"],
  },
  {
    code: "SP6",
    name: "三陰交",
    reading: "さんいんこう",
    meridian: "SP",
    classification: ["足の三陰経の交会穴"],
  },
  {
    code: "SP8",
    name: "地機",
    reading: "ちき",
    meridian: "SP",
    classification: ["脾経の郄穴"],
  },
  {
    code: "SP9",
    name: "陰陵泉",
    reading: "いんりょうせん",
    meridian: "SP",
    classification: ["脾経の合水穴"],
  },
];

const state = {
  filter: "all",
  deck: [],
  stages: [],
  selectedIndex: null,
  soundEnabled: true,
};

const elements = {
  deck: document.querySelector("#deck"),
  drawCard: document.querySelector("#drawCard"),
  drawStep: document.querySelector("#drawStep"),
  drawCode: document.querySelector("#drawCode"),
  drawKicker: document.querySelector("#drawKicker"),
  drawTitle: document.querySelector("#drawTitle"),
  drawReading: document.querySelector("#drawReading"),
  drawHint: document.querySelector("#drawHint"),
  answerBox: document.querySelector("#answerBox"),
  answerText: document.querySelector("#answerText"),
  completedCount: document.querySelector("#completedCount"),
  totalCount: document.querySelector("#totalCount"),
  shuffleButton: document.querySelector("#shuffleButton"),
  soundButton: document.querySelector("#soundButton"),
  infoDialog: document.querySelector("#infoDialog"),
  infoButton: document.querySelector("#infoButton"),
  footerInfoButton: document.querySelector("#footerInfoButton"),
  closeInfoButton: document.querySelector("#closeInfoButton"),
  pointTables: document.querySelector("#pointTables"),
  toast: document.querySelector("#toast"),
};

let audioContext;
let toastTimer;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function createUniqueDeck(points) {
  return shuffle(points);
}

function currentPoints() {
  return state.filter === "all" ? POINTS : POINTS.filter((point) => point.meridian === state.filter);
}

function meridianName(meridian) {
  return meridian === "ST" ? "足の陽明胃経" : "足の太陰脾経";
}

function playTone(kind) {
  if (!state.soundEnabled) return;

  audioContext ??= new AudioContext();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const frequencies = kind === "answer" ? [523.25, 659.25] : [392];

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencies[0], now);
  if (frequencies[1]) oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.085, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.21);
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
}

function resetDrawPanel() {
  elements.drawCard.className = "draw-card is-empty";
  elements.drawStep.textContent = "カードを1枚選ぼう";
  elements.drawCode.textContent = "?";
  elements.drawKicker.textContent = "TAP A CARD";
  elements.drawTitle.innerHTML = "どの経穴が<br class=\"mobile-only\" />隠れているかな？";
  elements.drawReading.textContent = `${state.deck.length}枚から、好きな一枚をタップ`;
  elements.drawHint.textContent = "下のカードを選んでください";
  elements.answerBox.hidden = true;
  elements.answerText.textContent = "";
  elements.drawCard.removeAttribute("role");
  elements.drawCard.removeAttribute("aria-label");
}

function updateDrawPanel(point, stage) {
  elements.drawCard.className = `draw-card is-${point.meridian.toLowerCase()}`;
  elements.drawCard.dataset.selectedIndex = String(state.selectedIndex);
  elements.drawCard.setAttribute("role", "button");
  elements.drawCard.setAttribute("aria-label", `${point.name}。${stage === 1 ? "もう一度タップして要穴を表示" : point.classification.join("、")}`);
  elements.drawStep.textContent = stage === 1 ? "1回目｜経穴名" : "2回目｜要穴";
  elements.drawCode.textContent = point.code;
  elements.drawKicker.textContent = meridianName(point.meridian);
  elements.drawTitle.textContent = point.name;
  elements.drawReading.textContent = `${point.reading}｜${point.code}`;
  elements.answerBox.hidden = stage < 2;
  elements.answerText.textContent = point.classification.join(" ・ ");
  elements.drawHint.textContent = stage === 1 ? "同じカードをもう一度タップ" : "要穴まで開きました";
}

function updateProgress() {
  elements.completedCount.textContent = String(state.stages.filter((stage) => stage === 2).length);
  elements.totalCount.textContent = String(state.deck.length);
}

function renderDeck() {
  const fragment = document.createDocumentFragment();

  state.deck.forEach((point, index) => {
    const button = document.createElement("button");
    const stage = state.stages[index];
    button.type = "button";
    button.className = `lot-card${stage === 1 ? " is-name" : ""}${stage === 2 ? " is-answer" : ""}`;
    button.dataset.index = String(index);
    button.dataset.meridian = point.meridian;
    button.dataset.code = point.code;
    button.setAttribute(
      "aria-label",
      stage === 0
        ? `${index + 1}番のカード。未開封`
        : `${index + 1}番のカード。${point.name}。${stage === 1 ? "要穴は未表示" : point.classification.join("、")}`,
    );
    if (state.selectedIndex === index) button.classList.add("is-active");

    const label = document.createElement("span");
    label.className = "lot-card-label";
    label.textContent = point.name;
    button.append(label);
    fragment.append(button);
  });

  elements.deck.replaceChildren(fragment);
  updateProgress();
}

function selectCard(index) {
  const point = state.deck[index];
  if (!point) return;

  const previousIndex = state.selectedIndex;
  const isSameCard = previousIndex === index;

  if (!isSameCard) {
    state.selectedIndex = index;
    if (state.stages[index] === 0) {
      state.stages[index] = 1;
      playTone("name");
    }
  } else if (state.stages[index] === 1) {
    state.stages[index] = 2;
    playTone("answer");
  }

  renderDeck();
  updateDrawPanel(point, state.stages[index]);

  if (!isSameCard && previousIndex !== null) {
    showToast("このカードをもう一度タップすると要穴が開きます");
  }
}

function newDeck({ announce = true } = {}) {
  state.deck = createUniqueDeck(currentPoints());
  state.stages = Array(state.deck.length).fill(0);
  state.selectedIndex = null;
  elements.deck.setAttribute("aria-label", `重複なしの${state.deck.length}枚の経穴カード`);
  resetDrawPanel();
  renderDeck();
  if (announce) showToast(`${state.deck.length}枚をまぜ直しました`);
}

function setFilter(filter) {
  if (state.filter === filter) return;
  state.filter = filter;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  newDeck({ announce: false });
  showToast(filter === "all" ? "胃経・脾経の両方から出題します" : `${meridianName(filter)}だけで出題します`);
}

function buildPointTables() {
  const fragment = document.createDocumentFragment();
  ["ST", "SP"].forEach((meridian) => {
    const section = document.createElement("section");
    section.className = "point-group";
    section.dataset.meridian = meridian;

    const heading = document.createElement("h3");
    heading.innerHTML = `<span class="meridian-dot" aria-hidden="true"></span>${meridianName(meridian)}`;
    section.append(heading);

    const table = document.createElement("table");
    table.className = "point-table";
    table.innerHTML = "<thead><tr><th>経穴</th><th>要穴分類</th></tr></thead>";
    const body = document.createElement("tbody");

    POINTS.filter((point) => point.meridian === meridian).forEach((point) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      nameCell.className = "point-name-cell";
      nameCell.innerHTML = `${point.name} <small>${point.reading}｜${point.code}</small>`;
      const classCell = document.createElement("td");
      classCell.textContent = point.classification.join("／");
      row.append(nameCell, classCell);
      body.append(row);
    });

    table.append(body);
    section.append(table);
    fragment.append(section);
  });
  elements.pointTables.replaceChildren(fragment);
}

function openInfo() {
  elements.infoDialog.showModal();
}

elements.deck.addEventListener("click", (event) => {
  const card = event.target.closest(".lot-card");
  if (card) selectCard(Number(card.dataset.index));
});

elements.drawCard.addEventListener("click", () => {
  if (state.selectedIndex !== null) selectCard(state.selectedIndex);
});

elements.drawCard.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && state.selectedIndex !== null) {
    event.preventDefault();
    selectCard(state.selectedIndex);
  }
});

elements.shuffleButton.addEventListener("click", () => newDeck());

elements.soundButton.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  elements.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
  elements.soundButton.setAttribute("aria-label", state.soundEnabled ? "効果音をオフにする" : "効果音をオンにする");
  showToast(state.soundEnabled ? "効果音をオンにしました" : "効果音をオフにしました");
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

[elements.infoButton, elements.footerInfoButton].forEach((button) => button.addEventListener("click", openInfo));
elements.closeInfoButton.addEventListener("click", () => elements.infoDialog.close());
elements.infoDialog.addEventListener("click", (event) => {
  if (event.target === elements.infoDialog) elements.infoDialog.close();
});

buildPointTables();
newDeck({ announce: false });

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

export { POINTS, createUniqueDeck };
