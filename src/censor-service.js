import {CensorDataAccess} from "./censor-data-access.js"

export class CensorService {

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
