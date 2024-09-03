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
// @icon data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjxzdmcgaGVpZ2h0PSI4MDBweCIgd2lkdGg9IjgwMHB4IiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiANCgkgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGNpcmNsZSBzdHlsZT0iZmlsbDojMjYzQTdBOyIgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojMTIxMTQ5OyIgZD0iTTI3NC4yNTMsNTExLjM0NWMxMDEuNjMzLTcuMTYxLDE4Ni44NzgtNzMuNjQyLDIyMS4zNDQtMTY1LjAzNkwyMzguNDExLDg5LjEyMmwtMTAxLjM2LDYyLjg2OQ0KCWwtMzIuNzU0LDE2OC45NDNsMjguMzg5LDQ4Ljg0M0wyNzQuMjUzLDUxMS4zNDV6Ii8+DQo8cGF0aCBzdHlsZT0iZmlsbDojRkZDNjFCOyIgZD0iTTMwNS43NzgsMzQxLjMzM2MtNzQuNjE5LDAtMTM1LjExMS02MC40OTItMTM1LjExMS0xMzUuMTExYzAtNTAuMDc5LDI3LjI2Ny05My43NjIsNjcuNzQ0LTExNy4xDQoJQzE1NC4wMDksOTcuOTE0LDg4LjIwNywxNjkuMjcsODguMjA3LDI1NmMwLDkyLjY3LDc1LjEyNCwxNjcuNzkzLDE2Ny43OTMsMTY3Ljc5M2M4Ni43MywwLDE1OC4wODYtNjUuODAzLDE2Ni44NzgtMTUwLjIwNA0KCUMzOTkuNTM5LDMxNC4wNjYsMzU1Ljg1NywzNDEuMzMzLDMwNS43NzgsMzQxLjMzM3oiLz4NCjxwYXRoIHN0eWxlPSJmaWxsOiNFQUEyMkY7IiBkPSJNMzA1Ljc3OCwzNDEuMzMzYy0zNy4wMTcsMC03MC41NDYtMTQuODk4LTk0Ljk0OS0zOS4wMTJsLTcyLjg5NCw3Mi44OTQNCgljMzAuMzE4LDMwLjAyNyw3Mi4wMjMsNDguNTc4LDExOC4wNjUsNDguNTc4Yzg2LjczLDAsMTU4LjA4Ni02NS44MDMsMTY2Ljg3OC0xNTAuMjA0DQoJQzM5OS41MzksMzE0LjA2NiwzNTUuODU3LDM0MS4zMzMsMzA1Ljc3OCwzNDEuMzMzeiIvPg0KPC9zdmc+
// @grant none
// @run-at document-end
// ==/UserScript==

/*import(
  `https://lunarkitsunify.github.io/MoonCEBC/MoonCEBC.js?v=${(
    Date.now() / 10000
  ).toFixed(0)}`
);*/

(function () {
  "use strict";
  var script = document.createElement("script");
  script.setAttribute("crossorigin", "anonymous");
  script.src = "https://lunarkitsunify.github.io/MoonCEBC/MoonCEBCBeta.js";
  document.head.appendChild(script);
})();
