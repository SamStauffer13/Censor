// uglify + nodesass
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf
'use strict'

import { CensorService } from "./censor-service.js"

import { CensorElements } from "./censor-elements.js"

export class Censor {

    constructor() {

        this.service = new CensorService()
        let elements = new CensorElements()
        this.icon = elements.icon
        this.menu = elements.menu
        this.theD = elements.theD
        this.inputLeft = elements.inputLeft
        this.inputRight = elements.inputRight

        if (this.service.shouldRunOnPageLoad() === true) {

            this.icon.show();

            this.service.start();
        }

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.onBrowserIconClick(request.enableCensor));

        this.setupCensorMenu();
    }

    onBrowserIconClick(enableCensor) {

        if (enableCensor === true) {

            this.icon.show();

            this.service.start();

        } else if (enableCensor === false) {

            if (this.menu.isShowing === true) this.service.delete()

            this.icon.hide();

            this.menu.hide();

            this.service.stop();
        }
    }

    setupCensorMenu() {

        this.icon.e.onclick = () => {

            this.menu.show();

            this.icon.hide();
        }

        let close = () => {

            this.menu.hide();

            this.icon.show();
        }

        this.menu.e.onclick = close

        this.menu.e.onkeyup = (e) => {
            const enterKey = 13
            const escapeKey = 27
            switch (e.keyCode) {
                case enterKey:
                    this.theD.show()
                    this.service.update(this.inputLeft.e.value, this.inputRight.e.value)
                    break;
                case escapeKey:
                    close()
                    break;
                default: this.theD.hide()
            }
        }

        this.inputLeft.e.onmouseover = () => this.inputLeft.e.focus();

        this.inputRight.e.onmouseover = () => this.inputRight.e.focus();
    }
}