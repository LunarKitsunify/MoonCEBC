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
// @match https://bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://bondageprojects.com/*
// @match https://www.bondageprojects.com/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

/*import(
        `https://lunarkitsunify.github.io/RoomCardDecksEditorBC/RoomCardDecksEditorBC.js?v=${(
          Date.now() / 10000
        ).toFixed(0)}`
      );*/

(function () {
  "use strict";

  //#region UI

  let isVisibleMainWindow = false;
  const cells = [];

  //#region showButton

  const showButton = document.createElement("button");
  showButton.style.backgroundImage =
    "url('Screens/MiniGame/ClubCard/Sleeve/Default.png')";
  showButton.style.backgroundSize = "cover";
  showButton.style.backgroundPosition = "center";
  showButton.style.position = "absolute";
  showButton.style.width = "2.7%"; //40
  showButton.style.height = "10.8%"; //80
  showButton.style.top = "0px";
  //showButton.style.left = "50%";
  //showButton.style.transform = "translateX(-50%)";

  showButton.style.right = "50%";
  showButton.style.transform = "translateX(calc(50% - 45%))";
  showButton.style.padding = "1px 2px";
  showButton.style.zIndex = "9999"; // delete
  document.body.appendChild(showButton);
  showButton.addEventListener("click", function () {
    if (isVisibleMainWindow == true) {
      mainWindow.style.display = "none";
    } else {
      mainWindow.style.display = "block";
      LoadPlayerData();
    }
    isVisibleMainWindow = !isVisibleMainWindow;
  });

  //#endregion

  //#region mainWindow
  //Backgrounds/ClubCardPlayBoard1.jpg
  const mainWindow = document.createElement("div");
  mainWindow.style.position = "fixed";
  mainWindow.style.top = "50%";
  mainWindow.style.left = "50%";
  mainWindow.style.transform = "translate(-50%, -50%)";
  mainWindow.style.width = "87%";
  mainWindow.style.height = "87%";
  mainWindow.style.border = "3px solid black";
  mainWindow.style.boxSizing = "border-box";
  mainWindow.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
  mainWindow.style.display = "none";
  mainWindow.style.zIndex = "9999"; // ???????? look very bad

  mainWindow.style.backgroundImage =
    "url('Backgrounds/ClubCardPlayBoard1.jpg')"; // Укажите путь к вашему фоновому изображению
  mainWindow.style.backgroundSize = "cover"; // Изображение на всю область
  mainWindow.style.backgroundPosition = "center"; // Центрируем изображение

  document.body.appendChild(mainWindow);

  //#endregion

  //#region Top Panel
  const topPanelHeight = 40;
  const topPanel = document.createElement("div");
  topPanel.style.display = "flex";
  topPanel.style.justifyContent = "center";
  topPanel.style.alignItems = "center";
  //topPanel.style.backgroundColor = "green";
  topPanel.style.borderBottom = "2px solid black";
  topPanel.style.boxSizing = "border-box";
  topPanel.style.height = `${topPanelHeight}px`;
  topPanel.style.width = "100%";

  mainWindow.appendChild(topPanel);

  const comboBox = document.createElement("select");
  comboBox.style.flex = "1";
  comboBox.style.marginRight = "10px";
  comboBox.style.border = "2px solid black";
  comboBox.style.color = "green";
  topPanel.appendChild(comboBox);

  //need edit
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

  //#endregion

  //#region Bottom Panel

  const bottomPanel = document.createElement("div");
  bottomPanel.style.display = "grid";
  bottomPanel.style.gridTemplateColumns = "repeat(10, 1fr)";
  bottomPanel.style.gridTemplateRows = "repeat(3, 1fr)";
  bottomPanel.style.height = `calc(100% - ${topPanelHeight}px)`;
  bottomPanel.style.borderTop = "2px solid black";
  bottomPanel.style.overflow = "hidden";
  bottomPanel.style.gridAutoRows = "1fr";
  //bottomPanel.style.backgroundColor = "blue";
  mainWindow.appendChild(bottomPanel);

  for (let i = 0; i < 30; i++) {
    const cardCell = document.createElement("div");
    //cell.style.border = "1px solid black";
    cardCell.style.boxSizing = "border-box";
    //cell.style.height = "100%";
    cardCell.style.margin = "1px";
    //cell.style.position = "relative";
    cardCell.style.marginLeft = "1px";
    cardCell.style.marginRight = "1px";
    cardCell.style.justifyContent = "center";
    cardCell.style.display = "flex";
    cardCell.style.minHeight = "0";
    cardCell.style.minWidth = "0";
    cells.push(cardCell);
    bottomPanel.appendChild(cardCell);
  }

  //#endregion

  //#endregion

  function LoadPlayerData() {
    if (Player.Game.ClubCard === undefined) return;
    let playerData = Player.Game.ClubCard;

    comboBox.innerHTML = "";

    if (playerData.DeckName && playerData.DeckName.length > 0) {
      playerData.DeckName.forEach((name, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = name;
        comboBox.appendChild(option);
      });

      UpdateSelecteDeck(playerData);

      comboBox.addEventListener("change", function () {
        UpdateSelecteDeck(playerData);
      });
    } else {
      console.error("DeckName is empty or undefined.");
    }
  }

  /**
   * updates data cells depending on the selected deck
   * @param {GameClubCardParameters} playerData - index selected deck
   * @returns {void} - Nothing
   */
  function UpdateSelecteDeck(playerData) {
    let selectedIndex = comboBox.value;
    let encodedDeck = playerData.Deck[selectedIndex];
    let decodedDeck = decodeStringDeckToID(encodedDeck);
    let DeckCards = [];
    for (let id of decodedDeck)
      DeckCards.push(ClubCardList.find((card) => card.ID === id));

    //DeckCards.sort((a, b) => a.RequiredLevel - b.RequiredLevel);
    DeckCards.sort((a, b) =>
      a.Type === "Event"
        ? 1
        : b.Type === "Event"
        ? -1
        : a.RequiredLevel - b.RequiredLevel
    );

    for (let i = 0; i < DeckCards.length; i++) {
      if (i < cells.length) {
        cells[i].innerHTML = "";
        DrawCard(DeckCards[i], cells[i]);
      }
    }
  }

  /**
   * function to draw a card
   * @param {ClubCard} Card - массив карт.
   * @param {HTMLDivElement} cardCell fill for card data
   * @returns {void} - Nothing
   */
  function DrawCard(Card, cardCell) {
    const img = document.createElement("img");
    const imgFrame = document.createElement("img");
    const backgroundContainer = document.createElement("div");
    let Level =
      Card.RequiredLevel == null || Card.RequiredLevel <= 1
        ? 1
        : Card.RequiredLevel;
    let Color = ClubCardColor[Level];
    if (Card.Type == null) Card.Type = "Member";

    //#region Background

    backgroundContainer.style.position = "relative";
    backgroundContainer.style.top = "50%";
    backgroundContainer.style.left = "50%";
    backgroundContainer.style.transform = "translate(-50%, -50%)";
    backgroundContainer.style.width = "100%";
    backgroundContainer.style.height = "100%";
    backgroundContainer.style.display = "flex";
    backgroundContainer.style.justifyContent = "center";
    backgroundContainer.style.alignItems = "center";

    img.src =
      "Screens/MiniGame/ClubCard/" + Card.Type + "/" + Card.Name + ".png";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.height = "78%";
    img.style.objectFit = "contain";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "50%";
    img.style.transform = "translateX(-50%)";
    img.style.marginTop = "22%";

    imgFrame.src =
      "Screens/MiniGame/ClubCard/Frame/" +
      Card.Type +
      (Card.Reward != null ? "Reward" : "") +
      Level.toString() +
      ".png";
    imgFrame.style.maxWidth = "100%";
    imgFrame.style.maxHeight = "100%";
    imgFrame.style.objectFit = "contain";
    imgFrame.style.position = "absolute";

    backgroundContainer.appendChild(imgFrame); // Сначала добавляем рамку
    backgroundContainer.appendChild(img);
    cardCell.appendChild(backgroundContainer);

    //#endregion

    //#region Card Name

    const nameElement = document.createElement("div");
    nameElement.textContent = Card.Name;
    nameElement.style.position = "absolute";
    nameElement.style.top = "1%";
    nameElement.style.left = "50%";
    nameElement.style.transform = "translateX(-50%)";
    nameElement.style.fontSize = "0.8em";
    //nameElement.style.fontSize = "1% Arial";
    nameElement.style.textAlign = "center";
    nameElement.style.fontWeight = "bold";
    nameElement.style.lineHeight = "0.8";
    nameElement.style.whiteSpace = "normal";
    backgroundContainer.appendChild(nameElement);

    //#endregion

    //#region  TopLeftPanel
    let iconSize = "13px";
    const topLeftContainer = document.createElement("div");
    topLeftContainer.style.position = "absolute";
    topLeftContainer.style.top = "20%";
    topLeftContainer.style.left = "20%";
    topLeftContainer.style.display = "flex";
    topLeftContainer.style.flexDirection = "column";
    topLeftContainer.style.gap = "8%";

    if (Card.Group && Card.Group.includes("Liability")) {
      const liabilityIcon = document.createElement("img");
      liabilityIcon.src = "Screens/MiniGame/ClubCard/Bubble/Liability.png";
      liabilityIcon.style.width = iconSize;
      liabilityIcon.style.height = "auto";
      topLeftContainer.appendChild(liabilityIcon);
    }

    if (Card.RequiredLevel > 1) {
      const levelBoard = document.createElement("div");
      levelBoard.style.width = iconSize;
      levelBoard.style.height = "auto";
      levelBoard.style.position = "relative";
      topLeftContainer.appendChild(levelBoard);

      const levelElement = document.createElement("div");
      levelElement.textContent = Card.RequiredLevel;
      levelElement.style.textAlign = "center";
      levelElement.style.fontSize = "0.8em";
      levelElement.style.fontWeight = "bold";
      levelElement.style.position = "absolute";
      levelElement.style.width = "100%";
      levelElement.style.maxWidth = "100%";
      levelElement.style.maxHeight = "100%";
      levelElement.style.top = "50%";
      levelElement.style.left = "50%";
      levelElement.style.transform = "translate(-50%, -60%)";

      const requiredLevelIcon = document.createElement("img");
      requiredLevelIcon.src = "Screens/MiniGame/ClubCard/Bubble/Level.png";
      requiredLevelIcon.style.width = "100%";
      requiredLevelIcon.style.maxWidth = "100%";
      requiredLevelIcon.style.maxHeight = "100%";
      requiredLevelIcon.style.objectFit = "contain";

      levelBoard.appendChild(requiredLevelIcon);
      levelBoard.appendChild(levelElement);
    }

    backgroundContainer.appendChild(topLeftContainer);
    //#endregion
  }

  //#region encode/decode functions

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

  //#endregion
})();
