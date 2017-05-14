export class CensorHTMLComponent {
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