chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // DEBUG:
    //console.log("Content script: Received message with request " + request.method );
    
    switch ( request.method ) 
    {
    
        // CONTENT SCRIPT - TEXT SELECTION SEED (EVENT LISTENER) << MESSAGE OUTBOUND >>
        // ------------------------------------
        case "getSelection":
            //console.log("Processing: " + request.method);
            
            // Credit: http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            
            //console.log("Text Selected(" + text.length + "): " + text);
            sendResponse({method:"searchSelectedText", data: text});

        break;

        // CONTENT SCRIPT - DARK\LIGHT THEME (EVENT LISTENER) << MESSAGE INBOUND >>
        // ---------------------------------
        case "themeClick":
            if ( !request.data || request.data == undefined ) {
                console.log("data for " + request.method + "is invalid: " + request.data)
                return;
            }
            themeClicked(request.data);
            break;
        
            
        // CONTENT SCRIPT - BACK, FORWARD, TOP, HOME (EVENT LISTENER) << MESSAGE INBOUND >>
        // -----------------------------------------
        case "bottomMenuClick":
            if ( !request.data || request.data == undefined ) {
                console.log("data for " + request.method + "is invalid: " + request.data)
                return;
            }
            
            if (request.data == "link") {
                if ( document.location.host !== "jisho.org" )
                    return; // We should only be performing these methods in the <iframe>
                
                //console.log("Link clicked, sending: " + document.location.href);
                sendResponse({method:"CopyToClipboard", data:document.location.href});
            } else            
                bottomMenuClicked(request.data);
            
            break;
        
            
        // CONTENT SCRIPT - <iframe>.load() (EVENT LISTENER) << MESSAGE INBOUND >>
        // --------------------------------
        case "getNewIframeLocation":
            // Fired from <iframe>'s load() event in Popup.js
            //console.log("Processing: " + request.method);
            
            // Ignore all non-Jisho loaded requests
            if ( document.location.host !== "jisho.org" ) {
                //console.log("Host rejection: " + document.location.host);
                return;
            }
            
            // Ignore non-Jisho searches (Forums, About, etc.)
            if ( document.location.href.indexOf("http://jisho.org/search/") == -1 ) {
                //console.log("URL rejection: " + document.location.href);
                return;
            }
            
            //console.log("Sending response for: " + document.location.href);
            sendResponse({method:"updateLastSearched", data: document.location.href});
            break;
            
    default:
        console.log("Method is invalid: " + request.method);
    }
    
    
    function themeClicked(themeClicked) {
        // themeClicked = "Light" || "Dark";
        
        if ( document.location.host !== "jisho.org" )
            return; // We should only be performing these methods in the <iframe>
        
        switch( themeClicked ) 
        {
            case "Dark":
                // #.) Create <link> tag to add dark theme CSS file to the DOM
                var cssLink = document.createElement("link");
                    //console.log(chrome.extension.getURL("/css/darkRedTheme.css"));
                    cssLink.href = chrome.extension.getURL("/css/darkRedTheme.css"); 
                    cssLink .rel = "stylesheet";
                    cssLink .type = "text/css";
                    document.head.appendChild(cssLink);
                // cssLink.href = "chrome-extension://cpijlhjblmbllnphcaogikhdbdmmofhm/css/darkRedTheme.css";
                break;

            case "Light":
                // #.) Gather all <link> tags
                var darkCssLink = document.head.getElementsByTagName("link"); // Search only <head>

                // #.) Go through all <link> in <head> to determine if we can remove the dark theme <link> tag
                if ( darkCssLink.length > 0 ) {
                    for ( var i = 0; i < darkCssLink.length; i++) {
                        if ( darkCssLink[i].href.indexOf("/css/darkRedTheme.css") > 0 ) {
                            //console.log("Removed link: " + darkCssLink[i].href);
                            darkCssLink[i].parentNode.removeChild(darkCssLink[i]);
                            break; // Should only need to remove one <link>
                        }
                    }
                 }
                break;
        }
    }
    
    function bottomMenuClicked(linkClicked) {
        
        //console.log("Script host: " + document.location.host);
        //console.log("Link clicked: " + linkClicked);
        
        // This extension should be used within the Jisho.org domain.
        //  - If users go outside, they should be able to click Advanced Search as a workaround.
        //  - I have submitted a forum discussion for the webmaster to make these external links
        //    open in a new tab (which cannot be opened from an <iframe> and should fix our issue:
        //    http://jisho.org/forum/56fc6ae0d5dda719140002d0-please-consider-updating-links-that-lead-outside-jisho-dot-org-to-open-in-a-new-tab
        
        switch (linkClicked)
        {
            case "back":
                window.history.back();
                break;
                
            case "forward":
                window.history.forward();
                break
                
            case "top":
                if ( document.location.host !== "jisho.org" )
                    return; // We should only be performing these methods in the <iframe>
                
                // #.) Scroll <iframe> to the Top    
                window.scroll(0,0);
                // Return focus to the search bar for an additional search without mouse interaction
                // <input type="text" class="keyword japanese_gothic" name="keyword" id="keyword" ...>
                var searchBar = document.getElementById('keyword');
                searchBar.focus(); 
                break;
                
            case "home":
                var url = "http://jisho.org/";
                window.location.assign(url);
                break;
                
            case "advSearch":
                var url = "http://jisho.org/docs";
                window.location.assign(url);
                break;
                
        }
    }
});


// CONTENT SCRIPT - DARK THEME (LOAD CSS) -- Autoload if theme is dark

// #.) Targeting injected script in <iframe>; Make sure hostname is Jisho.org before processing
if ( document.location.host == "jisho.org" ) {
    
    // Call local storage function directly to see if we should use a dark theme on loaded pages
    // in <iframe> or stick to Jisho.org theme ("Light")
    chrome.storage.local.get("theme", function (result) {
           
           // #.) No set theme = undefined so make it the default CSS style (Light).
           var theme;
           
           if ( result.theme == undefined || result.theme == "" || result.theme.length == 0 )
               theme = "Light"; // default
           else
               theme = result.theme;
           
           if ( theme == "Dark" ) {
               // #.) Create <link> tag to add dark theme CSS file to the DOM
               // *** copied from function themeClicked(themeClicked) - should be the same ***
                var cssLink = document.createElement("link");
                    cssLink.href = chrome.extension.getURL("/css/darkRedTheme.css"); 
                    cssLink .rel = "stylesheet";
                    cssLink .type = "text/css";
                    document.head.appendChild(cssLink);
           }
       });   
}

// Change display on Ads to none as they do not size to mobile widths (at least for desktop browsing).
// This can be tested on a desktop browser by shrinking the width of the window and
// scrolling down until you see Ads. Note how the long (width-wise) ads produce
// ugly horizontal scrollbars. Setting them to none should still allow the Ad to load however
// they may not be clickable.
// 
// *** Take off Adblock or similar extensions when testing.
document.addEventListener("DOMContentLoaded", function(event) {
    if ( document.location.host !== "jisho.org" )
        return; // Not sure what <ins> are in other pages
    
    var Ads = document.getElementsByTagName("ins");
    for ( var i = 0; i < Ads.length; i++)
        Ads[i].style.display = "none";
  });

document.addEventListener("load", function(event) {
    if ( document.location.host !== "jisho.org" )
        return;
    
    var Ads = document.getElementsByTagName("ins");
    for ( var i = 0; i < Ads.length; i++)
        Ads[i].style.display = "none";
  });