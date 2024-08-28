// ==UserScript==
// @name Moon Cards Editor BC
// @namespace https://www.bondageprojects.com/
// @version 1.0.0
// @description Addon for viewing and customizing card decks without Npc room.
// @author Lunar Kitsunify
// @match http://localhost:*/*
// @match https://bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://bondageprojects.com/*
// @match https://www.bondageprojects.com/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

//#region  bcSDK Stuff
var bcModSdk = (function () {
  "use strict";
  const o = "1.2.0";
  function e(o) {
    alert("Mod ERROR:\n" + o);
    const e = new Error(o);
    throw (console.error(e), e);
  }
  const t = new TextEncoder();
  function n(o) {
    return !!o && "object" == typeof o && !Array.isArray(o);
  }
  function r(o) {
    const e = new Set();
    return o.filter((o) => !e.has(o) && e.add(o));
  }
  const i = new Map(),
    a = new Set();
  function c(o) {
    a.has(o) || (a.add(o), console.warn(o));
  }
  function s(o) {
    const e = [],
      t = new Map(),
      n = new Set();
    for (const r of f.values()) {
      const i = r.patching.get(o.name);
      if (i) {
        e.push(...i.hooks);
        for (const [e, a] of i.patches.entries())
          t.has(e) &&
            t.get(e) !== a &&
            c(
              `ModSDK: Mod '${r.name}' is patching function ${
                o.name
              } with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${
                t.get(e) || ""
              }\nPatch2:\n${a}`
            ),
            t.set(e, a),
            n.add(r.name);
      }
    }
    e.sort((o, e) => e.priority - o.priority);
    const r = (function (o, e) {
      if (0 === e.size) return o;
      let t = o.toString().replaceAll("\r\n", "\n");
      for (const [n, r] of e.entries())
        t.includes(n) ||
          c(`ModSDK: Patching ${o.name}: Patch ${n} not applied`),
          (t = t.replaceAll(n, r));
      return (0, eval)(`(${t})`);
    })(o.original, t);
    let i = function (e) {
      var t, i;
      const a =
          null === (i = (t = m.errorReporterHooks).hookChainExit) ||
          void 0 === i
            ? void 0
            : i.call(t, o.name, n),
        c = r.apply(this, e);
      return null == a || a(), c;
    };
    for (let t = e.length - 1; t >= 0; t--) {
      const n = e[t],
        r = i;
      i = function (e) {
        var t, i;
        const a =
            null === (i = (t = m.errorReporterHooks).hookEnter) || void 0 === i
              ? void 0
              : i.call(t, o.name, n.mod),
          c = n.hook.apply(this, [
            e,
            (o) => {
              if (1 !== arguments.length || !Array.isArray(e))
                throw new Error(
                  `Mod ${
                    n.mod
                  } failed to call next hook: Expected args to be array, got ${typeof o}`
                );
              return r.call(this, o);
            },
          ]);
        return null == a || a(), c;
      };
    }
    return { hooks: e, patches: t, patchesSources: n, enter: i, final: r };
  }
  function l(o, e = !1) {
    let r = i.get(o);
    if (r) e && (r.precomputed = s(r));
    else {
      let e = window;
      const a = o.split(".");
      for (let t = 0; t < a.length - 1; t++)
        if (((e = e[a[t]]), !n(e)))
          throw new Error(
            `ModSDK: Function ${o} to be patched not found; ${a
              .slice(0, t + 1)
              .join(".")} is not object`
          );
      const c = e[a[a.length - 1]];
      if ("function" != typeof c)
        throw new Error(`ModSDK: Function ${o} to be patched not found`);
      const l = (function (o) {
          let e = -1;
          for (const n of t.encode(o)) {
            let o = 255 & (e ^ n);
            for (let e = 0; e < 8; e++)
              o = 1 & o ? -306674912 ^ (o >>> 1) : o >>> 1;
            e = (e >>> 8) ^ o;
          }
          return ((-1 ^ e) >>> 0).toString(16).padStart(8, "0").toUpperCase();
        })(c.toString().replaceAll("\r\n", "\n")),
        d = { name: o, original: c, originalHash: l };
      (r = Object.assign(Object.assign({}, d), {
        precomputed: s(d),
        router: () => {},
        context: e,
        contextProperty: a[a.length - 1],
      })),
        (r.router = (function (o) {
          return function (...e) {
            return o.precomputed.enter.apply(this, [e]);
          };
        })(r)),
        i.set(o, r),
        (e[r.contextProperty] = r.router);
    }
    return r;
  }
  function d() {
    for (const o of i.values()) o.precomputed = s(o);
  }
  function p() {
    const o = new Map();
    for (const [e, t] of i)
      o.set(e, {
        name: e,
        original: t.original,
        originalHash: t.originalHash,
        sdkEntrypoint: t.router,
        currentEntrypoint: t.context[t.contextProperty],
        hookedByMods: r(t.precomputed.hooks.map((o) => o.mod)),
        patchedByMods: Array.from(t.precomputed.patchesSources),
      });
    return o;
  }
  const f = new Map();
  function u(o) {
    f.get(o.name) !== o &&
      e(`Failed to unload mod '${o.name}': Not registered`),
      f.delete(o.name),
      (o.loaded = !1),
      d();
  }
  function g(o, t) {
    (o && "object" == typeof o) ||
      e("Failed to register mod: Expected info object, got " + typeof o),
      ("string" == typeof o.name && o.name) ||
        e(
          "Failed to register mod: Expected name to be non-empty string, got " +
            typeof o.name
        );
    let r = `'${o.name}'`;
    ("string" == typeof o.fullName && o.fullName) ||
      e(
        `Failed to register mod ${r}: Expected fullName to be non-empty string, got ${typeof o.fullName}`
      ),
      (r = `'${o.fullName} (${o.name})'`),
      "string" != typeof o.version &&
        e(
          `Failed to register mod ${r}: Expected version to be string, got ${typeof o.version}`
        ),
      o.repository || (o.repository = void 0),
      void 0 !== o.repository &&
        "string" != typeof o.repository &&
        e(
          `Failed to register mod ${r}: Expected repository to be undefined or string, got ${typeof o.version}`
        ),
      null == t && (t = {}),
      (t && "object" == typeof t) ||
        e(
          `Failed to register mod ${r}: Expected options to be undefined or object, got ${typeof t}`
        );
    const i = !0 === t.allowReplace,
      a = f.get(o.name);
    a &&
      ((a.allowReplace && i) ||
        e(
          `Refusing to load mod ${r}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`
        ),
      u(a));
    const c = (o) => {
        let e = g.patching.get(o.name);
        return (
          e ||
            ((e = { hooks: [], patches: new Map() }),
            g.patching.set(o.name, e)),
          e
        );
      },
      s =
        (o, t) =>
        (...n) => {
          var i, a;
          const c =
            null === (a = (i = m.errorReporterHooks).apiEndpointEnter) ||
            void 0 === a
              ? void 0
              : a.call(i, o, g.name);
          g.loaded ||
            e(`Mod ${r} attempted to call SDK function after being unloaded`);
          const s = t(...n);
          return null == c || c(), s;
        },
      p = {
        unload: s("unload", () => u(g)),
        hookFunction: s("hookFunction", (o, t, n) => {
          ("string" == typeof o && o) ||
            e(
              `Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`
            );
          const i = l(o),
            a = c(i);
          "number" != typeof t &&
            e(
              `Mod ${r} failed to hook function '${o}': Expected priority number, got ${typeof t}`
            ),
            "function" != typeof n &&
              e(
                `Mod ${r} failed to hook function '${o}': Expected hook function, got ${typeof n}`
              );
          const s = { mod: g.name, priority: t, hook: n };
          return (
            a.hooks.push(s),
            d(),
            () => {
              const o = a.hooks.indexOf(s);
              o >= 0 && (a.hooks.splice(o, 1), d());
            }
          );
        }),
        patchFunction: s("patchFunction", (o, t) => {
          ("string" == typeof o && o) ||
            e(
              `Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`
            );
          const i = l(o),
            a = c(i);
          n(t) ||
            e(
              `Mod ${r} failed to patch function '${o}': Expected patches object, got ${typeof t}`
            );
          for (const [n, i] of Object.entries(t))
            "string" == typeof i
              ? a.patches.set(n, i)
              : null === i
              ? a.patches.delete(n)
              : e(
                  `Mod ${r} failed to patch function '${o}': Invalid format of patch '${n}'`
                );
          d();
        }),
        removePatches: s("removePatches", (o) => {
          ("string" == typeof o && o) ||
            e(
              `Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`
            );
          const t = l(o);
          c(t).patches.clear(), d();
        }),
        callOriginal: s("callOriginal", (o, t, n) => {
          ("string" == typeof o && o) ||
            e(
              `Mod ${r} failed to call a function: Expected function name string, got ${typeof o}`
            );
          const i = l(o);
          return (
            Array.isArray(t) ||
              e(
                `Mod ${r} failed to call a function: Expected args array, got ${typeof t}`
              ),
            i.original.apply(null != n ? n : globalThis, t)
          );
        }),
        getOriginalHash: s("getOriginalHash", (o) => {
          ("string" == typeof o && o) ||
            e(
              `Mod ${r} failed to get hash: Expected function name string, got ${typeof o}`
            );
          return l(o).originalHash;
        }),
      },
      g = {
        name: o.name,
        fullName: o.fullName,
        version: o.version,
        repository: o.repository,
        allowReplace: i,
        api: p,
        loaded: !0,
        patching: new Map(),
      };
    return f.set(o.name, g), Object.freeze(p);
  }
  function h() {
    const o = [];
    for (const e of f.values())
      o.push({
        name: e.name,
        fullName: e.fullName,
        version: e.version,
        repository: e.repository,
      });
    return o;
  }
  let m;
  const y =
    void 0 === window.bcModSdk
      ? (window.bcModSdk = (function () {
          const e = {
            version: o,
            apiVersion: 1,
            registerMod: g,
            getModsInfo: h,
            getPatchingInfo: p,
            errorReporterHooks: Object.seal({
              apiEndpointEnter: null,
              hookEnter: null,
              hookChainExit: null,
            }),
          };
          return (m = e), Object.freeze(e);
        })())
      : (n(window.bcModSdk) || e("Failed to init Mod SDK: Name already in use"),
        1 !== window.bcModSdk.apiVersion &&
          e(
            `Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`
          ),
        window.bcModSdk.version !== o &&
          alert(
            `Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`
          ),
        window.bcModSdk);
  return (
    "undefined" != typeof exports &&
      (Object.defineProperty(exports, "__esModule", { value: !0 }),
      (exports.default = y)),
    y
  );
})();

//#endregion

/*import(
      `https://lunarkitsunify.github.io/MoonCEBC/MoonCEBC.js?v=${(
        Date.now() / 10000
      ).toFixed(0)}`
    );*/

(function () {
  "use strict";

  const CardTextPath = "Screens/MiniGame/ClubCard/Text_ClubCard.csv";
  let CardTextContent = null;
  const AddonName = "Moon Cards Editor BC";
  let isVisibleMainWindow = false;
  const cells = [];
  const w = window;

  //#region Size and color customization for the card rendering

  const requiredLevelTestColor = "#FF5733";
  const fameTextColor = "#3357FF";
  const moneyTextColor = "#006400";
  const cardNameFontSize = "60%";
  const cardGroupFontSize = "55%";
  const cardTextFontSize = "50%";
  //#endregion

  //#region BC Mod SDK Stuff

  const modApi = bcModSdk.registerMod({
    name: "MoonCEBC",
    fullName: "Moon Cards Editor BC",
    version: "1.0.0",
    repository: "https://github.com/LunarKitsunify/RoomCardDecksEditorBC",
  });

  modApi.hookFunction("ClubCardLoad", 0, (args, next) => {
    console.log("TestHook ClubCardLoad");
    next();
  });

  modApi.hookFunction("ClubCardRenderCard", 0, (args, next) => {
    console.log("TestHook ClubCardRenderCard");
    next(args);
  });

  modApi.hookFunction("MainRun", 0, (args, next) => {
    //TODO Hook ChatRoomRun and do it with a DrawButton?
    //This should minimize the load on the server instead of constantly running in MainRun
    next(args);
    UpdateStatusShowButton();
  });

  //#endregion

  //#region UI

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
  showButton.addEventListener("click", function () {
    if (isVisibleMainWindow == true) {
      mainWindow.style.display = "none";
    } else {
      mainWindow.style.display = "block";
      LoadPlayerData();
    }
    isVisibleMainWindow = !isVisibleMainWindow;
  });
  document.body.appendChild(showButton);

  //#endregion

  //#region mainWindow
  const mainWindow = document.createElement("div");
  mainWindow.style.position = "fixed";
  mainWindow.style.top = "50%";
  mainWindow.style.left = "50%";
  mainWindow.style.transform = "translate(-50%, -50%)";
  mainWindow.style.width = "95%";
  mainWindow.style.height = "95%";
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
  comboBox.style.alignContent = "center";
  comboBox.style.textAlign = "center";
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
    //topPanel.appendChild(button);
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
    //TODO need more test with margin. smartphone ???
    cardCell.style.margin = "1%";
    cardCell.style.marginLeft = "5%";
    cardCell.style.marginRight = "5%";
    cardCell.style.position = "relative";
    cardCell.style.justifyContent = "center";
    cardCell.style.alignItems = "center";
    cardCell.style.display = "inline-block";
    cardCell.addEventListener("onclick", () => {
      console.log("Click");
    });
    //cardCell.style.background = "blue";
    cells.push(cardCell);
    bottomPanel.appendChild(cardCell);
  }

  //#endregion

  //#endregion

  //////////////////START//////////////////
  AddonLoad();

  function AddonLoad() {
    console.log(`${AddonName} Start Load`);
    CardTextContent = new TextCache(CardTextPath); //Load Cards data from BC Server
    console.log(`${AddonName} Load Complete`);
  }

  function UpdateStatusShowButton() {
    //check if in room selected ClubCard game
    const isClubCardsGame = ChatRoomGame == "ClubCard";
    //check where the player is
    const isInChatRoom = CurrentScreen == "ChatRoom";

    const isShowButton = isInChatRoom && isClubCardsGame;

    if (isShowButton && showButton.style.display !== "block")
      showButton.style.display = "block";
    else if (!isShowButton && showButton.style.display !== "none")
      showButton.style.display = "none";
  }

  function LoadPlayerData() {
    if (Player.Game.ClubCard === undefined) return;

    let playerData = Player.Game.ClubCard;

    comboBox.innerHTML = "";

    if (playerData.DeckName && playerData.DeckName.length > 0) {
      playerData.DeckName.forEach((name, index) => {
        if (name != null && name != "") {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = name;
          comboBox.appendChild(option);
        }
      });

      UpdateSelecteDeck(playerData);

      comboBox.addEventListener("change", function () {
        UpdateSelecteDeck(playerData);
      });
    } else {
      console.log(`${AddonName} DeckName is empty or undefined`);
    }
  }
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
   * updates data cells depending on the selected deck
   * @param {GameClubCardParameters} playerData - index selected deck
   * @returns {void} - Nothing
   */
  function UpdateSelecteDeck(playerData) {
    let selectedIndex = comboBox.value;
    let encodedDeck = playerData.Deck[selectedIndex];
    let decodedDeck = decodeStringDeckToID(encodedDeck);
    let DeckCards = [];
    let deckData = [];

    for (let id of decodedDeck) {
      let cardData = ClubCardList.find((card) => card.ID === id);
      if (cardData.RequiredLevel == null) cardData.RequiredLevel = 1;

      const cardText = CardTextContent.get("Text " + cardData.Name).replace(
        /<F>/g,
        ""
      );

      formatTextForInnerHTML;
      cardData.Text = formatTextForInnerHTML(cardText);

      deckData.push(cardData);
    }

    let events = deckData.filter((card) => card.Type === "Event");
    let normalCards = deckData.filter((card) => card.Type !== "Event");

    events.sort((a, b) => a.RequiredLevel - b.RequiredLevel);
    normalCards.sort((a, b) => a.RequiredLevel - b.RequiredLevel);

    normalCards.sort((a, b) => {
      const levelComparison =
        (a.RequiredLevel === null ? 1 : a.RequiredLevel) -
        (b.RequiredLevel === null ? 1 : b.RequiredLevel);

      if (levelComparison === 0) {
        return a.ID - b.ID;
      }

      return levelComparison;
    });

    DeckCards = [...normalCards, ...events];

    for (let i = 0; i < DeckCards.length; i++) {
      if (i < cells.length) {
        cells[i].innerHTML = "";
        DrawCard(DeckCards[i], cells[i]);
      }
    }
  }

  /**
   * function to draw a card
   * @param {ClubCard} Card - ClubCard from BC.
   * @param {HTMLDivElement} cardCell fill for card data
   * @returns {void} - Nothing
   */
  function DrawCard(Card, cardCell) {
    let Level =
      Card.RequiredLevel == null || Card.RequiredLevel <= 1
        ? 1
        : Card.RequiredLevel;
    let Color = ClubCardColor[Level];
    if (Card.Type == null) Card.Type = "Member";

    //#region Background

    //const backgroundContainer = document.createElement("div");
    const backgroundContainer = document.createElement("button");
    backgroundContainer.style.position = "relative";
    backgroundContainer.style.overflow = "hidden";
    backgroundContainer.style.margin = "0 auto";
    backgroundContainer.style.height = "100%";
    backgroundContainer.style.visibility = "hidden";
    backgroundContainer.style.display = "inline - block";
    backgroundContainer.style.justifyContent = "center";
    backgroundContainer.style.userSelect = "none";
    //backgroundContainer.style.pointerEvents = "none";
    //backgroundContainer.style.zIndex = "10";
    //TODO dont work
    backgroundContainer.addEventListener("click", () => {
      console.log("Click");
    });
    backgroundContainer.addEventListener("onmouseover", () => {
      backgroundContainer.style.border = "1px solid green";
      console.log("Over");
    });
    backgroundContainer.addEventListener("onmouseleave ", () => {
      backgroundContainer.style.border = "none";
      console.log("Leave");
    });

    const imgFrame = document.createElement("img");
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
    imgFrame.style.top = "0";
    imgFrame.style.transform = "translateX(-50%)";
    imgFrame.style.display = "block";
    imgFrame.addEventListener("load", () => {
      //TODO I really don't like this implementation.
      //Sometimes it slows down and does not render files.
      //And also it doesn't update when the browser window size changes.
      const imgWidth = imgFrame.offsetWidth;
      backgroundContainer.style.width = `${imgWidth}px`;
      backgroundContainer.style.visibility = "visible";
    });
    backgroundContainer.appendChild(imgFrame);

    const img = document.createElement("img");
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
    backgroundContainer.appendChild(img);

    //#endregion

    //#region Card Name

    const cardNameTextElement = document.createElement("div");
    cardNameTextElement.textContent = Card.Name;
    cardNameTextElement.style.position = "absolute";
    cardNameTextElement.style.top = "1%";
    cardNameTextElement.style.left = "50%";
    cardNameTextElement.style.transform = "translateX(-50%)";
    cardNameTextElement.style.fontSize = cardNameFontSize;
    cardNameTextElement.style.textAlign = "center";
    cardNameTextElement.style.fontWeight = "bold";
    cardNameTextElement.style.lineHeight = "0.8";
    cardNameTextElement.style.whiteSpace = "normal";
    backgroundContainer.appendChild(cardNameTextElement);

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

      const requiredLevelTest = document.createElement("div");
      requiredLevelTest.textContent = Card.RequiredLevel;
      requiredLevelTest.style.textAlign = "center";
      requiredLevelTest.style.color = requiredLevelTestColor;
      requiredLevelTest.style.fontSize = "0.8em";
      requiredLevelTest.style.fontWeight = "bold";
      requiredLevelTest.style.position = "absolute";
      requiredLevelTest.style.width = "100%";
      requiredLevelTest.style.maxWidth = "100%";
      requiredLevelTest.style.maxHeight = "100%";
      requiredLevelTest.style.top = "50%";
      requiredLevelTest.style.left = "50%";
      requiredLevelTest.style.transform = "translate(-50%, -60%)";

      const requiredLevelIcon = document.createElement("img");
      requiredLevelIcon.src = "Screens/MiniGame/ClubCard/Bubble/Level.png";
      requiredLevelIcon.style.width = "100%";
      requiredLevelIcon.style.maxWidth = "100%";
      requiredLevelIcon.style.maxHeight = "100%";
      requiredLevelIcon.style.objectFit = "contain";

      levelBoard.appendChild(requiredLevelIcon);
      levelBoard.appendChild(requiredLevelTest);
    }

    //Card.FamePerTurn
    if (Card.FamePerTurn != null) {
      const fameBoard = document.createElement("div");
      fameBoard.style.width = iconSize;
      fameBoard.style.height = "auto";
      fameBoard.style.position = "relative";
      topLeftContainer.appendChild(fameBoard);

      const fameText = document.createElement("div");
      fameText.textContent = Card.FamePerTurn;
      fameText.style.textAlign = "center";
      fameText.style.color = fameTextColor;
      fameText.style.fontSize = "0.8em";
      fameText.style.fontWeight = "bold";
      fameText.style.position = "absolute";
      fameText.style.width = "100%";
      fameText.style.maxWidth = "100%";
      fameText.style.maxHeight = "100%";
      fameText.style.top = "50%";
      fameText.style.left = "50%";
      fameText.style.transform = "translate(-50%, -60%)";

      const fameIcon = document.createElement("img");
      fameIcon.src = "Screens/MiniGame/ClubCard/Bubble/Fame.png";
      fameIcon.style.width = "100%";
      fameIcon.style.maxWidth = "100%";
      fameIcon.style.maxHeight = "100%";
      fameIcon.style.objectFit = "contain";

      fameBoard.appendChild(fameIcon);
      fameBoard.appendChild(fameText);
    }

    //Card.MoneyPerTurn
    if (Card.MoneyPerTurn != null) {
      const moneyBoard = document.createElement("div");
      moneyBoard.style.width = iconSize;
      moneyBoard.style.height = "auto";
      moneyBoard.style.position = "relative";
      topLeftContainer.appendChild(moneyBoard);

      const moneyText = document.createElement("div");
      moneyText.textContent = Card.MoneyPerTurn;
      moneyText.style.textAlign = "center";
      moneyText.style.color = moneyTextColor;
      moneyText.style.fontSize = "0.8em";
      moneyText.style.fontWeight = "bold";
      moneyText.style.position = "absolute";
      moneyText.style.width = "100%";
      moneyText.style.maxWidth = "100%";
      moneyText.style.maxHeight = "100%";
      moneyText.style.top = "50%";
      moneyText.style.left = "50%";
      moneyText.style.transform = "translate(-50%, -60%)";

      const moneyIcon = document.createElement("img");
      moneyIcon.src = "Screens/MiniGame/ClubCard/Bubble/Money.png";
      moneyIcon.style.width = "100%";
      moneyIcon.style.maxWidth = "100%";
      moneyIcon.style.maxHeight = "100%";
      moneyIcon.style.objectFit = "contain";

      moneyBoard.appendChild(moneyIcon);
      moneyBoard.appendChild(moneyText);
    }

    backgroundContainer.appendChild(topLeftContainer);
    //#endregion

    //#region Bottom Info Panel
    const bottomContainer = document.createElement("div");
    bottomContainer.style.position = "absolute";
    bottomContainer.style.bottom = "1%";
    bottomContainer.style.width = "98%";
    bottomContainer.style.height = "45%";
    bottomContainer.style.justifyContent = "center";
    bottomContainer.style.display = "flex";
    bottomContainer.style.flexDirection = "column";
    bottomContainer.style.textAlign = "center";
    bottomContainer.style.left = "50%";
    bottomContainer.style.transform = "translateX(-50%)";
    bottomContainer.style.borderRadius = "0 0 15 px 15px";
    bottomContainer.style.background = "rgba(255, 255, 255, 0.6)";

    const cardGroupTextElement = document.createElement("div");
    cardGroupTextElement.textContent = `${
      Card.Group ? Card.Group.join(", ") : ""
    }`;
    cardGroupTextElement.style.fontSize = cardGroupFontSize;
    cardGroupTextElement.style.textAlign = "center";
    cardGroupTextElement.style.fontWeight = "bold";
    cardGroupTextElement.style.lineHeight = "0.8";
    cardGroupTextElement.style.flex = "0 0 20%";
    cardGroupTextElement.style.whiteSpace = "normal";
    bottomContainer.appendChild(cardGroupTextElement);

    const cardDescriptionTextElement = document.createElement("div");
    cardDescriptionTextElement.innerHTML = Card.Text;
    cardDescriptionTextElement.style.fontSize = cardTextFontSize;
    cardDescriptionTextElement.style.fontWeight = "bold";
    cardDescriptionTextElement.style.textAlign = "center";
    cardDescriptionTextElement.style.lineHeight = "1";
    cardDescriptionTextElement.style.whiteSpace = "normal";
    cardDescriptionTextElement.style.flex = "1";
    cardDescriptionTextElement.style.margin = "2%";
    bottomContainer.appendChild(cardDescriptionTextElement);

    backgroundContainer.appendChild(bottomContainer);
    //#endregion

    cardCell.appendChild(backgroundContainer);
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
