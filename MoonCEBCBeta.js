// ==UserScript==
// @name Moon Cards Editor BC
// @namespace https://www.bondageprojects.com/
// @version 1.3.0
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

//import { card_Cover1 } from "./src/images.js";

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
              `ModSDK: Mod '${r.name}' is patching function ${o.name
              } with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${t.get(e) || ""
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
                  `Mod ${n.mod
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
        router: () => { },
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
    UNGROUPED: { value: "Ungrouped", text: "Ungrouped" },
    REWARD_CARDS: { value: "Reward Cards", text: "Reward Cards" },
    LIABILITY: { value: "Liability", text: "Liability" },
    STAFF: { value: "Staff", text: "Staff" },
    POLICE_CRIMINAL: { value: "PoliceCriminal", text: "Police / Criminal" },
    FETISHIST: { value: "Fetishist", text: "Fetishist" },
    PORN_ACTRESS: { value: "PornActress", text: "Porn Actress" },
    MAID: { value: "Maid", text: "Maid" },
    ASYLUM: { value: "Asylum", text: "Asylum" },
    DOMINANT_MISTRESS: {
      value: "DominantMistress",
      text: "Dominant / Mistress",
    },
    ABDL: { value: "ABDL", text: "ABDL" },
    COLLEGE: { value: "College", text: "College" },
    SHIBARI_SENSEI_KNOT: {
      value: "ShibariSenseiKnot",
      text: "Shibari / Sensei / Knot",
    },
  });

  const MoonCEBCAddonName = "Moon Cards Editor BC";
  const MoonCEBCTopPanelBackground = "url('https://i.imgur.com/nO4qB3m.jpeg')";
  const CardGameCardCoverBackground = "https://i.imgur.com/rGuMjPS.jpeg";
  const CardGameBoardBackground = "https://i.imgur.com/sagZ9Xp.png";
  /**
   * If the people in the room pass the addon check, draws a card icon for them.
   */
  const MoonCEBCStatusIsAddonIcon = "https://i.imgur.com/SXAG27j.png";
  /**
   * If a player opens the addon menu, an icon is rendered for the other players.
   */
  const MoonCEBCIsOpenMenuIcon = "https://i.imgur.com/nje9iy8.png";
  /**
   * variable for loading description for cards
   */
  let MoonCEBCTextContent = null;
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
   * variable to check if mainWindow is open
   */
  let isMainWindowLoaded = false;
  /**
   * An array of 30 cells into which the bottom container is divided. To display 30 cards.
   * @type {HTMLDivElement[]}
   */
  let CardCells = [];

  window.addEventListener("resize", function () {
    if (isMainWindowLoaded) UpdateCardHeightWidth();
  });

  /**
   * Variable for accessing  mainWindow = document.createElement("div");
   */
  let MainWindowPanel = null;

  // variables to calculate the height and width of the cards.
  let MoonCEBCCardHeight = 0;
  let MoonCEBCCardWidth = 0;
  let MoonCEBCBigCardHeight = 0;
  let MoonCEBCBigCardWidth = 0;

  //#region Size and color customization

  const TopPanelHeight = "7%";
  const TopPanelTextSize = "1.2vw";
  const DeckNamePanelWidth = "20%";
  const TopLeftPanelGap = "1%";
  const TopPanelSidePadding = "0.5%";
  const TopLeftPanelWidth = "92%";
  const TopRightPanelWidth = `calc(100% - ${TopLeftPanelWidth})`;

  const requiredLevelTestColor = "#FF5733";
  const fameTextColor = "#3357FF";
  const moneyTextColor = "#006400";

  //TODO I think you have to make a formula. Because there may be problems for widescreens.
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

  const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ'];
  const AddonVersion = "1.3.0";
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

  /*modApi.hookFunction("DrawImageEx", 0, (args, next) => {
    if (args[0] == "Screens/MiniGame/ClubCard/Sleeve/Default.png") {
      const newImage = CardGameCardCoverBackground;
      args[0] = newImage;
    }

    if (args[0] == "Backgrounds/ClubCardPlayBoard1.jpg") {
      const newImage = CardGameBoardBackground;
      args[0] = newImage;
    }
    next(args);
  });*/

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
      DrawImageResize(MoonCEBCStatusIsAddonIcon, CharX + 350 * Zoom, CharY + 5, 30 * Zoom, 30 * Zoom);

    return next(args);

  });

  modApi.hookFunction("ChatRoomCharacterViewDrawOverlay", 0, (args, next) => {
    if (ChatRoomHideIconState != 0) return next(args);
    const [C, CharX, CharY, Zoom] = args;

    //Is Menu Addon Open Icon
    if (C.MoonCEBC && C.MoonCEBC.IsMenuOpen)
      DrawImageResize(MoonCEBCIsOpenMenuIcon, CharX + 375 * Zoom, CharY + 50 * Zoom, 50 * Zoom, 50 * Zoom);

    return next(args);
  });

  //#endregion //------------------------------//

  //#region ---------------Addon work with hiden message--------------- // 

  modApi.hookFunction("ChatRoomSync", 0, (args, next) => {
    AddonInfoMessage();

    if (Player.OnlineSharedSettings.MoonCEBC) {
      delete Player.OnlineSharedSettings.MoonCEBC;
      ServerAccountUpdate.QueueData({ OnlineSharedSettings: Player.OnlineSharedSettings });
    }

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
        if (!sender) next(args);
        const message = ParseAddonMessage(data);
        sender.MoonCEBC = message;
      }
    }

    return next(args);
  });

  //#endregion //------------------------------//

  //#region  ---------------Addon Rework Selection Deck Menu--------------- //

  /**Rewriting the click handler in ClubCard to remove the deck selection handler from it. */
  modApi.hookFunction("ClubCardClick", 0, (args, next) => {
    // In popup mode, no other clicks can be done but the popup buttons
    if (ClubCardPopup != null) {
      if ((ClubCardPopup.Mode == "TEXT") && MouseIn(700, 570, 300, 60)) return CommonDynamicFunction(ClubCardPopup.Function1);
      if ((ClubCardPopup.Mode == "YESNO") && MouseIn(660, 570, 180, 60)) return CommonDynamicFunction(ClubCardPopup.Function1);
      if ((ClubCardPopup.Mode == "YESNO") && MouseIn(860, 570, 180, 60)) return CommonDynamicFunction(ClubCardPopup.Function2);
      if (ClubCardPopup.Mode == "DISCARDPILE") {
        if (MouseIn(760, 650, 180, 60)) return CommonDynamicFunction(ClubCardPopup.Function1);
        if (ClubCardPopup.Text == "Opponent") {
          if ((ClubCardHover != null) && ClubCardHover.Location == "OpponentDiscardPile") return ClubCardFocus = { ...ClubCardHover };
        } else {
          if ((ClubCardHover != null) && ClubCardHover.Location == "PlayerDiscardPile") return ClubCardFocus = { ...ClubCardHover };
        }
      }
      //Since I'm making a new deck selection menu, I don't need that click handler anymore.
      // if (ClubCardPopup.Mode == "DECK")
      // 	for (let Deck = 0; Deck < 10; Deck++)
      // 		if (MouseIn(560 + Math.floor(Deck / 5) * 300, 310 + (Deck % 5) * 80, 280, 60))
      // 			ClubCardLoadDeckNumber(Deck);
      return;
    }

    // If there's a pending card with a prerequisite, there are extra buttons
    if ((ClubCardPending != null) && MouseIn(1725, 300, 250, 60) && ClubCardCanSelectCard(ClubCardPlayer[ClubCardTurnIndex], ClubCardFocus)) return ClubCardSelectCard(ClubCardFocus);
    if ((ClubCardPending != null) && MouseIn(1805, 905, 90, 90)) return ClubCardPending = null;

    // Can always concede/exit
    if (MouseIn(1905, 905, 90, 90)) return ClubCardCreatePopup("YESNO", TextGet(ClubCardIsPlaying() ? "ConfirmConcede" : "ConfirmExit"), TextGet("Yes"), TextGet("No"), "ClubCardConcede()", "ClubCardDestroyPopup()");

    // If we are waiting for deck selection
    if ((ClubCardPlayer[0].FullDeck == null) || (ClubCardPlayer[0].FullDeck.length == 0) || (ClubCardPlayer[1].FullDeck == null) || (ClubCardPlayer[1].FullDeck.length == 0)) return;

    // Runs the basic game buttons

    //Play Card
    if (MouseIn(1725, 300, 250, 60) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player") && ClubCardCanPlayCard(ClubCardPlayer[ClubCardTurnIndex], ClubCardFocus)) return ClubCardStartTurn(ClubCardStartTurnType.PLAYCARD);
    // Hm ???
    if (MouseIn(1700, 0, 300, 600) && (ClubCardFocus != null)) return ClubCardFocus = null;
    // Draw card and end turn
    if (MouseIn(1705, 905, 90, 90) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player")) return ClubCardStartTurn(ClubCardStartTurnType.DRAWENDTURN);
    // Open Bancrupt window and bind function close and bancrupt in yes and no
    if (MouseIn(1805, 905, 90, 90) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player")) return ClubCardCreatePopup("YESNO", TextGet("ConfirmBankrupt"), TextGet("Yes"), TextGet("No"), "ClubCardStartTurn()", "ClubCardDestroyPopup()");
    // Upgrade lvl Club
    if (MouseIn(1390, 435, 300, 60) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player") && (ClubCardPlayer[ClubCardTurnIndex].Level < ClubCardLevelCost.length - 1) && (ClubCardPlayer[ClubCardTurnIndex].Money >= ClubCardCalculateLevelCost(ClubCardPlayer[ClubCardTurnIndex]))) return ClubCardStartTurn(ClubCardStartTurnType.UPGRADELEVEL);

    //DISCARDPILE
    if (MouseIn(5, 450, 45, 45) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player")) return ClubCardCreatePopup("DISCARDPILE", "Opponent", TextGet("Close"), null, "ClubCardDestroyPopup()", null);
    if (MouseIn(5, 505, 45, 45) && (ClubCardPlayer[ClubCardTurnIndex].Control == "Player")) return ClubCardCreatePopup("DISCARDPILE", null, TextGet("Close"), null, "ClubCardDestroyPopup()", null);

    // Sets the focus card if nothing else was clicked
    if (ClubCardHover != null) return ClubCardFocus = { ...ClubCardHover };
  });

  modApi.hookFunction("ClubCardRenderPopup", 0, (args, next) => {
    // Exit on no popup
    if (ClubCardPopup == null) return;

    // In deck mode, we open Deck Selection Menu
    if (ClubCardPopup.Mode == "DECK") {
      ClubCardRenderDeckSelectionMenu();
      return;
    }

    // Draw the discard pile popup
    if (ClubCardPopup.Mode == "DISCARDPILE") {
      DrawRect(48, 258, 1604, 484, "White");
      DrawRect(50, 260, 1600, 480, "Black");
      DrawButton(760, 650, 180, 60, ClubCardPopup.Button1, "White");
      if (ClubCardPopup.Text == "Opponent") {
        ClubCardRenderDiscardPile(ClubCardGetOpponent(ClubCardPlayer[ClubCardTurnIndex]), 52, 252, 1516, 428);
      } else {
        ClubCardRenderDiscardPile(ClubCardPlayer[ClubCardTurnIndex], 52, 252, 1516, 428);
      }
      return;
    }

    // Draw the yes/no/text popups
    DrawRect(648, 348, 404, 304, "White");
    DrawRect(650, 350, 400, 300, "Black");
    DrawTextWrap(ClubCardPopup.Text, 670, 360, 370, 210, "White");
    if (ClubCardPopup.Mode == "TEXT") DrawButton(700, 570, 300, 60, ClubCardPopup.Button1, "White");
    if (ClubCardPopup.Mode == "YESNO") {
      DrawButton(660, 570, 180, 60, ClubCardPopup.Button1, "White");
      DrawButton(860, 570, 180, 60, ClubCardPopup.Button2, "White");
    }
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
  //#region Card Render
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
   * Creates the main container (button) for the card.
   * @param {boolean} isBigCard - Determines if the card is a big card.
   * @param {ClubCard} card - ClubCard from BC.
   * @returns {HTMLElement} - The card button container.
   * @param {HTMLElement} imgSelected - The selected indicator image element.
   */
  function createCardContainer(isBigCard, card, imgSelected) {
    const cardButton = document.createElement("button");
    cardButton.style.position = "relative";
    cardButton.style.borderRadius = "6px";
    cardButton.style.display = "flex";
    cardButton.style.justifyContent = "center";
    cardButton.style.alignItems = "center";
    cardButton.style.userSelect = "none";

    cardButton.addEventListener("click", () => {
      const isEditMode = MoonCEBCPageMode === WindowStatus.EDIT;
      // If not in edit mode, do nothing
      if (!isEditMode) return;
      // Toggle card selection
      if (MoonCEBCEditCurrentDeck.includes(card)) {
        const indexToRemove = MoonCEBCEditCurrentDeck.findIndex(
          (removedCard) => removedCard.ID === card.ID
        );
        MoonCEBCEditCurrentDeck.splice(indexToRemove, 1);
        imgSelected.style.display = "none"; // Hide selected indicator
        cardButton.style.border = "none"; // Reset border
      } else {
        MoonCEBCEditCurrentDeck.push(card);
        imgSelected.style.display = "block"; // Show selected indicator
        cardButton.style.border = "3px solid #40E0D0"; // Highlight border
      }

      // Update counter or related UI
      UpdateDeckCardsCounter();
    });

    if (isBigCard) {
      cardButton.id = "BigCardId";
      cardButton.style.height = `${MoonCEBCBigCardHeight}px`;
      cardButton.style.width = `${MoonCEBCBigCardWidth}px`;
    } else {
      cardButton.style.height = `${MoonCEBCCardHeight}px`;
      cardButton.style.width = `${MoonCEBCCardWidth}px`;

      cardButton.addEventListener("mouseover", () => {
        // Check if the card is already displayed
        if (MoonCEBCMouseOverCard !== card) {
          MoonCEBCMouseOverCard = card;

          // Clear the CardInfoPanel and render a new big card
          const cardInfoPanel = document.querySelector("#CardInfoPanelId");
          if (cardInfoPanel) cardInfoPanel.innerHTML = "";

          CardRender(
            MoonCEBCMouseOverCard,
            cardInfoPanel,
            bigCardNameFontSize,
            bigCardGroupFontSize,
            bigCardTextFontSize,
            bigCardValueFontSize,
            true // Render as big card
          );
        }
      });
    }

    return cardButton;
  }
  /**
   * Adds images (frame, main image, selected indicator) to the card.
   * @param {HTMLElement} cardButton - The card container.
   * @param {ClubCard} card - ClubCard from BC.
   * @param {boolean} isEditMode - If in edit mode, show selected indicator.
   * @param {HTMLElement} imgSelected - The selected indicator image element.
   */
  function addCardImages(cardButton, card, isEditMode, imgSelected) {
    const Level =
      card.RequiredLevel == null || card.RequiredLevel <= 1
        ? 1
        : card.RequiredLevel;
    if (card.Type == null) card.Type = "Member";

    const imgFrame = document.createElement("img");
    imgFrame.src = `Screens/MiniGame/ClubCard/Frame/${card.Type}${card.Reward != null ? "Reward" : ""}${Level}.png`;
    imgFrame.style.width = "100%";
    imgFrame.style.height = "100%";
    imgFrame.style.position = "absolute";
    imgFrame.style.display = "block";
    imgFrame.style.top = "0";
    imgFrame.style.pointerEvents = "none";
    cardButton.appendChild(imgFrame);

    const imgCard = document.createElement("img");
    imgCard.src = `Screens/MiniGame/ClubCard/${card.Type}/${card.Name}.png`;

    imgCard.style.height = "85%";
    imgCard.style.position = "absolute";
    imgCard.style.top = "15%";
    imgCard.style.maxWidth = "100%";
    imgCard.style.maxHeight = "100%";
    imgCard.style.objectFit = "contain";
    imgCard.style.left = "50%";
    imgCard.style.transform = "translateX(-50%)";
    imgCard.style.pointerEvents = "none";
    cardButton.appendChild(imgCard);

    imgSelected.src = "Screens/MiniGame/ClubCardBuilder/Selected.png";
    imgSelected.style.position = "absolute";
    imgSelected.style.top = "13%";
    imgSelected.style.right = "3%";
    imgSelected.style.width = "30%";
    imgSelected.style.objectFit = "contain";
    imgSelected.style.pointerEvents = "none";
    imgSelected.style.display = isEditMode && MoonCEBCEditCurrentDeck.includes(card) ? "block" : "none";
    cardButton.appendChild(imgSelected);

    if (MoonCEBCPageMode == WindowStatus.EDIT) {
      if (MoonCEBCEditCurrentDeck.includes(card)) {
        imgSelected.style.display = "block";
        cardButton.style.border = "3px solid #40E0D0"; // #40E0D0 or orange (#FFA500):
      }
    }
  }
  /**
   * Adds text elements (name, group, description) to the card.
   * @param {HTMLElement} cardButton - The card container.
   * @param {ClubCard} card - ClubCard from BC.
   * @param {string} nameSize - Font size for the card name.
   * @param {string} groupSize - Font size for the group text.
   * @param {string} textSize - Font size for the description.
   */
  function addCardText(cardButton, card, nameSize, groupSize, textSize) {
    const cardNameTextElement = document.createElement("div");
    cardNameTextElement.textContent = card.Name;
    cardNameTextElement.style.position = "absolute";
    cardNameTextElement.style.top = "1%";
    cardNameTextElement.style.left = "50%";
    cardNameTextElement.style.transform = "translateX(-50%)";
    cardNameTextElement.style.fontSize = nameSize;
    cardNameTextElement.style.textAlign = "center";
    cardNameTextElement.style.fontWeight = "bold";
    cardButton.appendChild(cardNameTextElement);

    const bottomContainer = document.createElement("div");
    bottomContainer.style.position = "absolute";
    bottomContainer.style.bottom = "0";
    bottomContainer.style.width = "98%";
    bottomContainer.style.height = "45%";
    bottomContainer.style.background = "rgba(255, 255, 255, 0.6)";
    bottomContainer.style.textAlign = "center";
    bottomContainer.style.overflow = "hidden";

    const cardGroupTextElement = document.createElement("div");
    cardGroupTextElement.textContent = ClubCardGetGroupText(card.Group);
    cardGroupTextElement.style.fontSize = groupSize;
    cardGroupTextElement.style.fontWeight = "bold";
    bottomContainer.appendChild(cardGroupTextElement);

    const cardDescriptionTextElement = document.createElement("div");
    cardDescriptionTextElement.innerHTML = card.Text;
    cardDescriptionTextElement.style.fontSize = textSize;
    cardDescriptionTextElement.style.fontWeight = "bold";
    bottomContainer.appendChild(cardDescriptionTextElement);

    cardButton.appendChild(bottomContainer);
  }
  /**
   * Adds a value panel to the card for level, fame, and money.
   * @param {HTMLElement} cardButton - The card container.
   * @param {ClubCard} card - ClubCard from BC.
   * @param {string} valueSize - Font size for values.
   */
  function addValuePanel(cardButton, card, valueSize) {
    const valueCardPanel = document.createElement("div");
    valueCardPanel.style.position = "absolute";
    valueCardPanel.style.top = "13%";
    valueCardPanel.style.left = "3%";
    valueCardPanel.style.width = "17%";
    valueCardPanel.style.display = "flex";
    valueCardPanel.style.flexDirection = "column";
    valueCardPanel.style.gap = "10%";

    // Add Required Level if > 1
    if (card.RequiredLevel > 1) {
      const levelBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Level.png",
        card.RequiredLevel,
        requiredLevelTestColor,
        valueSize
      );
      valueCardPanel.appendChild(levelBoard);
    }

    // Add Fame per Turn if available
    if (card.FamePerTurn != null) {
      const fameBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Fame.png",
        card.FamePerTurn,
        fameTextColor,
        valueSize
      );
      valueCardPanel.appendChild(fameBoard);
    }

    // Add Money per Turn if available
    if (card.MoneyPerTurn != null) {
      const moneyBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Money.png",
        card.MoneyPerTurn,
        moneyTextColor,
        valueSize
      );
      valueCardPanel.appendChild(moneyBoard);
    }

    // Add any other dynamic values here
    // Example: Custom data properties
    if (card.CustomValue) {
      const customBoard = createBoard(
        "Screens/MiniGame/ClubCard/Bubble/Custom.png",
        card.CustomValue,
        customTextColor,
        valueSize
      );
      valueCardPanel.appendChild(customBoard);
    }

    cardButton.appendChild(valueCardPanel);
  }
  /**
   * Main function to render a card by combining all parts.
   * @param {object} card - The card data object.
   * @param {HTMLElement} cardCell - The container for the card.
   * @param {string} cardNameSize - Font size for the name.
   * @param {string} cardGroupSize - Font size for the group.
   * @param {string} cardTextSize - Font size for the description.
   * @param {string} cardValueSize - Font size for values.
   * @param {boolean} isBigCard - Whether this is a big card.
   */
  function CardRender(
    card,
    cardCell,
    cardNameSize = cardNameFontSize,
    cardGroupSize = cardGroupFontSize,
    cardTextSize = cardTextFontSize,
    cardValueSize = cardValueFontSize,
    isBigCard = false
  ) {
    if (cardCell == null) return;
    // Add images and selection indicator
    const imgSelected = document.createElement("img");
    const cardButton = createCardContainer(isBigCard, card, imgSelected, cardCell != null);
    addCardImages(cardButton, card, MoonCEBCPageMode === WindowStatus.EDIT, imgSelected);
    addCardText(cardButton, card, cardNameSize, cardGroupSize, cardTextSize);
    addValuePanel(cardButton, card, cardValueSize);
    cardCell.appendChild(cardButton);
  }
  /**
   * Creates a grid-based panel to display a collection of cards.
   * @param {HTMLElement} parent - The parent element where the panel will be appended.
   * @returns {HTMLElement} - The created cards collection panel.
   */
  function CreateCardsCollectionPanel(parent) {
    // Create the panel container
    const cardViewer = document.createElement("div");
    cardViewer.id = "CardViewerId";
    cardViewer.style.display = "grid";
    cardViewer.style.gridTemplateColumns = "repeat(10, 1fr)"; // 10 columns
    cardViewer.style.gridTemplateRows = "repeat(3, 1fr)"; // 3 rows
    cardViewer.style.gridAutoRows = "1fr"; // Automatically adjust row height
    cardViewer.style.height = "100%";
    cardViewer.style.width = "80%";
    cardViewer.style.overflow = "hidden";
    parent.appendChild(cardViewer); // Append the panel to the parent

    // Create card cells and add them to the panel
    for (let i = 0; i < 30; i++) {
      const cardCell = document.createElement("div");
      cardCell.style.boxSizing = "border-box";
      cardCell.style.margin = "2%";
      cardCell.style.position = "relative";
      cardCell.style.justifyContent = "center";
      cardCell.style.alignItems = "center";
      cardCell.style.display = "inline-block";
      CardCells.push(cardCell); // Add card cell to the array
      cardViewer.appendChild(cardCell); // Append card cell to the panel
    }

    return cardViewer; // Return the created panel
  }
  /**
   * Renders the deck selection menu for club cards.
   * This function ensures the menu aligns with the `MainCanvas` element and updates its position and size dynamically.
   * If the selection menu already exists, it updates its dimensions. Otherwise, it creates a new menu.
   */
  function ClubCardRenderDeckSelectionMenu() {
    // Get the position and size of the MainCanvas element
    const canvasRect = document.getElementById("MainCanvas").getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    const mainDeckSelectionDiv = document.querySelector("#MainDecksSelectionDivId");
    // Update the existing deck selection menu if it exists
    if (mainDeckSelectionDiv && mainDeckSelectionDiv instanceof HTMLElement) {
      mainDeckSelectionDiv.style.top = `${canvasRect.top}px`;
      mainDeckSelectionDiv.style.left = `${canvasRect.left}px`;
      mainDeckSelectionDiv.style.width = `${canvasWidth * 0.85}px`; // 85% of the canvas width
      mainDeckSelectionDiv.style.height = `${canvasHeight}px`; // Full canvas height
      UpdateCardHeightWidth(); // Adjust card dimensions
      return;
    } else {
      // Create a new deck selection menu if it doesn't exist
      const mainDeckSelectionDiv = document.createElement("div");
      mainDeckSelectionDiv.id = "MainDecksSelectionDivId";
      mainDeckSelectionDiv.style.position = "absolute";
      mainDeckSelectionDiv.style.top = `${canvasRect.top}px`;
      mainDeckSelectionDiv.style.left = `${canvasRect.left}px`;
      mainDeckSelectionDiv.style.width = `${canvasWidth * 0.85}px`; // 85% of the canvas width
      mainDeckSelectionDiv.style.height = `${canvasHeight}px`; // Full canvas height
      document.body.appendChild(mainDeckSelectionDiv);

      // Create a cards viewer container for card rendering
      const cardsViewerDiv = document.createElement("div");
      cardsViewerDiv.style.height = "80%"; // Takes 80% of the height
      cardsViewerDiv.style.width = "100%"; // Full width
      cardsViewerDiv.style.position = "absolute";
      cardsViewerDiv.style.justifyContent = "center";
      cardsViewerDiv.style.alignItems = "center";
      cardsViewerDiv.style.display = "flex";
      cardsViewerDiv.style.zIndex = "2"; // Place it above the overlay
      mainDeckSelectionDiv.appendChild(cardsViewerDiv);

      // Add a background overlay under the cards viewer for visual separation
      const backgroundOverlay = document.createElement("div");
      backgroundOverlay.style.position = "absolute";
      backgroundOverlay.style.top = cardsViewerDiv.style.top || "0";
      backgroundOverlay.style.left = cardsViewerDiv.style.left || "0";
      backgroundOverlay.style.width = cardsViewerDiv.style.width;
      backgroundOverlay.style.height = cardsViewerDiv.style.height;
      backgroundOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
      backgroundOverlay.style.zIndex = "1"; // Place it below the cards viewer
      mainDeckSelectionDiv.appendChild(backgroundOverlay);

      // Create a panel to display the cards
      CreateCardsCollectionPanel(cardsViewerDiv);

      // TODO: Implement dropdown menu functionality for deck selection
      GetDeckData(2); // Load data for deck ID 2
      UpdateCardHeightWidth(); // Adjust card dimensions to fit

      // Create a buttons container below the cards viewer
      const buttonsDiv = document.createElement("div");
      buttonsDiv.style.height = `calc(100% - ${cardsViewerDiv.style.height})`; // Remaining height
      buttonsDiv.style.width = cardsViewerDiv.style.width; // Match cards viewer width
      buttonsDiv.style.backgroundColor = "white"; // Placeholder styling
      buttonsDiv.style.position = "absolute";
      buttonsDiv.style.left = cardsViewerDiv.style.left; // Align with cards viewer
      buttonsDiv.style.top = cardsViewerDiv.style.height; // Position below cards viewer
      buttonsDiv.style.alignItems = "center";
      buttonsDiv.style.justifyContent = "center";
      buttonsDiv.style.display = "flex";
      mainDeckSelectionDiv.appendChild(buttonsDiv);

      const playerDecksSelect = document.createElement("select");
      playerDecksSelect.id = "PlayerDecksSelectId";
      playerDecksSelect.style.width = DeckNamePanelWidth;
      playerDecksSelect.style.height = "80%";
      playerDecksSelect.style.alignContent = "center";
      playerDecksSelect.style.textAlign = "center";
      playerDecksSelect.style.fontSize = TopPanelTextSize;
      playerDecksSelect.addEventListener("change", function () {
        GetDeckData(playerDecksSelect.selectedIndex);
      });
      
      buttonsDiv.appendChild(playerDecksSelect);
      
      LoadPlayerDecksSelectData();
      // Example of adding a dropdown (currently commented out)
      // const dropDown = document.createElement("select");
      // dropDown.id = "SelectionMenuDeckDropDownID";
      // mainDeckSelectionDiv.appendChild(dropDown);
    }
  }
  //#endregion

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
    topSettingsPanel.style.backgroundImage = MoonCEBCTopPanelBackground;
    topSettingsPanel.style.backgroundSize = "cover";
    topSettingsPanel.style.backgroundPosition = "center";
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
      GetDeckData(playerDecksSelect.selectedIndex);
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
      null,
      "auto",
      "80%",
      "0",
      "0",
      "Export Deck",
      "right"
    );

    const importButton = createButton(
      "Import",
      null,
      () => {
        console.log("Centered button clicked!");
      },
      "auto",
      "80%",
      "0",
      "0",
      "Import Deck",
      "right"
    );

    //topSettingsLeftViewPanel.appendChild(exportButton);
    //topSettingsLeftViewPanel.appendChild(importButton);
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
      MoonCEBCCurrentGroup = groupSelect.value;
      UpdateCardsListSetNewGroup();
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
      if (newValue == "" || newValue == undefined)
        MoonCEBCBuilderSeacrhGroupList = [];
      else
        MoonCEBCBuilderSeacrhGroupList =
          MoonCEBCBuilderCurrentGroupsList.filter((card) =>
            card.Name.toLowerCase().includes(newValue.toLowerCase())
          );

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
      null,
      "50%",
      "80%",
      "0",
      "0",
      "Dont Work",
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
    mainWindow.appendChild(bottomPanel);

    CreateCardsCollectionPanel(bottomPanel);

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

    UpdateCardHeightWidth();
    //load decks data
    LoadPlayerDecksSelectData();
  }

  //#endregion

  /**
   * Loads and stores card data.  Text_ClubCard.csv
   * TODO make variant loading for different interface languages  ( Text_ClubCard_CN.txt, Text_ClubCard_RU.txt )
   */
  async function AddonLoad() {

    await waitFor(() => Player !== undefined && Player.MemberNumber !== undefined);

    const TextPath = "Screens/MiniGame/ClubCard/Text_ClubCard.csv";

    //Load Cards data from BC Server
    MoonCEBCTextContent = new TextCache(TextPath);
    for (let i = 0; i < ClubCardList.length; i++) {
      let copiedCard = { ...ClubCardList[i] };
      MoonCEBCClubCardList.push(copiedCard);
    }

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

    const playerDecksSelect = document.querySelector(
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

    GetDeckData(playerDecksSelect.selectedIndex);
  }

  /**
   * Get data selected deck and update cards cells
   * @param {number} - deck index from Player.Game.ClubCard.Deck
   * @returns {void} - Nothing
   */
  function GetDeckData(deckIndex) {
    const encodedDeck = Player.Game.ClubCard.Deck[deckIndex];
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
      if (CardCells[i]) CardCells[i].innerHTML = "";
      if (cardsArray && i < cardsArray.length) {
        const cardText = MoonCEBCTextContent.get(
          "Text " + cardsArray[i].Name
        ).replace(/<F>/g, "");
        cardsArray[i].Text = formatTextForInnerHTML(cardText);
        CardRender(cardsArray[i], CardCells[i]);
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
    deckCardsCounter.textContent = `Select the cards (${countCards}/30)`;

    if (countCards != 30) deckCardsCounter.style.color = "red";
    else deckCardsCounter.style.color = "white";
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

    if (isDeckNameValidation && MoonCEBCEditCurrentDeck.length == 30) {
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
   */
  function SaveNewDeck() {
    const deckNameInput = MainWindowPanel.querySelector("#MoonCEBCDeckNameInputId");
    const playerDecksSelect = MainWindowPanel.querySelector("#PlayerDecksSelectId");
    const newDeckName = deckNameInput.value;
    const cardIDs = MoonCEBCEditCurrentDeck.map((card) => card.ID);
    const encodeIDDeck = encodeIDDeckToString(cardIDs);
    const selectedIndex = playerDecksSelect.selectedIndex;

    //fix null deck if player dont created them
    if (Player.Game.ClubCard.DeckName == null)
      Player.Game.ClubCard.DeckName = ["Deck #1", "Deck #2", "Deck #3", "Deck #4", "Deck #5", "Deck #6", "Deck #7", "Deck #8", "Deck #9", "Deck #10"];

    Player.Game.ClubCard.DeckName[selectedIndex] = newDeckName;
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
      isMainWindowLoaded = false;
      if (MainWindowPanel) MainWindowPanel.remove();

      MoonCEBCCurrentGroup = CardTypes.ALL_CARDS.value;
      MoonCEBCBuilderSeacrhGroupList = [];
      MoonCEBCBuilderCurrentGroupsList = [];
      MoonCEBCPageMode = WindowStatus.VIEW;
      MoonCEBCCurrentCardsListPage = 0;

      CardCells = [];
    } else {
      AddonInfoMessage(null, true);
      isMainWindowLoaded = true;
      LoadMainWindow();
    }

    MoonCEBCPageMode = WindowStatus.VIEW;
    isVisibleMainWindow = !isVisibleMainWindow;
  }

  //#endregion

  //#endregion

  /**
   * Function to update the size of cards in 30 cells when the window size changes.
   */
  function UpdateCardHeightWidth(parent) {
    let cardsCollectionPanel = null;
    let cardInfoPanel = null;
    if (document.querySelector("#CardViewerId") != null)
      cardsCollectionPanel = document.querySelector("#CardViewerId");
    else
      cardsCollectionPanel = document.querySelector("#MainDecksSelectionDivId");

    if (document.querySelector("#CardInfoPanelId"))
      cardInfoPanel = document.querySelector("#CardInfoPanelId");

    const reservedSpace = 15;

    let cardsCollectionPanelWidth =
      cardsCollectionPanel.offsetWidth - reservedSpace;
    let cardsCollectionPanelHeight =
      cardsCollectionPanel.offsetHeight - reservedSpace;

    if (cardsCollectionPanelWidth == 0 || cardsCollectionPanelHeight == 0)
      return;

    let cardHeight = cardsCollectionPanelHeight / 3;
    let cardWidth = cardHeight / 2;

    let maxCardWidth = cardsCollectionPanelWidth / 10;

    while (cardWidth > maxCardWidth) {
      cardWidth -= 1;
      cardHeight = cardWidth * 2;
    }

    MoonCEBCCardHeight = cardHeight;
    MoonCEBCCardWidth = cardWidth;

    for (let i = 0; i < 30; i++) {
      const childButton = CardCells[i].querySelector("button");
      if (childButton) {
        childButton.style.height = `${MoonCEBCCardHeight}px`;
        childButton.style.width = `${MoonCEBCCardWidth}px`;
      }
    }

    if (cardInfoPanel) {
      let cardInfoPanelWidth = cardInfoPanel.offsetWidth;
      let cardInfoPanelHeight = cardInfoPanel.offsetHeight;
      let bigCardHeight = cardInfoPanelHeight;
      let bigCardWidth = cardInfoPanelHeight / 2;
      let maxBigCardWidth = cardInfoPanelWidth;
      while (bigCardWidth > maxBigCardWidth) {
        bigCardWidth -= 1;
        bigCardHeight = bigCardWidth * 2;
      }

      MoonCEBCBigCardHeight = bigCardHeight;
      MoonCEBCBigCardWidth = bigCardWidth;

      const bigCard = MainWindowPanel.querySelector("#BigCardId");
      if (bigCard) {
        bigCard.style.height = `${MoonCEBCBigCardHeight}px`;
        bigCard.style.width = `${MoonCEBCBigCardWidth}px`;
      }
    }

  }
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
      case CardTypes.POLICE_CRIMINAL.value:
        cardGroupList = MoonCEBCClubCardList.filter(
          (card) =>
            card.Group &&
            (card.Group.includes("Police") || card.Group.includes("Criminal"))
        );
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

  //#endregion
})();
