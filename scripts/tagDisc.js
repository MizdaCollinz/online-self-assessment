$.get(chrome.extension.getURL('/pages/featureDisc.html'), function(data) {
    $($.parseHTML(data)).appendTo('body');
});
