
// Open visualisation page on clicking the page-button
document.getElementById("page-button").addEventListener('click',openPage)

function openPage() {
    //Create the visualisation tab
    chrome.tabs.create({url: chrome.extension.getURL('visuals.html')}, function(tab) {
        //Callback
    });    
}