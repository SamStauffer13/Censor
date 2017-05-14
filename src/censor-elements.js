export class CensorElements {
    constructor() {
        const components = this.generateHTML()
        this.icon = new CensorElement(components.icon)
        this.menu = new CensorElement(components.menu)
        this.theD = new CensorElement(components.theD)
        this.inputLeft = new CensorInputElement(components.inputLeft)
        this.inputRight = new CensorInputElement(components.inputRight)
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

class CensorElement {
    constructor(id) {        
        this.e = document.getElementById(id)
        this.isShowing = this.e.style.display != 'none'
    }
    show() {
        this.e.style.display = 'inline'
    }
    hide() {
        if (this.isShowing) this.e.style.display = 'none'
    }
}

class CensorInputElement extends CensorElement {
    constructor(id) {        
        super(id)        
        this.e.onmouseover = () => this.e.focus()
    }
    clear() {
        this.e.classList.add('fade-out') // 1 second
        setTimeout(() => {
            this.e.classList.remove('fade-out')
            this.e.value = ''
        }, 1000)
    }
    next(value) {
        this.e.classList.add('swipe-right') // todo animate in the next value
        this.e.value = value
    }    
    previous(value){
        this.e.classList.add('swipe-left') // todo animate in the next value
        this.e.value = value
    }
}

