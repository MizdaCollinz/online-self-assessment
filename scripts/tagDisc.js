let iframe = document.createElement("iframe");
iframe.src = chrome.extension.getURL("./pages/featureDisc.html");
iframe.setAttribute("style", "border: none; width: 72px; height: 72px; z-index: 999; position: fixed; bottom: 0; right: 0;");
iframe.setAttribute("id", "tagFrame");

iframe.addEventListener('click', function() {
    iframe.height('600px');
    iframe.width('400px');
});

document.body.appendChild(iframe);