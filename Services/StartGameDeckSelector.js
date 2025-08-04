import { DrawAddonButtonWithImage, CreateCustomDropdown, CreateRect, CreateCenteredRect } from "./UIObject.js"
import * as Common from "./Common.js";
let selectedDeckIndex = 0;
let decks = null;
let SwitchDeckStorageModeIcon = null;
/**
 * @type {{
 *   UpdateOptions: (newOptions: string[]) => void,    // Replace the list of options
 *   SetValue: (value: string) => void,                // Manually set the selected value
 *   GetValue: () => string,                           // Get the currently selected value
 * 	 GetIndex: () => number,						   // Get the currently selected deck index 
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
const TitleRect = CreateCenteredRect(340, 300, 32);
//#############

//### Row 2 ###
/**
 * Deck Loader Info Button Coordinates
 * @type {UIRect}
 */
const InfoButtonRect = CreateRect(RectCenterX - ButtonWidth - Gap, TitleRect.y + TitleRect.h + Gap, ButtonWidth, ElementsHeight);
/**
 * Sources Button Coordinates
 * @type {UIRect}
 */
const SourcesButtonRect = CreateRect(RectCenterX + Gap, TitleRect.y + TitleRect.h + Gap, ButtonWidth, ElementsHeight);
//#############

//### Row 3 ###
const DecksDropdownRect = CreateCenteredRect(InfoButtonRect.y + InfoButtonRect.h + Gap, 270, 90);
//#############
//#endregion

//### Row 4 ###
const StartButtonRect = CreateCenteredRect(DecksDropdownRect.y + DecksDropdownRect.h, 240, 75);
//#############

export function DeckSelectorRun() {
	SwitchDeckStorageModeIcon = Player.ExtensionSettings.MoonCE.Settings.UseAddonDecks ? Common.MoonDeckIcon : "Icons/Logo.png";

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
		decks = Common.GetDeckNamesList();
		DropDownRef = CreateCustomDropdown("MoonDecksDropdown", decks, () => { selectedDeckIndex = DropDownRef.GetIndex(); });
		ElementPositionFix("MoonDecksDropdown", 20, DecksDropdownRect.x, DecksDropdownRect.y, DecksDropdownRect.w, DecksDropdownRect.h);
		DropDownRef.SetValue(decks[selectedDeckIndex]);
	}
	//#####
	
	//##### Start Button
	DrawButton(StartButtonRect.x,StartButtonRect.y , StartButtonRect.w, StartButtonRect.h, "Start", "White");
	//#####
	
}

export function DeckSelectorClick(onInfoClick) {
	//Stwitch deck storage mode : BC or Addon
	if (MouseIn(SourcesButtonRect.x, SourcesButtonRect.y, SourcesButtonRect.w, SourcesButtonRect.h))
		SwitchDeckStorageMode();
	//Load deck and start game.
	if (MouseIn(StartButtonRect.x, StartButtonRect.y, StartButtonRect.w, StartButtonRect.h)) {
		const deckIndex = DropDownRef.GetIndex();
		ClubCardLoadDeckNumber(deckIndex);
		ElementRemove("MoonDecksDropdown");
	}
	//Start game click
	if (MouseIn(InfoButtonRect.x, InfoButtonRect.y, InfoButtonRect.w, InfoButtonRect.h))
		onInfoClick(selectedDeckIndex);
}

/**
 * Updated the standard ClubCardLoadDeckNumber function so that it can load decks from the addon.
 */
export function MoonClubCardLoadDeck() {
	const DeckNum = DropDownRef.GetIndex();
	const deckSources = Common.GetDecksList();
	let Deck = [];
	if (deckSources.length > DeckNum && deckSources[DeckNum]?.length >= ClubCardBuilderMinDeckSize && deckSources[DeckNum]?.length <= ClubCardBuilderMaxDeckSize) {
		let msg = TextGet("UsingDeck").replace("PLAYERNAME", CharacterNickname(Player));
		ClubCardMessageAdd(ClubCardMessageType.SYSTEM, null, {}, null, msg);
		for (let i = 0; i < deckSources[DeckNum]?.length; i++)
			Deck.push(deckSources[DeckNum].charCodeAt(i));
	} else {
		let msg = TextGet("NoValidDeckFound").replace("PLAYERNAME", CharacterNickname(Player));
		ClubCardMessageAdd(ClubCardMessageType.SYSTEM, null, {}, null, msg);
		Deck = ClubCardBuilderDefaultDeck.slice();
		}

	ElementRemove("MoonDecksDropdown");

	// Loads the deck and shuffles it
	let Index = ClubCardGetPlayerIndex();
	if (Index >= 0) {
		ClubCardPlayer[Index].Deck = ClubCardShuffle(ClubCardLoadDeck(Deck));
		ClubCardPlayer[Index].FullDeck = ClubCardLoadDeck(Deck);
	}

	// Starts the game with the loaded deck
	if (!ClubCardIsOnline()) {
		const textGetKey = "Start" + ((ClubCardTurnIndex == 0) ? "Player" : "Opponent");
		ClubCardMessageAdd(ClubCardMessageType.SYSTEM, textGetKey);
		ClubCardPlayer[0].Hand.push(ClubCardGetCopyCardByName("Tips"));
		ClubCardPlayer[1].Hand.push(ClubCardGetCopyCardByName("Tips"));
		ClubCardPlayerDrawCard(ClubCardPlayer[0], (ClubCardTurnIndex == 0) ? 5 : 6);
		ClubCardPlayerDrawCard(ClubCardPlayer[1], (ClubCardTurnIndex == 1) ? 5 : 6);
	} else {
		ClubCardPlayer[Index].Hand.push(ClubCardGetCopyCardByName("Tips"));
		ClubCardPlayerDrawCard(ClubCardPlayer[Index], (ClubCardTurnIndex == Index) ? 5 : 6);
	}
	// Syncs online data
	// Only send our own data when we select a deck, otherwise we could overwrite the other
	// player's deck selection if they both select at the same time.
	GameClubCardSyncOnlineData("Action", true);

	// If a card can be won against the NPC
	ClubCardReward = null;
	if (!ClubCardIsOnline() && (ClubCardPlayer[1].Character.IsNpc()))
		for (let Card of ClubCardList)
			if ((Card.Reward === "NPC-" + ClubCardPlayer[1].Character.Name) || (Card.Reward === ClubCardPlayer[1].Character.AccountName)) {
				let Char = String.fromCharCode(Card.ID);
				if ((Player.Game == null) || (Player.Game.ClubCard == null) || (Player.Game.ClubCard.Reward == null) || (Player.Game.ClubCard.Reward.indexOf(Char) < 0)) {
					ClubCardReward = Card;
					break;
				}
			}

	// If a card can be won against the online player
	if (ClubCardIsOnline() && ClubCardIsPlaying())
		for (let Card of ClubCardList)
			if (Card.Reward && ((Card.RewardMemberNumber === ClubCardOnlinePlayerMemberNumber1) || (Card.RewardMemberNumber === ClubCardOnlinePlayerMemberNumber2))) {
				let Char = String.fromCharCode(Card.ID);
				if ((Player.Game == null) || (Player.Game.ClubCard == null) || (Player.Game.ClubCard.Reward == null) || (Player.Game.ClubCard.Reward.indexOf(Char) < 0)) {
					ClubCardReward = Card;
					break;
				}
			}

	// Show the winnable card or start the game right away
	if (ClubCardReward != null) {
		if (ClubCardReward.Type == null) ClubCardReward.Type = "Member";
		ClubCardFocus = { ...ClubCardReward, Location: 'Reward' , AnimationState: 'idle'};
		if (ClubCardPlayer[1].Control === "AI") ClubCardPlayer[1].Hand.push({ ...ClubCardReward });
		ClubCardCreatePopup("TEXT", TextGet("CanWinNewCard") + " " + ClubCardReward.Title, TextGet("Play"), null, "ClubCardAIStart()", null);
		ClubCardOptionSelection = true;
	} else ClubCardAIStart();
}

/**
 * Toggles between using addon-based decks and base-game decks.
 * Syncs the new setting with the server.
 */
function SwitchDeckStorageMode() {
	const settings = Player.ExtensionSettings?.MoonCE?.Settings;
    if (!settings) return;

    settings.UseAddonDecks = !settings.UseAddonDecks;
	ServerPlayerExtensionSettingsSync("MoonCE");
	
	SwitchDeckStorageModeIcon = Player.ExtensionSettings.MoonCE.Settings.UseAddonDecks ? Common.MoonDeckIcon : "Icons/Logo.png";

	selectedDeckIndex = 0;
	const newDecks = Common.GetDeckNamesList();
	DropDownRef.UpdateOptions(newDecks);
	DropDownRef.SetValue(newDecks[0]);
}

/**
 * @typedef {Object} UIRect
 * Represents a rectangular UI area.
 * @property {number} x - Horizontal position (X)
 * @property {number} y - Vertical position (Y)
 * @property {number} w - Width of the rectangle
 * @property {number} h - Height of the rectangle
 */