let startTime
let currentUrl = '';
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('Updated');
    if (changeInfo.status === "complete" && tab.active) {
        if (tab.url != 'chrome://newtab/' && tab.url != '') {
            if (currentUrl != tab.url) {
                chrome.storage.local.get('${currentUrl}', function(result) {
                    if (result.start == 'undefined') {
                        startTime = new Date();
                        let obj = {
                            'start': startTime,
                            'end': 0,
                            'total': 0
                        };

                        chrome.storage.local.set({'${tab.url}': obj});
                        currentUrl = tab.url;
                    } else {
                        //idk why using startTime instead of result.start works but eh
                        result.end = new Date() - startTime;
                        result.total = result.total + result.end;
                        console.log('time on site: ' + currentUrl + ' = ' + result.end);
                        startTime = new Date();
                        console.log('new time: ' + startTime);
                        let newObj = {
                            'start': startTime,
                            'end': 0,
                            'total': 0
                        };

                        chrome.storage.local.set({'{$tab.url}': newObj});
                        currentUrl = tab.url;
                    }
                });
            }
        }
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    console.log('Removed');

    chrome.storage.local.get('${currentUrl}', function(result) {
        result.end = new Date() - startTime;
        result.total = result.total + result.end;
        console.log('time on site: ' + currentUrl + ' = ' + result.end);
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log('Activated');
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url != 'chrome://newtab/' && tab.url != '') {
            if (currentUrl != tab.url) {
                chrome.storage.local.get('${currentUrl}', function(result) {
                    //idk why using startTime instead of result.start works but eh
                    result.end = new Date() - startTime;
                    result.total = result.total + result.end;
                    console.log('time on site: ' + currentUrl + ' = ' + result.end);
                    startTime = new Date();
                    console.log('new time: ' + startTime);
                    let newObj = {
                        'start': startTime,
                        'end': 0,
                        'total': 0
                    };

                    chrome.storage.local.set({'{$tab.url}': newObj});
                    currentUrl = tab.url;
                });
            }
        }
    });
});
