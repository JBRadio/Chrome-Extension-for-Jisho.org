chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.method == "getSelection")
    {
        // Credit: http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        
        sendResponse({data: text});
        
    } else {
      sendResponse({data:""});
    }
});