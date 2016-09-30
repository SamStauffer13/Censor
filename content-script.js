// eventually I'd like the manifest to reference a folder containing es5 compiled code

'use strict';

class SettingsService
{
    constructor(SettingsDataAccess)
    {  
        this.db = SettingsDataAccess;

        this.timesInvoked = 1;        

        this.pluginKey = "2646C6BD6CCCCF9947F69EF256CA8";
        this.saveButtonKey = "8F2C924C61BA96CBAB68E3CB2DA44";
        this.marqueeKey = "A3EC18473FC9AD6A41BA384C61C77"        
        
        this.ApplySettings(); 

        // todo: pass in chrome API as dependency and fake it in the unit tests 
        if(chrome.runtime.onMessage) chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => { if (request.displaySettings) plugin.DisplaySettings(); });

        // todo: pass in relevant mutant nodes ( exluding our UI nodes ) instead of entire document body 
        new MutationObserver( mutations => { this.ApplySettings();  }).observe(document.body, { subtree: true, childList: true });
    }

    ApplySettings(domToParse = document.body)
    {
        let start = performance.now();
        
        let settings = this.db.GetSettings(), ent = document.createTreeWalker(domToParse, NodeFilter.SHOW_TEXT);
        
        while (ent.nextNode())
        {
            Object.keys(settings).forEach( word => { ent.currentNode.nodeValue = ent.currentNode.nodeValue.replace(word, settings[word]); }); 
        }

        console.info(`plugin took ${performance.now() - start} ms on execution #${this.timesInvoked++}`);            
    }

    DisplaySettings()
    {        
        let popup = document.getElementById(this.pluginKey);

        if (popup)
        {           
            if (popup.style.visibility == "hidden") return popup.style.visibility = ""; // show

            return popup.style.visibility = "hidden"; // hide
        }         

        // todo: inject a stylesheet
        let styles = 
        {
            popup : 
            `opacity:0.8;
            background-color: dimgrey;
            position:fixed;
            width:100%;
            height:100%;
            top:0px;
            left:0px;
            z-index:1000;
            text-align: center;
            vertical-align: middle;
            font-weight:bold;
            font-size:50px;  
            color: white;  `,
            marquee:
            `display:block;`,
            saveButton : 
            `margin-top: 100px;
            background:none!important;
            border:none; 
            padding:0!important;
            font: inherit;    
            color: inherit;
            cursor: pointer;
            font-size: 100px;`
        }

        let settingsFromDb = this.db.GetSettings(), marKey="", image="";        
        let settings = Object.keys(settingsFromDb).forEach( word => { marKey += `<marquee id=${this.marqueeKey} style="${styles.marquee}"> ${word} is a ${settingsFromDb[word]} </marquee> `; });
        
        if(chrome.extension) image = `<img src=${chrome.extension.getURL("/icon-large.png")}/>`;
                
        popup = document.createElement("div");
        popup.innerHTML = `<div id=${this.pluginKey} style="${styles.popup}"> ${marKey} ${image} <button id=${this.saveButtonKey} style="${styles.saveButton}"> :) </button> </div>`;              
        document.body.appendChild(popup);

        document.getElementById(this.saveButtonKey).addEventListener("click", () => { this.SaveSettings(); });        
        // document.getElementById(this.marqueeKey).addEventListener("click", () => { console.log("populated"); });
    }

    SaveSettings()
    {
        let popup = document.getElementById(this.pluginKey);
        return popup.style.visibility = "hidden"; // hide
    }
}

class SettingsDataAccess
{
    constructor()
    {            
        this.storageKey = "7DCF8FAAC5ECB6FF17DF5487735A7";
        this.defaultSettings = {"Donald Trump" : "A Mad Scientist", "Hillary Clinton" : "A Six Foot Tall Giant Robot"}; // todo refactor this to use a map instead of key value object 
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
        localStorage.setItem(this.storageKey, JSON.stringify(settings));
    }
}