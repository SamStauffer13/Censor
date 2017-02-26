
// let censorIsEnabled = localeStorage.getItem("isCensorEnabled");
let censorIsEnabled = true;

chrome.browserAction.onClicked.addListener(() => {

    censorIsEnabled = !censorIsEnabled;

    // todo remove after testing, the presence of the helicopter icon should illustrate that the plugin is enabled/disabled
    let badgeText = censorIsEnabled ? "" : "Off";
    chrome.browserAction.setBadgeText({ text: badgeText });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        let currentOpenTab = tabs[0].id;

        chrome.tabs.sendMessage(currentOpenTab, { enableCensor: censorIsEnabled }, (response) => { });
    });
});