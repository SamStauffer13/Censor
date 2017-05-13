import { CensorDataAccess } from "./censor-data-access.js"

// todo reduce looping in watch algorithm
// todo impliment Bias calculator. Highlights trigger words… Gives count of how Biased news source is… 
// todo handle paradoxs
// todo only replace whole words not just characters in words, so if a user types a, censor shouldn't replace the a in every word
export class CensorService {

    constructor() {

        this.CensorDB = new CensorDataAccess();

        this.facebookOffenders = [];

        let deboucer = null;

        this.teenageMutant = new MutationObserver(mutations => {

            clearTimeout(deboucer)

            deboucer = setTimeout(() => this._censorDom(), 500)
        });
    }

    start() {

        this._censorDom();

        this.teenageMutant.observe(document.body, { childList: true });

        this.CensorDB.updateCensorStatus(true);
    }

    stop() {

        this.teenageMutant.disconnect();

        this.CensorDB.updateCensorStatus(false);

        this.facebookOffenders.forEach((offender) => {

            offender.innerHTML = offender.previousContents;
        });
    }

    update(oldWord, newWord) {

        let sanitize = input => {
            return input ? input.toLowerCase().trim() : ''
        }
        oldWord = sanitize(oldWord)
        newWord = sanitize(newWord)

        if (oldWord === '' || newWord === '') return;

        switch (newWord) {
            case 'kittens':
                this._updateTriggerWarnings(oldWord)
                break
            case 'sam stauffer':
                break
            default: this._updateDebauchery(oldWord, newWord)
        }
    }

    _updateTriggerWarnings(oldWord) {

        let triggerWarnings = this.CensorDB.getTriggerWarnings();

        if (triggerWarnings.indexOf(oldWord) >= 0) return;

        triggerWarnings.push(oldWord);

        this.CensorDB.updateTriggerWarnings(triggerWarnings);
    }

    _updateDebauchery(oldWord, newWord) {

        let debauchery = this.CensorDB.getDebauchery();

        debauchery[oldWord] = newWord;

        this.CensorDB.updateDebauchery(debauchery);
    }

    delete() {

        this.CensorDB.updateDebauchery('');

        this.CensorDB.updateTriggerWarnings('');
    }

    shouldRunOnPageLoad() {

        return this.CensorDB.isCensorEnabled();
    }

    _scrapeDom() {

    }
    _censorDom() {

        let ent = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

        while (ent.nextNode()) {

            let content = ent.currentNode.nodeValue.toLowerCase().trim();

            let triggerWarnings = this.CensorDB.getTriggerWarnings();

            triggerWarnings.forEach((triggerWarning) => {

                if (content.includes(triggerWarning) && ent.currentNode) {

                    if (window.location.hostname == 'www.facebook.com') {

                        let post = this._getOffendingFacebookPost(ent.currentNode)

                        if (post !== null) this.facebookOffenders.push(post);
                    }
                    else if (ent.currentNode.parentElement) {

                        ent.currentNode.parentElement.innerHTML = this._getRandomKittenGif()
                    }
                }
            });

            let debauchery = this.CensorDB.getDebauchery();

            Object.keys(debauchery).forEach(trigger => {
                trigger = trigger.toLowerCase().trim();
                if (content.includes(trigger)) ent.currentNode.nodeValue = content.replace(trigger, debauchery[trigger]);
            });
        }

        this.facebookOffenders.forEach((offender) => {

            if (offender.firstChild && offender.firstChild.id === 'censor-kitty-photo') return; // todo, figure out why there is excessive looping

            offender.previousContents = offender.innerHTML;

            offender.innerHTML = this._getRandomKittenGif();
        });
    }

    _getOffendingFacebookPost(offendingNode) {

        while ((offendingNode = offendingNode.parentElement) && !offendingNode.classList.contains('userContentWrapper'));

        return offendingNode;
    }

    _getRandomKittenGif() {

        return `<img id="censor-kitty-photo" src="https://thecatapi.com/api/images/get?format=src&type=jpg&size=large&category=boxes"/>`
    }
}
