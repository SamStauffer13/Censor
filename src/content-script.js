// todo: target element by  ID instead of generic class for better css specificity : https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
// todo: convert to .ts file and minify transpiled js, point manifest at transpiled files 
// todo: specify browser action function in mainfest for keyboard shortcuts : https://developer.chrome.com/extensions/commands
// todo: get opener and livereload working for faster development...
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf

'use strict'

class Censor {

    constructor() {

        this.UI = new UserInterface();

        this.CensorService = new CensorService();

        this.CensorDB = new CensorDataAccess();

        let shouldRunOnPageLoad = this.CensorDB.IsCensorEnabled();

        this.EnableCensor(shouldRunOnPageLoad);

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.EnableCensor(request.enableCensor));
    }

    EnableCensor(enableCensor) {

        if (enableCensor === true) this.CensorService.CensorDom();

        this.CensorService.ListenForDomChanges(enableCensor);

        this.CensorDB.UpdateCensorStatus(enableCensor);
    }
}

class CensorService {

    constructor() {

        this.triggerWarnings = ["[politics]"];

        this.debauchery = {

            "trump": "A Mad Scientist",
            "donald trump": "A Mad Scientist",
            "donald j. trump": "A Mad Scientist",
            "black lives matter": "Attack Helicopter Lives Matter",
            "lgbt": "Attack Helicopters",
            "anti-muslim": "Anti-Attack-Helicopter",
            "alt-right": "Anti-Attack-Helicopters",
            "andrew robertson": "Jizz Pirate",
            "theodoric raimund legr": "Titts",
            "andrew r mchugh": "A Six Foot Tall Giant Robot",
            "david barkley strawhun": "Spicy Taco Farts",
            "alex meyer": "Wang Lord",
            "chris givan": "Fister Roboto",
            "sam stauffer": "ಠ‿↼"
        }

        let deboucer = null;

        this.teenageMutant = new MutationObserver(mutations => {

            let observer = () => mutations.forEach(mutation => this.CensorDom());

            clearTimeout(deboucer);

            deboucer = setTimeout(() => observer(), 1000);
        });
    }

    ListenForDomChanges(enabled = true) {

        if (enabled === true) {

            this.teenageMutant.observe(document.body, { childList: true });
        }
        else if (enabled === false) {

            this.teenageMutant.disconnect();
        }
    }

    CensorDom(domToParse = document.body) {

        let ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);

        let facebookOffenders = [];

        while (ent.nextNode()) {

            let content = ent.currentNode.nodeValue.toLowerCase().trim();

            this.triggerWarnings.forEach((triggerWarning) => {

                if (content.includes(triggerWarning)) {

                    if (window.location.hostname == 'www.facebook.com' && ent.currentNode) {

                        let post = this.GetOffendingFacebookPost(ent.currentNode)

                        if (post !== null) facebookOffenders.push(post);
                    }
                }
            });

            Object.keys(this.debauchery).forEach(trigger => {

                if (content.includes(trigger)) ent.currentNode.nodeValue = content.replace(trigger, this.debauchery[trigger]);

            });
        }

        facebookOffenders.forEach((offender) => offender.innerHTML = this.GetRandomKittenGif());
    }

    GetOffendingFacebookPost(offendingNode) {

        while ((offendingNode = offendingNode.parentElement) && !offendingNode.classList.contains('userContentWrapper'));

        return offendingNode;
    }

    GetRandomKittenGif() {

        return `<img id="censor-kitty-photo" src="https://thecatapi.com/api/images/get?format=src&type=jpg&size=large&category=boxes"/>`

    }
}

class CensorDataAccess {

    constructor() {

        this.CensorStatusKey = "CensorStatusKey";
    }

    IsCensorEnabled() {

        let status = localStorage.getItem(this.CensorStatusKey);

        if (status === null || status === '' || status === 'true') return true;

        return false;
    }

    UpdateCensorStatus(isEnabled) {

        console.log("censor should be enabled: ", isEnabled);
        localStorage.setItem(this.CensorStatusKey, isEnabled);
    }
}

class UserInterface {

    constructor() {

        this.icon = new CensorIcon();

        this.icon.element.onclick = () => this.ShowMenu();

        this.menu = new CensorSettingsMenu();
    }

    ShowIcon() {

        document.body.appendChild(this.icon.element);
    }

    ShowMenu() {

        document.body.appendChild(this.menu.element);

        // this.PrintOneLetterAtATime("", this.menu.element)
    }

    PrintOneLetterAtATime(message, htmlElement, charPosition = 0) {

        if (charPosition >= message.length) return;

        htmlElement.innerHTML += message[charPosition++];

        setTimeout(() => { this.PrintOneLetterAtATime(message, htmlElement, charPosition); }, 120); // recursion (0_0)
    }
}

class CensorIcon {
    constructor() {

        this.element = document.createElement('img');
        this.element.src = chrome.extension ? chrome.extension.getURL('resources/icon-large.png') : 'resources/icon-large.png';
        this.element.classList = 'censor-icon-large';
    }
}

class CensorSettingsMenu {
    constructor() {

        this.element = document.createElement("div");
        this.element.className = "censor-container";
    }
}