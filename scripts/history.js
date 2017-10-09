let currentHistoryItem;
let currentDomainItem;
let historyQueryCompleted;
let domainQueryCompleted;

chrome.history.onVisited.addListener(function(result){
    
    // Set up the asynchonous calls to the history APIs
    currentHistoryItem = result;
    historyQueryCompleted = new Promise(function(resolve, reject){
        let urlWrapper = {url:currentHistoryItem.url};
        chrome.history.getVisits(urlWrapper, function(results){
            let index = results.length - 1;
            resolve(results[index].transition);
        });
    });

    // Create and set up the domain history object
    createDomainItem();
    domainQueryCompleted = new Promise(function(resolve, reject){
        let urlWrapper = {url:currentDomainItem.entryUrl};
        chrome.history.getVisits(urlWrapper, function(results){
            let index = results.length - 1;
            resolve(results[index].transition);
        });
    });

});

// Instantiate the domain item object.
function createDomainItem(){
    entryTransition = getTransitionFromHistory(currentHistoryItem);
    currentDomainItem = {entryUrl:currentHistoryItem.url, internalClicks:0, transition:entryTransition};
}

// Increase the count of clicks within the current domain
function incrementInternalClicks(){
    currentDomainItem.internalClicks++
}

// Returns the transition for a history item by resolving the promise created on page load.
function getTransitionFromHistory(historyItem){
/*
Alternate callback-based implementation

    let urlWrapper = {url:historyItem.url};  
    chrome.history.getVisits(urlWrapper, function(results){
        let index = results.length - 1;
        return (results[index]).transition;
    });
*/

    historyQueryCompleted.then(function (completed) {
        return completed;
    });
}

// Returns the the transition for a domain item by resolving the promise created on page load.
function getTransitionFromDomain(domainItem){ 
/*
Alternate callback-based implementation

    let urlWrapper = {url:domainItem.entryUrl};  
    chrome.history.getVisits(urlWrapper, function(results){
        let index = results.length - 1;
        return (results[index]).transition;
    });
*/

    domainQueryCompleted.then(function (completed) {
        return completed;
    });
}