import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiFbTCMBbmw-1NSX8coyJ9UYx5xZRpzyg",
  authDomain: "lunch-rating.firebaseapp.com",
  projectId: "lunch-rating",
  storageBucket: "lunch-rating.firebasestorage.app",
  messagingSenderId: "230052051442",
  appId: "1:230052051442:web:994534d3cb52de2884d36b",
  measurementId: "G-X178X1X4FR"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const tableBody = document.getElementById("table-body");

const foods = [
  "YAB YOP",
  "PART DE BROOKIE",
  "GEOEGET",
  "SALAD SODEBO",
  "SALAD DAUNAT",
  "RADIATORI SODEBO",
  "SANDWICH DAUNAT",
  "FLEURY MICHON",
  "SALADE EN LIBRE-SERVICE",
  "GRIGNOT POULET",
  "CUP NOODLES",
  "AMERICAN SANDWICH",
  "MADELEINES ST MICHEL",
  "PETIT ECOLIER",
  "KNOPPERS",
  "NUTELLA BISCUITS",
  "BISCOFF",
  "GRAINEA",
  "LINDT",
  "MONSTER",
  "FRUITS FRAIS",
  "PETIT DELI",
  "BAGUETTE"
];

const levels = [
  "masterclass",
  "incroyable",
  "valide",
  "ordinaire",
  "eclate"
];

/* 提取真正的 emoji */
function extractEmoji(text) {

  const emojiRegex =
    /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u200D|\p{Emoji_Modifier}|(?:\p{Extended_Pictographic}|\p{Regional_Indicator}))*/gu;

  const matches = text.match(emojiRegex);

  return matches ? matches.join("") : "";
}

function isEmojiOnly(text) {

  const cleaned = extractEmoji(text);

  return cleaned.length > 0 &&
         cleaned === text.trim();
}

function cleanEmoji(text) {
  return extractEmoji(text);
}

function createRatingCell(foodIndex, levelIndex) {

  const cell = document.createElement("td");
  cell.className = "rating-cell";

  const emojiList = document.createElement("div");
  emojiList.className = "emoji-list";

  const inputArea = document.createElement("div");
  inputArea.className = "input-area";

  const input = document.createElement("input");

  input.type = "text";
  input.maxLength = 12;
  input.placeholder = "emoji";

  const button = document.createElement("button");
  button.textContent = "OK";

  const note = document.createElement("div");
  note.className = "small-note";
  note.textContent = "ajouter";

  inputArea.appendChild(input);
  inputArea.appendChild(button);

  cell.appendChild(emojiList);
  cell.appendChild(inputArea);
  cell.appendChild(note);

  const ratingPath =
    `ratings/${foodIndex}/${levels[levelIndex]}`;

  const ratingRef =
    ref(database, ratingPath);

  /* 实时读取数据库 */

  onValue(ratingRef, snapshot => {

    const data = snapshot.val();

    if (!data) {
      emojiList.textContent = "";
      return;
    }

    const values = Object.values(data)
      .map(item => item.emoji)
      .filter(Boolean);

    emojiList.textContent =
      values.join(" ");
  });

  /* 提交 */

  function submitEmoji() {

    const emoji =
      cleanEmoji(input.value);

    if (!isEmojiOnly(emoji)) {

      alert(
        "Merci d’entrer uniquement des emoji !"
      );

      input.value = "";
      return;
    }

    push(ratingRef, {
      emoji: emoji,
      time: Date.now()
    });

    input.value = "";
  }

  button.addEventListener(
    "click",
    submitEmoji
  );

  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        submitEmoji();
      }
    }
  );

  /* 自动过滤非 emoji */

  input.addEventListener(
    "input",
    () => {

      const onlyEmoji =
        cleanEmoji(input.value);

      input.value = onlyEmoji;
    }
  );

  return cell;
}

/* 创建表格 */

foods.forEach((food, foodIndex) => {

  const row =
    document.createElement("tr");

  const labelCell =
    document.createElement("td");

  labelCell.textContent = food;

  row.appendChild(labelCell);

  levels.forEach((level, levelIndex) => {

    const cell =
      createRatingCell(
        foodIndex,
        levelIndex
      );

    row.appendChild(cell);
  });

  tableBody.appendChild(row);
});
