<h2 align="center">
  Moon Cards Editor BC
</h2>

<h3>
  Features:

- View and edit card decks in online room.
- The character limit for the deck name has been increased from 20 to 30.
</h3>

![openAddonWindow](https://github.com/user-attachments/assets/8a0d5a90-3fde-477b-b1e1-ce09b2d1e8ec)

<h2>Installation</h2>

### FUSAM

In a future update.

### Tampermonkey or ViolentMonkey

https://github.com/LunarKitsunify/MoonCEBC/blob/main/MoonCEBCLoader.user.js

### Bookmark

```javascript
javascript: (() => {
  fetch("https://lunarkitsunify.github.io/MoonCEBC/MoonCEBC.js")
    .then((r) => r.text())
    .then((r) => eval(r));
})();
```
