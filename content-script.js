// todo: transpile and minify js, point manifest at transpiled files

// 'use strict';

// todo get font working http://stackoverflow.com/questions/12015074/adding-font-face-stylesheet-rules-to-chrome-extension
// todo: prevent observer from replacing div text...
// todo: hook up save functionality...

// use IDs instead of classes for better css specificity 
// use place holder text on inputs instead of text values..

class SettingsService {
    constructor(SettingsDataAccess) {

        this.admin = "Sam Stauffer";

        this.db = SettingsDataAccess;
        this.timesInvoked = 1;

        this.cssElements =
            {
                popup: "plugin-popup",
                marquee: "plugin-marquee",
                spanLeft: "plugin-span-left",
                spanRight: "plugin-span-right",
                textBoxLeft: "plugin-text-box-left",
                textBoxRight: "plugin-text-box-right",
                updateButton: "plugin-update-button",
                imageLarge: "plugin-image-large",
                saveButton: "plugin-save-button",
                textArea: "plugin-text-area"
            }

        this.ApplySettings(); // on startup

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { if (request.displaySettings) plugin.DisplaySettings(); });

        // todo: research way to optimize this without N+1 looping + limit to run only once a second
        this.observer = new MutationObserver(mutations => {            
            mutations.forEach( mutation => {

                let nodes = mutation.addedNodes[0];                
                // todo: test performance of this + get rid of parent div if possible
                if (nodes && nodes.firstChild && nodes.firstChild.id != this.cssElements.popup) this.ApplySettings();
            });
        });

        this.observer.observe(document.body, { childList: true });
    }

    ApplySettings(domToParse = document.body) {

        let start = performance.now();

        let settings = this.db.GetSettings(), ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);

        while (ent.nextNode()) {

            // this.db.GetSettings().forEach((word, definition) => ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, definition); );
            Object.keys(settings).forEach(word => { ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, settings[word]); });

        }

         console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);
    }

    PrintOneLetterAtATime(message, cssElement) {
        // https://stackoverflow.com/questions/7264974/show-text-letter-by-letter
        return message;
    }

    DisplaySettings() {

        this.observer.disconnect();

        let popup = document.getElementById(this.cssElements.popup);

        if (popup) return popup.style.visibility = popup.style.visibility ? "" : "hidden"; // show / hide

        let settingsFromDb = this.db.GetSettings(), spans = "";

        Object.keys(settingsFromDb).forEach(word => {
            // todo: something like definition == settingsFromDb[settingsFromDb.length] ? and : ""
            spans += `<span id="${word}" class="${this.cssElements.spanLeft}"> ${word} </span> is <span id="${settingsFromDb[word]}" class="${this.cssElements.spanRight}"> ${settingsFromDb[word]} </span> and`;
        });

        popup = document.createElement("div");

        popup.innerHTML =

            `<div id=${this.cssElements.popup} class="${this.cssElements.popup}">

            <marquee scrollamount="15" id=${this.cssElements.marquee} class="${this.cssElements.marquee}"> ${spans} </marquee>

            <div class=""> 
            
               <input id=${this.cssElements.textBoxLeft} class="${this.cssElements.textBoxLeft}" type="text" value="Life"/>

               is

               <input id=${this.cssElements.textBoxRight} class="${this.cssElements.textBoxRight}" type="text" value="A Dream"/>

               <button id=${this.cssElements.updateButton} class="${this.cssElements.updateButton}"> Apply Changes </button>

            </div>

            <div>
                <img class="${this.cssElements.imageLarge}" src="${chrome.extension ? chrome.extension.getURL("icon-large.png") : "icon-large.png"}"/>

                <button id=${this.cssElements.saveButton} class="${this.cssElements.saveButton}"> Click Here To Exit </button>
            </div>

            <textarea id="${this.cssElements.textArea}" class="${this.cssElements.textArea}"> ${this.db.GetNotes()} </textarea>

         </div>`;

        document.body.appendChild(popup);

        this.marquee = document.getElementById(this.cssElements.marquee);
        this.textBoxLeft = document.getElementById(this.cssElements.textBoxLeft);
        this.textBoxRight = document.getElementById(this.cssElements.textBoxRight);
        this.saveButton = document.getElementById(this.cssElements.saveButton);
        this.saveButton.onclick = () => this.SaveSettings();
        this.updateButton = document.getElementById(this.cssElements.updateButton);
        this.updateButton.show = () => this.updateButton.style.visibility = "";
        this.updateButton.hide = () => this.updateButton.style.visibility = "hidden";
        this.updateButton.onclick = () => this.UpdateSetting();

        this.textBoxLeft.onkeyup = () => {

            // todo once map conversion is complete use this:
            // let chaos = Object.Values(settingsFromDb)[this.textBoxLeft.value];
            // if (chaos) return this.textBoxRight.value = "In Use";

            if (this.textBoxLeft.value == this.admin) this.textBoxRight.value = "Sexy";

            this.updateButton.show();
        };

        this.textBoxRight.oninput = () => this.updateButton.show();

        Array.from(document.getElementsByClassName(this.cssElements.spanLeft)).forEach(span => {

            span.onclick = () => {
                this.textBoxLeft.value = span.innerHTML;
                this.updateButton.show();
            }

        });

        Array.from(document.getElementsByClassName(this.cssElements.spanRight)).forEach(span => {

            span.onclick = () => {
                this.textBoxRight.value = span.innerHTML;
                this.updateButton.show();
            };

        });

    }

    DeleteSetting() {

    }

    UpdateSetting() {

        this.updateButton.hide();

        let span = document.getElementById(this.textBoxLeft.value);
        let isNew = !span;

        if (this.textBoxLeft.value == this.admin) this.textBoxRight.value = "Sexy";

        let settings = this.db.GetSettings();

        settings[this.textBoxLeft.value] = this.textBoxRight.value;

        this.db.UpdateSettings(settings);

        if (isNew) span = document.createElement("span");

        let newSpan = `<span id="${this.textBoxLeft.value}" class="${this.cssElements.spanLeft}"> ${this.textBoxLeft.value} </span> is
            <span id="${this.textBoxRight.value}" class="${this.cssElements.spanRight}"> ${this.textBoxRight.value} </span> and`;

        span.innerHTML = newSpan;

        if (isNew) this.marquee.appendChild(span);
    }

    SaveSettings() {
        let notes = document.getElementById(this.cssElements.textArea);
        this.db.UpdateNotes(notes.value);

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
            console.warn(`${error.message} while parsing: ${settings}`);
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
        localStorage.setItem(this.notesKey, notes);
    }
}