// todo: transpile and minify js, point manifest at transpiled files

'use strict';

// two things: h3's styled differently + on hover / on focus events tied to the textboxes...

class SettingsService {
    constructor(SettingsDataAccess) {

        this.db = SettingsDataAccess;
        this.timesInvoked = 1;

        this.cssElements =
            {
                popup: "plugin-popup",
                spans: "plugin-spans",
                textBoxLeft: "plugin-text-box-left",
                textBoxRight: "plugin-text-box-right",
                imageLarge: "plugin-image-large",
                saveButton: "plugin-save-button",
                textArea: "plugin-text-area"
            }

        this.ApplySettings();

        // todo: pass in chrome API as dependency and mock it in the unit tests 
        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { if (request.displaySettings) plugin.DisplaySettings(); });

        // todo: research way to optimize this without N+1 looping + limit to run only once a second
        new MutationObserver(mutations => { this.ApplySettings(); }).observe(document.body, { childList: true });
    }

    ApplySettings(domToParse = document.body) {

        let start = performance.now();

        let settings = this.db.GetSettings(), ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);

        while (ent.nextNode()) {

            // this.db.GetSettings().forEach((word, definition) => ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, definition); );
            Object.keys(settings).forEach(word => { ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, settings[word]); });

        }

        // console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);
    }

    DisplaySettings() {

        let popup = document.getElementById(this.cssElements.popup);

        if (popup) return popup.style.visibility = popup.style.visibility ? "" : "hidden"; // show / hide

        let settingsFromDb = this.db.GetSettings(), spans = "";

        Object.keys(settingsFromDb).forEach(word => {

            spans += `<span class="${this.cssElements.spans}"> ${word} is ${settingsFromDb[word]} and </span>`;

        });

        popup = document.createElement("div");

        popup.innerHTML =

            `<div id=${this.cssElements.popup} class="${this.cssElements.popup}">

            <marquee class=""> ${spans} </marquee>

            <div class=""> 
            
                <input class="${this.cssElements.textBoxLeft}" type="text" value="Life"/>

                is

                <input class="${this.cssElements.textBoxRight}" type="text" value="A Dream"/>

            </div>

            <div>
                <img class="${this.cssElements.imageLarge}" src="${chrome.extension ? chrome.extension.getURL("icon-large.png") : "icon-large.png"}"/>

                <button id=${this.cssElements.saveButton} class="${this.cssElements.saveButton}"> Stay Strange, </button>
            </div>

            <textarea class="${this.cssElements.textArea}"> ${this.db.GetNotes()} </textarea>

         </div>`;

        document.body.appendChild(popup);

        document.getElementById(this.cssElements.saveButton).addEventListener("click", () => { this.SaveSettings(); });
    }

    SaveSettings() {
        let popup = document.getElementById(this.cssElements.popup);
        return popup.style.visibility = "hidden"; // hide
    }
}

// todo: have this callout to an API so data can persist accross clients
class SettingsDataAccess {
    constructor() {

        this.storageKey = "7DCF8FAAC5ECB6FF17DF5487735A7";
        this.notesKey = "8B7C91137E2AFE924FBFBB3E6FE71";

        this.defaultSettings = { "Donald Trump": "A Mad Scientist", "Hillary Clinton": "A Six Foot Tall Giant Robot" }; // todo refactor this to use a map instead of key value object
        // this.defaultSettings = new Map().set("Donald Trump", "A Mad Scientist").set("Hillary Clinton", "A Six Foot Tall Giant Robot");
    }

    GetSettings() {

        let settings = localStorage.getItem(this.storageKey);

        try {
            // return new Map(JSON.parse(settings));
            let parsed = JSON.parse(settings);
            if (parsed && typeof parsed === 'object') return parsed;
        }
        catch (error) {
            // console.warn(`${error.message} while parsing: ${settings}`);
        }

        return this.defaultSettings;
    }

    UpdateSettings(settings) {

        // localStorage.setItem(this.storageKey, JSON.stringify(Array.from(settings.entries()));
        localStorage.setItem(this.storageKey, JSON.stringify(settings));

    }

    GetNotes() {
        return localStorage.getItem(this.notesKey);
    }

    UpdateNotes(notes) {
        localStorage.setItem(this.notesKey, settings);
    }
}