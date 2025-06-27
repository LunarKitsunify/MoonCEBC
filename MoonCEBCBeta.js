// ==UserScript==
// @name Moon Cards Editor BC
// @namespace https://www.bondageprojects.com/
// @version 1.2.18
// @description Addon for viewing and customizing card decks without Npc room.
// @author Lunar Kitsunify
// @match http://localhost:*/*
// @match https://bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://bondageprojects.com/*
// @match https://www.bondageprojects.com/*
// @match https://bc-cards-test.netlify.app/
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

import { createCard, createGridLayout } from "./RenderObjs/CardRender.js";
import { createModal, createSettingsMenu } from './RenderObjs/SettingsMenu.js';
import { bcModSdk } from './src/BCModSdk.js';

const cssLink = document.createElement('link');
cssLink.href = new URL('./Style/styles.css', import.meta.url).href;
cssLink.rel = 'stylesheet';
document.head.appendChild(cssLink);

(function () {
  "use strict";

  //#region Const
  const WindowStatus = Object.freeze({
    VIEW: "ViewDeck",
    EDIT: "EditDeck",
    SETTINGS: "Settings",
  });
  
  const CardTypes = Object.freeze({
  ALL_CARDS: { value: "All Cards", text: "All Cards" },
  SELECTED_CARDS: { value: "Selected Cards", text: "Selected Cards" },
  EVENTS_CARDS: { value: "Events Cards", text: "Event Cards" },
  REWARD_CARDS: { value: "Reward Cards", text: "Reward Cards" },
  ABDL: { value: "ABDL", text: "ABDL" },
  ASYLUM: { value: "Asylum", text: "Asylum" },
  COLLEGE: { value: "College", text: "College" },
  CRIMINAL: { value: "Criminal", text: "Criminal" },
  DOMINANT_MISTRESS: {
    value: "DominantMistress",
    text: "Dominant / Mistress",
  },
  FETISHIST: { value: "Fetishist", text: "Fetishist" },
  LIABILITY: { value: "Liability", text: "Liability" },
  MAID: { value: "Maid", text: "Maid" },
  PET: { value: "PetOwner", text: "Pet / Owner" },
  PLAYER: { value: "Player", text: "Player" },
  POLICE: { value: "Police", text: "Police" },
  PORN: { value: "Porn", text: "Porn" },
  SHIBARI_SENSEI_KNOT: {
    value: "ShibariSenseiKnot",
    text: "Shibari / Sensei / Knot",
  },
  STAFF: { value: "Staff", text: "Staff" },
  UNGROUPED: { value: "Ungrouped", text: "Ungrouped" },
  });

  /** Card statistics repository. key = UniqueID
   * @type {Map<string, { id: number, uniqueID: string, name: string, seen: boolean, played: boolean }> } 
   * */
  const CardStatsMap = new Map();

  const MoonCEBCAddonName = "Moon Cards Editor";
  const meow_key = 42;
  
  const basePath = new URL(".", import.meta.url).href;
  const MoonCEBCTopPanelBackground = new URL("src/Images/MoonCETopPanelBackground.jpg", basePath).href;

  const CardGameBoardBackground = "https://i.imgur.com/sagZ9Xp.png";
  const CardGameCardCoverBackground  = new URL("src/Images/MoonCECardCover.png", basePath).href;
  /**
   * If the people in the room pass the addon check, draws a card icon for them.
   */
  const MoonCEBCStatusIsAddonIcon = new URL("src/Images/IsAddon.png", basePath).href;
  /**
   * If a player opens the addon menu, an icon is rendered for the other players.
   */
  const MoonCEBCIsOpenMenuIcon = new URL("src/Images/IsOpenMenu.png", basePath).href;
  /**
   * A variable for storing and manipulating the list of cards. To avoid touching cards in the main client.
   * @type {ClubCard[]}
   */
  let MoonCEBCClubCardList = [];
  /**
   * Tracking the card on which the mouse is hovering
   * @type {ClubCard}
   */
  let MoonCEBCMouseOverCard = [];
  /**
   * Variable for saving data in the deck being changed
   * @type {ClubCard[]}
   */
  let MoonCEBCEditCurrentDeck = [];
  /**
   * Saves the original deck data in case the changes are undone.
   * @type {ClubCard[]}
   */
  let MoonCEBCCurrentDeck = [];
  /**
   * Variable for filling cells with cards in edit mode
   * @type {ClubCard[]}
   */
  let MoonCEBCCurrent30Cards = [];
  /**
   * Sorts from the list of all cards those that match the group conditions.
   * @type {ClubCard[]}
   */
  let MoonCEBCBuilderCurrentGroupsList = [];
  /**
   *array to sift out of the MoonCEBCBuilderCurrentGroupsList of cards matching the condition.
   * @type {ClubCard[]}
   */
  let MoonCEBCBuilderSeacrhGroupList = [];
  /**
   * Variable for tracking the current group in edit mode
   * @type {string}
   */
  let MoonCEBCCurrentGroup = CardTypes.ALL_CARDS.value;
  /**
   * Variable for tracking the current page in edit mode
   * @type {number}
   */
  let MoonCEBCCurrentCardsListPage = 0;
  /**
   * Variable to track the mode of the addon. View decks or editor.
   * @type {string}
   */
  let MoonCEBCPageMode = WindowStatus.VIEW;
  /**
   * variable for tracking the visibility of the addon window
   * @type {boolean}
   */
  let isVisibleMainWindow = false;
  /**
   * An array of 30 cells into which the bottom container is divided. To display 30 cards.
   * @type {HTMLDivElement[]}
   */
  let CardCells = [];

  /**
   * Variable for accessing  mainWindow = document.createElement("div");
   */
  let MainWindowPanel = null;

  //#region Size and color customization

  const TopPanelHeight = "7%";
  const TopPanelTextSize = "1.2vw";
  const DeckNamePanelWidth = "20%";
  const TopLeftPanelGap = "1%";
  const TopPanelSidePadding = "0.5%";
  const TopLeftPanelWidth = "92%";
  const TopRightPanelWidth = `calc(100% - ${TopLeftPanelWidth})`;

  //const requiredLevelTestColor = "#FF5733";
  const fameTextColor = "#3357FF";
  const moneyTextColor = "#006400";

  const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ'];
  const AddonVersion = "1.2.18";
  const Hidden = "Hidden";

  //#endregion

  //#endregion

  //#region BC Mod SDK Stuff

  const modApi = bcModSdk.registerMod({
    name: "MoonCEBC",
    fullName: "Moon Cards Editor BC",
    version: AddonVersion,
    repository: "https://github.com/LunarKitsunify/MoonCEBC",
  });

  modApi.hookFunction("MainRun", 0, (args, next) => {
    //TODO Hook ChatRoomRun and do it with a DrawButton?
    //This should minimize the load on the server instead of constantly running in MainRun
    //At the moment I'm doing it via MainRun because from ChatRoomRun ,
    //I won't be able to track the moment of leaving the room. Or I'll have to do a lot of twisting for that.
    //That is, the button should be shown or hidden when conditions are met.
    next(args);
    UpdateStatusShowButton();
  });

  //#region ---------------Draw Addon Icons--------------- //

  modApi.hookFunction("ChatRoomDrawCharacterStatusIcons", 0, (args, next) => {
    if (ChatRoomHideIconState != 0) return next(args);
    const [C, CharX, CharY, Zoom] = args;

    //Is Addon active Icon
    if (C.MoonCEBC)
      DrawImageResize(MoonCEBCStatusIsAddonIcon, CharX + 347 * Zoom, CharY + 5, 30 * Zoom, 30 * Zoom);

    return next(args);
  });

  modApi.hookFunction("ChatRoomCharacterViewDrawOverlay", 3, (args, next) => {
    next(args);
    if (ChatRoomHideIconState != 0) return;
    const [C, CharX, CharY, Zoom] = args;

    //Is Menu Addon Open Icon
    if (C.MoonCEBC && C.MoonCEBC.IsMenuOpen)
      DrawImageResize(MoonCEBCIsOpenMenuIcon, CharX + 375 * Zoom, CharY + 50 * Zoom, 50 * Zoom, 50 * Zoom);
    
    //Is Addon active Icon
    if (C.MoonCEBC)
      DrawImageResize(MoonCEBCStatusIsAddonIcon, CharX + 347 * Zoom, CharY + 5, 30 * Zoom, 30 * Zoom);
  });

  //#endregion //------------------------------//

  //#region ---------------Addon work with hiden message--------------- // 

  modApi.hookFunction("ChatRoomSync", 0, (args, next) => {
    AddonInfoMessage();
    return next(args);
  });

  modApi.hookFunction("ChatRoomSyncMemberJoin", 0, (args, next) => {
    AddonInfoMessage();
    return next(args);
  });

  modApi.hookFunction("ChatRoomMessage", 0, (args, next) => {
    for (let arg of args) {
      const data = arg;
      if (data.Type && data.Type !== Hidden) continue;
      if (data.Content === "MoonCEBC") {
        const sender = Character.find(a => a.MemberNumber === data.Sender);
        if (!sender) return next(args);
        const message = ParseAddonMessage(data);
        sender.MoonCEBC = message;
      }
    }

    return next(args);
  });

  //#endregion //------------------------------//

  //#region ---------------Card Tracking Module--------------- //
  modApi.hookFunction("ClubCardLoadDeckNumber", 0, (args, next) => {
    const result = next(args);
    StartTrackingModule();
    return result;
  });

  modApi.hookFunction("GameClubCardLoadData", 0, (args, next) => {
    const result = next(args);
    RefreshTrackingAfterSync(ClubCardPlayer[0]);
    return result;
  });

  modApi.hookFunction("ClubCardCheckVictory", 5, (args, next) => {
    const result = next(args);

    if (ClubCardIsOnline() && result && ClubCardFameGoal == 100) {
      try {
        const player = args[0];
        const isPlayer = player?.Character?.MemberNumber === Player.MemberNumber;
        const payload = BuildPayload(isPlayer);
        SendCardStatsToServer(payload);
      } catch (error) {
        //ignore
      }
    }
    
    return result;
  });

  //#endregion

  //#endregion

  //////////////////START//////////////////
  AddonLoad();

  //#region UI

  //#region Create UI Object func

  /**
   * Creates a button with an optional image or text.
   *
   * @param {string} content - The text for the button (if the button is text-based). If null, the button will have an image.
   * @param {string} imageSrc - The path to the image. If null, the button will have text.
   * @param {function} onClick - The event handler function for the button click.
   * @param {string} width - Width from parent space
   * @param {string} height - Height from parent space
   * @param {string} marginLeft - The left margin of the button.
   * @param {string} marginRight - The right margin of the button.
   * @param {string} tooltip - The tooltip text to display.
   * @param {string} tooltipPosition - The position of the tooltip: "top", "right", "bottom", or "left".
   * @returns {HTMLButtonElement} The created button element.
   */
  function createButton(
    content,
    imageSrc,
    onClick,
    width,
    height,
    marginLeft,
    marginRight,
    tooltip = null,
    tooltipPosition = "right"
  ) {
    const button = ElementButton.Create(
      `ToolTipButton_${Math.random().toString(36).substring(2, 9)}`,
      onClick,
      {
        tooltip: tooltip,
        tooltipPosition: tooltipPosition,
      },
      {
        button: {
          style: {
            marginLeft: marginLeft,
            marginRight: marginRight,
            display: "flex",
            height: height,
            width: width,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            userSelect: "none",
          },

          innerHTML: content
            ? `<span style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; font-size: ${TopPanelTextSize};">${content}</span>`
            : `<img src="${imageSrc}" alt="Button Image" style="max-width: 90%; max-height: 90%; object-fit: contain; display: block; margin: auto;" />`,
        },
        tooltip: {
          style: {},
        },
      }
    );
    if (Player.Themed && Player.Themed.ColorsModule.base) {
      button.style.backgroundColor = Player.Themed.ColorsModule.base.main;
      button.style.borderColor = Player.Themed.ColorsModule.base.accent;
      button.style.color = Player.Themed.ColorsModule.base.text;
      button.addEventListener("mouseover", () => {
        button.style.backgroundColor = Player.Themed.ColorsModule.base.accent;
      });
      button.addEventListener("mouseout", () => {
        button.style.backgroundColor = Player.Themed.ColorsModule.base.main;
      });
    }

    return button;
  }

  //#endregion

  //#region showButton
  const showButton = document.createElement("button");
  showButton.style.backgroundImage =
    "url('Screens/MiniGame/ClubCard/Sleeve/Default.png')";
  showButton.style.backgroundSize = "cover";
  showButton.style.backgroundPosition = "center";
  showButton.style.position = "absolute";
  showButton.style.width = "2.23%";
  showButton.style.height = "5%";
  showButton.style.bottom = "0px";
  showButton.style.left = "1.5%";
  showButton.style.transform = "translateX(calc(50% - 45%))";
  showButton.style.padding = "1px 2px";
  showButton.style.display = "none";
  showButton.addEventListener("click", OpenExitAddonWindow);
  document.body.appendChild(showButton);

  //#endregion

  function LoadMainWindow() {
    //#region mainWindow
    const mainWindow = document.createElement("div");
    mainWindow.style.position = "fixed";
    mainWindow.style.top = "50%";
    mainWindow.style.left = "50%";
    mainWindow.style.transform = "translate(-50%, -50%)";
    mainWindow.style.width = "100%";
    mainWindow.style.height = "100%";
    mainWindow.style.border = "3px solid black";
    mainWindow.style.boxSizing = "border-box";
    mainWindow.style.display = "block";
    mainWindow.style.zIndex = "9999";
    mainWindow.style.backgroundImage =
      "url('Backgrounds/ClubCardPlayBoard1.jpg')";
    mainWindow.style.backgroundSize = "cover";
    mainWindow.style.backgroundPosition = "center";
    document.body.appendChild(mainWindow);
    MainWindowPanel = mainWindow;

    //#endregion

    //#region Top Panel
    const topSettingsPanel = document.createElement("div");
    topSettingsPanel.style.display = "flex";
    topSettingsPanel.style.borderBottom = "2px solid black";
    topSettingsPanel.style.boxSizing = "border-box";
    topSettingsPanel.style.alignItems = "center";
    topSettingsPanel.style.height = TopPanelHeight;
    topSettingsPanel.style.width = "100%";
    topSettingsPanel.style.backgroundImage = `url(${MoonCEBCTopPanelBackground})`;
    topSettingsPanel.style.backgroundRepeat = "repeat";
    mainWindow.appendChild(topSettingsPanel);

    //#region topSettingsLeftViewPanel
    const topSettingsLeftViewPanel = document.createElement("div");
    topSettingsLeftViewPanel.id = "TopSettingsLeftViewPanelId";
    topSettingsLeftViewPanel.style.display = "flex";
    topSettingsLeftViewPanel.style.justifyContent = "flex-start";
    topSettingsLeftViewPanel.style.alignItems = "center";
    topSettingsLeftViewPanel.style.width = TopLeftPanelWidth;
    topSettingsLeftViewPanel.style.height = "100%";
    topSettingsLeftViewPanel.style.boxSizing = "border-box";
    topSettingsLeftViewPanel.style.gap = TopLeftPanelGap;
    topSettingsLeftViewPanel.style.paddingLeft = TopPanelSidePadding;
    topSettingsPanel.appendChild(topSettingsLeftViewPanel);

    const playerDecksSelect = document.createElement("select");
    playerDecksSelect.id = "PlayerDecksSelectId";
    playerDecksSelect.style.width = DeckNamePanelWidth;
    playerDecksSelect.style.height = "80%";
    playerDecksSelect.style.alignContent = "center";
    playerDecksSelect.style.textAlign = "center";
    playerDecksSelect.style.fontSize = TopPanelTextSize;
    playerDecksSelect.addEventListener("change", function () {
      GetDeckData(playerDecksSelect);
    });

    if (Player.Themed) {
      playerDecksSelect.style.backgroundColor =
        Player.Themed.ColorsModule.primaryColor;
      playerDecksSelect.style.borderColor =
        Player.Themed.ColorsModule.accentColor;
      playerDecksSelect.style.color = Player.Themed.ColorsModule.textColor;
      playerDecksSelect.addEventListener("mouseover", () => {
        playerDecksSelect.style.backgroundColor =
          Player.Themed.ColorsModule.accentColor;
      });
      playerDecksSelect.addEventListener("mouseout", () => {
        playerDecksSelect.style.backgroundColor =
          Player.Themed.ColorsModule.primaryColor;
      });
    }

    topSettingsLeftViewPanel.appendChild(playerDecksSelect);

    const editButton = createButton(
      "Edit Deck",
      null,
      SetEditMode,
      "15%",
      "80%",
      "5%",
      "5%",
      "Open edit menu",
      "right"
    );
    topSettingsLeftViewPanel.appendChild(editButton);

    const exportButton = createButton(
      "Export",
      null,
      ExportDeck,
      "15%",
      "80%",
      "0",
      "0",
      "Export Deck",
      "right"
    );

    const importButton = createButton(
      "Import",
      null,
      ImportDeck,
      "15%",
      "80%",
      "0",
      "0",
      "Import Deck",
      "right"
    );

    topSettingsLeftViewPanel.appendChild(exportButton);
    topSettingsLeftViewPanel.appendChild(importButton);
    //#endregion

    //#region topSettingsLeftEditPanel
    const topSettingsLeftEditPanel = document.createElement("div");
    topSettingsLeftEditPanel.id = "TopSettingsLeftEditPanelId";
    topSettingsLeftEditPanel.style.display = "none";
    topSettingsLeftEditPanel.style.justifyContent = "flex-start";
    topSettingsLeftEditPanel.style.alignItems = "center";
    topSettingsLeftEditPanel.style.width = TopLeftPanelWidth;
    topSettingsLeftEditPanel.style.height = "100%";
    topSettingsLeftEditPanel.style.boxSizing = "border-box";
    topSettingsLeftEditPanel.style.gap = TopLeftPanelGap;
    topSettingsLeftEditPanel.style.paddingLeft = TopPanelSidePadding;
    topSettingsLeftEditPanel.style.paddingRight = TopPanelSidePadding;
    topSettingsPanel.appendChild(topSettingsLeftEditPanel);

    //#region deckNameImput

    const deckNameInput = document.createElement("input");
    deckNameInput.id = "MoonCEBCDeckNameInputId";
    deckNameInput.style.width = DeckNamePanelWidth;
    deckNameInput.style.height = "80%";
    deckNameInput.style.alignContent = "center";
    deckNameInput.style.textAlign = "center";
    deckNameInput.style.fontSize = TopPanelTextSize;
    deckNameInput.placeholder = "Deck Name";
    if (Player.Themed) {
      const userColor = Player.Themed.ColorsModule.textColor;
      deckNameInput.style.color = userColor;
      deckNameInput.addEventListener("input", (event) => {
        if (deckNameInput.value.length > 30)
          deckNameInput.style.color = "red";
        else deckNameInput.style.color = userColor;
      });
    } else {
      deckNameInput.addEventListener("input", (event) => {
        if (deckNameInput.value.length > 30) deckNameInput.style.color = "red";
        else deckNameInput.style.color = "black";
      });
    }
    deckNameInput.addEventListener("keydown", (event) => {
      if (movementKeys.includes(event.code))
        event.stopPropagation();
    });

    //#endregion

    //#region groupCombobox

    const groupSelect = document.createElement("select");
    groupSelect.id = "GroupSelectId";
    groupSelect.style.width = "15%";
    groupSelect.style.height = "80%";
    groupSelect.style.alignContent = "center";

    groupSelect.style.textAlign = "center";
    groupSelect.style.fontSize = TopPanelTextSize;
    groupSelect.addEventListener("change", function () {
      if (MoonCEBCCurrentGroup != groupSelect.value) {
        MoonCEBCCurrentGroup = groupSelect.value;
        searchCardInput.value = "";
        UpdateCardsListSetNewGroup();
      }
    });

    if (Player.Themed) {
      groupSelect.style.backgroundColor =
        Player.Themed.ColorsModule.primaryColor;
      groupSelect.style.borderColor = Player.Themed.ColorsModule.accentColor;
      groupSelect.style.color = Player.Themed.ColorsModule.textColor;
      groupSelect.addEventListener("mouseover", () => {
        groupSelect.style.backgroundColor =
          Player.Themed.ColorsModule.accentColor;
      });
      groupSelect.addEventListener("mouseout", () => {
        groupSelect.style.backgroundColor =
          Player.Themed.ColorsModule.primaryColor;
      });
    }

    function populateGroupSelect() {
      Object.values(CardTypes).forEach((type) => {
        const option = document.createElement("option");
        option.value = type.value;
        option.text = type.text;
        if (Player.Themed) {
          option.style.backgroundColor =
            Player.Themed.ColorsModule.primaryColor;
          option.style.borderColor = Player.Themed.ColorsModule.accentColor;
        }
        groupSelect.appendChild(option);
      });
    }
    populateGroupSelect();

    //#endregion

    //#region Search Card Input

    const searchCardInput = document.createElement("input");
    searchCardInput.id = "MoonCEBCSearchCardInputId";
    searchCardInput.style.width = "10%";
    searchCardInput.style.height = "80%";
    searchCardInput.style.alignContent = "center";
    searchCardInput.style.textAlign = "center";
    searchCardInput.style.fontSize = TopPanelTextSize;
    searchCardInput.placeholder = "Search Card";
    searchCardInput.addEventListener("input", (event) => {
      const newValue = event.target.value;
      
      if (newValue && newValue != "") {
        const lowerSearch = newValue.toLowerCase();
    
        const searchResult = MoonCEBCBuilderCurrentGroupsList.filter(card => {
          const cleanedText = card.Text?.replaceAll(fameTextColor, "").replaceAll(moneyTextColor, "");

          const inName = card.Name.toLowerCase().includes(lowerSearch);
          const inText = cleanedText && cleanedText.toLowerCase().includes(lowerSearch);
          const inGroup = card.Group && card.Group.some(group => group.toLowerCase().includes(lowerSearch));
      
          return inName || inText || inGroup;
        });
      
      MoonCEBCBuilderSeacrhGroupList = searchResult;
      }
      else
        MoonCEBCBuilderSeacrhGroupList = [];

      MoonCEBCCurrentCardsListPage = 0;
      MoonCEBCCurrent30Cards = Get30CardsGroup();
      UpdateCardsCells(MoonCEBCCurrent30Cards);
    });
    searchCardInput.addEventListener("keydown", (event) => {
      if (movementKeys.includes(event.code))
        event.stopPropagation();
    });

    //#endregion

    //#region groupButtons
    const groupButtons = document.createElement("div");
    groupButtons.style.width = "20%";
    groupButtons.style.height = "100%";
    groupButtons.style.textAlign = "center";
    groupButtons.style.alignItems = "center";
    groupButtons.style.display = "flex";
    groupButtons.style.flexDirection = "row";
    groupButtons.style.boxSizing = "border-box";
    groupButtons.style.gap = "2%";

    const clearButton = createButton(
      null,
      "Icons/Trash.png",
      ClearCurrentDeck,
      "20%",
      "80%",
      "0",
      "0",
      "Clear all cards",
      "left"
    );

    const defaultButton = createButton(
      "Default",
      "Icons/Small/Undo.png",
      null,
      "16%",
      "80%",
      "0",
      "0",
      "Select default deck",
      "left"
    );

    const leftCardsListButtonWithImage = createButton(
      null,
      "Icons/Prev.png",
      PrevButtonClick,
      "20%",
      "80%",
      "0",
      "0",
      "Previous page of cards",
      "left"
    );

    const rightCardsListButtonWithImage = createButton(
      null,
      "Icons/Next.png",
      NextButtonClick,
      "20%",
      "80%",
      "0",
      "0",
      "Next page of cards",
      "left"
    );

    const saveDeckButtonWithImage = createButton(
      null,
      "Icons/Accept.png",
      SaveDeckButtonClick,
      "20%",
      "80%",
      "0",
      "0",
      "Save deck",
      "left"
    );

    const cancelDeckButtonWithImage = createButton(
      null,
      "Icons/Cancel.png",
      CancelDeckButtonClick,
      "20%",
      "80%",
      "0",
      "0",
      "Cancel all changes",
      "left"
    );

    //#endregion

    //#region deckCardsCounter
    const deckCardsCounter = document.createElement("div");
    deckCardsCounter.id = "DeckCardsCounterId";
    deckCardsCounter.style.width = "15%";
    deckCardsCounter.style.alignContent = "center";
    deckCardsCounter.style.textAlign = "center";
    deckCardsCounter.style.pointerEvents = "none";
    deckCardsCounter.style.userSelect = "none";
    deckCardsCounter.style.fontSize = TopPanelTextSize;
    deckCardsCounter.style.color = "white";

    //#endregion

    groupButtons.appendChild(clearButton);
    //groupButton.appendChild(defaultButton);
    groupButtons.appendChild(leftCardsListButtonWithImage);
    groupButtons.appendChild(rightCardsListButtonWithImage);
    groupButtons.appendChild(saveDeckButtonWithImage);
    groupButtons.appendChild(cancelDeckButtonWithImage);

    topSettingsLeftEditPanel.appendChild(deckNameInput);
    topSettingsLeftEditPanel.appendChild(groupSelect);
    topSettingsLeftEditPanel.appendChild(searchCardInput);
    topSettingsLeftEditPanel.appendChild(groupButtons);
    topSettingsLeftEditPanel.appendChild(deckCardsCounter);
    //#endregion

    //#region topSettingsRightPanel

    const topSettingsRightPanel = document.createElement("div");
    topSettingsRightPanel.style.display = "flex";
    topSettingsRightPanel.style.flexDirection = "row";
    topSettingsRightPanel.style.justifyContent = "flex-end";
    topSettingsRightPanel.style.alignItems = "center";
    topSettingsRightPanel.style.width = TopRightPanelWidth;
    topSettingsRightPanel.style.height = "100%";
    topSettingsRightPanel.style.boxSizing = "border-box";
    topSettingsRightPanel.style.paddingRight = TopPanelSidePadding;
    topSettingsRightPanel.style.paddingLeft = TopPanelSidePadding;
    topSettingsRightPanel.style.gap = TopLeftPanelGap;
    topSettingsPanel.appendChild(topSettingsRightPanel);

    const settingsButton = createButton(
      null,
      "Icons/General.png",
      OpenSettingsMenu,
      "50%",
      "80%",
      "0",
      "0",
      "Dont Work",
      "left"
    );

    const infoButtonWithImage = createButton(
      null,
      "Icons/Question.png",
      OpenInfo,
      "50%",
      "80%",
      "0",
      "5%",
      "Info",
      "left"
    );

    const exitButtonWithImage = createButton(
      null,
      "Icons/Exit.png",
      OpenExitAddonWindow,
      "50%",
      "80%",
      "0",
      "5%",
      "Exit Addon",
      "left"
    );

    topSettingsRightPanel.appendChild(infoButtonWithImage);
    //topSettingsRightPanel.appendChild(settingsButton);
    topSettingsRightPanel.appendChild(exitButtonWithImage);

    //#endregion

    //#endregion

    //#region Bottom Panel

    const bottomPanel = document.createElement("div");
    bottomPanel.style.display = "flex";
    bottomPanel.style.flexDirection = "row";
    bottomPanel.style.justifyContent = "space-between";
    bottomPanel.style.alignItems = "center";
    bottomPanel.style.width = "100%";
    bottomPanel.style.height = `calc(100% - ${TopPanelHeight})`;
    bottomPanel.style.boxSizing = "border-box";
    mainWindow.appendChild(bottomPanel);

    CardCells = createGridLayout(bottomPanel);

    const cardInfoPanel = document.createElement("div");
    cardInfoPanel.id = "CardInfoPanelId";
    cardInfoPanel.style.height = "100%";
    cardInfoPanel.style.width = "20%";
    cardInfoPanel.style.maxWidth = "100%";
    cardInfoPanel.style.maxHeight = "100%";
    cardInfoPanel.style.boxSizing = "border-box";
    cardInfoPanel.style.position = "relative";
    cardInfoPanel.style.justifyContent = "center";
    cardInfoPanel.style.alignItems = "center";
    cardInfoPanel.style.display = "flex";
    bottomPanel.appendChild(cardInfoPanel);
    //#endregion

    //load decks data
    LoadPlayerDecksSelectData();
  }

  //#endregion

  /**
   * Loads the club card list and ensures each card has its associated text.
   */
  function LoadClubCardList() {
    if (!MoonCEBCClubCardList || MoonCEBCClubCardList.length === 0 || MoonCEBCClubCardList[0].Text === "") {
      MoonCEBCClubCardList = [];
          for (const card of ClubCardList) {
              const copiedCard = { ...card };
              let attemptsLeft = 2;

              while (attemptsLeft-- > 0) {
                  const text = ClubCardTextGet("Text " + copiedCard.Name);

                if (text && text != '') {
                  copiedCard.Text = text;
                  break;
                }
            }
            
              MoonCEBCClubCardList.push(copiedCard);
          }
      }
  }

  /**
   * Loads and stores card data.  Text_ClubCard.csv
   */
  async function AddonLoad() {
    await waitFor(() => Player !== undefined && Player.MemberNumber !== undefined);

   //Load Cards data from BC Server
    TextPrefetchFile(ScreenFileGetPath(`Text_ClubCard.csv`, "MiniGame", "ClubCard"));
    ClubCardTextGet("Title Kinky Neighbor");

    if (CurrentScreen == "ChatRoom")
      AddonInfoMessage();

    console.log(`${MoonCEBCAddonName} Loaded! Version: ${AddonVersion}`);
  }

  /**
   * Waits until the given condition function returns true, or the cancel function (if provided) returns true.
   * @param {() => boolean} func - Condition function to wait for.
   * @param {() => boolean} [cancelFunc] - Optional cancel function to stop waiting.
   * @returns {Promise<boolean>}
   */
  async function waitFor(func, cancelFunc = () => false) {
    while (!func()) {
      if (cancelFunc()) return false;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return true;
  }

  /**
   * The function is loaded into Run via BcModSdk and constantly checks to see if the button can be displayed to open the addon window
   */
  function UpdateStatusShowButton() {
    //check if in room selected ClubCard game
    const isClubCardsGame = ChatRoomGame == "ClubCard";
    //check where the player is
    const isInChatRoom = CurrentScreen == "ChatRoom";

    const isShowButton = isInChatRoom && true;

    if (isShowButton && showButton.style.display !== "block")
      showButton.style.display = "block";
    else if (!isShowButton && showButton.style.display !== "none")
      showButton.style.display = "none";
  }
  /**
   * Checks the player's data and fills the drop-down list with the player's decks.
   * Also updates the card boxes for the first option.
   */
  function LoadPlayerDecksSelectData() {
    if (Player.Game.ClubCard == null) return;

    const playerDecksSelect = MainWindowPanel.querySelector(
      "#PlayerDecksSelectId"
    );

    const oldSelectedIndex = playerDecksSelect.selectedIndex;
    playerDecksSelect.innerHTML = "";
    let playerDecksData = [];
    if (
      Player.Game.ClubCard.DeckName != null &&
      Player.Game.ClubCard.DeckName.length > 0
    )
      playerDecksData = Player.Game.ClubCard.DeckName;
    else playerDecksData = ["", "", "", "", "", "", "", "", "", ""];

    for (let i = 0; i <= 9; i++)
      if (playerDecksData[i] == "") playerDecksData[i] = `Deck #${i + 1}`;

    //I'm deleting the 11th element of the deck array.
    //I don't quite understand why it is needed, because there are no decks under this index.
    if (playerDecksData.length == 11) playerDecksData.pop();

    playerDecksData.forEach((name, index) => {
      if (name != null) {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = name;
        if (Player.Themed) {
          option.style.backgroundColor =
            Player.Themed.ColorsModule.primaryColor;
          option.style.borderColor = Player.Themed.ColorsModule.accentColor;
        }
        playerDecksSelect.appendChild(option);
      }
    });

    playerDecksSelect.selectedIndex =
      oldSelectedIndex != -1 ? oldSelectedIndex : 0;

    GetDeckData(playerDecksSelect);
  }
  /**
   * Get data selected deck and update cards cells
   * @param {HTMLSelectElement} - Sources HTMLSelectElement
   * @returns {void} - Nothing
   */
  function GetDeckData(decksCombobox) {
    let selectedIndex = decksCombobox.value;
    const encodedDeck = Player.Game.ClubCard.Deck[selectedIndex];
    let deckData = [];
    let decodedDeck = [];
    if (encodedDeck == "" || encodedDeck == null) {
      decodedDeck = [...ClubCardBuilderDefaultDeck];
    } else {
      decodedDeck = decodeStringDeckToID(encodedDeck);
    }

    for (let id of decodedDeck)
      deckData.push(MoonCEBCClubCardList.find((card) => card.ID === id));
    const sortedCards = SortCardsList(deckData);
    MoonCEBCEditCurrentDeck = [...sortedCards];
    MoonCEBCCurrentDeck = [...sortedCards];
    MoonCEBCCurrent30Cards = [...sortedCards];

    UpdateCardsCells(MoonCEBCCurrent30Cards);
  }
  /**
   * updates cells with an array of 30 cards
   * @param {ClubCard[]} cardsArray
   */
  function UpdateCardsCells(cardsArray) {
    for (let i = 0; i < 30; i++) {
      const cardCells = CardCells[i];
      if (cardCells) cardCells.innerHTML = "";
      
      if (cardsArray == null)
        continue;

      let card = cardsArray[i];
      if (cardsArray && i < cardsArray.length) {
        const cardText = ClubCardTextGet("Text " + card.Name);
        card.Text = formatTextForInnerHTML(cardText);
        const cardController = createCard(card);

        //Update border selected cards
        if (MoonCEBCPageMode == WindowStatus.EDIT)
          if (MoonCEBCEditCurrentDeck.includes(card))
            cardController.showSelected();

        cardController.cardButton.addEventListener("click", () => {
          const isEditMode = MoonCEBCPageMode == WindowStatus.EDIT;
          if (isEditMode) {
            if (MoonCEBCEditCurrentDeck.includes(card)) {
              const indexToRemove = MoonCEBCEditCurrentDeck.findIndex(
                (removedCard) => removedCard.ID === card.ID
              );
              MoonCEBCEditCurrentDeck.splice(indexToRemove, 1);
              cardController.hideSelected();

              UpdateDeckCardsCounter();
            } else {
              MoonCEBCEditCurrentDeck.push(card);
              cardController.showSelected();
              UpdateDeckCardsCounter();
            }
          }
        });

        cardController.cardButton.addEventListener("mouseover", () => { 
          if (MoonCEBCMouseOverCard != card) {
            MoonCEBCMouseOverCard = card;
            const cardInfoPanel = MainWindowPanel.querySelector("#CardInfoPanelId");
            if (cardInfoPanel) cardInfoPanel.innerHTML = "";
            const cardControllerInfoPanel = createCard(card);

            if (card.Reward) cardControllerInfoPanel.cardButton.style.border = "4.5px solid gold";
            else cardControllerInfoPanel.cardButton.style.border = "4.5px solid black";

            cardControllerInfoPanel.titleName.classList.add("card-name-info-panel");
            cardControllerInfoPanel.cardGroupTextElement.classList.add("card-group-info-panel");
            cardControllerInfoPanel.cardDescriptionTextElement.classList.add("card-description-info-panel");
            cardControllerInfoPanel.valuePanel.classList.add("value-card-panel-info-panel");

            cardInfoPanel.appendChild(cardControllerInfoPanel.cardButton);
          }
        });

        cardCells.appendChild(cardController.cardButton);
      }
    }
  }
  /**
   * Track and update the current card count when editing a deck
   */
  function UpdateDeckCardsCounter() {
    const deckCardsCounter = MainWindowPanel.querySelector(
      "#DeckCardsCounterId"
    );

    const countCards = MoonCEBCEditCurrentDeck.length;

    deckCardsCounter.textContent = `Select the cards (${countCards}/${"30 - 40"})`;

    const isValidDeckSize = countCards >= 30 && countCards <= 40;

    deckCardsCounter.style.color = isValidDeckSize ? "white" : "red";
  }

  //#region Top Panel Button Logic

  //#region VIEW Left Top Panel

  /**
   * The function changes the top panel and updates the data to enter edit mode.
   */
  function SetEditMode() {
    const topSettingsLeftViewPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftViewPanelId"
    );
    const topSettingsLeftEditPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftEditPanelId"
    );
    const deckNameInput = MainWindowPanel.querySelector("#MoonCEBCDeckNameInputId");
    const playerDecksSelect = MainWindowPanel.querySelector(
      "#PlayerDecksSelectId"
    );
    const groupSelect = MainWindowPanel.querySelector("#GroupSelectId");

    topSettingsLeftViewPanel.style.display = "none";
    topSettingsLeftEditPanel.style.display = "flex";

    if (Player.Themed)
      deckNameInput.style.color = Player.Themed.ColorsModule.textColor;
    else deckNameInput.style.color = "black";

    deckNameInput.value =
      playerDecksSelect.options[playerDecksSelect.selectedIndex].text;

    groupSelect.selectedIndex = 0;

    MoonCEBCPageMode = WindowStatus.EDIT;
    MoonCEBCEditCurrentDeck = [...MoonCEBCCurrentDeck];
    UpdateCardsListSetNewGroup();
    UpdateDeckCardsCounter();
  }

  //#endregion

  //#region EDIT Left Top Panel

  function CancelDeckButtonClick() {
    const topSettingsLeftViewPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftViewPanelId"
    );
    const topSettingsLeftEditPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftEditPanelId"
    );

    topSettingsLeftViewPanel.style.display = "flex";
    topSettingsLeftEditPanel.style.display = "none";
    MoonCEBCPageMode = WindowStatus.VIEW;
    MoonCEBCCurrentGroup = CardTypes.ALL_CARDS.value;
    MoonCEBCBuilderSeacrhGroupList = [];
    MoonCEBCBuilderCurrentGroupsList = [];
    MoonCEBCCurrentCardsListPage = 0;
    UpdateCardsCells(MoonCEBCCurrentDeck);
  }

  function SaveDeckButtonClick() {
    const topSettingsLeftViewPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftViewPanelId"
    );
    const topSettingsLeftEditPanel = MainWindowPanel.querySelector(
      "#TopSettingsLeftEditPanelId"
    );
    const deckNameInput = MainWindowPanel.querySelector("#MoonCEBCDeckNameInputId");
    const isDeckNameValidation =
      deckNameInput.value != "" &&
      deckNameInput.value != null &&
      deckNameInput.value.length <= 30;
    
    if (isDeckNameValidation && MoonCEBCEditCurrentDeck.length >= 30 && MoonCEBCEditCurrentDeck.length <= 40) {
      topSettingsLeftViewPanel.style.display = "flex";
      topSettingsLeftEditPanel.style.display = "none";
      MoonCEBCPageMode = WindowStatus.VIEW;
      MoonCEBCCurrentGroup = CardTypes.ALL_CARDS.value;
      MoonCEBCBuilderSeacrhGroupList = [];
      MoonCEBCBuilderCurrentGroupsList = [];
      MoonCEBCCurrentCardsListPage = 0;

      SaveNewDeck();
      UpdateCardsCells(MoonCEBCEditCurrentDeck);
      LoadPlayerDecksSelectData();
    }
  }

  /**
   * Save new Deck  :)
   * @param {boolean} [isSaveName=true] - variable that controls whether a new name for the deck will be stored.
   */
  function SaveNewDeck(isSaveName = true) {
    const deckNameInput = MainWindowPanel.querySelector("#MoonCEBCDeckNameInputId");
    const playerDecksSelect = MainWindowPanel.querySelector("#PlayerDecksSelectId");
    const cardIDs = MoonCEBCEditCurrentDeck.map((card) => card.ID);
    const encodeIDDeck = encodeIDDeckToString(cardIDs);
    const selectedIndex = playerDecksSelect.selectedIndex;
 
    if (isSaveName) {
      //fix null deck if player dont created them
      if (Player.Game.ClubCard.DeckName == null)
        Player.Game.ClubCard.DeckName = ["Deck #1", "Deck #2", "Deck #3", "Deck #4", "Deck #5", "Deck #6", "Deck #7", "Deck #8", "Deck #9", "Deck #10"];
      
      const newDeckName = deckNameInput.value;
      Player.Game.ClubCard.DeckName[selectedIndex] = newDeckName;
    }

    Player.Game.ClubCard.Deck[selectedIndex] = encodeIDDeck;

    ServerAccountUpdate.QueueData({ Game: Player.Game }, true);
  }

  /**
   * Function for switching cards pages in edit mode
   */
  function PrevButtonClick() {
    if (MoonCEBCCurrentCardsListPage != 0) {
      MoonCEBCCurrentCardsListPage -= 1;
      let newCardsLlist = Get30CardsGroup();
      if (newCardsLlist) {
        MoonCEBCCurrent30Cards = [...newCardsLlist];
        UpdateCardsCells(MoonCEBCCurrent30Cards);
      } else {
        MoonCEBCCurrentCardsListPage += 1;
      }
    }
  }

  /**
   * Function for switching cards pages in edit mode
   */
  function NextButtonClick() {
    MoonCEBCCurrentCardsListPage += 1;
    let newCardsLlist = Get30CardsGroup();
    if (newCardsLlist) {
      MoonCEBCCurrent30Cards = [...newCardsLlist];
      UpdateCardsCells(MoonCEBCCurrent30Cards);
    } else {
      MoonCEBCCurrentCardsListPage -= 1;
    }
  }

  /**
   * Clear Current deck in edit mode
   */
  function ClearCurrentDeck() {
    MoonCEBCEditCurrentDeck = [];

    UpdateCardsCells(MoonCEBCCurrent30Cards);

    UpdateDeckCardsCounter();
  }
  /**
   * TODO Maybe I'll add a couple of my decks as a default deck?
   */
  function SetCurrentDeckDefault() { }

  //#endregion

  //#region Right Top Panel

  /**
   * Function to open or close the addon window
   */
  function OpenExitAddonWindow() {
    if (isVisibleMainWindow) {
      AddonInfoMessage();
      if (MainWindowPanel) MainWindowPanel.remove();

      MoonCEBCCurrentGroup = CardTypes.ALL_CARDS.value;
      MoonCEBCBuilderSeacrhGroupList = [];
      MoonCEBCBuilderCurrentGroupsList = [];
      MoonCEBCPageMode = WindowStatus.VIEW;
      MoonCEBCCurrentCardsListPage = 0;

      CardCells = [];
    } else {
      LoadClubCardList();
      AddonInfoMessage(null, true);
      LoadMainWindow();
    }

    MoonCEBCPageMode = WindowStatus.VIEW;
    isVisibleMainWindow = !isVisibleMainWindow;
  }

  //#region Export / Import Deck

  function ExportDeck() {
    const cardIDs = MoonCEBCEditCurrentDeck.map((card) => card.ID);
    const encodeDeck = encodeEIDeck(cardIDs);
    CreateInputWindow("Export Deck", encodeDeck, null);
  }

  function ImportDeck() {
    CreateInputWindow("Import Deck", "", SaveImportDeck);
  }
  function SaveImportDeck(stringDeck) {
    const deckData = [];
    const decodedDeck = decodeEIDeck(stringDeck.trim());
    if (decodedDeck == null) return false;

    for (let id of decodedDeck)
      deckData.push(MoonCEBCClubCardList.find((card) => card.ID === id));
    MoonCEBCEditCurrentDeck = deckData
    SaveNewDeck(false);
    const playerDecksSelect = MainWindowPanel.querySelector("#PlayerDecksSelectId");
    GetDeckData(playerDecksSelect);
    return true;
  }

  function CreateInputWindow(title, textAreaText, onOkCallback) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const windowContainer = document.createElement("div");
    windowContainer.style.cssText = `
        position: relative;
        width: min(90vw, 400px);
        height: min(80vh, 250px);
        background: white;
        border-radius: 8px;
        border: 1px solid black;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        overflow: auto;
    `;
    windowContainer.style.backgroundImage = "url('Backgrounds/ClubCardPlayBoard1.jpg')";

    const header = document.createElement("div");
    header.style.cssText = `
        height: 20%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 5%;
        font-size: 1.2vw;
        font-weight: bold;
        border-bottom: 1px solid #ccc;
    `;
    header.style.backgroundImage = `url(${MoonCEBCTopPanelBackground})`;

    const titleLabel = document.createElement("span");
    titleLabel.textContent = title || "Enter data";
    titleLabel.style.cssText = `
        color: white;
        font-size: min(1.5vw, 18px);
        font-weight: bold;
        text-align: left;
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    `;

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "10px";

    const inputField = document.createElement("textarea");
    inputField.value = textAreaText;
    inputField.style.cssText = `
        width: 95%;
        height: 95%;
        padding: 2%;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1vw;
        text-align: left;
    `;

    let copyButton = null;
    if (textAreaText && textAreaText != "") {
      copyButton = createIconButton("📋", "Copy", () => {
          navigator.clipboard.writeText(inputField.value)
              .then(() => toggleIcon(copyButton, "✅"))
              .catch(() => toggleIcon(copyButton, "❌"));
      });
    }

    const closeButton = createIconButton("✖", "Close", () => MainWindowPanel.removeChild(overlay));
    if (textAreaText && textAreaText != "") buttonGroup.append(copyButton, closeButton);
    else buttonGroup.append(closeButton);
    header.append(titleLabel, buttonGroup);

    const content = document.createElement("div");
    content.style.cssText = `
        height: 80%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10%;
    `;

    const inputContainer = document.createElement("div");
    inputContainer.style.cssText = `
        height: 50%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    inputContainer.appendChild(inputField);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        height: 25%;
        width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const okButton = document.createElement("button");
    okButton.textContent = "ОК";
    okButton.style.cssText = `
        width: 90%;
        height: 80%;
        font-size: 1vw;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    okButton.onclick = () => {
      if (typeof onOkCallback === "function") {
        const result = onOkCallback(inputField.value);
        if(result) MainWindowPanel.removeChild(overlay);
      }
      else {
        MainWindowPanel.removeChild(overlay);
      }

    };

    buttonContainer.appendChild(okButton);
    content.append(inputContainer, buttonContainer);

    overlay.onclick = (event) => {
        if (event.target === overlay) MainWindowPanel.removeChild(overlay);
    };

    windowContainer.append(header, content);
    overlay.appendChild(windowContainer);
    MainWindowPanel.appendChild(overlay);
  }
  
  /**
 * Changes the button icon for a short time.
 * @param {HTMLButtonElement} button - Button to change.
 * @param {string} newIcon - New Icon.
 */
  function toggleIcon(button, newIcon) {
    const oldIcon = button.innerHTML;
    button.innerHTML = newIcon;
    setTimeout(() => button.innerHTML = oldIcon, 1000);
  }

  function createIconButton(iconText, tooltip, onClick) {
    const button = document.createElement("button");
    button.style.cssText = `
        width: 2vw;
        height: 2vw;
        display: flex;
        justify-content: center;
        align-items: center;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
        padding: 0;
        overflow: hidden;
    `;
    
    const icon = document.createElement("span");
    icon.innerHTML = iconText;
    icon.style.cssText = `
        width: 80%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    button.appendChild(icon);

    button.title = tooltip;
    button.onclick = onClick;

    return button;
}



  //#endregion Export / Import Deck
  
  //#region Info Window

  function OpenInfo() {
    const infoText =
    `📌 Discord — BC Cards Community
    Join discussions, ask questions, and meet other players:
    🔗 https://discord.gg/ZByQXVHm4u

    📊 Cards Monitoring Tool
    Track cards stats:
    🔗 https://clubcardmonitoring.onrender.com/

    📰 News
    🔗 https://discord.com/channels/1172246773352370337/1374075134071144590

    🐞 Report Bugs
    Found a bug? Help fix it faster:
    🔗 https://discord.com/channels/1172246773352370337/1280926166836056064`;

    CreateInfoWindow("Information", infoText);
  }
  /**
   * Displays an informational window with auto-height and clean layout.
   * @param {string} title - The window title
   * @param {string} message - Text content to display (supports \n)
   */
  function CreateInfoWindow(title, message) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const windowContainer = document.createElement("div");
    windowContainer.style.cssText = `
      position: relative;
      width: min(90vw, 700px);
      max-height: 90vh;
      background: white;
      border-radius: 8px;
      border: 1px solid black;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      background-image: url('Backgrounds/ClubCardPlayBoard1.jpg');
      padding-bottom: 20px;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      height: auto;
      min-height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      background-image: url(${MoonCEBCTopPanelBackground});
    `;

    const titleLabel = document.createElement("span");
    titleLabel.textContent = title || "Information";
    titleLabel.style.cssText = `
      color: white;
      font-size: 18px;
      font-weight: bold;
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    `;

    const closeButton = createIconButton("✖", "Close", () => MainWindowPanel.removeChild(overlay));
    header.append(titleLabel, closeButton);

    const content = document.createElement("div");
    content.style.cssText = `
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    `;

    const messageBox = document.createElement("div");
    messageBox.innerText = message || "No content provided.";
    messageBox.style.cssText = `
      width: 100%;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      font-size: 1rem;
      white-space: pre-line;
    `;

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.cssText = `
      padding: 8px 35px;
      font-size: 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      align-self: center;
    `;
    okButton.onclick = () => MainWindowPanel.removeChild(overlay);

    content.append(messageBox, okButton);
    windowContainer.append(header, content);
    overlay.appendChild(windowContainer);
    MainWindowPanel.appendChild(overlay);
  }


  //#endregion
  
  function OpenSettingsMenu() {
    const settingsModal = createModal('settings-modal', MainWindowPanel, 'Moon Cards Editor Settings');
     const menuContainer1 = settingsModal.addMenuContainer('row');
    // const menuContainer2 = settingsModal.addMenuContainer('row');
    // const menuContainer3 = settingsModal.addMenuContainer('row');
     createSettingsMenu(menuContainer1, settingsData);
    // createSettingsMenu(menuContainer2, settingsData);
    // createSettingsMenu(menuContainer3, settingsData);
    settingsModal.open();
  }

  const settingsData = [
    {
        groupName: 'General Settings',
        settings: [
            {
                name: 'Enable Notifications',
                shortDescription: 'Receive alerts',
                fullDescription: 'Enables notifications for all important updates.',
                type: 'checkbox',
                defaultValue: true,
                onChange: (newValue) => {
                    console.log(`Notifications: ${newValue}`);
                }
            },
            {
                name: 'Username',
                shortDescription: 'Enter your username',
                fullDescription: 'Your unique username for the system.',
                type: 'text',
                defaultValue: 'User123',
                onChange: (newValue) => {
                    console.log(`Username updated to: ${newValue}`);
                }
            },
            {
                name: 'Theme',
                shortDescription: 'Select a theme',
                fullDescription: 'Choose between Light and Dark themes.',
                type: 'dropdown',
                options: ['Light', 'Dark'],
                defaultValue: 'Light',
                onChange: (newValue) => {
                    console.log(`Theme changed to: ${newValue}`);
                }
            },
            {
                name: 'Reset Settings',
                shortDescription: 'Reset all settings to default',
                fullDescription: 'Click this button to reset all settings to their default values.',
                type: 'button',
                onClick: () => {
                    console.log('Settings have been reset to default!');
                }
            }
        ]
    }
];

  //#endregion

  //#endregion
  
  /**
   * Function for sorting from the general list of cards,
   * the selected group of cards by the current value from the drop-down list.
   * Also checks to see if the player has any reward cards.
   * TODO Should be redone in the future and not block the output of reward cards.
   * But block access to adding them to the deck. And give a hint how to get a card.
   */
  function UpdateCardsListSetNewGroup() {
    let cardGroupList = [];
    const rewardPlayerCards = decodeStringDeckToID(Player.Game.ClubCard.Reward);
    const allRewardCards = MoonCEBCClubCardList.filter(
      (card) => card.Reward != undefined
    );

    switch (MoonCEBCCurrentGroup) {
      case CardTypes.ALL_CARDS.value:
        cardGroupList = [...MoonCEBCClubCardList];
        break;
      case CardTypes.SELECTED_CARDS.value:
        cardGroupList = [...MoonCEBCEditCurrentDeck];
        break;
      case CardTypes.EVENTS_CARDS.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) => card.Type == "Event"
        );
        break;
      case CardTypes.UNGROUPED.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) => card.Group == undefined && card.Type != "Event"
        );
        break;
      case CardTypes.REWARD_CARDS.value:
        cardGroupList = allRewardCards;
        break;
      case CardTypes.ASYLUM.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("AsylumPatient") ||
              card.Group.includes("AsylumNurse"))
        );
        break;
      case CardTypes.DOMINANT_MISTRESS.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("Dominant") || card.Group.includes("Mistress"))
        );
        break;
      case CardTypes.ABDL.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("ABDLBaby") ||
              card.Group.includes("ABDLMommy"))
        );
        break;
      case CardTypes.COLLEGE.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("CollegeStudent") ||
              card.Group.includes("CollegeTeacher"))
        );
        break;
      case CardTypes.SHIBARI_SENSEI_KNOT.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("Shibari") ||
              card.Group.includes("Sensei") ||
              card.Group.includes("Knot"))
        );
        break;
      case CardTypes.PET.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("Pet") ||
              card.Group.includes("Owner"))
        );
        break;
      case CardTypes.PORN.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("PornActress") ||
              card.Group.includes("Porn") ||
              card.Group.includes("Video"))
        );
        break;
      default:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) => card.Group && card.Group.includes(MoonCEBCCurrentGroup)
        );
        break;
    }

    cardGroupList = cardGroupList.filter((card) => {
      const isRewardCard = allRewardCards.some(
        (rewardCard) => rewardCard.ID === card.ID
      );

      if (isRewardCard) {
        return rewardPlayerCards.includes(card.ID);
      }

      return true;
    });

    const sortedCards = SortCardsList(cardGroupList);
    MoonCEBCBuilderCurrentGroupsList = [...sortedCards];
    MoonCEBCCurrentCardsListPage = 0;
    MoonCEBCCurrent30Cards = Get30CardsGroup();
    UpdateCardsCells(MoonCEBCCurrent30Cards);
  }

  /**
   * Function to get the current 30 cards from a sorted array with cards.
   * @returns {ClubCard[]} cards page list
   */
  function Get30CardsGroup() {
    const cardsPerPage = 30;
    const countSkipCards = MoonCEBCCurrentCardsListPage * cardsPerPage;
    const searchCardInput = MainWindowPanel.querySelector("#MoonCEBCSearchCardInputId");

    const cardsSources =
      searchCardInput.value.length > 0
        ? MoonCEBCBuilderSeacrhGroupList
        : MoonCEBCBuilderCurrentGroupsList;

    const countTakePossibleCards = cardsSources.length - countSkipCards;

    if (countTakePossibleCards >= cardsPerPage) {
      return cardsSources.slice(countSkipCards, countSkipCards + cardsPerPage);
    }
    if (countTakePossibleCards < cardsPerPage && countTakePossibleCards > 0) {
      return cardsSources.slice(
        countSkipCards,
        countSkipCards + countTakePossibleCards
      );
    } else {
      return null;
    }
  }
  /**
   * sorting by card level and secondarily by ID.
   * @param {ClubCard[]} cardsArray
   * @returns sorted array
   */
  function SortCardsList(cardsArray) {
    //In case there was an error when receiving the card, fills the data with an empty object.
    cardsArray.forEach((card, index) => {
      if (card === undefined) {
        cardsArray[index] = {
          ID: 0,
          Name: "Error",
          Type: "Error",
          Title: "Error",
          Text: "Error",
          Reward: "Error",
          RewardMemberNumber: 0,
          MoneyPerTurn: 0,
          FamePerTurn: 0,
          RequiredLevel: 0,
          Group: ["Error"],
        };
      }
    });

    let events = cardsArray.filter((card) => card.Type === "Event");
    let normalCards = cardsArray.filter((card) => card.Type !== "Event");

    events.sort(
      (a, b) =>
        (a.RequiredLevel == null ? 1 : a.RequiredLevel) -
        (b.RequiredLevel == null ? 1 : b.RequiredLevel)
    );
    normalCards.sort(
      (a, b) =>
        (a.RequiredLevel == null ? 1 : a.RequiredLevel) -
        (b.RequiredLevel == null ? 1 : b.RequiredLevel)
    );

    normalCards.sort((a, b) => {
      const levelComparison =
        (a.RequiredLevel === null ? 1 : a.RequiredLevel) -
        (b.RequiredLevel === null ? 1 : b.RequiredLevel);

      if (levelComparison == 0) {
        return a.ID - b.ID;
      }

      return levelComparison;
    });

    const sortedCards = [...normalCards, ...events];

    return sortedCards;
  }

  //#region Card Tracking Module
  function StartTrackingModule() {
    InitTrackingFromDeckAndHand(ClubCardPlayer[0].Deck, ClubCardPlayer[0].Hand);
    HookAllPlayerZones(ClubCardPlayer[0]);
  }

  /* ** Initialize tracking from FullDeck (at game start) ** */
  function InitTrackingFromDeckAndHand(deck, hand) {
    CardStatsMap.clear();
    const source = [...deck, ...hand];
    for (const card of source) {
      CardStatsMap.set(card.UniqueID, {
        id: card.ID,
        uniqueID: card.UniqueID,
        name: card.Name,
        seen: false,
        played: false
      });
    }
  }

  /* ** Mark a card as seen in hand ** */
  function MarkSeen(card) {
    const stat = CardStatsMap.get(card.UniqueID);
    if (stat && !stat.seen) stat.seen = true;
  }

  /* ** Mark a card as played (on board/event/discard) ** */
  function MarkPlayed(card) {
    const stat = CardStatsMap.get(card.UniqueID);
    if (stat && !stat.played) stat.played = true;
  }

  /* ** Hook array.push() to track card movement ** */
  function HookPush(array, onCard) {
    const originalPush = array.push;
    array.push = function (...cards) {
      for (const card of cards) {
        if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) {
          onCard(card);
        }
      }
      return originalPush.apply(this, cards);
    };
  }

  /* ** Apply push hooks to all player zones ** */
  function HookAllPlayerZones(player) {
    HookPush(player.Hand, MarkSeen);
    HookPush(player.Board, MarkPlayed);
    HookPush(player.Event, MarkPlayed);
    HookPush(player.DiscardPile, MarkPlayed);
  }

  /**
   * Build payload for API submission at the end of the game.
   * Includes all cards from FullDeck, even if unused.
   *
   * @param {boolean} win - Whether the player won the match.
   * @returns {{ id: number, name: string, score: number, win: boolean }[]} Array of card stats ready for upload.
   */
  function BuildPayload(win) {
    RefreshTrackingAfterSync(ClubCardPlayer[0]);
    const payload = [];
    for (const stat of CardStatsMap.values()) {
      const score = EvaluateScore(stat);
      payload.push({
        id: stat.id,
        name: stat.name,
        score: parseFloat(score.toFixed(2)),
        win: win
      });
    }
    return payload;
  }

  /* ** Simple scoring logic based on card usage ** */
  function EvaluateScore(stat) {
    if (stat.played) return 1;
    if (stat.seen) return 0.5;
    return 0.1;
  }

  /**
   * Reapply push hooks and reanalyze state after receiving full game state from opponent.
   * Should be called immediately after local ClubCardPlayer[0] is overwritten.
   *
   * @param {object} player - The local player object (ClubCardPlayer[0])
   */
  function RefreshTrackingAfterSync(player) {
    HookAllPlayerZones(player);

    for (const card of player.Hand) {
      if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkSeen(card);
    }
    for (const card of player.Board) {
      if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
    for (const card of player.Event) {
      if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
    for (const card of player.DiscardPile) {
      if (card?.UniqueID && CardStatsMap.has(card.UniqueID)) MarkPlayed(card);
    }
  }

  /**
 * Sends the final payload to the server.
 *
 * @param {{ id: number, name: string, score: number, win: boolean }[]} payload - Array of card stats.
 */
  function SendCardStatsToServer(payload) {
    fetch("https://clubcardmonitoring.onrender.com/api/upload-cardstats/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(r => r.text())
    .then(text => {
      //console.log("📡 Server response:", text);
    })
    .catch(err => {
      //console.error("❌ Failed to send card stats:", err);
    });
  } 


  //#endregion

  //#endregion

  //#region ChatMessageFunc

  /**
   * Func for send on server hidden message with addon data
   * @param {*} target - maybe later will use it for a few func
   * @param {boolean} isMenuOpen - IsOpen Addon Menu  
   */
  function AddonInfoMessage(target = null, isMenuOpen = false) {
    const message = {
      Type: Hidden,
      Content: "MoonCEBC",
      Sender: Player.MemberNumber,
      Dictionary: [],
    };
    if (target) message.Target = target;
    const MoonMsg = { Version: AddonVersion, IsMenuOpen: isMenuOpen };

    message.Dictionary.push(MoonMsg);

    ServerSend("ChatRoomChat", message);
  }

  /**
   * Func for parse data string to object
   * @param {*} data -message data
   * @returns 
   */
  function ParseAddonMessage(data) {
    let moonMessage = null;

    if (Array.isArray(data.Dictionary)) {
      moonMessage = data.Dictionary.find(entry =>
        entry && typeof entry.Version !== 'undefined' && typeof entry.IsMenuOpen !== 'undefined'
      );
    }

    return moonMessage || null;
  }

  //#endregion

  //#region parser functions

  /**
   * Updated  the text by mask, for InnerHTML
   * @param {String} text -Normal Card Text
   * @returns {String} -  Updated for InnerHTML Card Text
   */
  function formatTextForInnerHTML(text) {
    const fameRegex = /[+-]?\d*\s*fame/gi;
    const moneyRegex = /[+-]?\d*\s*money/gi;

    const formattedText = text
      .replace(
        fameRegex,
        (match) => `<span style='color: ${fameTextColor};'>${match}</span>`
      )
      .replace(
        moneyRegex,
        (match) => `<span style='color: ${moneyTextColor};'>${match}</span>`
      );

    return formattedText;
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
   * Function to decode a string back into an array of numeric IDs.
   * @param {string} stringDeck - The encoded string to decode.
   * @returns {number[]} - An array of numeric IDs decoded from the string.
   */
  function decodeStringDeckToID(stringDeck) {
    let decodedNumbers = [];
    for (let i = 0; i < stringDeck.length; i++) {
      decodedNumbers.push(stringDeck.charCodeAt(i));
    }
    return decodedNumbers;
  }



/**
 * Encodes an array of numbers into a Base64 string. For Export/Import Deck
 * @param {number[]} IdArrayDeck - The array of numerical IDs to encode.
 * @returns {string} - The encoded string.
 */
function encodeEIDeck(IdArrayDeck) {
    let encrypted = IdArrayDeck.map(id => id ^ meow_key);
    let stringified = encrypted.join(",");
    return btoa(stringified);
}

/**
 * Decodes a Base64 string back into an array of numbers with validation.
 * @param {string} encodedString - The encoded Base64 string.
 * @returns {number[]} - The decoded and validated array of IDs.
 */
function decodeEIDeck(encodedString) {
  try {
      if (!encodedString || typeof encodedString !== "string") {
          throw new Error("Invalid input: Not a string");
      }

      let decryptedString;
      try {
          decryptedString = atob(encodedString);
      } catch (e) {
          throw new Error("Invalid input: Not a valid Base64 string");
      }

      let numbers = decryptedString
          .split(",")
          .map(num => parseInt(num, 10))
          .filter(num => !isNaN(num));

      if (numbers.length < 30 || numbers.length > 40) {
          throw new Error(`Invalid deck size: Expected 30-40, got ${numbers.length}`);
      }

      let decodedIds = numbers.map(id => id ^ meow_key);

      let allIdsExist = decodedIds.every(id => MoonCEBCClubCardList.some(card => card.ID === id));
      if (!allIdsExist) {
          throw new Error("Invalid deck: Some IDs do not exist in the card database");
      }

      return decodedIds;

  } catch (error) {
      console.error("decodeEIDeck Error:", error.message);
      return null;
  }
}


  //#endregion
})();
