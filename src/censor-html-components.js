import { CensorHTMLComponent } from "./censor-html-component.js"
import { CensorHTMLInputComponent } from "./censor-html-input-component.js"


export class CensorHTMLComponents {
    constructor() {
        const components = this.generateHTML()
        this.icon = new CensorHTMLComponent(components.icon)
        this.menu = new CensorHTMLComponent(components.menu)
        this.theD = new CensorHTMLComponent(components.theD)
        this.inputLeft = new CensorHTMLInputComponent(components.inputLeft)
        this.inputRight = new CensorHTMLInputComponent(components.inputRight)
    }
    generateHTML() { // keeps implementation details below the fold
        const styles = {
            icon: 'censor-icon',
            menu: 'censor-menu',
            theD: 'censor-the-d',
            spanLeft: 'censor-span-left',
            inputLeft: 'censor-input-left',
            spanRight: 'censor-span-right',
            inputRight: 'censor-input-right',
        };

        let template = document.createElement('div')
        document.body.appendChild(template)
        template.outerHTML = `<img id='${styles.icon}' src='${chrome.extension ? chrome.extension.getURL('./resources/icon-large.png') : 'app/resources/icon-large.png'}' >
            <div id='${styles.menu}'>
                    <span id='${styles.spanLeft}' > Replace<span id=${styles.theD}>D</span> <input id='${styles.inputLeft}' type='text' placeholder='[politics]' /> </span>
                    <span id='${styles.spanRight}'> With <input type='text' placeholder='kittens' id='${styles.inputRight}' /> </span> 
            </div>`

        return styles
    }
}