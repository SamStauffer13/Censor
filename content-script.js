// eventually I'd like the manifest to reference a folder containing es5 compiled code

'use strict';

class SettingsService
{
    constructor(SettingsDataAccess)
    {  
        this.db = SettingsDataAccess;

        this.timesInvoked = 1;        

        this.pluginID = "asdfsdafsadfsadfsdfsas";
        
        // chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { if (request.displaySettings) this.DisplaySettings(); });

        this.ApplySettings(); 

        // todo pass in relevant mutant nodes ( exluding our UI nodes ) instead of entire document body 
        new MutationObserver( mutations => { this.ApplySettings();  }).observe(document.body, { subtree: true, childList: true }); 
    }

    ApplySettings(domToParse = document.body)
    {
        let start = performance.now();
        
        // todo refactor this to use a map instead of key value object
        let settings = this.db.GetSettings(), ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);
        
        while (ent.nextNode())
        {
            Object.keys(settings).forEach( word => { ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, settings[word]); }); 
        }

        // todo remove this once testing is complete
        console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);            
    }

    DisplaySettings()
    {        
        let popup = document.getElementById(this.pluginID);

        if (popup)
        {           
            if (popup.style.visibility == "hidden") return popup.style.visibility = ""; // show

            return popup.style.visibility = "hidden"; // hide
        }         

        // let settingsFromDb = db.GetSettings(); 
        // let settings = Object.keys(settingsFromDb).forEach( word => { `<marquee style="display:block;"> ${word} is a ${settingsFromDb[word]} </marquee>` });        
        // let settingsInput = `<div style=""> <input style="" value=""/> is a <input style="" value=""/> </div>`;
        // let saveButton = `<button style=""> Stay Strange </button>`;

        popup = document.createElement("div");

        let popupStyles = "opacity: 0.8;background-color: dimgrey;position: fixed;width: 100%;height: 100%;top: 0px;left: 0px;z-index: 1000;text-align: center;vertical-align: middle;font-weight: bold;font-size: 50px;color: white;";
        popup.innerHTML = `<div id=${this.pluginID} style="${popupStyles}"> Hello World! </div>`;
              
        document.body.appendChild(popup);

        // sets listener that would trigger save then apply
        // let saveButton = document.createElement("button");
        // saveButton.addEventListener("click", this.SaveSettings());
    }

    SaveSettings()
    {
        // gets settings from dom and pushes to plugin storage
        // gets from plugin storage and saves settings to db
    }
}   

class SettingsDataAccess
{
    constructor()
    {            
        this.storageKey = "WRP";
        this.defaultSettings = { "donald trump" : "mad scientist" }; 
    }

    GetSettings()
    {
        let settings = localStorage.getItem(this.storageKey);

        try
        {                
            let parsed = JSON.parse(settings); 
            if (parsed && typeof parsed === 'object') return parsed;                
        }
        catch(error)
        {
            // console.warn(`${error.message} while parsing: ${settings}`);
        }

        return this.defaultSettings; 
    }

    UpdateSettings(settings)
    {
        localStorage.setItem("WRP", JSON.stringify(settings));
    }
}

// let plugin = new SettingsService(new SettingsDataAccess());
// chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { if (request.displaySettings) plugin.DisplaySettings(); });
