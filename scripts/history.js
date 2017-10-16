// Returns a promise containing the history items associated with a given domain.
function historyItemsFromDomain(domainName){
    var historyItems = [];
    return new Promise((resolve, reject) => {
        // Get all results - this is the biggest number this API allows.
        chrome.history.search({text:"", maxResults:2147483647}, function(results){
            results.forEach(function(historyItem){
                // If the URL contains the domain name, add it to the list
                if (historyItem.url.indexOf(domainName)!==-1){
                    historyItems.push(historyItem);
                }
            });       
            resolve(historyItems);
        });
    });
}

// Return the sum of the visits to any website in a domain - Reloading a page is not considered a visit.
async function visitCountToDomain(domainName){
    var results = await historyItemsFromDomain(domainName);
    visitCount = 0;
    results.forEach(function(element) {
        visitCount += element.visitCount;
    }, this);
    return visitCount;
} 

// Returns the number of visits of a given transition type
// Uses the transition types listed here: https://developer.chrome.com/extensions/history#transition_types
async function getVisitsByTransition(domainName, transitionType){
    var transitionBreakdown = await getTransitionsInDomain(domainName).then(function(fulfilled){
        return fulfilled;
    });
    return transitionBreakdown[transitionType];
}

// Wrapper function used for chaining promises. 
// Returns a promise containing a transitionBreakdown for a single history item.
async function transitionCountsByHistoryItem(url, transitionBreakdown){
    return new Promise((resolve, reject) => {
        var urlWrapper = {url:url};  
        chrome.history.getVisits(urlWrapper, function(results){
            results.forEach(function(visitItem){
                transitionBreakdown[visitItem.transition]++;
            });
            resolve(transitionBreakdown);
        });
    });
}

// Return a promise containing a breakdown of the transitions of a domain's history items.
async function getTransitionsInDomain(domainName){
    
    // Data will be returned in this format.
    var transitionBreakdown = {
        "link":0, 
        "typed":0, 
        "auto_bookmark":0,
        "auto_subframe":0, 
        "manual_subframe":0, 
        "generated":0, 
        "auto_toplevel":0, 
        "form_submit":0, 
        "reload":0, 
        "keyword":0,
        "keyword_generated":0
    }
    

    var historyItems = await historyItemsFromDomain(domainName);

    // Iterate through each visit of each history item, and increment the transitions as appropriate.
    // Standard for loop is needed, not forEach, due to await call.
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < historyItems.length; i++){
            transitionBreakdown = await transitionCountsByHistoryItem(historyItems[i].url, transitionBreakdown).then(function(resolved){
                return resolved;
            });
        }
        resolve(transitionBreakdown);
    });
}