//#region Variables    
export const MoonCEAddonName = "Moon Cards Editor";
export const meow_key = 42;
export const MessageTypeHidden = "Hidden";

export const WindowStatus = Object.freeze({
    VIEW: "ViewDeck",
    EDIT: "EditDeck",
    SETTINGS: "Settings",
});

export const CardTypes = Object.freeze({
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
    const useAddonDecks = Player.ExtensionSettings?.MoonCE?.Settings?.UseAddonDecks === true;
    let decksSources = useAddonDecks ? Player.ExtensionSettings.MoonCE.Decks.DeckName : Player.Game.ClubCard.DeckName;
    return decksSources;
}

/**
 * Returns the list of decks (raw encoded strings) based on the selected storage mode.
 *
 * @returns {string[]} An array of encoded deck data strings.
 */
export function GetDecksList() {
    const useAddonDecks = Player.ExtensionSettings?.MoonCE?.Settings?.UseAddonDecks === true;
    let decksSources = useAddonDecks ? Player.ExtensionSettings.MoonCE.Decks.Deck : Player.Game.ClubCard.Deck;
    return decksSources;
}

//#endregion