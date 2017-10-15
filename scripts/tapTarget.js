document.addEventListener("DOMContentLoaded", function() {
    let tagTarget = document.getElementById("menu");
    tagTarget.onclick = function() {
        $('#tagFrame').toggleClass('wide');
        $('.tap-target').tapTarget('open');
    };
});