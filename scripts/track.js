let startTime, endTime, currentTrack, newTrack, key;
let currentUrl = '';
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        if (tab.url != 'chrome://newtab/' && tab.url != '' && (tab.url.startsWith('http') || tab.url.startsWith('www'))) {
            let newUrl = new URL(tab.url);
            let domain = newUrl.hostname;
            if (currentUrl != domain) {
                key = domain;
                currentTrack = new Promise(function(resolve, reject) {
                    if (currentUrl != '') {
                        chrome.storage.local.get(`${currentUrl}`, function(result) {
                            resolve(result[`${currentUrl}`]);
                        });
                    }
                });
                newTrack = new Promise(function(resolve, reject) {
                    chrome.storage.local.get(`${key}`, function(result) {
                        resolve(result[`${key}`]);
                    });
                });

                createAndSet(tab);
            }
        }
    }
});
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    currentTrack = new Promise(function(resolve, reject) {
        if (currentUrl != '') {
            chrome.storage.local.get(`${currentUrl}`, function(result) {
                resolve(result[`${currentUrl}`]);
            });
        }
    });

    updateCurrent();
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url != 'chrome://newtab/' && tab.url != '' && (tab.url.startsWith('http') || tab.url.startsWith('www'))) {
            let newUrl = new URL(tab.url);
            let domain = newUrl.hostname;
            if (currentUrl != domain) {
                key = domain;
                currentTrack = new Promise(function(resolve, reject) {
                    if (currentUrl != '') {
                        chrome.storage.local.get(`${currentUrl}`, function(result) {
                            resolve(result[`${currentUrl}`]);
                        });
                    }
                });
                newTrack = new Promise(function(resolve, reject) {
                    chrome.storage.local.get(`${key}`, function(result) {
                        resolve(result[`${key}`]);
                    });
                });

                createAndSet(tab);
            }
        }
    });
});

function createAndSet(tab) {
    newTrack.then(function(resolvedObj) {
        let obj;
        if (typeof resolvedObj === 'undefined') {
            startTime = new Date();
            obj = {
                'visits' : [{
                    'historyitem' : {},
                    'time' : {
                        'start' : `${startTime}`,
                        'end' : '0'
                    }
                }],
                'tags' : []
            };
        } else {
            startTime = new Date();
            let newVisit = {
                'historyitem' : {},
                'time' : {
                    'start' : `${startTime}`,
                    'end' : '0'
                }
            };
            resolvedObj.visits.push(newVisit);
            obj = resolvedObj;
        }
        let dataObj = {};
        dataObj[key] = obj;
        chrome.storage.local.set(dataObj);

        updateCurrent();

        return new URL(tab.url).hostname;
    }).then(function(newUrl) {
        currentUrl = newUrl;
    });
}

function updateCurrent() {
    currentTrack.then(function(prevObj) {
        let lastVisit = prevObj.visits[prevObj.visits.length - 1];
        endTime = new Date();
        lastVisit.time.end = `${endTime}`;
        let dataObj = {};
        dataObj[currentUrl] = prevObj;
        chrome.storage.local.set(dataObj);
    });
}
