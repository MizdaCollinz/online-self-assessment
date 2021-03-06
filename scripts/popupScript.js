
// Open visualisation page on clicking the page-button
//document.getElementById("page-button").addEventListener('click',openPage)

function openPage() {
    //Create the visualisation tab
    chrome.tabs.create({url: chrome.extension.getURL('./pages/visuals.html')});   
}

function clearData() {
    chrome.storage.local.clear();
    window.close();
}

document.addEventListener('DOMContentLoaded', function() {
    let divs = document.querySelectorAll('div.chip');
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
                    if (resolvedObj.tags.indexOf(e.target.innerText.slice(0, -6)) == -1) {
                        resolvedObj.tags.push(e.target.innerText.slice(0, -6));
                        let newObj = {};
                        newObj[domain] = resolvedObj;
                        chrome.storage.local.set(newObj);
                    }
                }).then(function() {
                    window.close();
                });
            });
        });
    }

    let button = document.querySelectorAll('a');
    button[0].addEventListener('click', openPage);
    button[1].addEventListener('click', clearData);
});
