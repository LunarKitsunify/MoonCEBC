/** Init MoonCE Settings */
const DECK_SLOT_COUNT = 20;
const DefaultMoonSettings = {
    DebugMode: false,
    GameStats: true,
    UseAddonDecks: false,
};

export function InitSettings() {
    let syncNeeded = false;
    if (!Player.ExtensionSettings.MoonCE) {
        Player.ExtensionSettings.MoonCE = {
            Settings: { DebugMode: false, GameStats: true, UseAddonDecks: false },
            Decks: { Deck: [], DeckName: [] }
        };
        InitMoonDefaultDecks();
        syncNeeded = true;
    }

    const moonCe = Player.ExtensionSettings.MoonCE;

    if (!moonCe.Settings) {
        moonCe.Settings = { ...DefaultMoonSettings };
        syncNeeded = true;
    } else {
        // Add the missing fields and mark what needs to be synchronized
        const missingSettings = Object.entries(DefaultMoonSettings).filter(
            ([key]) => moonCe.Settings[key] === undefined
        );

        if (missingSettings.length > 0) {
            Object.assign(moonCe.Settings, Object.fromEntries(missingSettings));
            syncNeeded = true;
        }
    }

    if (!moonCe.Decks) {
        moonCe.Decks = { Deck: [], DeckName: [] };
        InitMoonDefaultDecks();
        syncNeeded = true;
    }

    if (syncNeeded)
        ServerPlayerExtensionSettingsSync("MoonCE");
}

/** Fills MoonCE.Decks with 20 empty decks and default names if missing */
function InitMoonDefaultDecks() {
    for (let i = 0; i < DECK_SLOT_COUNT; i++)
        if (!Player.ExtensionSettings.MoonCE.Decks.DeckName[i])
            Player.ExtensionSettings.MoonCE.Decks.DeckName[i] = `Moon Deck #${i + 1}`;
    //TODO Don't forget to update the GetDeckData code later so that it can grab decks from here.
}