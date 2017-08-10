import { CensorDataAccess } from "./censor-data-access.js"

// todo impliment Bias calculator. Highlights trigger words… Gives count of how Biased news source is… 
// todo only replace whole words not just characters in words, so if a user types a, censor shouldn't replace the a in every word
// todo expand the undo functionality to non facebook pages

export class CensorService {

    constructor() {

        this.CensorDB = new CensorDataAccess();

        this.correctedNodes = [];

        let deboucer = null;

        this.teenageMutant = new MutationObserver(mutations => {

            clearTimeout(deboucer)

            deboucer = setTimeout(() => { this._censorDom()}, 500)
        });
    }
    shouldRunOnPageLoad() {

        return this.CensorDB.isCensorEnabled();
    }
    start() {

        // todo I think this might not be needed
        this._censorDom();

        this.teenageMutant.observe(document.body, { childList: true });

        this.CensorDB.updateCensorStatus(true);
    }
    stop() {

        this.teenageMutant.disconnect();

        this.CensorDB.updateCensorStatus(false);

        this.correctedNodes.forEach((offender) => {

            offender.innerHTML = offender.previousContents;
        });
    }
    update(oldWord, newWord) {

        oldWord = this._sanitize(oldWord)

        newWord = this._sanitize(newWord)

        if (oldWord === '' || newWord === '') return        

        let triggerWarnings = this.CensorDB.getTriggerWarnings()

        triggerWarnings[oldWord] = newWord

        this.CensorDB.updateTriggerWarnings(triggerWarnings)
    }
    delete() {
        this.CensorDB.updateTriggerWarnings(null)
    }
    _censorDom() {
        let ent = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

        const triggerWarnings = this.CensorDB.getTriggerWarnings()

        while (ent.nextNode()) {

            let content = this._sanitize(ent.currentNode.nodeValue)

            Object.keys(triggerWarnings).forEach(trigger => {

                const replacement = triggerWarnings[trigger]
                
                if (content.includes(trigger)) {
                    
                    if (replacement === 'kittens' && window.location.hostname === 'www.facebook.com') {
                        
                        let post = this._getOffendingFacebookPost(ent.currentNode)
                        post.previousContents = post.innerHTML
                        post.innerHTML = this._getRandomKittenGif()
                        this.correctedNodes.push(post)
                    }
                    else { ent.currentNode.nodeValue = content.replace(trigger, replacement) }
                }
            });
        }
    }
    _sanitize(input) {
         return input ? input.toLowerCase().trim() : ''
    }
    _getOffendingFacebookPost(offendingNode) { // abstracted behind a method so it's easy to swap out dom crawling mechanism

        while ((offendingNode = offendingNode.parentElement) && !offendingNode.classList.contains('fbUserPost'))

        return offendingNode;
    }
    _getRandomKittenGif() { // abstracted behind a method so it's easy to swap out kitten photo providers

         return `<img id="censor-kitty-photo" src="https://thecatapi.com/api/images/get?format=src&type=jpg&size=large&category=boxes"/>`
    }
}
