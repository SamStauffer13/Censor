// todo: use package.json to pull in jasmine instead of c/p'd files - reason is, we'll be pulling in babel and web pack via this method anyways, no reason to be inconsistent
// todo: test fail randomly due to order of execution, impliment async assertions

describe("Censor will begin replace content as soon as the page loads, ", function () {

    it("and will continue to replace content after the page loads", function (done) {

        pending(); // uses a mutation observer https://goo.gl/iBc25q

        let word = 'fire ants';
        let definition = 'spicy boys';

        let div = document.createElement("div");
        let span = document.createElement("span");

        div.appendChild(span);
        document.body.appendChild(div);

        let fakeDataAccess = new SettingsDataAccess();
        fakeDataAccess.GetSettings = () => { return { [word]: definition }; }

        // act
        let plugin = new SettingsService(fakeDataAccess);

        // BOOM the dom was changed AFTER the plugin ran...
        span.innerHTML = `bla bla bla ${word} bla bla bla`;

        // async assert
        setTimeout(function () {

            expect(span.innerHTML).toEqual(`bla bla bla ${definition} bla bla bla`);

            done();

            div.remove();

        }, 100);

        expect(true).toEqual(true);
    });

    let integrationsTest = (variation, expected, markAsPending) => {

        it(`Censor will replace ${variation} with ${expected}`, function () {

            if (markAsPending) pending();

            // arrange
            let div = document.createElement("div");
            let span = document.createElement("span");

            span.innerHTML = `bla bla bla ${variation} bla bla bla`;

            div.appendChild(span);
            document.body.appendChild(div);

            // act
            let plugin = new SettingsService(new SettingsDataAccess());

            // assert
            expect(span.innerHTML).toEqual(`bla bla bla ${expected} bla bla bla`);

            div.remove();
        });
    }

    let expected = "A Mad Scientist";
    describe(`By default, Censor will replace variations of Donald Trump with ${expected}`, () => {

        integrationsTest("Donald Trump", expected);
        integrationsTest("donald trump", expected);
        integrationsTest("DoNalD TruMp", expected);
        integrationsTest("Donald Trump's", expected + "'s");
        integrationsTest("Mr. Trump", expected, true);
        integrationsTest("Donald J. Trump", expected);
        integrationsTest("Donald - China Invented Climate Change - Trump", expected);
    });

    let expected2 = "A Six Foot Tall Giant Robot";
    describe(`By default, Censor will replace variations of Hillary Clinton with ${expected}`, () => {

        integrationsTest("Hillary Clinton", expected2);
        integrationsTest("hillary clinton", expected2);
        integrationsTest("hiLlAry cLinTon", expected2);
        integrationsTest("Hillary Clinton's", expected2 + "'s");
        integrationsTest("Mrs. Clinton", expected2, true);
        integrationsTest("Hillary D. Clinton", expected2);
        integrationsTest("Hillary - What's A Felony - Clinton", expected2);
        
    });
});

it("clicking the Censor icon will open the interface", function () {
        // arrange            
        let plugin = new SettingsService(new SettingsDataAccess());

        // act
        plugin.DisplaySettings();

        // assert        
        let userInterface = document.getElementById(plugin.cssElements.popup);

        if (userInterface) {

            expect(userInterface.style.visibility).toEqual("");
            userInterface.remove();

        }
        else fail("user interface does not exist");
    });

    it("clicking the Censor icon a second time will hide the interface", function () {
        // arrange            
        let plugin = new SettingsService(new SettingsDataAccess());

        // act
        plugin.DisplaySettings();
        plugin.DisplaySettings();

        // assert        
        let userInterface = document.getElementById(plugin.cssElements.popup);
        if (userInterface) {

            expect(userInterface.style.visibility).toEqual("hidden");
            userInterface.remove();

        }
        else fail("user interface does not exist");
    });

it("The interface should give adequate props to Marat @ The Noun Project for supplying the Attack Helicopter icon");
it("The interface should give adequate props to Luke Lisis @ LisiDesign.com for supplying the Summit font");

describe("Developer documentation for the settings data access class", function () {

    let sut;
    beforeEach(() => { sut = new SettingsDataAccess(); });

    it("user settings will be retrieved from local storage", function () {
        // arrange
        let expectedSettings = { "this word": "that word" };
        localStorage.setItem(sut.storageKey, JSON.stringify(expectedSettings));
        // act 
        let actualSettings = sut.GetSettings();
        // assert
        expect(actualSettings).toEqual(expectedSettings);
    });

    it("user notes will be retrieved from local storage", function () {
        // arrange
        let expectedNotes = "my spirit animal comes in a pretzel bun";
        localStorage.setItem(sut.notesKey, expectedNotes);
        // act 
        let actualNotes = sut.GetNotes();
        // assert
        expect(actualNotes).toEqual(expectedNotes);
    });

    it("default settings will be returned if user settings are empty", function () {
        // arrange
        localStorage.setItem(sut.storageKey, '');
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual(sut.defaultSettings);
    });

    it("default settings will be returned if user settings are null", function () {
        // arrange
        localStorage.setItem(sut.storageKey, null);
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual(sut.defaultSettings);
    });

    it("default settings will be returned if user settings are invalid json", function () {
        // arrange
        localStorage.setItem(sut.storageKey, '{');
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual(sut.defaultSettings);
    });

    it("default settings will be returned if user settings not a JSON object", function () {
        // arrange
        localStorage.setItem(sut.storageKey, 9);
        // act 
        let result = sut.GetSettings();
        // assert
        expect(result).toEqual(sut.defaultSettings);
    });
});