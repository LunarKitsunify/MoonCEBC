import { DrawAddonButtonWithImage , CreateCustomDropdown } from "./UIObject.js"
let selectedDeck = null;
let decks = null;
// const basePath = new URL(".", import.meta.url).href;
// const MoonDeckIcon = new URL("src/Images/MoonDeckIcon.png", basePath).href;

const basePath = new URL("../src/Images/", import.meta.url).href;
const MoonDeckIcon = new URL("MoonDeckIcon.png", basePath).href;
let SwitchDeckStorageModeIcon = null;
/**
 * @type {{
 *   UpdateOptions: (newOptions: string[]) => void,    // Replace the list of options
 *   SetValue: (value: string) => void,                // Manually set the selected value
 *   GetValue: () => string,                           // Get the currently selected value
 *   Wrapper: HTMLDivElement                           // Root dropdown container
 * }}
 */
let DropDownRef;
//#region UI coordinates

/** Center X between 550 and 1150 */
const RectCenterX = 850;
/** gap between row */
const Gap = 15;
/** row height */
const ElementsHeight = 60;
const ButtonWidth = 60;

//### Row 1 ###
/**
 * Deck Loader Title Coordinates
 * @type {UIRect}
 */
const TitleRect = createCenteredRect(340, 300, 32);
//#############

//### Row 2 ###
/**
 * Deck Loader Info Button Coordinates
 * @type {UIRect}
 */
const InfoButtonRect = createRect(RectCenterX - ButtonWidth - Gap, TitleRect.y + TitleRect.h + Gap, ButtonWidth, ElementsHeight);
/**
 * Sources Button Coordinates
 * @type {UIRect}
 */
const SourcesButtonRect = createRect(RectCenterX + Gap, TitleRect.y + TitleRect.h + Gap, ButtonWidth, ElementsHeight);
//#############

//### Row 3 ###
const DecksDropdownRect = createCenteredRect(InfoButtonRect.y + InfoButtonRect.h + Gap, 300, ElementsHeight);
//#############
//#endregion

//### Row 4 ###
const StartButtonRect = createCenteredRect(DecksDropdownRect.y + DecksDropdownRect.h + Gap, 240, 75);
//#############

export function DeckSelectorRun() {
	SwitchDeckStorageModeIcon = Player.ExtensionSettings.MoonCE.Settings.UseAddonDecks ? MoonDeckIcon : "Icons/Logo.png";

	DrawRect(548, 298, 604, 404, "White");
	DrawRect(550, 300, 600, 400, "Black");
	
	//##### Title
	DrawTextWrap("Choose a deck", TitleRect.x, TitleRect.y, TitleRect.w, TitleRect.h, "White");
	//#####
	
	//##### Deck Info
	DrawAddonButtonWithImage(InfoButtonRect.x, InfoButtonRect.y, InfoButtonRect.w, InfoButtonRect.h,
		"White", "Icons/Public.png", "Check current deck");

	
	//##### decks sources button and dropdown
	//decks sources button
	DrawAddonButtonWithImage(SourcesButtonRect.x, SourcesButtonRect.y, SourcesButtonRect.w, SourcesButtonRect.h,
		"White", SwitchDeckStorageModeIcon, "Switch deck storage mode : BC or Addon");
	
	//dropdown
	const container = document.getElementById("MoonDecksDropdown");
	if (container) {
		ElementPositionFix("MoonDecksDropdown", 20, DecksDropdownRect.x, DecksDropdownRect.y, DecksDropdownRect.w, DecksDropdownRect.h);
	} else {
		decks = GetDeckNamesList();
		//ElementCreateDropdown("MoonDecksDropdown", GetDeckNamesList(), DeckSelectedOnChange);
		DropDownRef = CreateCustomDropdown("MoonDecksDropdown", decks, DeckSelectedOnChange);
		ElementPositionFix("MoonDecksDropdown", 20, DecksDropdownRect.x, DecksDropdownRect.y, DecksDropdownRect.w, DecksDropdownRect.h);
		selectedDeck = decks[0];
	}
	//#####
	
	//##### Start Button
	DrawButton(StartButtonRect.x,StartButtonRect.y , StartButtonRect.w, StartButtonRect.h, "Start", "White");
	//#####
	
}

export function DeckSelectorClick() {
	if (MouseIn(SourcesButtonRect.x, SourcesButtonRect.y, SourcesButtonRect.w, SourcesButtonRect.h))
		SwitchDeckStorageMode();
}

function DeckSelectedOnChange() {
	selectedDeck = this.value;
	console.log(this.value);
}

function GetDeckNamesList() {
	const useAddonDecks = Player.ExtensionSettings?.MoonCE?.Settings?.UseAddonDecks === true;
	let decksSources = useAddonDecks ? Player.ExtensionSettings.MoonCE.Decks.DeckName : Player.Game.ClubCard.DeckName;
	return decksSources;
}

function SwitchDeckStorageMode() {
	const settings = Player.ExtensionSettings?.MoonCE?.Settings;
    if (!settings) return;

    settings.UseAddonDecks = !settings.UseAddonDecks;
	ServerPlayerExtensionSettingsSync("MoonCE");
	
	SwitchDeckStorageModeIcon = Player.ExtensionSettings.MoonCE.Settings.UseAddonDecks ? MoonDeckIcon : "Icons/Logo.png";

	const newDecks = GetDeckNamesList();
	DropDownRef.UpdateOptions(newDecks);
	DropDownRef.SetValue(newDecks[0]);
}

function createCenteredRect(y, w, h) {
	return {
		x: RectCenterX - w / 2,
		y,
		w,
		h
	};
}

function createRect(x, y, w, h) {
	return {
		x,
		y,
		w,
		h
	};
}

/**
 * @typedef {Object} UIRect
 * Represents a rectangular UI area.
 * @property {number} x - Horizontal position (X)
 * @property {number} y - Vertical position (Y)
 * @property {number} w - Width of the rectangle
 * @property {number} h - Height of the rectangle
 */