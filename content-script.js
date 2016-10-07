// mission critical
// todo: improve replacement algorithm
// todo: hook up delete functionality
// enhancements
// todo: get printer function working
// todo: buttons only show on change, use display:none instead of "visibility"
// todo: target element then ID instead of generic class for better css specificity : https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
// todo: use place holder text on inputs instead of text values...
// todo: transpile and minify js, point manifest at transpiled files 

'use strict';

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
                deleteButton: "plugin-delete-button",
                imageLarge: "plugin-image-large",
                saveButton: "plugin-save-button",
                textArea: "plugin-text-area"
            }

        this.ApplySettings(); // on startup

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { if (request.displaySettings) plugin.DisplaySettings(); });


        new MutationObserver(mutations => {

            // todo: limit to run only once a second
            mutations.forEach(mutation => {

                // todo: remove div parent if possible
                let isLegit = mutation.addedNodes[0] && mutation.addedNodes[0].firstChild && mutation.addedNodes[0].firstChild.id != this.cssElements.popup;
                if (isLegit) this.ApplySettings();

            });

        }).observe(document.body, { childList: true });
    }

    ApplySettings(domToParse = document.body) {

        let start = performance.now();

        let settings = this.db.GetSettings(), ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);

        while (ent.nextNode()) {

            // future state - option to replace keywords with black bars 

            // this.db.GetSettings().forEach((word, definition) => ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, definition); );
            Object.keys(settings).forEach(word => { ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, settings[word]); });

        }

        // console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);
    }

    PrintOneLetterAtATime(message, cssElement) {
        // https://stackoverflow.com/questions/7264974/show-text-letter-by-letter
        return message;
    }

    DisplaySettings() {

        let popup = document.getElementById(this.cssElements.popup);

        if (popup) return popup.style.visibility = popup.style.visibility ? "" : "hidden"; // show / hide
        
        // todo: refactor into a dom generator utility and a user interaction utility
        let settingsFromDb = this.db.GetSettings(),
            keys = Object.keys(settingsFromDb),
            values = [],
            spans = "";

        keys.forEach(key => {

            let value = settingsFromDb[key];

            values.push(value);

            let trailingAnd = key == keys[keys.length - 1] ? "" : "and";

            spans += `<span id="${key}" class="${this.cssElements.spanLeft}"> ${key} </span> is <span id="${value}" class="${this.cssElements.spanRight}"> ${value} </span> ${trailingAnd}`;
        });

        popup = document.createElement("div");

        popup.innerHTML =

            `<div id=${this.cssElements.popup} class="${this.cssElements.popup}">

            <marquee scrollamount="15" id=${this.cssElements.marquee} class="${this.cssElements.marquee}"> ${spans} </marquee>

            <div class=""> 
            
               <input id=${this.cssElements.textBoxLeft} class="${this.cssElements.textBoxLeft}" type="text" value="Life"/>

               is

               <input id=${this.cssElements.textBoxRight} class="${this.cssElements.textBoxRight}" type="text" value="A Dream"/>

               <button id=${this.cssElements.updateButton} class="${this.cssElements.updateButton}"> Save </button>

               <button id=${this.cssElements.deleteButton} class="${this.cssElements.deleteButton}"> Delete </button>

            </div>

            <div>
                <img class="${this.cssElements.imageLarge}" src="${chrome.extension ? chrome.extension.getURL("icon-large.png") : "icon-large.png"}"/>

                <button id=${this.cssElements.saveButton} class="${this.cssElements.saveButton}"> Exit </button>
            </div>

            <textarea id="${this.cssElements.textArea}" class="${this.cssElements.textArea}"> ${this.db.GetNotes()} </textarea>

         </div>`;

        document.body.appendChild(popup);

        this.marquee = document.getElementById(this.cssElements.marquee);
        this.textBoxLeft = document.getElementById(this.cssElements.textBoxLeft);
        this.textBoxRight = document.getElementById(this.cssElements.textBoxRight);
        this.textBoxRight.disable = message => {

            this.textBoxRight.value = message;
            this.textBoxRight.disabled = true;

        }
        this.saveButton = document.getElementById(this.cssElements.saveButton);
        this.saveButton.onclick = () => this.SaveSettings();
        this.updateButton = document.getElementById(this.cssElements.updateButton);
        this.updateButton.show = () => this.updateButton.style.visibility = "";
        this.updateButton.hide = () => this.updateButton.style.visibility = "hidden";
        this.updateButton.onclick = () => this.UpdateSetting();

        let previousValueL = this.textBoxLeft.value;
        this.textBoxLeft.onmouseover = () => {

            this.textBoxLeft.focus();
            if (this.textBoxLeft.value == previousValueL) this.textBoxLeft.value = "";

        }
        this.textBoxLeft.onmouseout = () => {
            if (this.textBoxLeft.value == "") this.textBoxLeft.value = previousValueL;
        }

        let previousValueR = this.textBoxRight.value;
        this.textBoxRight.onmouseover = () => {

            this.textBoxRight.focus();
            if (this.textBoxRight.value == previousValueR) this.textBoxRight.value = "";

        }
        this.textBoxRight.onmouseout = () => {
            if (this.textBoxRight.value == "") this.textBoxRight.value = previousValueR;
        }

        this.textBoxLeft.onkeyup = () => {

            if (this.textBoxLeft.value === "") return;

            if (values.includes(this.textBoxLeft.value)) return this.textBoxRight.disable("paradoxical");

            if (this.textBoxLeft.value == this.admin) return this.textBoxRight.disable("sexy");

            this.textBoxRight.disabled = false;

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

        let settings = this.db.GetSettings();

        settings[this.textBoxLeft.value] = this.textBoxRight.value;

        this.db.UpdateSettings(settings);

        if (isNew) span = document.createElement("span");

        let newSpan = `and <span id="${this.textBoxLeft.value}" class="${this.cssElements.spanLeft}"> ${this.textBoxLeft.value} </span> is
            <span id="${this.textBoxRight.value}" class="${this.cssElements.spanRight}"> ${this.textBoxRight.value} </span>`;

        span.innerHTML = newSpan;

        if (isNew) this.marquee.appendChild(span);
    }

    SaveSettings() {
        let notes = document.getElementById(this.cssElements.textArea);
        this.db.UpdateNotes(notes.value);

        this.ApplySettings();

        let popup = document.getElementById(this.cssElements.popup);
        popup.style.visibility = "hidden"; // hide
    }
}

// todo: have this callout to an API so data can persist accross clients
class SettingsDataAccess {
    constructor() {

        this.storageKey = "7DCF8FAAC5ECB6FF17DF5487735A7";
        this.notesKey = "8B7C91137E2AFE924FBFBB3E6FE71";

        // todo refactor this to use a map instead of key value object
        this.defaultSettings = { "Donald Trump": "A Mad Scientist", "Hillary Clinton": "A Six Foot Tall Giant Robot" };
        // this.defaultSettings = new Map().set("Donald Trump", "A Mad Scientist").set("Hillary Clinton", "A Six Foot Tall Giant Robot");
        this.defaultNotes = "You can use this space to take notes if you want, the'll be saved when you click the Exit button ";
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
        localStorage.setItem(this.notesKey, notes);
    }
}