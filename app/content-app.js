(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(r,t,a){return t&&e(r.prototype,t),a&&e(r,a),r}}(),CensorDataAccess=exports.CensorDataAccess=function(){function e(){_classCallCheck(this,e),this.CensorStatusKey="CensorStatusKey",this.CensorTriggerWarningKey="CensorTriggerWarningKey",this.CensorDebaucheryKey="CensorDebaucheryKey",this.defaultTriggerWarnings=["[politics]"],this.defaultDebauchery={"sam stauffer":"༼ つ ◕_◕ ༽つ"}}return _createClass(e,[{key:"GetTriggerWarnings",value:function(){var e=localStorage.getItem(this.CensorTriggerWarningKey);return null===e||""===e||"null"===e?this.defaultTriggerWarnings:e.split(",")}},{key:"GetDebauchery",value:function(){var e=localStorage.getItem(this.CensorDebaucheryKey);if(null===e||""===e||"null"===e)return this.defaultDebauchery;try{return JSON.parse(e)}catch(r){return console.error("unable to parse ",e,r),localStorage.clear(),this.defaultDebauchery}}},{key:"UpdateTriggerWarnings",value:function(e){localStorage.setItem(this.CensorTriggerWarningKey,e)}},{key:"UpdateDebauchery",value:function(e){localStorage.setItem(this.CensorDebaucheryKey,JSON.stringify(e))}},{key:"IsCensorEnabled",value:function(){var e=localStorage.getItem(this.CensorStatusKey);return null===e||""===e||"true"===e}},{key:"UpdateCensorStatus",value:function(e){localStorage.setItem(this.CensorStatusKey,e)}}]),e}();
},{}],2:[function(require,module,exports){
"use strict";function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(n,t,i){return t&&e(n.prototype,t),i&&e(n,i),n}}(),CensorElements=exports.CensorElements=function(){function e(){_classCallCheck(this,e);var n={icon:"censor-icon",menu:"censor-menu",spanLeft:"censor-span-left",inputLeft:"censor-input-left",spanRight:"censor-span-right",inputRight:"censor-input-right"},t=document.createElement("div");document.body.appendChild(t),t.outerHTML="<div style='display: none'>\n            <img id='"+n.icon+"' src='"+this.getSrc("app/resources/icon-large.png")+"' >\n            <div id='"+n.menu+"'>\n                    <span id='"+n.spanLeft+"' > Replace <input id='"+n.inputLeft+"' type='text' placeholder='[politics]' /> </span>\n                    <span id='"+n.spanRight+"'> With <input type='text' placeholder='kittens' id='"+n.inputRight+"' /> </span> \n            </div>\n        </div>",this.icon=new CensorElement(document.getElementById(n.icon)),this.menu=new CensorElement(document.getElementById(n.menu)),this.inputLeft=new CensorElement(document.getElementById(n.inputLeft)),this.inputRight=new CensorElement(document.getElementById(n.inputRight))}return _createClass(e,[{key:"getSrc",value:function(e){return chrome.extension?chrome.extension.getURL(e):e}}]),e}(),CensorElement=function(){function e(n){_classCallCheck(this,e),this.element=n}return _createClass(e,[{key:"Display",value:function(){document.body.appendChild(this.element)}},{key:"Remove",value:function(){document.body.contains(this.element)&&document.body.removeChild(this.element)}}]),e}();
},{}],3:[function(require,module,exports){
"use strict";function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0}),exports.CensorService=void 0;var _createClass=function(){function e(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}}(),_censorDataAccess=require("./censor-data-access.js"),CensorService=exports.CensorService=function(){function e(){var n=this;_classCallCheck(this,e),this.CensorDB=new _censorDataAccess.CensorDataAccess,this.facebookOffenders=[];var t=null;this.teenageMutant=new MutationObserver(function(e){var r=function(){return e.forEach(function(e){return n._CensorDom()})};clearTimeout(t),t=setTimeout(function(){return r()},1e3)})}return _createClass(e,[{key:"Start",value:function(){this._CensorDom(),this.teenageMutant.observe(document.body,{childList:!0}),this.CensorDB.UpdateCensorStatus(!0)}},{key:"Stop",value:function(){this.teenageMutant.disconnect(),this.CensorDB.UpdateCensorStatus(!1),this.facebookOffenders.forEach(function(e){e.innerHTML=e.previousContents})}},{key:"Update",value:function(e,n){if(e=e.toLowerCase(),n=n.toLowerCase(),""!==e&&""!==n){if("kittens"===n){var t=this.CensorDB.GetTriggerWarnings();if(t.indexOf(e)>=0)return;return t.push(e),void this.CensorDB.UpdateTriggerWarnings(t)}var r=this.CensorDB.GetDebauchery();r[e]=n,this.CensorDB.UpdateDebauchery(r)}}},{key:"Delete",value:function(){this.CensorDB.UpdateDebauchery(null),this.CensorDB.UpdateTriggerWarnings(null)}},{key:"ShouldRunOnPageLoad",value:function(){return this.CensorDB.IsCensorEnabled()}},{key:"_CensorDom",value:function(){for(var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:document.body,t=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);t.nextNode();)!function(){var n=t.currentNode.nodeValue.toLowerCase().trim();e.CensorDB.GetTriggerWarnings().forEach(function(r){if(n.includes(r)&&t.currentNode)if("www.facebook.com"==window.location.hostname){var o=e._GetOffendingFacebookPost(t.currentNode);null!==o&&e.facebookOffenders.push(o)}else t.currentNode.parentElement&&(t.currentNode.parentElement.innerHTML=e._GetRandomKittenGif())});var r=e.CensorDB.GetDebauchery();Object.keys(r).forEach(function(e){e=e.toLowerCase().trim(),n.includes(e)&&(t.currentNode.nodeValue=n.replace(e,r[e]))})}();this.facebookOffenders.forEach(function(n){n.firstChild&&"censor-kitty-photo"===n.firstChild.id||(n.previousContents=n.innerHTML,n.innerHTML=e._GetRandomKittenGif())})}},{key:"_GetOffendingFacebookPost",value:function(e){for(;(e=e.parentElement)&&!e.classList.contains("userContentWrapper"););return e}},{key:"_GetRandomKittenGif",value:function(){return'<img id="censor-kitty-photo" src="https://thecatapi.com/api/images/get?format=src&type=jpg&size=large&category=boxes"/>'}}]),e}();
},{"./censor-data-access.js":1}],4:[function(require,module,exports){
"use strict";var _contentScript=require("./content-script.js"),censor=new _contentScript.Censor;
},{"./content-script.js":5}],5:[function(require,module,exports){
"use strict";function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Censor=void 0;var _createClass=function(){function e(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(n,t,i){return t&&e(n.prototype,t),i&&e(n,i),n}}(),_censorService=require("../censor-service.js"),_censorElements=require("../censor-elements.js"),Censor=exports.Censor=function(){function e(){var n=this;_classCallCheck(this,e),this.service=new _censorService.CensorService;var t=new _censorElements.CensorElements;this.icon=t.icon,this.menu=t.menu,this.inputLeft=t.inputLeft,this.inputRight=t.inputRight,!0===this.service.ShouldRunOnPageLoad()&&(this.icon.Display(),this.service.Start()),chrome.runtime.onMessage&&chrome.runtime.onMessage.addListener(function(e){return n.OnBrowserIconClick(e.enableCensor)}),this.SetupCensorMenu()}return _createClass(e,[{key:"OnBrowserIconClick",value:function(e){!0===e?(this.icon.Display(),this.service.Start()):!1===e&&(this.icon.Remove(),this.menu.Remove(),this.service.Stop())}},{key:"SetupCensorMenu",value:function(){var e=this;this.icon.element.onclick=function(){e.menu.Display(),e.icon.Remove()},this.menu.element.onclick=function(){e.menu.Remove(),e.icon.Display()},this.inputLeft.element.onmouseover=function(){return e.inputLeft.element.focus()},this.inputLeft.element.onclick=function(e){return e.stopPropagation()},this.inputRight.element.onmouseover=function(){return e.inputRight.element.focus()},this.inputRight.element.onclick=function(e){return e.stopPropagation()}}}]),e}();
},{"../censor-elements.js":2,"../censor-service.js":3}]},{},[4]);
