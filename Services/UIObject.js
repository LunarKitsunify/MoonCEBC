import * as Common from "./Common.js";
//#region DOM

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
export function CreateButton(
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
                    ? `<span style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; font-size: ${Common.TopPanelTextSize};">${content}</span>`
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

/**
 * Creates a custom dropdown element and appends it to the document.
 *
 * @returns {{
 *   UpdateOptions: (newOptions: string[]) => void,
 *   SetValue: (value: string) => void,
 *   GetValue: () => string,
 * 	 GetIndex: () => number,
 *   Wrapper: HTMLDivElement
 * }}
 */
export function CreateCustomDropdown(id, optionsList, onChange) {
	const existing = document.getElementById(id);
	if (existing) existing.remove();

	let currentOptions = optionsList;

	const wrapper = document.createElement("div");
	wrapper.id = id;
	wrapper.style.position = "fixed";
	wrapper.style.fontSize = "1.5em";
	wrapper.style.userSelect = "none";
	wrapper.style.display = "flex";
	wrapper.style.flexDirection = "column";
	wrapper.style.boxSizing = "border-box";

	const selected = document.createElement("div");
	selected.style.flex = "0 0 40%";
	selected.style.padding = "2% 4%";
	selected.style.background = "white";
	selected.style.color = "black";
	selected.style.border = "1px solid #00aaff";
	selected.style.cursor = "pointer";
	selected.style.display = "flex";
	selected.style.alignItems = "center";
	selected.style.justifyContent = "space-between";

	const selectedLabel = document.createElement("span");
	selectedLabel.textContent = optionsList[0] ?? "";

	const arrow = document.createElement("span");
	arrow.textContent = "▼";
	arrow.style.marginLeft = "auto";
	arrow.style.fontSize = "0.8em";
	arrow.style.pointerEvents = "none";

	selected.appendChild(selectedLabel);
	selected.appendChild(arrow);

	selected.onclick = () => {
		options.style.display = options.style.display === "block" ? "none" : "block";
	};

	wrapper.appendChild(selected);

	const options = document.createElement("div");
	options.style.flex = "1";
	options.style.background = "#f0f0f0";
	options.style.border = "1px solid #00aaff";
	options.style.overflowY = "auto";
	options.style.display = "none";
	options.style.position = "absolute";
	options.style.top = "55%";
	options.style.left = "0";
	options.style.right = "0";
	options.style.boxSizing = "border-box";
	options.style.maxHeight = "400%";

	function UpdateDropdownOptions(newOptions) {
		currentOptions = newOptions;
		options.innerHTML = "";

		newOptions.forEach(opt => {
			const el = document.createElement("div");
			el.textContent = opt;
			el.style.padding = "2% 4%";
			el.style.cursor = "pointer";
			el.style.background = "#f0f0f0";
			el.style.color = "black";
			el.onmouseenter = () => el.style.background = "#dcdcdc";
			el.onmouseleave = () => el.style.background = "#f0f0f0";
			el.onclick = () => {
				selectedLabel.textContent = opt;
				options.style.display = "none";
				if (onChange) onChange(opt);
			};
			options.appendChild(el);
		});
	}

	UpdateDropdownOptions(currentOptions);
	wrapper.appendChild(options);
	document.body.appendChild(wrapper);

	return {
		UpdateOptions: UpdateDropdownOptions,
		SetValue: (value) => { selectedLabel.textContent = value },
		GetValue: () => selectedLabel.textContent,
		GetIndex: () => currentOptions.indexOf(selectedLabel.textContent),
		Wrapper: wrapper
	};
}


//#endregion


//#region Canvas
/**
 * Draws a button with an image scaled to fit within the button rectangle.
 * Works around default DrawButton's unscaled image rendering.
 *
 * @param {number} Left - X position of the button
 * @param {number} Top - Y position of the button
 * @param {number} Width - Width of the button
 * @param {number} Height - Height of the button
 * @param {string} Color - Background color
 * @param {string} ImageSrc - Path or URL of the image
 * @param {string} [HoveringText] - Optional tooltip text
 * @param {boolean} [Disabled] - Optional disabled flag
 */
export function DrawAddonButtonWithImage(Left, Top, Width, Height, Color, ImageSrc, HoveringText = null, Disabled = false) {
    ControllerAddActiveArea(Left, Top);

    // Draw button rectangle
    MainCanvas.beginPath();
    MainCanvas.rect(Left, Top, Width, Height);
    const hovering = MouseX >= Left && MouseX <= Left + Width && MouseY >= Top && MouseY <= Top + Height;
    MainCanvas.fillStyle = (hovering && !CommonIsMobile && !Disabled) ? "Cyan" : Color;
    MainCanvas.fillRect(Left, Top, Width, Height);
    MainCanvas.lineWidth = 2;
    MainCanvas.strokeStyle = 'black';
    MainCanvas.stroke();
    MainCanvas.closePath();

    // Draw image scaled to button area
    if (ImageSrc) {
        DrawImageEx(ImageSrc, MainCanvas, Left + 2, Top + 2, {
            Width: Width - 4,
            Height: Height - 4
        });
    }

    // Optional tooltip
    if (hovering && HoveringText && !CommonIsMobile && !CommonPhotoMode) {
        DrawHoverElements.push(() => DrawButtonHover(Left, Top, Width, Height, HoveringText));
    }
}
//#endregion

/**
 * Creates a rectangle centered horizontally around RectCenterX.
 *
 * @param {number} y - Top Y coordinate of the rectangle.
 * @param {number} w - Width of the rectangle.
 * @param {number} h - Height of the rectangle.
 * @returns {UIRect} A rectangle object with centered X and given dimensions.
 */
export function CreateCenteredRect(y, w, h) {
	return { x: Common.RectCenterX - w / 2, y, w, h };
}

/**
 * Creates a rectangle with explicit X, Y, width, and height.
 *
 * @param {number} x - Left X coordinate.
 * @param {number} y - Top Y coordinate.
 * @param {number} w - Width of the rectangle.
 * @param {number} h - Height of the rectangle.
 * @returns {UIRect} A rectangle object with specified position and size.
 */
export function CreateRect(x, y, w, h) {
	return { x, y, w, h };
}