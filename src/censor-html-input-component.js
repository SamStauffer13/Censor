import { CensorHTMLComponent } from "./censor-html-component.js"

export class CensorHTMLInputComponent extends CensorHTMLComponent {
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