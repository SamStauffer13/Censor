// eventually I'd like the manifest to reference a folder containing es5 compiled code

'use strict';

class SettingsService
{
    constructor(SettingsDataAccess)
    {  
        this.db = SettingsDataAccess;
        this.timesInvoked = 1;     
        
        // chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { if (request.displaySettings) this.DisplaySettings(); });

        this.ApplySettings(); 

        // todo pass in relevant mutant nodes ( exluding our UI nodes ) instead of entire document body 
        new MutationObserver( mutations => { this.ApplySettings();  }).observe(document.body, { subtree: true, childList: true }); 
    }

    ApplySettings(domToParse = document.body)
    {
        let start = performance.now();
        
        let settings = this.db.GetSettings(), textNodeOnPage, ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);
        
        while (textNodeOnPage = ent.nextNode())
        {
            Object.keys(settings).forEach( word => { textNodeOnPage.nodeValue = textNodeOnPage.nodeValue.replace(word, settings[word]); }); 
        }

        // todo remove this once testing is complete
        console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);            
    }

    DisplaySettings(hideMenu)
    {
        console.log("displaying...");
        // if its already displaying on the page and this is called, then hide it
        // if it exists on the plugin, show it 
        // else get settings from db and build it
        // let marquee = document.createElement("marquee");
        // marquee.addEventListener("click", this.SaveSettings());
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
