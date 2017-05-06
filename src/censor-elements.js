export class CensorElements {
    constructor() {
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
        template.outerHTML = `<img id='${styles.icon}' src='${chrome.extension ? chrome.extension.getURL('app/resources/icon-large.png') : 'app/resources/icon-large.png'}' >
            <div id='${styles.menu}'>
                    <span id='${styles.spanLeft}' > Replace<span id=${styles.theD}>D</span> <input id='${styles.inputLeft}' type='text' placeholder='[politics]' /> </span>
                    <span id='${styles.spanRight}'> With <input type='text' placeholder='kittens' id='${styles.inputRight}' /> </span> 
            </div>`
        this.icon = new CensorElement(styles.icon)
        this.menu = new CensorElement(styles.menu)
        this.theD = new CensorElement(styles.theD)
        this.inputLeft = new CensorElement(styles.inputLeft)
        this.inputRight = new CensorElement(styles.inputRight)
    }
}

class CensorElement {
    constructor(id) {
        this.e = document.getElementById(id)
        this.e.onclick = (e) => e.stopPropagation()
        this.isShowing = this.e.style.display != 'none'
    }
    show() {
        this.e.style.display = 'inline'
    }
    hide() {
        if (this.isShowing) this.e.style.display = 'none'
    }
}