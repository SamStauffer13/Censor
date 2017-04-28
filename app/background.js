
let censorIsEnabled = true;

chrome.browserAction.onClicked.addListener(() => {

    censorIsEnabled = !censorIsEnabled;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        let currentOpenTab = tabs[0].id;

        chrome.tabs.sendMessage(currentOpenTab, { enableCensor: censorIsEnabled }, (response) => { });
    });
});