
// let censorIsEnabled = localeStorage.getItem("isCensorEnabled");
let censorIsEnabled = true;

if (censorIsEnabled === false) chrome.browserAction.setBadgeText({ text: "Off" });

chrome.browserAction.onClicked.addListener(() => {

    censorIsEnabled = !censorIsEnabled;

    // todo remove after testing, the presence of the helicopter should be enough
    let badgeText = censorIsEnabled ? "" : "Off";

    chrome.browserAction.setBadgeText({ text: badgeText });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        let currentOpenTab = tabs[0].id;

        chrome.tabs.sendMessage(currentOpenTab, { enableCensor: censorIsEnabled }, (response) => { });
    });
});