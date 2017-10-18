const commonTags = {
    'Entertainment': ["reddit.com", "netflix.com", "youtube.com"],
    'Productivity': [],
    'Social Networking': ["facebook.com", "instagram.com", "twitter.com", "messenger.com"]
};
let startTime, endTime, currentTrack, newTrack, key;
let currentUrl = '';
let period;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        if (tab.url != 'chrome://newtab/' && tab.url != '' && (tab.url.startsWith('http') || tab.url.startsWith('www'))) {
            let newUrl = new URL(tab.url);
            let domain = newUrl.hostname;
            if (currentUrl != domain) {
                period = 2;
                chrome.alarms.create("Break", {
                    delayInMinutes: 120,
                    periodInMinutes: 120
                });
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
    chrome.alarms.clear("Break");
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
                chrome.alarms.clear("Break");
                period = 1;
                chrome.alarms.create("Break", {
                    delayInMinutes: 120,
                    periodInMinutes: 120
                });
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

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "Break") {
        let opt = {
            type: 'basic',
            iconUrl: './images/break.png',
            title: 'Take a break',
            message: 'You have been on this page for ' + period + ' hours. Consider taking a break.'
        };
        chrome.notifications.create('reminder', opt);
        period += 2;
    }
});

function createAndSet(tab) {
    newTrack.then(function(resolvedObj) {
        let obj;
        if (typeof resolvedObj === 'undefined') {
            startTime = new Date();
            let siteTag = [];
            let mapKeys = Object.keys(commonTags);
            for (let i = 0; i < mapKeys.length; i++) {
                let sites = commonTags[mapKeys[i]];
                for (let j = 0; j < sites.length; j++) {
                    if (key.indexOf(sites[j]) !== -1) {
                        siteTag.push(mapKeys[i]);
                        break;
                    }
                }
            }
            obj = {
                'visits' : [{
                    'time' : {
                        'start' : `${startTime}`,
                        'end' : '0'
                    }
                }],
                'tags' : siteTag
            };
        } else {
            startTime = new Date();
            let newVisit = {
                'time' : {
                    'start' : `${startTime}`,
                    'end' : '0'
                }
            };
            resolvedObj.visits.push(newVisit);
            obj = resolvedObj;
        }
        if (obj.tags.length === 0) {
            let opt = {
                type: 'basic',
                iconUrl: './images/tag.jpg',
                title: 'Untagged',
                message: 'This page is currently untagged. Open the extension to tag this page.'
            }
            chrome.notifications.create('untagged', opt);
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
