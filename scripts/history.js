let currentHistoryItem;
let currentDomainItem;

chrome.history.onVisited.addListener(function(result){
    currentHistoryItem = result;
    /*  Logging stuff
    console.log("ID: " + currentHistoryItem.id);
    console.log("URL: "+ currentHistoryItem.url);    
    console.log("Title: "+ currentHistoryItem.title);
    console.log("Last visit time: "+ currentHistoryItem.lastVisitTime);
    console.log("Visit count: "+ currentHistoryItem.visitCount);
    console.log("Typed count: "+ currentHistoryItem.typedCount);
    let newObj = {url:currentHistoryItem.url};
    chrome.history.getVisits(newObj, function(results){
        for (i=0; i<results.length; i++){
            console.log(results[i].visitTime);
            // The last item in this array is the most recent visit
        }
    });
    */
});

function createDomainItem(){

}

function getDomainItem(){

}

function setDomainItem(domainItem){

}

function incrementInternalClicks(historyItem){

}

function getURL(historyItem){

}

function getTransition(historyItem){    

}