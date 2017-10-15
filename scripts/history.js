async function historyItemsFromDomain(domainName){
    // Return the history items associated with a given domain.
    let historyItems = [];
    return new Promise((resolve, reject) => {
        // 10000 should get a decent portion of the user's history without lagging.
        chrome.history.search({text:"", maxResults:10000}, function(results){
            for (i=0; i<results.length; i++){
                // If the URL contains the domain name, add it to the list
                console.log(results[i]);
                if (results[i].url.indexOf(domainName)!==-1){
                    historyItems.push(results[i]);
                }
            }
            resolve(historyItems);
        });
    });
}

function visitCountToDomain(domainName){
    // Return the sum of the visits to any website in a domain
} 

function typedCountToDomain(domainName){
    // Return the number of times a user typed in a url in a domain.
}

function linkedCountToDomain(domainName){
    // Return the number of times a user was linked to a page in this domain.
}

function getTransitionsInDomain(domainName){
    // Return a breakdown of the transitions of a domain's history items.
}







// Below here is my old code, for reference.

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
        currentDomainItem = {entryUrl:window.location.url, internalClicks:0, transition:entryTransition};
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