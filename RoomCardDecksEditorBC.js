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
  showButton.style.width = "2.7%";
  showButton.style.height = "10.8%";
  showButton.style.top = "0px";
  showButton.style.right = "50%";
  showButton.style.transform = "translateX(calc(50% - 45%))";
  showButton.style.padding = "1px 2px";
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
  mainWindow.appendChild(bottomPanel);

  for (let i = 0; i < 30; i++) {
    const cardCell = document.createElement("div");
    cardCell.style.boxSizing = "border-box";
    //TODO need more test wirg margin. phone ???
    cardCell.style.margin = "5%";
    cardCell.style.marginLeft = "5%";
    cardCell.style.marginRight = "5%";
    cardCell.style.position = "relative";
    cardCell.style.justifyContent = "center";
    cardCell.style.alignItems = "center";
    cardCell.style.display = "inline-block";
    //cardCell.style.background = "blue";
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

        //TODO look bad, i think need ome time read Text_ClubCard.csv and save data.
        DeckCards[i].Title = ClubCardTextGet("Title " + DeckCards[i].Name);
        DeckCards[i].Text = ClubCardTextGet("Text " + DeckCards[i].Name);

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

    //backgroundContainer.style.display = "inline-block";
    backgroundContainer.style.position = "relative";
    backgroundContainer.style.overflow = "hidden";
    backgroundContainer.style.margin = "0 auto";
    backgroundContainer.style.height = "100%";
    //backgroundContainer.style.background = "yellow";
    //backgroundContainer.style.width = "100%";
    //backgroundContainer.style.top = "50%";
    //backgroundContainer.style.left = "50%";
    //backgroundContainer.style.transform = "translate(-50%, -50%)";
    //backgroundContainer.style.display = "flex";
    backgroundContainer.style.display = "inline - block";
    backgroundContainer.style.justifyContent = "center";
    //backgroundContainer.style.alignItems = "center";

    img.src =
      "Screens/MiniGame/ClubCard/" + Card.Type + "/" + Card.Name + ".png";
    img.style.height = "78%";
    img.style.position = "absolute";
    img.style.top = "22%";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.left = "50%";
    img.style.transform = "translateX(-50%)";

    imgFrame.src =
      "Screens/MiniGame/ClubCard/Frame/" +
      Card.Type +
      (Card.Reward != null ? "Reward" : "") +
      Level.toString() +
      ".png";
    imgFrame.style.height = "100%";
    imgFrame.style.width = "auto";
    imgFrame.style.position = "absolute";
    imgFrame.style.objectFit = "contain";
    imgFrame.style.left = "50%";
    imgFrame.style.transform = "translateX(-50%)";
    imgFrame.style.display = "block";
    img.onload = function () {
      //TODO I really don't like this implementation.
      //Sometimes it slows down and does not render files.
      //And also it doesn't update when the browser window size changes.
      const imgWidth = imgFrame.offsetWidth;
      backgroundContainer.style.width = `${imgWidth}px`;
    };

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
    nameElement.style.fontSize = "60%";
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
    topLeftContainer.style.left = "5%";
    topLeftContainer.style.display = "flex";
    topLeftContainer.style.flexDirection = "column";
    topLeftContainer.style.gap = "10%";
    //topLeftContainer.style.background = "green";

    //Liability Icon
    if (Card.Group && Card.Group.includes("Liability")) {
      const liabilityIcon = document.createElement("img");
      liabilityIcon.src = "Screens/MiniGame/ClubCard/Bubble/Liability.png";
      liabilityIcon.style.width = iconSize;
      liabilityIcon.style.height = "auto";
      topLeftContainer.appendChild(liabilityIcon);
    }

    //Card.RequiredLevel
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

    //Card.FamePerTurn
    if (Card.FamePerTurn != null) {
      const fameBoard = document.createElement("div");
      fameBoard.style.width = iconSize;
      fameBoard.style.height = "auto";
      fameBoard.style.position = "relative";
      topLeftContainer.appendChild(fameBoard);

      const fameElement = document.createElement("div");
      fameElement.textContent = Card.FamePerTurn;
      fameElement.style.textAlign = "center";
      fameElement.style.fontSize = "0.8em";
      fameElement.style.fontWeight = "bold";
      fameElement.style.position = "absolute";
      fameElement.style.width = "100%";
      fameElement.style.maxWidth = "100%";
      fameElement.style.maxHeight = "100%";
      fameElement.style.top = "50%";
      fameElement.style.left = "50%";
      fameElement.style.transform = "translate(-50%, -60%)";

      const fameIcon = document.createElement("img");
      fameIcon.src = "Screens/MiniGame/ClubCard/Bubble/Fame.png";
      fameIcon.style.width = "100%";
      fameIcon.style.maxWidth = "100%";
      fameIcon.style.maxHeight = "100%";
      fameIcon.style.objectFit = "contain";

      fameBoard.appendChild(fameIcon);
      fameBoard.appendChild(fameElement);
    }

    //Card.MoneyPerTurn
    if (Card.MoneyPerTurn != null) {
      const moneyBoard = document.createElement("div");
      moneyBoard.style.width = iconSize;
      moneyBoard.style.height = "auto";
      moneyBoard.style.position = "relative";
      topLeftContainer.appendChild(moneyBoard);

      const moneyElement = document.createElement("div");
      moneyElement.textContent = Card.MoneyPerTurn;
      moneyElement.style.textAlign = "center";
      moneyElement.style.fontSize = "0.8em";
      moneyElement.style.fontWeight = "bold";
      moneyElement.style.position = "absolute";
      moneyElement.style.width = "100%";
      moneyElement.style.maxWidth = "100%";
      moneyElement.style.maxHeight = "100%";
      moneyElement.style.top = "50%";
      moneyElement.style.left = "50%";
      moneyElement.style.transform = "translate(-50%, -60%)";

      const moneyIcon = document.createElement("img");
      moneyIcon.src = "Screens/MiniGame/ClubCard/Bubble/Money.png";
      moneyIcon.style.width = "100%";
      moneyIcon.style.maxWidth = "100%";
      moneyIcon.style.maxHeight = "100%";
      moneyIcon.style.objectFit = "contain";

      moneyBoard.appendChild(moneyIcon);
      moneyBoard.appendChild(moneyElement);
    }

    backgroundContainer.appendChild(topLeftContainer);
    //#endregion

    //#region Bottom Info Panel
    const bottomContainer = document.createElement("div");
    bottomContainer.style.position = "absolute";
    bottomContainer.style.bottom = "0";
    bottomContainer.style.width = "100%";
    bottomContainer.style.height = "45%";
    bottomContainer.style.justifyContent = "center";
    //ackgroundContainer.style.alignItems = "center";
    bottomContainer.style.display = "flex";
    bottomContainer.style.flexDirection = "column";
    bottomContainer.style.textAlign = "center";
    bottomContainer.style.background = "rgba(255, 255, 255, 0.6)";
    //bottomContainer.style.left = "2%";
    //bottomContainer.style.right = "2%";

    const groupElement = document.createElement("div");
    groupElement.textContent = `${Card.Group ? Card.Group.join(", ") : ""}`;
    //groupElement.style.position = "absolute";
    groupElement.style.fontSize = "55%";
    groupElement.style.textAlign = "center";
    groupElement.style.fontWeight = "bold";
    groupElement.style.lineHeight = "0.8";
    groupElement.style.flex = "0 0 20%";
    groupElement.style.whiteSpace = "normal";
    //groupElement.style.marginBottom = "45%";
    //groupElement.style.bottom = "50%";
    bottomContainer.appendChild(groupElement);

    const descriptionElement = document.createElement("div");
    descriptionElement.textContent = Card.Text;
    descriptionElement.style.fontSize = "50%";
    descriptionElement.style.fontWeight = "bold";
    descriptionElement.style.textAlign = "center";
    descriptionElement.style.lineHeight = "1";
    descriptionElement.style.whiteSpace = "normal";
    descriptionElement.style.flex = "1";
    descriptionElement.style.margin = "2%";
    //descriptionElement.style.marginBottom = "5%";
    bottomContainer.appendChild(descriptionElement);

    backgroundContainer.appendChild(bottomContainer);
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
