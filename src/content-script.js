// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf

'use strict'

class Censor {

    constructor() {

        this.CensorService = new CensorService();

        if (this.CensorService.ShouldRunOnPageLoad()) this.EnableCensor(true);

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.EnableCensor(request.enableCensor));
    }

    EnableCensor(enableCensor) {

        if (enableCensor === true) {

            this.CensorService.CensorDom();
        }
        else {

            this.CensorService.UnCensorDom();
        }

        this.CensorService.ListenForDomChanges(enableCensor);

        this.CensorService.UpdateCensorStatus(enableCensor);
    }
}

class CensorService {

    constructor() {

        this.CensorDB = new CensorDataAccess();

        let deboucer = null;

        this.teenageMutant = new MutationObserver(mutations => {

            let observer = () => mutations.forEach(mutation => this.CensorDom());

            clearTimeout(deboucer);

            deboucer = setTimeout(() => observer(), 1000);
        });

        this.facebookOffenders = [];
    }

    UpdateCensorStatus(enabled) {

        this.CensorDB.UpdateCensorStatus(enabled);
    }

    ShouldRunOnPageLoad() {

        return this.CensorDB.IsCensorEnabled();
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

        while (ent.nextNode()) {

            let content = ent.currentNode.nodeValue.toLowerCase().trim();

            let triggerWarnings = this.CensorDB.GetTriggerWarnings();

            triggerWarnings.forEach((triggerWarning) => {

                if (content.includes(triggerWarning) && ent.currentNode) {

                    if (window.location.hostname == 'www.facebook.com') {

                        let post = this.GetOffendingFacebookPost(ent.currentNode)

                        if (post !== null) this.facebookOffenders.push(post);
                    }
                    else if (ent.currentNode.parentElement) {

                        ent.currentNode.parentElement.innerHTML = this.GetRandomKittenGif()
                    }
                }
            });

            let debauchery = this.CensorDB.GetDebauchery();

            Object.keys(debauchery).forEach(trigger => {

                if (content.includes(trigger)) ent.currentNode.nodeValue = content.replace(trigger, debauchery[trigger]);

            });
        }

        this.facebookOffenders.forEach((offender) => {

            if (offender.firstChild && offender.firstChild.id === 'censor-kitty-photo') return; // todo, figure out why there is excessive looping

            offender.previousContents = offender.innerHTML;

            offender.innerHTML = this.GetRandomKittenGif();
        });
    }

    UnCensorDom() {

        this.facebookOffenders.forEach((offender) => {

            offender.innerHTML = offender.previousContents;
        });
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

    GetTriggerWarnings() {

        // todo 
        return [
            "[politics]"
        ];
    }

    GetDebauchery() {

        // todo 
        return {

            "trump": "A Mad Scientist",
            "donald trump": "A Mad Scientist",
            "donald j. trump": "A Mad Scientist",
            "black lives matter": "Attack Helicopter Lives Matter",
            "lgbt": "Attack Helicopters",
            "anti-muslim": "Anti-Attack-Helicopter",
            "anti-islam": "Anti-Attack-Helicopter",
            "alt-right": "Anti-Attack-Helicopters",
            "andrew r mchugh": "Andrew R. McHugh",
            "chris givan": "Jizz Pirate",
            "sam stauffer": "(づ￣ ³￣)づ"
        };
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

class CensorIcon {
    constructor() {

        this.element = document.createElement('img');
        this.element.src = chrome.extension ? chrome.extension.getURL('resources/icon-large.png') : 'resources/icon-large.png';
        this.element.classList = 'censor-icon-large';
        this.element.style.display = "none";
        document.body.appendChild(this.element);
    }

    Display(shouldDisplay) {

        this.element.style.display = shouldDisplay ? "" : "none";
    }
}

class CensorSettingsMenu {
    constructor() {

        this.element = document.createElement("div");
        this.element.style.display = "none";
        this.element.className = "censor-container";
        document.body.appendChild(this.element);
    }

    Display(shouldDisplay) {

        this.element.style.display = shouldDisplay ? "" : "none";
    }

    PrintOneLetterAtATime(message, htmlElement, charPosition = 0) {

        if (charPosition >= message.length) return;

        htmlElement.innerHTML += message[charPosition++];

        setTimeout(() => { this.PrintOneLetterAtATime(message, htmlElement, charPosition); }, 120); // recursion (0_0)
    }
}