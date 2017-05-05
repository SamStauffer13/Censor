
// unhid instead of display, extend display method instead of seperate class... return an array from a service rather than an object...
export class CensorElements {

    constructor() {

        let styles = {
            icon: 'censor-icon',
            menu: 'censor-menu',
            spanLeft: 'censor-span-left',
            inputLeft: 'censor-input-left',
            spanRight: 'censor-span-right',
            inputRight: 'censor-input-right',
        };

        var temp = document.createElement('div');
        document.body.appendChild(temp);
        temp.outerHTML = `<div style='display: none'>
            <img id='${styles.icon}' src='${this.getSrc('app/resources/icon-large.png')}' >
            <div id='${styles.menu}'>
                    <span id='${styles.spanLeft}' > Replace <input id='${styles.inputLeft}' type='text' placeholder='[politics]' /> </span>
                    <span id='${styles.spanRight}'> With <input type='text' placeholder='kittens' id='${styles.inputRight}' /> </span> 
            </div>
        </div>`

        this.icon = new CensorElement(document.getElementById(styles.icon));
        this.menu = new CensorElement(document.getElementById(styles.menu));
        this.inputLeft = new CensorElement(document.getElementById(styles.inputLeft));
        this.inputRight = new CensorElement(document.getElementById(styles.inputRight));

        // let elements = []
        // styles.forEach((style) => {
        //     let element = document.getElementById(style)
        //     element.display = () => { }
        //     element.hide = () => { }
        //     elements.push(element)
        // })        
        // return elements
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


        document.body.appendChild(this.element);
    }

    Remove() {

        if (document.body.contains(this.element)) document.body.removeChild(this.element);
    }
}