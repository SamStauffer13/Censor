// todo: transpile and minify js, point manifest at transpiled files

'use strict';

// todo get font working http://stackoverflow.com/questions/12015074/adding-font-face-stylesheet-rules-to-chrome-extension
// use IDs instead of classes for better specificity 
// use place holder text on inputs instead of text values.. 
// get on clicks of spans to populate boxes
// get save button hooked up
// publish app
// polish styles

class SettingsService {
    constructor(SettingsDataAccess) {

        this.db = SettingsDataAccess;
        this.timesInvoked = 1;

        this.cssElements =
            {
                popup: "plugin-popup",
                spanLeft: "plugin-span-left",
                spanRight: "plugin-span-right",
                textBoxLeft: "plugin-text-box-left",
                textBoxRight: "plugin-text-box-right",
                updateButton: "plugin-update-button",
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
            // todo: something like definition == settingsFromDb[settingsFromDb.length] ? and : ""
            spans += `<span class=""> <span id=${this.cssElements.spanLeft} class="${this.cssElements.spanLeft}"> ${word} </span> is <span id=${this.cssElements.spanRight} class="${this.cssElements.spanRight}"> ${settingsFromDb[word]} </span> and </span>`;
        });

        popup = document.createElement("div");

        popup.innerHTML =

            `<div id=${this.cssElements.popup} class="${this.cssElements.popup}">

            <marquee class="${this.cssElements.marquee}"> ${spans} </marquee>

            <div class=""> 
            
                <input id=${this.cssElements.textBoxLeft} class="${this.cssElements.textBoxLeft}" type="text" value="Life"/>

                is

               <input id=${this.cssElements.textBoxRight} class="${this.cssElements.textBoxRight}" type="text" value="A Dream"/>

               <button id=${this.cssElements.updateButton} class="${this.cssElements.updateButton}"> Update </button>

            </div>

            <div>
                <img class="${this.cssElements.imageLarge}" src="${chrome.extension ? chrome.extension.getURL("icon-large.png") : "icon-large.png"}"/>

                <button id=${this.cssElements.saveButton} class="${this.cssElements.saveButton}"> Stay Strange, </button>
            </div>

            <textarea class="${this.cssElements.textArea}"> ${this.db.GetNotes()} </textarea>

         </div>`;

        document.body.appendChild(popup);

        //todo: use popup instead of searching document
        let textBoxLeft = document.getElementById(this.cssElements.textBoxLeft);
        let textBoxRight = document.getElementById(this.cssElements.textBoxRight);
        let updateButton = document.getElementById(this.cssElements.updateButton);
        let saveButton = document.getElementById(this.cssElements.saveButton);

        textBoxLeft.addEventListener("input", () => updateButton.style.visibility = "");
        textBoxRight.addEventListener("input", () => updateButton.style.visibility = "");

        updateButton.addEventListener("click", () => {

            this.UpdateSettings();
            updateButton.style.visibility = "hidden";

        });

        Array.from(document.getElementsByClassName(this.cssElements.spanLeft)).forEach(span => {
            span.addEventListener("click", () => {

                textBoxLeft.value = span.innerHTML;
                updateButton.style.visibility = ""; // todo: why doesn't input event listener fire?

            });
        });

        Array.from(document.getElementsByClassName(this.cssElements.spanRight)).forEach(span => {
            span.addEventListener("click", () => {

                textBoxRight.value = span.innerHTML;
                updateButton.style.visibility = "";
                 
            });
        });

        saveButton.addEventListener("click", () => this.SaveSettings());
        saveButton.addEventListener("mouseover", () => saveButton.innerHTML = "Save & Exit");
        saveButton.addEventListener("mouseout", () => saveButton.innerHTML = "Stay Strange");
    }

    UpdateSettings() {

    }

    SaveSettings() {
        let popup = document.getElementById(this.cssElements.popup);
        popup.style.visibility = "hidden"; // hide
    }
}

// todo: have this callout to an API so data can persist accross clients
class SettingsDataAccess {
    constructor() {

        this.storageKey = "7DCF8FAAC5ECB6FF17DF5487735A7";
        this.notesKey = "8B7C91137E2AFE924FBFBB3E6FE71";

        this.defaultSettings = { "Donald Trump": "A Mad Scientist", "Hillary Clinton": "A Six Foot Tall Giant Robot" }; // todo refactor this to use a map instead of key value object
        // this.defaultSettings = new Map().set("Donald Trump", "A Mad Scientist").set("Hillary Clinton", "A Six Foot Tall Giant Robot");
        this.defaultNotes = "My spirit animal comes in a pretzel bun";
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
        return localStorage.getItem(this.notesKey) || this.defaultNotes;
    }

    UpdateNotes(notes) {
        localStorage.setItem(this.notesKey, settings);
    }
}