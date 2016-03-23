chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // CONTENT SCRIPT - TEXT SELECTION SEED (EVENT LISTENER) << MESSAGE OUTBOUND >>
    // ------------------------------------
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
        
    }
    
    // CONTENT SCRIPT - DARK\LIGHT THEME (EVENT LISTENER) << MESSAGE INBOUND >>
    // ---------------------------------
    if (request.method == "changeThemeDark" && document.location.host == "jisho.org") {
        
        // #.) Create <link> tag to add dark theme CSS file to the DOM
        var cssLink = document.createElement("link");
            console.log(chrome.extension.getURL("/css/darkRedTheme.css"));
            cssLink.href = chrome.extension.getURL("/css/darkRedTheme.css"); 
            cssLink .rel = "stylesheet";
            cssLink .type = "text/css";
            document.head.appendChild(cssLink);
        // cssLink.href = "chrome-extension://cpijlhjblmbllnphcaogikhdbdmmofhm/css/darkRedTheme.css";
        
    }
    
    if (request.method == "changeThemeLight" && document.location.host == "jisho.org") {
        // #.) Gather all <link> tags
        var darkCssLink = document.getElementsByTagName("link");
        
        // #.) Determine if we can remove the dark theme <link> tag
        if ( darkCssLink.length > 0 ) {
            var lastLinkTag = darkCssLink[ darkCssLink.length - 1];
            if ( lastLinkTag.rel = "stylesheet" && lastLinkTag.href == "/css/darkRedTheme.css")
                lastLinkTag.parentNode.removeChild(lastLinkTag);
        }   
    }
});


// CONTENT SCRIPT - DARK THEME (LOAD CSS) -- Autoload if theme is dark

// #.) Make sure hostname is Jisho.org
if ( document.location.host == "jisho.org" ) {
    
    // #.) Send a message to popup.js to indicate that a content script was added
    //      popup.js will then call "changeThemeDark" if necessary
    chrome.runtime.sendMessage({method: "checkCurrentTheme"}, function(response) {
        // DEBUG:
        //console.log("Content_script.js - Received response for checkCurrentTheme");
        //console.log("Content_script.js - Response received: " + response );
    });
}