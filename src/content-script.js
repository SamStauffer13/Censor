// todo pull in Jasmine as nuget dependency instead of filez
// todo impliment UI
// todo reduce looping in watch algorithm
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf
// todo on hover events, on hover of icon, on page load of icon, styling 

'use strict'
class Censor {

    constructor() {

        this.elements = new CensorElements();

        this.service = new CensorService();

        if (this.service.ShouldRunOnPageLoad === true) {

            document.body.appendChild(this.elements.icon);

            this.service.Start();
        }

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.OnBrowserIconClick(request.enableCensor));

        this.SetupCensorMenu();
    }

    OnBrowserIconClick(enableCensor) {

        if (enableCensor === true) {

            document.body.appendChild(this.elements.icon);

            this.service.Start();

        } else if (enableCensor === false) {

            if (document.body.contains(this.elements.icon)) document.body.removeChild(this.elements.icon);

            if (document.body.contains(this.elements.menu)) document.body.removeChild(this.elements.menu);

            this.service.Stop();
        }
    }

    // todo refactor into smaller methods?
    SetupCensorMenu() {

        this.elements.icon.onclick = () => {

            document.body.appendChild(this.elements.menu);

            document.body.removeChild(this.elements.icon);
        }

        // this.elements.menu.onclick = () => {

        //     document.body.appendChild(this.elements.icon);

        //     document.body.removeChild(this.elements.menu);            
        // }

        let previousText = this.elements.messenger.textContent;

        let restoreText = () => this.elements.messenger.textContent = previousText;

        this.elements.saveButton.onblur = restoreText();

        this.elements.nukeButton.onblur = restoreText();

        this.elements.saveButton.onhover = () => {

            previousText = this.elements.messenger.textContent;

            this.elements.messenger.textContent = 'Save?';
        }

        this.elements.saveButton.onclick = () => {

            let oldWord = this.elements.inputLeft.value;

            let newWord = this.elements.inputRight.value;

            this.service.UpdateDebauchery(oldWord, newWord);

            this.elements.messenger.textContent = 'Updated';
        }
    }
}

class CensorElements {

    // todo measure performace of this method vs others...
    constructor() {

        let styles = {
            icon: 'censor-icon',
            menu: 'censor-menu',
            messenger: 'censor-messenger',
            spanLeft: 'censor-span-left',
            inputLeft: 'censor-input-left',
            spanRight: 'censor-span-right',
            inputRight: 'censor-input-right',
            saveButton: 'censor-save-button',
            nukeButton: 'censor-nuke-button'
        };

        let temp = document.createElement('div');

        temp.innerHTML = `<img class='${styles.icon}' src='${this.getSrc('resources/icon-large.png')}' >
        <div class='${styles.menu}'>
            <span class='${styles.messenger}'> What can I help you with? </span>
            <span class='${styles.spanLeft}'> Replace </span> <input class='${styles.inputLeft}' type='text' value='[Politics]' /><span class='${styles.spanRight}'> With </span> <input  type='text' value='Kittens' class='${styles.inputRight}' />
            <img class='${styles.saveButton}' src='${this.getSrc('resources/icon-large.png')}' > <img class='${styles.nukeButton}' src='${this.getSrc('resources/icon-large.png')}' >
        </div>`;

        this.icon = temp.getElementsByClassName(styles.icon)[0];
        this.menu = temp.getElementsByClassName(styles.menu)[0];
        this.messenger = temp.getElementsByClassName(styles.messenger)[0];
        this.inputLeft = temp.getElementsByClassName(styles.inputLeft)[0];
        this.inputRight = temp.getElementsByClassName(styles.inputRight)[0];
        this.saveButton = temp.getElementsByClassName(styles.saveButton)[0];
        this.nuclearButton = temp.getElementsByClassName(styles.nukeButton)[0];
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

        if (document.body.contains(this.element)) document.body.appendChild(this.element);
    }

    Remove() {

        if (document.body.contains(this.element)) document.body.removeChild(this.element);
    }

    Print(message, charPosition = 0) {

        if (charPosition >= message.length) return;

        this.element.innerHTML += message[charPosition++];

        setTimeout(() => { this.PrintOneLetterAtATime(message, charPosition); }, 120); // recursion (0_0)
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

    UpdateDebauchery(oldWord, newWord) {

        let debauchery = this.CensorDB.GetDebauchery();

        debauchery[oldWord] = newWord;

        this.CensorDB.UpdateDebauchery(debauchery);
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

// todo everthing below this line is depricated
// class CensorElement {

//     constructor(name, css) {

//         this.element = document.createElement(name);

//         this.element.className = css;
//     }

//     // todo, rename this...
//     Display(elementToAppendTo = document.body) {

//         elementToAppendTo.appendChild(this.element);
//     }

//     Remove(elementToRemoveFrom = document.body) {

//         elementToRemoveFrom.removeChild(this.element);
//     }

//     PrintOneLetterAtATime(message, charPosition = 0) {

//         if (charPosition >= message.length) return;

//         this.element.innerHTML += message[charPosition++];

//         setTimeout(() => { this.PrintOneLetterAtATime(message, charPosition); }, 120); // recursion (0_0)
//     }
// }

// class Censor {

//     constructor() {

//         this.CensorService = new CensorService();

//         this.censor = new CensorOrchestrator();

//         if (this.CensorService.ShouldRunOnPageLoad()) this.EnableCensor(true);

//         if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.EnableCensor(request.enableCensor));
//     }

//     // todo move this behavior into the service
//     EnableCensor(enableCensor) {

//         if (enableCensor === true) {

//             this.censor.icon.Display();

//             this.CensorService.CensorDom();
//         }
//         else {

//             this.censor.icon.Remove();

//             this.CensorService.UnCensorDom();
//         }

//         this.CensorService.ListenForDomChanges(enableCensor);

//         this.CensorService.UpdateCensorStatus(enableCensor);
//     }
// }

// class CensorOrchestrator {

//     constructor() {

//         this.menu = new CensorMenu();

//         this.icon = new CensorIcon('censor-icon-on-page');

//         this.icon.element.onclick = () => {

//             this.icon.Remove();

//             this.menu.Display();

//             this.menu.RunTutorial();
//         };

//         this.menu.element.onclick = () => {

//             this.menu.Remove();

//             this.icon.Display();
//         }
//     }
// }

// // This is over enginered
// class CensorMenu extends CensorElement {

//     constructor() {

//         super('div', 'censor-container');

//         this.messenger = new CensorElement('span', 'todo');

//         this.messenger.Display(this.element);

//         this.userInput = new CensorElement("input", "censor-user-input");

//         this.userInput.Display(this.element);

//         this.saveButton = new CensorIcon('censor-icon-in-menu');

//         this.saveButton.Display(this.element);
//     }

//     RunTutorial() {

//         this.messenger.PrintOneLetterAtATime("Welcome, creature...");
//     }
// }

// class CensorIcon extends CensorElement {

//     constructor(css) {

//         super('img', css);

//         this.element.src = chrome.extension ? chrome.extension.getURL('resources/icon-large.png') : 'resources/icon-large.png';
//     }
// }