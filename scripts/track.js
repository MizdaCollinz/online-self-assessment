let startTime, endTime, tabNumber 
let currentUrl = '';
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('Updated');
    if (changeInfo.status === "complete" && tab.active) {
        tabNumber = tabId;
        if (tab.url != 'chrome://newtab/' && tab.url != '') {
            if (currentUrl != tab.url) {
                endTime = new Date();
                let timeOnSite = endTime - startTime;
                console.log('time on site: ' + currentUrl + ' = ' + timeOnSite)
                currentUrl = tab.url;
                startTime = new Date();
                console.log('new time: ' + startTime);
            }
        }
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    console.log('Removed');
    if (tabNumber == tabId) {
        endTime = new Date();
        console.log('end time: ' + endTime);
        let timeOnSite = endTime - startTime;
        console.log('time on site: ' + timeOnSite);
    }
});
