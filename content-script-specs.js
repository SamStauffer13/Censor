// todo, use package.json to pull in jasmine instead of c/p'd files - reason is, we'll be pulling in babel and web pack via this method anyways, no reason to be inconsistent

describe("When applying user settings, ", function(){

    it("the plugin will replace any word on a web page with a word defined in its settings", function(){

        // arrange
        let word = 'fire ants'; 
        let definition = 'spicy boys'; // support the cause: https://goo.gl/6Rl20I
        
        let div = document.createElement("div");
        let span = document.createElement("span");

        span.innerHTML = `bla bla bla ${word} bla bla bla`;

        div.appendChild(span);
        document.body.appendChild(div);

        let fakeDataAccess = new SettingsDataAccess();            
        fakeDataAccess.GetSettings = () => { return { [word] : definition }; }
        
        // act
        let plugin = new SettingsService(fakeDataAccess);

        // assert
        expect(span.innerHTML).toEqual(`bla bla bla ${definition} bla bla bla`);

        div.remove();
    });

    it("the plugin will automatically replace words added after page load", function(done){

        // uses a mutation observer https://goo.gl/iBc25q

        // arrange (copied from above)
        let word = 'fire ants'; 
        let definition = 'spicy boys';

        let div = document.createElement("div");
        let span = document.createElement("span");            

        div.appendChild(span);
        document.body.appendChild(div);

        let fakeDataAccess = new SettingsDataAccess();            
        fakeDataAccess.GetSettings = () => { return { [word] : definition }; }
        
        // act
        let plugin = new SettingsService(fakeDataAccess);

        // BOOM the dom was changed AFTER the plugin ran...
        span.innerHTML = `bla bla bla ${word} bla bla bla`;                       
                    
        // async assert
        setTimeout(function(){

            expect(span.innerHTML).toEqual(`bla bla bla ${definition} bla bla bla`);

            done();
                            
            div.remove();

            }, 100);

            expect(true).toEqual(true);                                         
    });

    it("the plugin will ignore capitolization and plurlization");

    it("the plugin will ignored English determiners like THE and A");

    it("the plugin will recursively utilize keywords to modify a page's contents", function(){
        pending(); // take the first word and the content after it, if the content after it contains the second word, replace the whole string...
    });

});

describe("When displaying user settings,", function(){

    it("clicking on the browser icon will open the interface", function(){
        // arrange            
        let plugin = new SettingsService(new SettingsDataAccess());

        // act
        plugin.DisplaySettings();

        // assert        
        let userInterface = document.getElementById(plugin.pluginID);

        if (userInterface)
        {
            expect(userInterface.style.visibility).toEqual("");
            userInterface.remove();
        }
        else
        {
            fail("user interface does not exist"); 
        }  
    }); 

    it("clicking on the browser icon again will hide the interface", function(){
        // arrange            
        let plugin = new SettingsService(new SettingsDataAccess());

        // act
        plugin.DisplaySettings();
        plugin.DisplaySettings(); 
        
        // assert        
        let userInterface = document.getElementById(plugin.pluginID);
        if (userInterface)
        {
            expect(userInterface.style.visibility).toEqual("hidden");
            userInterface.remove();
        }
        else
        {
            fail("user interface does not exist"); 
        }       
    });    

    it("clicking on a user setting will populate the settings form");

    it("interface should give adequate props to Marat for supplying the attack helicopter icon");
});

describe("When saving user settings,", function(){

});

describe("Developer documentation for the settings data access class", function(){

    let sut;
    beforeEach(() => { sut = new SettingsDataAccess(); });

    it("user settings will be retrieved from local storage", function(){
        // arrange
        let expectedSettings = { "this word" : "that word" };
        localStorage.setItem("WRP", JSON.stringify(expectedSettings));
        // act 
        let actualSettings = sut.GetSettings();
        // assert
        expect(actualSettings).toEqual(expectedSettings); 
    });

    it("default settings will be returned if user settings are empty", function(){
        // arrange
        localStorage.setItem("WRP", '');
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual( {"donald trump" : "mad scientist"} ); 
    });

    it("default settings will be returned if user settings are null", function(){
        // arrange
        localStorage.setItem("WRP", null);
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual( {"donald trump" : "mad scientist"} ); 
    });

    it("default settings will be returned if user settings are invalid json", function(){
        // arrange
        localStorage.setItem("WRP", '{');
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual( {"donald trump" : "mad scientist"} ); 
    });

    it("default settings will be returned if user settings not a JSON object", function(){
        // arrange
        localStorage.setItem("WRP", 9);
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual( {"donald trump" : "mad scientist"} ); 
    });        
});



