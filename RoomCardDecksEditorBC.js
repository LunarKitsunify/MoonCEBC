// ==UserScript==
// @name RoomCardDecksEditorBC
// @namespace https://www.bondageprojects.com/
// @version 1.0.0
// @description A brief description of what your script does
// @author Kitsunify
// @match https://example.com/*
// @match https://www.example.com/*
// @match http://localhost:*/*
// @match https://bc-cards-test.netlify.app/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

import(
  `https://lunarkitsunify.github.io/RoomCardDecksEditorBC/RoomCardDecksEditorBC.js?v=${(
    Date.now() / 10000
  ).toFixed(0)}`
);

(function () {
  "use strict";

  //open Player.Game.ClubCard. and get all decks    GameClubCardParameters ???
  /*interface GameClubCardParameters {
        Deck: string[];
        DeckName?: string[];
        Reward?: string;
        Status?: OnlineGameStatus;
        PlayerSlot?: number;
    }*/

  // Создаем кнопку для отображения mainWindow
  const showButton = document.createElement("button");
  showButton.textContent = "Show Main Window";
  showButton.style.position = "absolute";
  showButton.style.top = "10px";
  showButton.style.left = "50%";
  showButton.style.transform = "translateX(-50%)";
  showButton.style.padding = "10px 20px";
  showButton.style.background = "red";
  document.body.appendChild(showButton);

  // Обработчик клика по showButton
  showButton.addEventListener("click", function () {
    if (isVisibleMainWindow == true) {
      mainWindow.style.display = "none";
    } else {
      mainWindow.style.display = "block";
      LoadPlayerData();
    }
    isVisibleMainWindow = !isVisibleMainWindow;
  });

  let isVisibleMainWindow = false;

  // Создаем основной контейнер окна
  const mainWindow = document.createElement("div");
  mainWindow.style.position = "fixed";
  mainWindow.style.top = "15%";
  mainWindow.style.left = "15%";
  mainWindow.style.width = "70%";
  mainWindow.style.height = "70%";
  mainWindow.style.border = "2px solid black";
  mainWindow.style.backgroundColor = "white";
  mainWindow.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
  mainWindow.style.display = "none";
  mainWindow.style.zIndex = "9999"; // ????????
  document.body.appendChild(mainWindow);

  // Создаем контейнер для верхней панели
  const topPanel = document.createElement("div");
  topPanel.style.display = "flex";
  topPanel.style.justifyContent = "space-around";
  topPanel.style.padding = "10px";
  topPanel.style.backgroundColor = "green";
  topPanel.style.borderBottom = "2px solid black";
  mainWindow.appendChild(topPanel);

  // Создаем элементы верхней панели
  const comboBox = document.createElement("select");
  comboBox.style.flex = "1";
  comboBox.style.marginRight = "10px";
  comboBox.style.border = "2px solid black";
  comboBox.style.backgroundColor = "lightgray";
  comboBox.style.color = "green";
  topPanel.appendChild(comboBox);

  // Создаем кнопки на верхней панели
  for (let i = 0; i < 5; i++) {
    const button = document.createElement("button");
    button.textContent = "Button";
    button.style.flex = "1";
    button.style.marginLeft = "10px";
    button.style.border = "2px solid black";
    button.style.backgroundColor = "lightgray";
    button.style.color = "green";
    topPanel.appendChild(button);
  }

  // Создаем контейнер для нижней панели
  const bottomPanel = document.createElement("div");
  bottomPanel.style.display = "grid";
  bottomPanel.style.gridTemplateColumns = "repeat(6, 1fr)";
  bottomPanel.style.gridTemplateRows = "repeat(5, 1fr)";
  bottomPanel.style.height = "calc(100% - 70px)";
  bottomPanel.style.borderTop = "2px solid black";
  mainWindow.appendChild(bottomPanel);

  // Создаем 30 ячеек для отображения массива данных
  for (let i = 0; i < 30; i++) {
    const cell = document.createElement("div");
    cell.style.border = "1px solid black";
    cell.style.backgroundColor = "white";
    bottomPanel.appendChild(cell);
  }

  // Функция для загрузки данных игрока и заполнения ComboBox
  function LoadPlayerData() {
    let playerData = Player.Game.ClubCard;

    // Очистка ComboBox перед заполнением
    comboBox.innerHTML = "";

    // Заполнение ComboBox значениями из DeckName
    if (playerData.DeckName && playerData.DeckName.length > 0) {
      playerData.DeckName.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = index; // Используем индекс как значение
        option.textContent = name; // Отображаемое название
        comboBox.appendChild(option);
      });

      // Установка обработчика на изменение выбора в ComboBox
      comboBox.addEventListener("change", function () {
        let selectedIndex = comboBox.value;
        let encodedDeck = playerData.Deck[selectedIndex];
        let decodedDeck = decodeStringDeckToID(encodedDeck);
        console.log(`Selected Deck: ${playerData.DeckName[selectedIndex]}`);
        console.log(`Decoded Deck IDs:`, decodedDeck);
      });
    } else {
      console.error("DeckName is empty or undefined.");
    }
  }

  /**
   * Encodes an array of numerical IDs into a string where each ID is represented by a corresponding character.
   * @param {number[]} IdArrayDeck - The array of numerical IDs to encode.
   * @returns {string} - The encoded string where each character represents a numerical ID.
   */
  function encodeIDDeckToString(IdArrayDeck) {
    let encodedString = "";
    for (let i = 0; i < IdArrayDeck.length; i++) {
      encodedString += String.fromCharCode(IdArrayDeck[i]);
    }
    return encodedString;
  }

  /**
   * Функция для декодирования строки обратно в массив числовых ID.
   * @param {string} stringDeck - Закодированная строка для декодирования.
   * @returns {number[]} - Массив числовых ID, декодированных из строки.
   */
  function decodeStringDeckToID(stringDeck) {
    let decodedNumbers = [];
    for (let i = 0; i < stringDeck.length; i++) {
      decodedNumbers.push(stringDeck.charCodeAt(i));
    }
    return decodedNumbers;
  }
})();
