//#region Variables    
import { DecksMode } from "./Settings.js";
export const MoonCEAddonName = "Moon Cards Editor";
export const meow_key = 42;
export const MessageTypeHidden = "Hidden";

export const WindowStatus = Object.freeze({
    VIEW: "ViewDeck",
    EDIT: "EditDeck",
    SETTINGS: "Settings",
});

export const UpdatedCardIDs = [
    11008, 31025, 9001, 9005, 14004, 14013, 30024, 31028, 1010, 1011,
    12009, 12010, 12011, 12012, 16000, 16001, 16002, 16006, 16003, 16004, 
    16005, 16007, 1024, 1023, 1025, 15000, 15001, 15002, 15003, 15004,
    9009, 3018, 3019, 31037, 31034, 31035, 31036, 31033, 31032
];

export const CardTypes = Object.freeze({
    ALL_CARDS: { value: "All Cards", text: "All Cards" },
    SELECTED_CARDS: { value: "Selected Cards", text: "Selected Cards" },
    EVENTS_CARDS: { value: "Events Cards", text: "Event Cards" },
    REWARD_CARDS: { value: "Reward Cards", text: "Reward Cards" },
    //UPDATED_CARDS: { value: "Updated Cards", text: "Updated Cards" },
    ABDL: { value: "ABDL", text: "ABDL" },
    ASYLUM: { value: "Asylum", text: "Asylum" },
    COLLEGE: { value: "College", text: "College" },
    CRIMINAL: { value: "Criminal", text: "Criminal" },
    DOMINANT_MISTRESS: { value: "DominantMistress", text: "Dominant / Mistress" },
    EXHIBITIONIST: { value: "Exhibitionist", text: "Exhibitionist" },
    FETISHIST: { value: "Fetishist", text: "Fetishist" },
    KEMONOMIMI: { value: "Kemonomimi", text: "Kemonomimi" },
    LATEX: { value: "Latex", text: "Latex" },
    LIABILITY: { value: "Liability", text: "Liability" },
    MAID: { value: "Maid", text: "Maid" },
    PET: { value: "PetOwner", text: "Pet / Owner" },
    PLAYER: { value: "Player", text: "Player" },
    POLICE: { value: "Police", text: "Police" },
    PORN: { value: "Porn", text: "Porn" },
    SHIBARI_SENSEI_KNOT: { value: "ShibariSenseiKnot", text: "Shibari / Sensei / Knot", },
    STAFF: { value: "Staff", text: "Staff" },
    SUBMISSIVE_SLAVE: { value: "SubmissiveSlave", text: "Submissive / Slave"},
    UNGROUPED: { value: "Ungrouped", text: "Ungrouped" },
});

//#region Images
export const basePath = new URL("../", import.meta.url).href;
export const MoonCETopPanelBackground = new URL("src/Images/MoonCETopPanelBackground.jpg", basePath).href;
/**
 * If the people in the room pass the addon check, draws a card icon for them.
 */
export const MoonCEStatusIsAddonIcon = new URL("src/Images/IsAddon.png", basePath).href;
/**
 * If a player opens the addon menu, an icon is rendered for the other players.
 */
export const MoonCEIsOpenMenuIcon = new URL("src/Images/IsOpenMenu.png", basePath).href;
export const MoonDeckIcon = new URL("src/Images/MoonDeckIcon.png", basePath).href; //MoonDeckIcon
export const MoonLogo = new URL("src/Images/AddonIcon2.png", basePath).href;
export const MoonDefaultOnIcon = new URL("src/Images/DefaultOn.png", basePath).href;
export const MoonDefaultOffIcon = new URL("src/Images/DefaultOff.png", basePath).href;
export const ViewEditIcon = new URL("src/Images/ViewEdit.png", basePath).href;
//#endregion

//#region Size and color customization
/** Center X between 550 and 1150 */
export const RectCenterX = 850;

export const TopPanelHeight = "7%";
export const TopPanelTextSize = "1.2vw";
export const DeckNamePanelWidth = "20%";
export const TopLeftPanelGap = "1%";
export const TopPanelSidePadding = "0.5%";
export const TopLeftPanelWidth = "92%";
export const TopRightPanelWidth = `calc(100% - ${TopLeftPanelWidth})`;

//export const requiredLevelTestColor = "#FF5733";
export const fameTextColor = "#3357FF";
export const moneyTextColor = "#006400";

export const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ'];


//#endregion

//#endregion

//#region Common functions

/**
 * Returns the list of deck names based on the selected storage mode (addon or base game).
 *
 * @returns {string[]} An array of deck name strings.
 */
export function GetDeckNamesList() {
    const deckMode = Player.ExtensionSettings?.MoonCE?.Settings?.DecksMode;

    if (deckMode == DecksMode.Default) {
        if (typeof ClubCardBuilderDefaultDecksList === "undefined") return [];
		return Object.keys(ClubCardBuilderDefaultDecksList);
    } else {
        const useAddonDecks = Player.ExtensionSettings?.MoonCE?.Settings?.UseAddonDecks === true;
        let decksSources = useAddonDecks ? Player.ExtensionSettings.MoonCE.Decks.DeckName : (Player.Game.ClubCard.DeckName ?? ['Deck #1', 'Deck #2', 'Deck #3', 'Deck #4', 'Deck #5', 'Deck #6', 'Deck #7', 'Deck #8', 'Deck #9', 'Deck #10']);
        return decksSources;
    }
}

/**
 * Returns the list of decks as raw encoded strings based on the selected storage mode.
 *
 * Sources:
 * - BC: player's base-game decks
 * - Addon: MoonCE addon decks
 * - Default: built-in default decks from ClubCardBuilderDefaultDecksList
 *
 * @returns {string[]} An array of encoded deck data strings.
 */
export function GetDecksList() {
	const settings = Player.ExtensionSettings?.MoonCE?.Settings;

	const deckMode = settings?.DecksMode ?? (settings?.UseAddonDecks ? DecksMode.Addon : DecksMode.BC);

	switch (deckMode) {
		case DecksMode.Default:
			return GetDefaultDecksList();

		case DecksMode.Addon:
			return Player.ExtensionSettings?.MoonCE?.Decks?.Deck ?? [];

		case DecksMode.BC:
		default:
			return Player.Game?.ClubCard?.Deck ?? [];
	}
}

/**
 * Converts built-in default decks from number[] format to encoded string format.
 *
 * @returns {string[]}
 */
function GetDefaultDecksList() {
	if (typeof ClubCardBuilderDefaultDecksList === "undefined") return [];
	return Object.values(ClubCardBuilderDefaultDecksList).map(deck => String.fromCharCode(...deck));
}

/** 
 * Checks if game statistics upload is enabled for the current player.
 * 
 * @returns {boolean} True if the GameStats setting is enabled in the player's MoonCE settings, otherwise false.
 */
export function IsStatsUploadEnabled() {
    return Player?.ExtensionSettings?.MoonCE?.Settings?.GameStats;
}

/** 
 * Checks if the opponent is using the MoonCE addon.
 * 
 * @returns {boolean} True if the second player (index 1) has MoonCE enabled in their character data, otherwise false.
 */
export function IsOpponentMoonCE() {
    return ClubCardPlayer?.[1]?.Character?.MoonCE;
}
/** 
 * Checks if the current game version uses the new game signature (version >= 130 or test server).
 * 
 * @returns {boolean} True if the new game signature is used (version >= 130 or test server), otherwise false.
 */
export function CheckGameVersion() {
    const VersionNumber = Number(GameVersion.match(/R(\d+)/)?.[1] ?? 0);
    const normalizedServerURL = String(ServerURL ?? "").replace(/\/+$/, "");
    const usesNewSignature = VersionNumber >= 130 || normalizedServerURL === "https://bondage-club-server-test.herokuapp.com";
    return usesNewSignature;
}
//#endregion
