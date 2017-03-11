// todo pull in Jasmine as nuget dependency instead of filez
// todo impliment UI
// todo reduce looping in watch algorithm
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf

'use strict'

class Censor {

    constructor() {

        this.CensorService = new CensorService();

        this.icon = new CensorIcon();

        if (this.CensorService.ShouldRunOnPageLoad()) this.EnableCensor(true);

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.EnableCensor(request.enableCensor));
    }

    // todo move this behavior into the service?
    EnableCensor(enableCensor) {

        if (enableCensor === true) {

            this.icon.Display(true);

            this.CensorService.CensorDom();
        }
        else {

            this.icon.Display(false);

            this.CensorService.UnCensorDom();
        }

        this.CensorService.ListenForDomChanges(enableCensor);

        this.CensorService.UpdateCensorStatus(enableCensor);
    }
}

// todo, how about just adding and removing from dom rather than toggling hidden?
class CensorIcon {
    constructor() {

        this.menu = new CensorSettingsMenu();

        this.element = document.createElement('img');
        this.element.src = chrome.extension ? chrome.extension.getURL('resources/icon-large.png') : 'resources/icon-large.png';
        this.element.classList = 'censor-icon-large';
        
        this.element.onclick = () => {

            if (this.menu.IsDisplaying()) {

                this.menu.Display(true);

            } else {

                this.menu.Display(false);
            }
        }

        this.Display(false);
        document.body.appendChild(this.element);
    }

    Display(shouldDisplay) {

        if (shouldDisplay === true) {

            this.element.style.display = "";

        } else {

            this.element.style.display = "none";

            this.menu.Display(false);
        }
    }
}

class CensorSettingsMenu {
    constructor() {

        this.element = document.createElement("div");
        this.element.style.display = "none";
        this.element.className = "censor-container";

        this.input = document.createElement("input");
        this.input.className = "censor-user-input";
        this.element.appendChild(this.input);

        document.body.appendChild(this.element);
    }

    IsDisplaying() {

        return this.element.style.display === "none";
    }

    Display(shouldDisplay) {

        this.element.style.display = shouldDisplay === true ? "" : "none";
    }

    RunTutorial() {

        this.PrintOneLetterAtATime("What is your name?", this.element);

        // var secondMessage = () => this.PrintOneLetterAtATime(' click the nuke button to wipe your settings => ', this.element);        
    }

    PrintOneLetterAtATime(message, htmlElement, charPosition = 0) {

        if (charPosition >= message.length) return;

        htmlElement.innerHTML += message[charPosition++];

        setTimeout(() => { this.PrintOneLetterAtATime(message, htmlElement, charPosition); }, 120); // recursion (0_0)
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
        this.CensorTriggerWarningKey = "CensorTriggerWarningKey";
        this.CensorDebaucheryKey = "CensorDebaucheryKey";

        this.defaultTriggerWarnings = ['[politics]'];
        this.defaultDebauchery = {

            "trump": "A Mad Scientist",
            "donald trump": "A Mad Scientist",
            "donald j. trump": "A Mad Scientist",
            "alt-facts": "Blowjobs",
            "alternative facts": "Blowjobs",
            "black lives matter": "Attack Helicopters Are People",
            "lgbt": "Attack Helicopter's",
            "women's": "Attack Helicopter's",
            "anti-muslim": "Anti-Attack-Helicopter",
            "anti-islam": "Anti-Attack-Helicopter",
            "alt-right": "Anti-Attack-Helicopters",
            "sam stauffer": "༼ つ ◕_◕ ༽つ"
        };
    }

    // todo this pattern could be abstracted
    GetTriggerWarnings() {

        let triggerWarnings = localStorage.getItem(this.CensorTriggerWarningKey);

        if (triggerWarnings === null || triggerWarnings === '') return this.defaultTriggerWarnings;

        return triggerWarnings;
    }

    GetDebauchery() {

        let debauchery = localStorage.getItem(this.CensorDebaucheryKey);

        if (debauchery === null || debauchery === '') return this.defaultDebauchery;

        return debauchery;
    }

    UpdateTriggerWarnings(triggerWarnings) {

        localStorage.setItem(this.CensorTriggerWarningKey, triggerWarnings);
    }

    UpdateDebauchery(debauchery) {

        localStorage.setItem(this.CensorDebaucheryKey, debauchery);
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