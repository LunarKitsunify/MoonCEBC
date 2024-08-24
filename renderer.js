export function createUI() {
  const elements = {
    showButton: document.createElement("button"),
  };

  showButton.textContent = "Show Main Window";
  showButton.style.position = "absolute";
  showButton.style.top = "10px";
  showButton.style.left = "50%";
  showButton.style.transform = "translateX(-50%)";
  showButton.style.padding = "10px 20px";
  showButton.style.background = "red";
  document.body.appendChild(showButton);
}
