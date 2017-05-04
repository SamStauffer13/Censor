// todo reduce looping in watch algorithm
// todo improve UI creation algorithm
// program escape key
// program enter key
// update replaced on save
// hitting icon with menu open wipes all settings
// uglify in package.json
// compile css via browserify
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf
// todo impliment Bias calculator. Highlights trigger words… Gives count of how Biased news source is… 
// no need for semi colons
'use strict'
export class Censor {

    constructor() {

        this.service = new CensorService();
        let elements = new CensorElements();
        this.icon = elements.icon;
        this.menu = elements.menu;
        this.inputLeft = elements.inputLeft;
        this.inputRight = elements.inputRight;

        if (this.service.ShouldRunOnPageLoad() === true) {

            this.icon.Display();

            this.service.Start();
        }

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.OnBrowserIconClick(request.enableCensor));

        this.SetupCensorMenu();
    }

    OnBrowserIconClick(enableCensor) {

        if (enableCensor === true) {

            this.icon.Display();

            this.service.Start();

        } else if (enableCensor === false) {

            this.icon.Remove();

            this.menu.Remove();

            this.service.Stop();
        }
    }

    SetupCensorMenu() {

        this.icon.element.onclick = () => {

            this.menu.Display();

            this.icon.Remove();
        }

        this.menu.element.onclick = () => {

            this.menu.Remove();

            this.icon.Display();
        }

        this.inputLeft.element.onmouseover = () => this.inputLeft.element.focus();

        this.inputLeft.element.onclick = (e) => e.stopPropagation();

        this.inputRight.element.onmouseover = () => this.inputRight.element.focus();

        this.inputRight.element.onclick = (e) => e.stopPropagation();
    }
}

// unhid instead of display, extend display method instead of seperate class... return an array from a service rather than an object...
class CensorElements {

    constructor() {

        let styles = {
            icon: 'censor-icon',
            menu: 'censor-menu',
            spanLeft: 'censor-span-left',
            inputLeft: 'censor-input-left',
            spanRight: 'censor-span-right',
            inputRight: 'censor-input-right',
        };

        var temp = document.createElement('div');
        document.body.appendChild(temp);
        temp.outerHTML = `<div style='display: none'>
            <img id='${styles.icon}' src='${this.getSrc('app/resources/icon-large.png')}' >
            <div id='${styles.menu}'>
                    <span id='${styles.spanLeft}' > Replace <input id='${styles.inputLeft}' type='text' placeholder='[politics]' /> </span>
                    <span id='${styles.spanRight}'> With <input type='text' placeholder='kittens' id='${styles.inputRight}' /> </span> 
            </div>
        </div>`

        this.icon = new CensorElement(document.getElementById(styles.icon));
        this.menu = new CensorElement(document.getElementById(styles.menu));
        this.inputLeft = new CensorElement(document.getElementById(styles.inputLeft));
        this.inputRight = new CensorElement(document.getElementById(styles.inputRight));

        // let elements = []
        // styles.forEach((style) => {
        //     let element = document.getElementById(style)
        //     element.display = () => { }
        //     element.hide = () => { }
        //     elements.push(element)
        // })        
        // return elements
    }
    getSrc(path) {
        return chrome.extension ? chrome.extension.getURL(path) : path;
    }
}

class CensorElement {

    constructor(element) {

        this.element = element;
    }

    Display() {


        document.body.appendChild(this.element);
    }

    Remove() {

        if (document.body.contains(this.element)) document.body.removeChild(this.element);
    }
}

class CensorService {

    constructor() {

        this.CensorDB = new CensorDataAccess();

        this.facebookOffenders = [];

        let deboucer = null;

        this.teenageMutant = new MutationObserver(mutations => {

            let observer = () => mutations.forEach(mutation => this._CensorDom());

            clearTimeout(deboucer);

            // todo deboucer isnt working
            deboucer = setTimeout(() => observer(), 1000);
        });
    }

    Start() {

        this._CensorDom();

        this.teenageMutant.observe(document.body, { childList: true });

        this.CensorDB.UpdateCensorStatus(true);
    }

    Stop() {

        this.teenageMutant.disconnect();

        this.CensorDB.UpdateCensorStatus(false);

        this.facebookOffenders.forEach((offender) => {

            offender.innerHTML = offender.previousContents;
        });
    }

    Update(oldWord, newWord) {

        oldWord = oldWord.toLowerCase();
        newWord = newWord.toLowerCase();

        // todo handle paradox's?
        if (oldWord === '' || newWord === '') return;

        if (newWord === 'kittens') {

            let triggerWarnings = this.CensorDB.GetTriggerWarnings();

            if (triggerWarnings.indexOf(oldWord) >= 0) return;

            triggerWarnings.push(oldWord);

            this.CensorDB.UpdateTriggerWarnings(triggerWarnings);

            return;
        }

        let debauchery = this.CensorDB.GetDebauchery();

        debauchery[oldWord] = newWord;

        this.CensorDB.UpdateDebauchery(debauchery);
    }

    Delete() {

        this.CensorDB.UpdateDebauchery(null);

        this.CensorDB.UpdateTriggerWarnings(null);
    }

    ShouldRunOnPageLoad() {

        return this.CensorDB.IsCensorEnabled();
    }

    _CensorDom(domToParse = document.body) {
        let ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);

        while (ent.nextNode()) {

            let content = ent.currentNode.nodeValue.toLowerCase().trim();

            let triggerWarnings = this.CensorDB.GetTriggerWarnings();

            triggerWarnings.forEach((triggerWarning) => {

                if (content.includes(triggerWarning) && ent.currentNode) {

                    if (window.location.hostname == 'www.facebook.com') {

                        let post = this._GetOffendingFacebookPost(ent.currentNode)

                        if (post !== null) this.facebookOffenders.push(post);
                    }
                    else if (ent.currentNode.parentElement) {

                        ent.currentNode.parentElement.innerHTML = this._GetRandomKittenGif()
                    }
                }
            });

            let debauchery = this.CensorDB.GetDebauchery();

            Object.keys(debauchery).forEach(trigger => {
                trigger = trigger.toLowerCase().trim();
                if (content.includes(trigger)) ent.currentNode.nodeValue = content.replace(trigger, debauchery[trigger]);
            });
        }

        this.facebookOffenders.forEach((offender) => {

            if (offender.firstChild && offender.firstChild.id === 'censor-kitty-photo') return; // todo, figure out why there is excessive looping

            offender.previousContents = offender.innerHTML;

            offender.innerHTML = this._GetRandomKittenGif();
        });
    }

    _GetOffendingFacebookPost(offendingNode) {

        while ((offendingNode = offendingNode.parentElement) && !offendingNode.classList.contains('userContentWrapper'));

        return offendingNode;
    }

    _GetRandomKittenGif() {

        return `<img id="censor-kitty-photo" src="https://thecatapi.com/api/images/get?format=src&type=jpg&size=large&category=boxes"/>`
    }
}

class CensorDataAccess {

    constructor() {

        this.CensorStatusKey = "CensorStatusKey";
        this.CensorTriggerWarningKey = "CensorTriggerWarningKey";
        this.CensorDebaucheryKey = "CensorDebaucheryKey";
        this.defaultTriggerWarnings = ['[politics]'];
        this.defaultDebauchery = { "sam stauffer": "༼ つ ◕_◕ ༽つ" };
    }

    // todo this pattern could be abstracted
    GetTriggerWarnings() {

        let triggerWarnings = localStorage.getItem(this.CensorTriggerWarningKey);

        if (triggerWarnings === null || triggerWarnings === '' || triggerWarnings === 'null') return this.defaultTriggerWarnings;

        return triggerWarnings.split(',');
    }

    GetDebauchery() {

        let debauchery = localStorage.getItem(this.CensorDebaucheryKey);
        if (debauchery === null || debauchery === '' || debauchery === 'null') return this.defaultDebauchery;

        try {

            return JSON.parse(debauchery);

        } catch (e) {

            console.error('unable to parse ', debauchery, e)

            localStorage.clear();

            return this.defaultDebauchery;
        }
    }

    UpdateTriggerWarnings(triggerWarnings) {

        localStorage.setItem(this.CensorTriggerWarningKey, triggerWarnings);
    }

    UpdateDebauchery(debauchery) {

        localStorage.setItem(this.CensorDebaucheryKey, JSON.stringify(debauchery));
    }

    IsCensorEnabled() {

        let status = localStorage.getItem(this.CensorStatusKey);

        if (status === null || status === '' || status === 'true') return true;

        return false;
    }

    UpdateCensorStatus(isEnabled) {

        localStorage.setItem(this.CensorStatusKey, isEnabled);
    }
}