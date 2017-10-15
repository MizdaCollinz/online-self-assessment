
// Open visualisation page on clicking the page-button

function openPage() {
    //Create the visualisation tab
    chrome.tabs.create({url: chrome.extension.getURL('./pages/visuals.html')}, function(tab) {
        //Callback
    });   
}

document.addEventListener('DOMContentLoaded', function() {
    let divs = document.querySelectorAll('div');
    for (let i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', function(e) {
            chrome.tabs.query({
                'active': true,
                'currentWindow': true
            }, function(tabs) {
                let tabUrl = new URL(tabs[0].url);
                let domain = tabUrl.hostname;
            
                let dataObj = new Promise(function(resolve, reject) {
                    chrome.storage.local.get(`${domain}`, function(result) {
                        resolve(result[`${domain}`]);
                    });
                }).then(function(resolvedObj) {
                    if (resolvedObj.tags.indexOf(e.target.id) == -1) {
                        resolvedObj.tags.push(e.target.id);
                        let newObj = {};
                        newObj[domain] = resolvedObj;
                        chrome.storage.local.set(newObj);
                    }
            
                    window.close();
                });
            });
        });
    }

    let button = document.querySelectorAll('button');
    button[0].addEventListener('click', openPage);
});
