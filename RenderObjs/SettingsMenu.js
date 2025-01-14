/** 
 * Creates a modal window and returns an object to control it.
 * @param {string} id - Unique identifier for the modal window.
 * @param {HTMLElement} parent - The parent element where the modal will be appended.
 * @param {string} titleText - The title text displayed in the modal header.
 * @returns {object} - Object with methods to open, close, and add content to the modal.
 */
export function createModal(id, parent, titleText) {
    // Check if a modal with the given ID already exists
    if (document.getElementById(id)) {
        console.warn(`A modal with ID "${id}" already exists.`);
        return null;
    }

    // Create the overlay (background) for the modal
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Dark overlay
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.visibility = 'hidden'; // Initially hidden
    parent.appendChild(overlay);
    
    // Create the modal container
    const modal = document.createElement('div');
    modal.style.width = '60%';
    modal.style.height = `80%`;
    modal.style.padding = '20px';
    modal.style.backgroundColor = '#1e1e1e'; // Dark gray background for the modal
    modal.style.color = '#ffffff'; // White text color
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    //modal.style.gap = '15px';
    overlay.appendChild(modal);


    //#region Header

    // Create a header container for the title and close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '15px';
    header.style.padding = '10px'; // Padding inside the header
    header.style.backgroundColor = '#2e2e2e'; // Darker background for the header
    header.style.borderBottom = '1px solid white'; // Line separating the header from the content
    header.style.borderRadius = '8px'; // Rounded top corners

    // Add the title to the header
    const title = document.createElement('h2');
    title.textContent = titleText;
    title.style.height = '20%';
    title.style.width = '100%';
    title.style.margin = '0';
    title.style.margin = '0 auto'; // Center the title horizontally
    title.style.textAlign = 'center';
    title.style.color = '#ffffff'; // White text color
    header.appendChild(title);

    // Add a close button to the header
    const closeButton = document.createElement('button');
    closeButton.textContent = '×'; // Icon for the close button
    closeButton.style.fontSize = '30px'; // Larger font for better visibility
    closeButton.style.fontWeight = 'bold';
    closeButton.style.color = '#ffffff'; // White color for the cross
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '10px';
    closeButton.style.padding = '0';
    closeButton.addEventListener('click', () => {
        modalObj.clearContent(); // Clear dynamic content on close
        modalObj.close();
    });
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.color = '#ff4444'; // Change to red on hover
        closeButton.style.transform = 'scale(1.2)'; // Slightly enlarge the button
        closeButton.style.transition = 'transform 0.2s ease, color 0.2s ease'; // Smooth transition
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.color = '#ffffff'; // Restore original color
        closeButton.style.transform = 'scale(1)'; // Restore original size
    });
    // Append the close button to the header
    header.appendChild(closeButton);

    // Add the header to the modal
    modal.appendChild(header);

    //#endregion


    //#region Content

    // Create the content container
    const content = document.createElement('div');
    content.style.flex = '1'; // Fill available space
    content.style.display = 'flex';
    content.style.flexDirection = 'column'; // Default to vertical layout
    content.style.overflow = 'hidden'; // Prevent overflow
    content.style.backgroundColor = '#1e1e1e';
    modal.appendChild(content);

    //#endregion


    // Object to control the modal window
    const modalObj = {
        element: overlay, // Reference to the overlay
        content: modal,   // Reference to the modal content
        open: () => {     // Opens the modal
            overlay.style.visibility = 'visible';
        },
        close: () => {    // Closes the modal
            overlay.style.visibility = 'hidden';
        },
        clearContent: () => {
            overlay.remove();
        },
        addMenuContainer: ( direction = 'row') => {
            const menuContainer = document.createElement('div');
            menuContainer.style.flex = '1';
            menuContainer.style.display = 'flex';
            menuContainer.style.flexDirection = direction;
            menuContainer.style.gap = '10px';
            menuContainer.style.padding = '10px';
            menuContainer.style.overflowY = direction === 'column' ? 'auto' : 'hidden'; // Вертикальная прокрутка для столбцов
            menuContainer.style.overflowX = direction === 'row' ? 'auto' : 'hidden'; // Горизонтальная прокрутка для строк
            menuContainer.style.backgroundColor = '#1e1e1e';
            content.style.flexDirection = direction;
            content.appendChild(menuContainer);
            return menuContainer;
        }
    };

    return modalObj; // Return the control object
}

/** 
 * Populates the modal with grouped settings and links them to an external state.
 * Adds different types of input elements based on the provided settings data.
 * Includes a subtle line between settings for better separation.
 * @param {object} parent - The modal object returned by createModal.
 * @param {Array} settingsData - Array of groups and their settings.
 */
export function createSettingsMenu(parent, settingsData) {
    if (!parent) {
        console.error('Invalid modal object provided.');
        return;
    }

    settingsData.forEach(group => {
        const groupContainer = document.createElement('div');
        groupContainer.style.marginBottom = '20px';
        groupContainer.style.padding = '25px';
        groupContainer.style.border = '1px solid #444';
        groupContainer.style.borderRadius = '8px';
        groupContainer.style.backgroundColor = '#2e2e2e';

        const groupTitle = document.createElement('h3');
        groupTitle.textContent = group.groupName;
        groupTitle.style.margin = '0 0 15px 0';
        groupTitle.style.padding = '10px';
        groupTitle.style.backgroundColor = '#1e1e1e';
        groupTitle.style.color = '#ffffff';
        groupTitle.style.borderRadius = '8px';
        groupTitle.style.border = '1px solid #444';
        groupTitle.style.textAlign = 'center';
        groupContainer.appendChild(groupTitle);

        group.settings.forEach(setting => {
            const settingContainer = document.createElement('div');
            settingContainer.style.display = 'flex';
            settingContainer.style.flexDirection = 'column';
            settingContainer.style.marginBottom = '15px';
            settingContainer.style.paddingBottom = '10px';
            settingContainer.style.borderBottom = '1px solid #444';

            const topRow = document.createElement('div');
            topRow.style.display = 'flex';
            topRow.style.alignItems = 'center';
            topRow.style.width = '100%';

            const settingName = document.createElement('label');
            settingName.textContent = setting.name;
            settingName.title = setting.fullDescription;
            settingName.style.marginRight = '10px';
            settingName.style.cursor = 'help';
            settingName.style.color = '#ffffff';
            topRow.appendChild(settingName);

            let inputElement;
            if (setting.type === 'checkbox') {
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.style.marginLeft = 'auto';
                inputElement.style.transform = 'scale(1.5)';
                inputElement.checked = setting.defaultValue || false; // Default value if provided
            } else if (setting.type === 'text') {
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.style.marginLeft = 'auto';
                inputElement.style.padding = '5px';
                inputElement.style.width = '200px';
                inputElement.value = setting.defaultValue || ''; // Default value if provided
            } else if (setting.type === 'dropdown') {
                inputElement = document.createElement('select');
                inputElement.style.marginLeft = 'auto';
                inputElement.style.padding = '5px';
                inputElement.style.width = '200px';
                (setting.options || []).forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    inputElement.appendChild(optionElement);
                });
                inputElement.value = setting.defaultValue || (setting.options ? setting.options[0] : '');
            } else if (setting.type === 'button') {
                inputElement = document.createElement('button');
                inputElement.textContent = setting.name;
                inputElement.style.marginLeft = 'auto';
                inputElement.style.padding = '5px 10px';
                inputElement.style.backgroundColor = '#444';
                inputElement.style.color = '#fff';
                inputElement.style.border = 'none';
                inputElement.style.borderRadius = '4px';
                inputElement.style.cursor = 'pointer';
            
                // Логика при нажатии кнопки
                inputElement.addEventListener('click', () => {
                    if (typeof setting.onClick === 'function') {
                        setting.onClick();
                    }
                });
            }

            // Add change listener
            inputElement.addEventListener('change', () => {
                const newValue = inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;

                // Trigger the onChange callback if provided
                if (typeof setting.onChange === 'function') {
                    setting.onChange(newValue);
                }
            });

            topRow.appendChild(inputElement);

            const shortDesc = document.createElement('span');
            shortDesc.textContent = setting.shortDescription;
            shortDesc.style.color = '#aaaaaa';
            shortDesc.style.fontSize = '0.85em';
            shortDesc.style.marginTop = '5px';
            settingContainer.appendChild(topRow);
            settingContainer.appendChild(shortDesc);

            groupContainer.appendChild(settingContainer);
        });

        parent.appendChild(groupContainer);
    });
}

