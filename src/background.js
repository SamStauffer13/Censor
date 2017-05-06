let censorIsEnabled = true

chrome.browserAction.onClicked.addListener(() => {

    censorIsEnabled = !censorIsEnabled

    const settings = { active: true, currentWindow: true }

    chrome.tabs.query(settings, (tabs) => {

        const currentOpenTab = tabs[0].id

        const request = { enableCensor: censorIsEnabled }

        chrome.tabs.sendMessage(currentOpenTab, request, (response) => { })
    })
})