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

  //#region Const
  const WindowStatus = Object.freeze({
    VIEW: "ViewDeck",
    EDIT: "EditDeck",
    SETTINGS: "Settings",
  });
  const CardTypes = Object.freeze({
    ALL_CARDS: { value: "All Cards", text: "All Cards" },
    EVENTS_CARDS: { value: "Events Cards", text: "Event Cards" },
    UNGROUPED: { value: "Ungrouped", text: "Ungrouped" },
    REWARD_CARDS: { value: "Reward Cards", text: "Reward Cards" },
    LIABILITY: { value: "Liability", text: "Liability" },
    STAFF: { value: "Staff", text: "Staff" },
    POLICE: { value: "Police", text: "Police" },
    CRIMINAL: { value: "Criminal", text: "Criminal" },
    FETISHIST: { value: "Fetishist", text: "Fetishist" },
    PORN_ACTRESS: { value: "PornActress", text: "Porn Actress" },
    MAID: { value: "Maid", text: "Maid" },
    ASYLUM_PATIENT: { value: "AsylumPatient", text: "Asylum Patient" },
    ASYLUM_NURSE: { value: "AsylumNurse", text: "Asylum Nurse" },
    DOMINANT: { value: "Dominant", text: "Dominant" },
    MISTRESS: { value: "Mistress", text: "Mistress" },
    ABDL_BABY: { value: "ABDLBaby", text: "ABDL Baby" },
    ABDL_MOMMY: { value: "ABDLMommy", text: "ABDL Mommy" },
    COLLEGE_STUDENT: { value: "CollegeStudent", text: "College Student" },
    COLLEGE_TEACHER: { value: "CollegeTeacher", text: "College Teacher" },
  });

  const MoonCEBCBuilderDeckSize = 30;
  const MoonCEBCAddonName = "Moon Cards Editor BC";
  const MoonCEBCCardTextPath = "Screens/MiniGame/ClubCard/Text_ClubCard.csv";
  const MoonCEBCBoardBackgroundPath =
    "url('Backgrounds/ClubCardPlayBoard1.jpg')";
  const MoonCEBCExitIconPath = "Icons/Exit.png";
  let MoonCEBCTextContent = null;
  let MoonCEBCMouseOverCard = [];
  let MoonCEBCCurrentDeck = []; // variable to save data when switching to Edit mode and canceling.
  let MoonCEBCCurrent30Cards = [];
  let MoonCEBCBuilderCurrentGroupsList = [];
  let MoonCEBCCurrentGroup = "All Cards";
  let MoonCEBCCurrentCardsListPage = 0;
  let MoonCEBCPageMode = WindowStatus.VIEW;
  let MooonCEBCPlayerData = null;
  let isVisibleMainWindow = false;
  const CardCells = [];
  const w = window;

  //#region Size and color customization

  const TopPanelHeight = "6%";
  const TopPanelTextSize = "1.5vw";

  const requiredLevelTestColor = "#FF5733";
  const fameTextColor = "#3357FF";
  const moneyTextColor = "#006400";
  const cardNameFontSize = "0.75vw";
  const cardGroupFontSize = "0.70vw";
  const cardTextFontSize = "0.63vw";
  const cardValueFontSize = "0.70vw";

  const bigCardNameFontSize =
    (parseFloat(cardNameFontSize) * 3).toFixed(2) + "vw";
  const bigCardGroupFontSize =
    (parseFloat(cardGroupFontSize) * 3).toFixed(2) + "vw";
  const bigCardTextFontSize =
    (parseFloat(cardTextFontSize) * 3).toFixed(2) + "vw";
  const bigCardValueFontSize =
    (parseFloat(cardValueFontSize) * 3).toFixed(2) + "vw";
  //#endregion

  //#endregion

  //#region BC Mod SDK Stuff

  const modApi = bcModSdk.registerMod({
    name: "MoonCEBC",
    fullName: "Moon Cards Editor BC",
    version: "1.0.0",
    repository: "https://github.com/LunarKitsunify/RoomCardDecksEditorBC",
  });

  /*modApi.hookFunction("ClubCardLoad", 0, (args, next) => {
    console.log("TestHook ClubCardLoad");
    next();
  });

  modApi.hookFunction("ClubCardRenderCard", 0, (args, next) => {
    console.log("TestHook ClubCardRenderCard");
    next(args);
  });*/

  modApi.hookFunction("MainRun", 0, (args, next) => {
    //TODO Hook ChatRoomRun and do it with a DrawButton?
    //This should minimize the load on the server instead of constantly running in MainRun
    next(args);
    UpdateStatusShowButton();
  });

  //#endregion

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
   * @param {string} paddingTop - The top padding of the button.
   * @param {string} paddingBottom - The bottom padding of the button.
   * @param {string} marginRight - The right margin of the button.
   * @param {string} justifyContent - The alignment of the exitDiv content.
   * @returns {HTMLDivElement} The created button element.
   */
  function createButton(
    content,
    imageSrc,
    onClick,
    width,
    height,
    paddingTop,
    paddingBottom,
    marginRight,
    justifyContent
  ) {
    const exitDiv = document.createElement("div");
    exitDiv.style.width = width;
    exitDiv.style.height = height;
    exitDiv.style.display = "flex";
    exitDiv.style.alignItems = "center";
    exitDiv.style.justifyContent = justifyContent;

    const exitButton = document.createElement("button");
    exitButton.style.paddingTop = paddingTop;
    exitButton.style.paddingBottom = paddingBottom;
    exitButton.style.marginRight = marginRight;
    exitButton.style.height = "100%";
    exitButton.style.padding = "0";
    exitButton.style.display = "flex";
    exitButton.style.alignItems = "center";
    exitButton.style.justifyContent = "center";

    // Check for image path
    if (imageSrc) {
      const exitButtonImg = document.createElement("img");
      exitButtonImg.src = imageSrc;
      exitButtonImg.style.maxWidth = "90%";
      exitButtonImg.style.maxHeight = "90%";
      exitButtonImg.style.objectFit = "contain";
      exitButtonImg.style.display = "block";
      exitButton.appendChild(exitButtonImg);
    } else {
      // If no image is provided, create a text element
      const buttonText = document.createElement("span");
      buttonText.textContent = content;
      buttonText.style.marginLeft = "1vw";
      buttonText.style.marginRight = "1vw";
      buttonText.style.fontSize = TopPanelTextSize;
      exitButton.appendChild(buttonText);
    }

    exitDiv.appendChild(exitButton);

    // Add click event handler
    exitButton.addEventListener("click", onClick);

    return exitDiv; // Return the created element
  }

  /**
   * Creates a board element with an icon and text, appends it to the specified parent container,
   * and returns the created board element.
   *
   * @param {string} iconSrc - The source path of the icon image.
   * @param {string|number} textContent - The text content to display in the board.
   * @param {string} textColor - The color of the text.
   * @param {string} textFontSize - The text font size
   * @returns {HTMLElement} The created board element.
   */
  function createBoard(iconSrc, textContent, textColor, textFontSize) {
    const board = document.createElement("div");
    board.style.paddingTop = "15%";
    board.style.width = "auto";
    board.style.height = "auto";
    board.style.position = "relative";
    board.style.display = "flex";
    board.style.alignItems = "center";
    board.style.justifyContent = "center";

    const textElement = document.createElement("div");
    textElement.textContent = textContent;
    textElement.style.textAlign = "center";
    textElement.style.color = textColor;
    textElement.style.fontSize = textFontSize;
    textElement.style.fontWeight = "bold";
    textElement.style.position = "absolute";
    textElement.style.width = "100%";
    textElement.style.maxWidth = "100%";
    textElement.style.maxHeight = "100%";
    textElement.style.top = "50%";
    textElement.style.left = "50%";
    textElement.style.transform = "translate(-50%, -40%)";

    const icon = document.createElement("img");
    icon.src = iconSrc;
    icon.style.width = "100%";
    icon.style.maxWidth = "100%";
    icon.style.maxHeight = "100%";
    icon.style.objectFit = "contain";
    icon.style.display = "block";

    board.appendChild(icon);
    board.appendChild(textElement);

    return board;
  }

  /**
   * function to draw a card
   * @param {ClubCard} Card - ClubCard from BC.
   * @param {HTMLDivElement} cardCell fill for card data
   * @param {String} cardNameSize text size for card Name
   * @param {String} cardGroupSize text size for card Group
   * @param {String} cardTextSize text size for card Text (description)
   * @param {String} cardValueSize text size for card Value
   * @param {boolean} isCurrentCardInfoCell property for separating logical cards from the array and for one enlarged card
   * @returns {void} - Nothing
   */
  function DrawCard(
    Card,
    cardCell,
    cardNameSize = cardNameFontSize,
    cardGroupSize = cardGroupFontSize,
    cardTextSize = cardTextFontSize,
    cardValueSize = cardValueFontSize,
    isCurrentCardInfoCell = false
  ) {
    let Level =
      Card.RequiredLevel == null || Card.RequiredLevel <= 1
        ? 1
        : Card.RequiredLevel;
    if (Card.Type == null) Card.Type = "Member";

    //#region Background

    const cardButton = document.createElement("button");
    cardButton.style.position = "relative";
    cardButton.style.borderRadius = "6px";
    cardButton.style.height = "100%";
    cardButton.style.aspectRatio = "1 / 2";
    cardButton.style.display = "flex";
    cardButton.style.justifyContent = "center";
    cardButton.style.alignItems = "center";
    cardButton.style.userSelect = "none";

    cardButton.addEventListener("click", () => {
      const isEditMode = MoonCEBCPageMode == WindowStatus.EDIT;
      const isInfoPanel = isCurrentCardInfoCell;
      if (!isInfoPanel && isEditMode) {
        ClickCardButton(Card);
      }
    });
    cardButton.addEventListener("mouseover", () => {
      const isInfoPanel = isCurrentCardInfoCell;

      if (!isInfoPanel) {
        if (MoonCEBCMouseOverCard != Card) {
          MoonCEBCMouseOverCard = Card;
          cardInfoPanel.innerHTML = "";
          DrawCard(
            MoonCEBCMouseOverCard,
            cardInfoPanel,
            bigCardNameFontSize,
            bigCardGroupFontSize,
            bigCardTextFontSize,
            bigCardValueFontSize,
            true
          );
        }
      }
    });

    const imgFrame = document.createElement("img");
    imgFrame.src =
      "Screens/MiniGame/ClubCard/Frame/" +
      Card.Type +
      (Card.Reward != null ? "Reward" : "") +
      Level.toString() +
      ".png";
    imgFrame.style.width = "100%";
    imgFrame.style.height = "100%";
    imgFrame.style.position = "absolute";
    imgFrame.style.display = "block";
    imgFrame.style.top = "0";
    imgFrame.style.pointerEvents = "none";
    cardButton.appendChild(imgFrame);

    const img = document.createElement("img");
    img.src =
      "Screens/MiniGame/ClubCard/" + Card.Type + "/" + Card.Name + ".png";
    img.style.height = "85%";
    img.style.position = "absolute";
    img.style.top = "15%";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.display = "block";
    img.style.left = "50%";
    img.style.transform = "translateX(-50%)";
    img.style.pointerEvents = "none";
    cardButton.appendChild(img);

    //#endregion

    //#region Card Name

    const cardNameTextElement = document.createElement("div");
    cardNameTextElement.textContent = Card.Name;
    cardNameTextElement.style.position = "absolute";
    cardNameTextElement.style.top = "1%";
    cardNameTextElement.style.left = "50%";
    cardNameTextElement.style.transform = "translateX(-50%)";
    cardNameTextElement.style.fontSize = cardNameSize;
    cardNameTextElement.style.textAlign = "center";
    cardNameTextElement.style.fontWeight = "bold";
    cardNameTextElement.style.whiteSpace = "normal";
    cardButton.appendChild(cardNameTextElement);

    //#endregion

    //#region  ValueCardPanel
    const valueCardPanel = document.createElement("div");
    valueCardPanel.style.position = "absolute";
    valueCardPanel.style.top = "13%";
    valueCardPanel.style.left = "3%";
    valueCardPanel.style.width = "17%";
    valueCardPanel.style.display = "flex";
    valueCardPanel.style.flexDirection = "column";
    valueCardPanel.style.gap = "10%";

    //Liability Icon
    if (Card.Group && Card.Group.includes("Liability")) {
      const liabilityIcon = document.createElement("img");
      liabilityIcon.src = "Screens/MiniGame/ClubCard/Bubble/Liability.png";
      liabilityIcon.style.maxWidth = "100%";
      liabilityIcon.style.maxHeight = "100%";
      liabilityIcon.style.objectFit = "contain";
      liabilityIcon.style.display = "block";
      valueCardPanel.appendChild(liabilityIcon);
    }

    if (Card.RequiredLevel > 1) {
      const levelBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Level.png",
        Card.RequiredLevel,
        requiredLevelTestColor,
        cardValueSize
      );
      valueCardPanel.appendChild(levelBoard);
    }

    if (Card.FamePerTurn != null) {
      const fameBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Fame.png",
        Card.FamePerTurn,
        fameTextColor,
        cardValueSize
      );
      valueCardPanel.appendChild(fameBoard);
    }

    if (Card.MoneyPerTurn != null) {
      const moneyBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Money.png",
        Card.MoneyPerTurn,
        moneyTextColor,
        cardValueSize
      );
      valueCardPanel.appendChild(moneyBoard);
    }

    cardButton.appendChild(valueCardPanel);
    //#endregion

    //#region Bottom Info Panel
    const bottomContainer = document.createElement("div");
    bottomContainer.style.position = "absolute";
    bottomContainer.style.bottom = "0";
    bottomContainer.style.width = "98%";
    bottomContainer.style.height = "45%";
    bottomContainer.style.justifyContent = "center";
    bottomContainer.style.display = "flex";
    bottomContainer.style.flexDirection = "column";
    bottomContainer.style.textAlign = "center";
    bottomContainer.style.left = "50%";
    bottomContainer.style.transform = "translateX(-50%)";
    bottomContainer.style.borderRadius = "0 0 10px 10px";
    bottomContainer.style.background = "rgba(255, 255, 255, 0.6)";

    const cardGroupTextElement = document.createElement("div");
    cardGroupTextElement.textContent = `${
      Card.Group ? Card.Group.join(", ") : ""
    }`;
    cardGroupTextElement.style.fontSize = cardGroupSize;
    cardGroupTextElement.style.textAlign = "center";
    cardGroupTextElement.style.fontWeight = "bold";
    cardGroupTextElement.style.lineHeight = "0.8";
    cardGroupTextElement.style.flex = "0 0 20%";
    cardGroupTextElement.style.whiteSpace = "normal";
    bottomContainer.appendChild(cardGroupTextElement);

    const cardDescriptionTextElement = document.createElement("div");
    cardDescriptionTextElement.innerHTML = Card.Text;
    cardDescriptionTextElement.style.fontSize = cardTextSize;
    cardDescriptionTextElement.style.fontWeight = "bold";
    cardDescriptionTextElement.style.textAlign = "center";
    cardDescriptionTextElement.style.lineHeight = "1";
    cardDescriptionTextElement.style.whiteSpace = "normal";
    cardDescriptionTextElement.style.flex = "1";
    cardDescriptionTextElement.style.margin = "2%";
    bottomContainer.appendChild(cardDescriptionTextElement);

    cardButton.appendChild(bottomContainer);
    //#endregion

    cardCell.appendChild(cardButton);
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
  mainWindow.style.width = "100%";
  mainWindow.style.height = "100%";
  mainWindow.style.border = "3px solid black";
  mainWindow.style.boxSizing = "border-box";
  mainWindow.style.display = "none";
  mainWindow.style.zIndex = "9999"; // TODO ???????? look very bad
  mainWindow.style.backgroundImage = MoonCEBCBoardBackgroundPath;
  mainWindow.style.backgroundSize = "cover";
  mainWindow.style.backgroundPosition = "center";
  document.body.appendChild(mainWindow);

  //#endregion

  //#region Top Panel
  const topSettingsPanel = document.createElement("div");
  topSettingsPanel.style.display = "flex";
  topSettingsPanel.style.borderBottom = "2px solid black";
  topSettingsPanel.style.boxSizing = "border-box";
  topSettingsPanel.style.alignItems = "center";
  topSettingsPanel.style.height = TopPanelHeight;
  topSettingsPanel.style.width = "100%";
  topSettingsPanel.style.backgroundImage =
    "url('https://i.imgur.com/22H94gG.jpeg')";
  topSettingsPanel.style.backgroundSize = "cover";
  topSettingsPanel.style.backgroundPosition = "center";

  //#region topSettingsLeftViewPanel
  const topSettingsLeftViewPanel = document.createElement("div");
  topSettingsLeftViewPanel.style.display = "flex";
  topSettingsLeftViewPanel.style.flexDirection = "row";
  topSettingsLeftViewPanel.style.gap = "30px";
  topSettingsLeftViewPanel.style.justifyContent = "flex-start";
  topSettingsLeftViewPanel.style.alignItems = "center";
  topSettingsLeftViewPanel.style.width = "80%";
  topSettingsLeftViewPanel.style.height = "100%";
  //topSettingsLeftViewPanel.style.marginLeft = "2%";
  topSettingsLeftViewPanel.style.boxSizing = "border-box";
  topSettingsLeftViewPanel.style.background = "red";

  const decksCombobox = document.createElement("select");
  decksCombobox.style.marginLeft = "2%";
  decksCombobox.style.width = "20%";
  decksCombobox.style.height = "80%";
  decksCombobox.style.alignContent = "center";
  decksCombobox.style.textAlign = "center";
  decksCombobox.style.fontSize = TopPanelTextSize;
  decksCombobox.addEventListener("change", function () {
    MooonCEBCPlayerData = Player.Game.ClubCard;
    GetDeckData(MooonCEBCPlayerData);
  });

  const editButton = createButton(
    "Edit",
    null,
    () => {
      SetEditMode();
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  const exportButton = createButton(
    "Export",
    null,
    () => {
      console.log("Centered button clicked!");
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  const importButton = createButton(
    "Import",
    null,
    () => {
      console.log("Centered button clicked!");
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  topSettingsLeftViewPanel.appendChild(decksCombobox);
  topSettingsLeftViewPanel.appendChild(editButton);
  topSettingsLeftViewPanel.appendChild(exportButton);
  topSettingsLeftViewPanel.appendChild(importButton);
  //#endregion

  //#region topSettingsLeftEditPanel
  const topSettingsLeftEditPanel = document.createElement("div");
  topSettingsLeftEditPanel.style.display = "none";
  topSettingsLeftEditPanel.style.justifyContent = "flex-start";
  topSettingsLeftEditPanel.style.alignItems = "center";
  topSettingsLeftEditPanel.style.width = "80%";
  topSettingsLeftEditPanel.style.height = "100%";
  topSettingsLeftEditPanel.style.boxSizing = "border-box";
  topSettingsLeftEditPanel.style.background = "yellow";

  const deckNameInput = document.createElement("input");
  deckNameInput.style.marginLeft = "2%";
  deckNameInput.style.width = "20%";
  deckNameInput.style.height = "80%";
  deckNameInput.style.alignContent = "center";
  deckNameInput.style.textAlign = "center";
  deckNameInput.style.fontSize = TopPanelTextSize;

  const clearButton = createButton(
    "Clear",
    null,
    () => {
      topSettingsLeftViewPanel.style.display = "none";
      topSettingsLeftEditPanel.style.display = "flex";
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  const defaultButton = createButton(
    "Default",
    null,
    () => {
      topSettingsLeftViewPanel.style.display = "none";
      topSettingsLeftEditPanel.style.display = "flex";
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  const groupCombobox = document.createElement("select");
  groupCombobox.style.width = "20%";
  groupCombobox.style.height = "80%";
  groupCombobox.style.alignContent = "center";
  groupCombobox.style.textAlign = "center";
  groupCombobox.style.fontSize = TopPanelTextSize;
  groupCombobox.addEventListener("change", function () {
    MoonCEBCCurrentGroup = groupCombobox.value;
    UpdateCardsListSetNewGroup();
  });

  function populateGroupCombobox() {
    Object.values(CardTypes).forEach((type) => {
      const option = document.createElement("option");
      option.value = type.value;
      option.text = type.text;
      groupCombobox.appendChild(option);
    });
  }
  populateGroupCombobox();

  const leftCardsListButtonWithImage = createButton(
    null,
    "Icons/Prev.png",
    () => {
      PrevButtonClick();
    },
    "5%",
    "90%",
    "0",
    "0",
    "0",
    "center"
  );

  const rightCardsListButtonWithImage = createButton(
    null,
    "Icons/Next.png",
    () => {
      NextButtonClick();
    },
    "5%",
    "90%",
    "0",
    "0",
    "0",
    "center"
  );
  const saveDeckButtonWithImage = createButton(
    null,
    "Icons/Accept.png",
    () => {
      SetViewMode(true);
    },
    "5%",
    "90%",
    "0",
    "0",
    "0",
    "center"
  );
  const cancelDeckButtonWithImage = createButton(
    null,
    "Icons/Cancel.png",
    () => {
      SetViewMode(false);
    },
    "5%",
    "90%",
    "0",
    "0",
    "0",
    "center"
  );

  topSettingsLeftEditPanel.appendChild(deckNameInput);
  topSettingsLeftEditPanel.appendChild(clearButton);
  topSettingsLeftEditPanel.appendChild(defaultButton);
  topSettingsLeftEditPanel.appendChild(groupCombobox);
  topSettingsLeftEditPanel.appendChild(leftCardsListButtonWithImage);
  topSettingsLeftEditPanel.appendChild(rightCardsListButtonWithImage);
  topSettingsLeftEditPanel.appendChild(saveDeckButtonWithImage);
  topSettingsLeftEditPanel.appendChild(cancelDeckButtonWithImage);
  //#endregion

  //#region topSettingsRightPanel

  const topSettingsRightPanel = document.createElement("div");
  topSettingsRightPanel.style.display = "flex";
  topSettingsRightPanel.style.flexDirection = "row";
  topSettingsRightPanel.style.gap = "30px";
  topSettingsRightPanel.style.justifyContent = "flex-end";
  topSettingsRightPanel.style.alignItems = "center";
  topSettingsRightPanel.style.width = "auto";
  topSettingsRightPanel.style.height = "100%";
  topSettingsRightPanel.style.marginLeft = "2%";
  topSettingsRightPanel.style.boxSizing = "border-box";
  topSettingsRightPanel.style.background = "green";

  const settingsButton = createButton(
    "Settings",
    null,
    () => {
      console.log("Centered button clicked!");
    },
    "auto",
    "80%",
    "10%",
    "10%",
    "0%",
    "center"
  );

  const exitButtonWithImage = createButton(
    null,
    MoonCEBCExitIconPath,
    () => {
      if (isVisibleMainWindow == true) {
        mainWindow.style.display = "none";
      } else {
        mainWindow.style.display = "block";
        LoadPlayerData();
      }
      isVisibleMainWindow = !isVisibleMainWindow;
    },
    "30%",
    "90%",
    "5%",
    "5%",
    "5%",
    "center"
  );

  topSettingsRightPanel.appendChild(settingsButton);
  topSettingsRightPanel.appendChild(exitButtonWithImage);

  //#endregion

  topSettingsPanel.appendChild(topSettingsLeftViewPanel);
  topSettingsPanel.appendChild(topSettingsLeftEditPanel);
  topSettingsPanel.appendChild(topSettingsRightPanel);
  //
  mainWindow.appendChild(topSettingsPanel);
  //#endregion

  //#region Bottom Panel
  const bottomPanel = document.createElement("div");
  bottomPanel.style.display = "flex";
  bottomPanel.style.flexDirection = "row";
  bottomPanel.style.justifyContent = "space-between";
  bottomPanel.style.alignItems = "center";
  bottomPanel.style.width = "100%";
  bottomPanel.style.height = `calc(100% - ${TopPanelHeight})`;
  mainWindow.appendChild(bottomPanel);

  const cardsCollectionPanel = document.createElement("div");
  cardsCollectionPanel.style.display = "grid";
  cardsCollectionPanel.style.gridTemplateColumns = "repeat(10, 1fr)";
  cardsCollectionPanel.style.gridTemplateRows = "repeat(3, 1fr)";
  cardsCollectionPanel.style.gridAutoRows = "1fr";
  cardsCollectionPanel.style.height = "100%";
  cardsCollectionPanel.style.width = "80%";
  cardsCollectionPanel.style.maxWidth = "80%";
  cardsCollectionPanel.style.overflow = "hidden";
  bottomPanel.appendChild(cardsCollectionPanel);

  const cardInfoPanel = document.createElement("div");
  cardInfoPanel.style.height = "100%";
  cardInfoPanel.style.width = "auto";
  cardInfoPanel.style.maxWidth = "100%";
  cardInfoPanel.style.maxHeight = "100%";
  cardInfoPanel.style.boxSizing = "border-box";
  cardInfoPanel.style.paddingBottom = "1%";
  cardInfoPanel.style.paddingTop = "1%";
  cardInfoPanel.style.position = "relative";
  cardInfoPanel.style.justifyContent = "center";
  cardInfoPanel.style.alignItems = "center";
  cardInfoPanel.style.display = "inline-block";
  bottomPanel.appendChild(cardInfoPanel);

  for (let i = 0; i < 30; i++) {
    const cardCell = document.createElement("div");
    cardCell.style.boxSizing = "border-box";
    cardCell.style.margin = "2%";
    cardCell.style.position = "relative";
    cardCell.style.justifyContent = "center";
    cardCell.style.alignItems = "center";
    cardCell.style.display = "inline-block";
    CardCells.push(cardCell);
    cardsCollectionPanel.appendChild(cardCell);
  }

  //#endregion

  //#endregion

  //////////////////START//////////////////
  AddonLoad();

  function AddonLoad() {
    console.log(`${MoonCEBCAddonName} Start Load`);
    MoonCEBCTextContent = new TextCache(MoonCEBCCardTextPath); //Load Cards data from BC Server
    console.log(`${MoonCEBCAddonName} Load Complete`);
  }

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

  function LoadPlayerData() {
    if (Player.Game.ClubCard === undefined) return;

    MooonCEBCPlayerData = Player.Game.ClubCard;

    decksCombobox.innerHTML = "";

    if (
      MooonCEBCPlayerData.DeckName &&
      MooonCEBCPlayerData.DeckName.length > 0
    ) {
      MooonCEBCPlayerData.DeckName.forEach((name, index) => {
        if (name != null && name != "") {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = name;
          decksCombobox.appendChild(option);
        }
      });

      GetDeckData(MooonCEBCPlayerData);
    } else {
      console.log(`${MoonCEBCAddonName} DeckName is empty or undefined`);
    }
  }

  /**
   * Get data selected deck and update cards cells
   * @param {GameClubCardParameters} playerData - index selected deck
   * @returns {void} - Nothing
   */
  function GetDeckData(playerData) {
    let selectedIndex = decksCombobox.value;
    let encodedDeck = playerData.Deck[selectedIndex];
    let decodedDeck = decodeStringDeckToID(encodedDeck);
    let deckData = [];

    for (let id of decodedDeck) {
      let cardData = ClubCardList.find((card) => card.ID === id);
      if (cardData.RequiredLevel == null) cardData.RequiredLevel = 1;

      deckData.push(cardData);
    }

    MoonCEBCCurrentDeck = SortCardsList(deckData);
    MoonCEBCCurrent30Cards = SortCardsList(deckData);

    UpdateCardsCells(MoonCEBCCurrent30Cards);
  }
  /**
   * updates cells with an array of 30 cards
   * @param {ClubCard[]} cardsArray
   */
  function UpdateCardsCells(cardsArray) {
    for (let i = 0; i < 30; i++) {
      CardCells[i].innerHTML = "";
      if (i < cardsArray.length) {
        const cardText = MoonCEBCTextContent.get(
          "Text " + cardsArray[i].Name
        ).replace(/<F>/g, "");
        cardsArray[i].Text = formatTextForInnerHTML(cardText);
        DrawCard(cardsArray[i], CardCells[i]);
      }
    }
  }

  function SetEditMode() {
    topSettingsLeftViewPanel.style.display = "none";
    topSettingsLeftEditPanel.style.display = "flex";
    deckNameInput.value =
      decksCombobox.options[decksCombobox.selectedIndex].text;
    MoonCEBCPageMode = WindowStatus.EDIT;

    UpdateCardsListSetNewGroup();
  }

  function SetViewMode(isSave) {
    topSettingsLeftViewPanel.style.display = "flex";
    topSettingsLeftEditPanel.style.display = "none";
    MoonCEBCPageMode = WindowStatus.VIEW;
    if (isSave) {
      //save edit deck and update cards panel
    } else {
      UpdateCardsCells(MoonCEBCCurrentDeck);
    }
  }
  /**
   * handles the card click event for Edit mode
   * @param {*} card card data
   */
  function ClickCardButton(card) {}

  function ClearCurrentDeck() {}

  function SetCurrentDeckDefault() {}

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

  function UpdateCardsListSetNewGroup() {
    let cardGroupList = [];
    switch (MoonCEBCCurrentGroup) {
      case CardTypes.ALL_CARDS.value:
        cardGroupList = [...ClubCardList];
        break;
      case CardTypes.EVENTS_CARDS.value:
        cardGroupList = ClubCardList.filter((card) => card.Type == "Event");
        break;
      case CardTypes.UNGROUPED.value:
        cardGroupList = ClubCardList.filter(
          (card) => card.Group == undefined && card.Type != "Event"
        );
        break;
      case CardTypes.REWARD_CARDS.value:
        cardGroupList = ClubCardList.filter((card) => card.Reward != undefined);
        break;
      default:
        cardGroupList = ClubCardList.filter(
          (card) => card.Group && card.Group.includes(MoonCEBCCurrentGroup)
        );
        break;
    }

    const sortedCards = SortCardsList(cardGroupList);
    MoonCEBCBuilderCurrentGroupsList = [...sortedCards];
    MoonCEBCCurrentCardsListPage = 0;
    MoonCEBCCurrent30Cards = Get30CardsGroup();
    UpdateCardsCells(MoonCEBCCurrent30Cards);
  }

  /**
   *
   * @returns {ClubCard[]} cards page list
   */
  function Get30CardsGroup() {
    const cardsPerPage = MoonCEBCBuilderDeckSize;
    const countSkipCards = MoonCEBCCurrentCardsListPage * cardsPerPage;
    const countTakePossibleCards =
      MoonCEBCBuilderCurrentGroupsList.length - countSkipCards;

    if (countTakePossibleCards >= cardsPerPage) {
      return MoonCEBCBuilderCurrentGroupsList.slice(
        countSkipCards,
        countSkipCards + cardsPerPage
      );
    }
    if (countTakePossibleCards < cardsPerPage && countTakePossibleCards > 0) {
      return MoonCEBCBuilderCurrentGroupsList.slice(
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
    let events = cardsArray.filter((card) => card.Type === "Event");
    let normalCards = cardsArray.filter((card) => card.Type !== "Event");

    events.forEach((card) => {
      if (card.RequiredLevel == null) {
        card.RequiredLevel = 1;
      }
    });

    normalCards.forEach((card) => {
      if (card.RequiredLevel == null) {
        card.RequiredLevel = 1;
      }
    });

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

    const sortedCards = [...normalCards, ...events];

    return sortedCards;
  }

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
