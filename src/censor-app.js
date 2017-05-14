// uglify + nodesass
// update delete functonality to remove only the selected setting
// update, clicking right or left keys swipes through settings
// update task runner with correct map files 
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

        this.setupCensorMenu();

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.onBrowserIconClick(request.enableCensor));
    }

    onBrowserIconClick(enableCensor) {

        if (this.menu.isShowing === true) {

            this.inputLeft.clear()

            this.inputRight.clear()

            this.service.delete()

        } else if (enableCensor === true) {

            this.icon.show();

            this.service.start();

        } else if (enableCensor === false) {

            this.icon.hide();

            this.menu.hide();

            this.service.stop();
        }
    }

    setupCensorMenu() {

        this.icon.e.onclick = () => {

            this.service.stop()

            this.menu.show()

            this.icon.hide()
        }

        let closeMenu = () => {

            this.menu.hide();

            this.icon.show();

            this.service.start();
        }

        // todo, leverage the chrome api instead of brute force js
        this.menu.e.onkeyup = (e) => {
            const enterKey = 13
            const escapeKey = 27
            const leftArrowKey = 37
            const rightArrowKey = 39
            switch (e.keyCode) {
                case enterKey:
                    this.theD.show()
                    this.service.update(this.inputLeft.e.value, this.inputRight.e.value)
                    break
                case escapeKey:
                    closeMenu()
                    break
                default: this.theD.hide()
            }
        }
    }
}