// todo reduce looping in watch algorithm
// todo improve UI creation algorithm
// program escape key
// program enter key
// update replaced on save
// hitting icon with menu open wipes all settings
// uglify in package.json
// compile css via browserify
// https://chrome.google.com/webstore/detail/censor/nhmdjmcfaiodoofhminppdjdhfifflbf
// todo impliment Bias calculator. Highlights trigger words… Gives count of how Biased news source is… 
// no need for semi colons
'use strict'

import { CensorService } from "../censor-service.js"

import { CensorElements } from "../censor-elements.js"

export class Censor {

    constructor() {

        this.service = new CensorService();
        let elements = new CensorElements();
        this.icon = elements.icon;
        this.menu = elements.menu;
        this.inputLeft = elements.inputLeft;
        this.inputRight = elements.inputRight;

        if (this.service.ShouldRunOnPageLoad() === true) {

            this.icon.Display();

            this.service.Start();
        }

        if (chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((request) => this.OnBrowserIconClick(request.enableCensor));

        this.SetupCensorMenu();
    }

    OnBrowserIconClick(enableCensor) {

        if (enableCensor === true) {

            this.icon.Display();

            this.service.Start();

        } else if (enableCensor === false) {

            this.icon.Remove();

            this.menu.Remove();

            this.service.Stop();
        }
    }

    SetupCensorMenu() {

        this.icon.element.onclick = () => {

            this.menu.Display();

            this.icon.Remove();
        }

        this.menu.element.onclick = () => {

            this.menu.Remove();

            this.icon.Display();
        }

        this.inputLeft.element.onmouseover = () => this.inputLeft.element.focus();

        this.inputLeft.element.onclick = (e) => e.stopPropagation();

        this.inputRight.element.onmouseover = () => this.inputRight.element.focus();

        this.inputRight.element.onclick = (e) => e.stopPropagation();
    }
}
