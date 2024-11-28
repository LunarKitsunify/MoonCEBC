const requiredLevelColor = "#FF5733";
const fameTextColor = "#3357FF";
const moneyTextColor = "#006400";

/** 
 * function to draw a card
 * @param {ClubCard} card - ClubCard from BC. 
 * @returns {HTMLElement} The created card element. 
 */
export function createCard(card) {
    //#region fix card null parameter
    let Level =
        card.RequiredLevel == null || card.RequiredLevel <= 1
            ? 1
            : card.RequiredLevel;
    if (card.Type == null) card.Type = "Member";

    //#endregion

    const imgFrameSrc = `Screens/MiniGame/ClubCard/Frame/${card.Type}${card.Reward ? "Reward" : ""}${Level}.png`;
    const imgCardSrc = `Screens/MiniGame/ClubCard/${card.Type}/${card.Name}.png`;

    const cardButton = document.createElement('button');
    cardButton.classList.add('card-button');

    const cardImage = document.createElement('img');
    cardImage.classList.add('card-image');
    cardImage.src = imgCardSrc;
    cardButton.appendChild(cardImage);


    const { nameElement, bottomContainer } = createCardText(card);
    cardButton.appendChild(nameElement);
    cardButton.appendChild(bottomContainer);

    const valuePanel = createCardValuesPanel(card);
    cardButton.appendChild(valuePanel);

    return cardButton;
}

/**
 * @param {Object} card - The card object containing information for creating the panel.
 * @returns {Object} - Object containing the `nameElement` and `bottomContainer`.
 */
function createCardText(card) {

    // Create the card name element
    const cardNameTextElement = document.createElement("div");
    cardNameTextElement.classList.add("card-name");
    cardNameTextElement.textContent = card.Name;

    // Create the bottom container for groups and description
    const bottomContainer = document.createElement("div");
    bottomContainer.classList.add("card-bottom-div");

    // Group text
    let groupText = ClubCardGetGroupText(card.Group);
    if (card.RewardMemberNumber != null)
        groupText += " #" + card.RewardMemberNumber.toString();

    const cardGroupTextElement = document.createElement("div");
    cardGroupTextElement.classList.add("card-group");
    cardGroupTextElement.textContent = groupText;

    // Card description text
    const cardDescriptionTextElement = document.createElement("div");
    cardDescriptionTextElement.classList.add("card-description");
    cardDescriptionTextElement.innerHTML = card.Text;

    // Append group and description to the bottom container
    bottomContainer.appendChild(cardGroupTextElement);
    bottomContainer.appendChild(cardDescriptionTextElement);

    // Return the created elements as an object
    return {
        nameElement: cardNameTextElement,
        bottomContainer: bottomContainer
    };
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
function createCardBoard(iconSrc, textContent, textColor) {
    const board = document.createElement("div");
    board.classList.add("board");

    const textElement = document.createElement("div");
    textElement.classList.add("board-text");
    textElement.textContent = textContent;
    textElement.style.color = textColor;

    const icon = document.createElement("img");
    icon.classList.add("board-icon");
    icon.src = iconSrc;

    board.appendChild(icon);
    board.appendChild(textElement);

    return board;
}

/**
 * Creates a value card panel with the specified attributes and appends it to the parent element.
 * 
 * @param {Object} card - The card object containing information for creating the panel.
 * @returns {HTMLElement} The created ValuesPanel element.
 */
function createCardValuesPanel(card) {
    // Create the main panel
    const valueCardPanel = document.createElement("div");
    valueCardPanel.classList.add("value-card-panel");

    // Add Liability Icon if applicable
    if (card.Group && card.Group.includes("Liability")) {
        const liabilityIcon = document.createElement("img");
        //liabilityIcon.src = "Screens/MiniGame/ClubCard/Bubble/Liability.png";
        liabilityIcon.classList.add("value-card-icon");
        valueCardPanel.appendChild(liabilityIcon);
    }

    // Add Level Board if applicable
    if (card.RequiredLevel > 1) {
        const levelBoard = createCardBoard(
            "Screens/MiniGame/ClubCard/Bubble/Level.png",
            card.RequiredLevel,
            requiredLevelColor
        );
        valueCardPanel.appendChild(levelBoard);
    }

    // Add Fame Board if applicable
    if (card.FamePerTurn != null) {
        const fameBoard = createCardBoard(
            "Screens/MiniGame/ClubCard/Bubble/Fame.png",
            card.FamePerTurn,
            fameTextColor
        );
        valueCardPanel.appendChild(fameBoard);
    }

    // Add Money Board if applicable
    if (card.MoneyPerTurn != null) {
        const moneyBoard = createCardBoard(
            "Screens/MiniGame/ClubCard/Bubble/Money.png",
            card.MoneyPerTurn,
            moneyTextColor
        );
        valueCardPanel.appendChild(moneyBoard);
    }

    return valueCardPanel;
}