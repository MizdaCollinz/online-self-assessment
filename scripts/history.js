let currentHistoryItem;
let currentDomainItem;
let historyQueryCompleted;
let domainQueryCompleted;

// Promise-based implementation currently suffers from race conditions.

chrome.history.onVisited.addListener(function(result){
    // Set up the asynchonous calls to the history APIs
    currentHistoryItem = result;

    /*
    // Promise-based setup
    historyQueryCompleted = new Promise(function(resolve, reject){
        let urlWrapper = {url:currentHistoryItem.url};
        chrome.history.getVisits(urlWrapper, function(results){
            let index = results.length - 1;
            resolve(results[index].transition);
        });
    });
    */

    /*
    // Promise-based setup
    domainQueryCompleted = new Promise(function(resolve, reject){
        let urlWrapper = {url:currentDomainItem.entryUrl};
        chrome.history.getVisits(urlWrapper, function(results){
            let index = results.length - 1;
            resolve(results[index].transition);
        });
    });
    */
});

// Instantiate the domain item object.
function createDomainItem(){
    if (currentHistoryItem == null){
        chrome.history.search({url:tab.url}, function(results){
            let index = results.length - 1;
            currentHistoryItem = results[index];
            createDomainItem();
            return;
        });
    }
    entryTransition = getTransitionFromHistory(currentHistoryItem, function(entryTransition){
        currentDomainItem = {entryUrl:currentHistoryItem.url, internalClicks:0, transition:entryTransition};
    });
}

// Increase the count of clicks within the current domain
function incrementInternalClicks(){
    currentDomainItem.internalClicks++;
}

// Returns the transition for a history item by getting it's most recent visit item.
function getTransitionFromHistory(historyItem, callback){
// Callback-based implementation
    let urlWrapper = {url:historyItem.url};  
    chrome.history.getVisits(urlWrapper, function(results){
        let index = results.length - 1;
        callback((results[index]).transition);
    });
    
/*
// Promise-based implementation
    historyQueryCompleted.then(function (completed) {
        return completed;
    });
*/
}

// Returns the the transition for a domain item by getting it's most recent visit item.
function getTransitionFromDomain(domainItem, callback){ 
// Callback-based implementation
    let urlWrapper = {url:domainItem.entryUrl};  
    chrome.history.getVisits(urlWrapper, function(results){
        let index = results.length - 1;
        callback((results[index]).transition);
    });

/*
// Promise-based implementation
    domainQueryCompleted.then(function (completed) {
        return completed;
    });
*/
}