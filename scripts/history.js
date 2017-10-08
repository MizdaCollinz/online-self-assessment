let currentHistoryItem = '';
chrome.history.onVisited.addListener(function(result){
    currentHistoryItem = result;
    
});

