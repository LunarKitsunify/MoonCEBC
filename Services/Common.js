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
//export const MoonCEStatusIsAddonIcon = new URL("src/Images/IsAddon.png", basePath).href;
export const MoonCEStatusIsAddonIcon = "data:image/png;base64,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";
/**
 * If a player opens the addon menu, an icon is rendered for the other players.
*/
//export const MoonCEIsOpenMenuIcon = new URL("src/Images/IsOpenMenu.png", basePath).href;
export const MoonCEIsOpenMenuIcon = "data:image/png;base64,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";
export const MoonDeckIcon = new URL("src/Images/MoonDeckIcon.png", basePath).href; //MoonDeckIcon
export const MoonLogo = new URL("src/Images/AddonIcon2.png", basePath).href;
export const MoonDefaultOnIcon = new URL("src/Images/DefaultOn.png", basePath).href;
export const MoonDefaultOffIcon = new URL("src/Images/DefaultOff.png", basePath).href;
export const ViewEditIcon = new URL("src/Images/ViewEdit.png", basePath).href;
export const SelectedCardsViewIcon = new URL("src/Images/SelectedCardsViewIcon.png", basePath).href;
export const UnSelectedCardsViewIcon = new URL("src/Images/UnSelectedCardsViewIcon.png", basePath).href;
//#endregion

//#region Size and color customization
/** Center X between 550 and 1150 */
export const RectCenterX = 850;

export const TopPanelHeight = "7%";
export const TopPanelTextSize = "1.2vw";
export const DeckNamePanelWidth = "20%";
export const TopLeftPanelGap = "1%";
export const TopRightPanelGap = "2%";
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

    if (CurrentScreen == 'ClubCard' && deckMode == DecksMode.Default) {
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
			if (CurrentScreen === "ClubCard") return GetDefaultDecksList();

			return settings?.UseAddonDecks
				? Player.ExtensionSettings?.MoonCE?.Decks?.Deck ?? []
				: Player.Game?.ClubCard?.Deck ?? [];

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
 * This may be a temporary function that will be used from time to time before new versions of BC are released.
 * 
 * @returns {boolean} True if the new game signature is used (version >= 130 or test server), otherwise false.
 */
export function CheckGameVersion() {
    const newVersion = 130;
    const VersionNumber = Number(GameVersion.match(/R(\d+)/)?.[1] ?? 0);
    const normalizedServerURL = String(ServerURL ?? "").replace(/\/+$/, "");
    const usesNewSignature = VersionNumber >= newVersion || normalizedServerURL === "https://bondage-club-server-test.herokuapp.com";
    return usesNewSignature;
}
//#endregion
