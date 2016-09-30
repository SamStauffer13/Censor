// todo, research if this is best practice / is there a more concise approach 
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { displaySettings: "true" }, function (response) {
        });
    });
});       