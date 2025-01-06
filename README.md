<h2 align="center">
  Moon Cards Editor BC
</h2>

Hello everyone. 
You probably know how annoying it is when you have to go to a special room with NPCs to edit your deck. Or even worse, you can't get into the room with NPCs while tied up. 

This addon is designed to solve both of those issues. And so maybe for other interesting things in the future.

<h3>
  Features:

- View and edit card decks in online room.
- The character limit for the deck name has been increased from 20 to 30.
</h3>

  <summary><h3>Demonstration</h3></summary>
  
 ![openAddonWindow4](https://github.com/user-attachments/assets/2a12b656-c85c-40ac-8be3-68ac4b8043a8)

<h2>Installation</h2>

### 1. FUSAM

The addon is available through the FUSAM Addon Manager.

### 2. [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [ViolentMonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)

Install one of these extensions on your browser and click on the link.

https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCLoader.user.js

### 3. Bookmark

Stable
```javascript
javascript: (() => {
  fetch("https://lunarkitsunify.github.io/MoonCEBC/MoonCEBC.js")
    .then((r) => r.text())
    .then((r) => eval(r));
})();
```

Beta
```javascript
javascript: (() => {
  fetch("https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCBeta.js")
    .then((r) => r.text())
    .then((r) => eval(r));
})();
```
