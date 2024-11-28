// ==UserScript==
// @name Beta MoonCEBC Loader
// @namespace https://www.bondageprojects.com/
// @version 1.0.0
// @description Addon for viewing and customizing card decks without Npc room.
// @author Lunar Kitsunify
// @match http://localhost:*/*
// @match https://bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://bondageprojects.com/*
// @match https://www.bondageprojects.com/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

// import(
//   `https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCBeta.js?v=${(
//     Date.now() / 10000
//   ).toFixed(0)}`
// );

// import('https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCBeta.js')
//   .then((module) => {
//     console.log(module);
//   })
//   .catch((err) => console.error("Failed to load module:", err));


(function () {
  "use strict";
  var script = document.createElement("script");
  script.type = 'module';
  script.setAttribute("crossorigin", "anonymous");
  script.src = "https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCBeta.js";
  document.head.appendChild(script);
})();


