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
            
            text = text.replace(/\./g,""); // Filter text selection to prevent 404 error page.
            
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
            
        case "delayRunOfUseStorageToChangeTheme":
            useStorageToChangeTheme(); // Delay A: Another message is received to check Dark Theme.
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
            
            var error404 = "Jisho.org | The page you were looking for doesn't exist (404)";
            
            // Ignore all non-Jisho loaded requests
            if ( document.location.host !== "jisho.org" ) {
                //console.log("Host rejection: " + document.location.host);
                return;
            }
            
            // Ignore non-Jisho searches (Forums, About, etc.)
            if ( document.location.href.indexOf("http://jisho.org/search/") == -1 ) {
                if ( document.title == error404 )
                    document.location.assign("http://jisho.org/"); // default to homepage from 404 page
                return;
            }
            
            // Determine if the current page is a 404 page
            if ( document.title == error404 ) {
                console.log("Jisho.org 404: " + document.location.href);

                var url = document.location.href;

                // Search page criteria probably broke the page.
                // Filter any invalid characters in search criteria.
                // - periods (.) in search values cause Jisho.org 
                var searchValue = url.substring(24, url.length);
                    searchValue = searchValue.replace(/\./g,"");

                if ( searchValue.length == 0 || searchValue == "") {
                    document.location.assign("http://jisho.org/"); // default to homepage from 404 page
                    return; // Do not record a blank search page.
                }

                // 404 Error page removes searchbar and other website features forcing the user to hit the 
                // back button or change the url manually. Instead, we'll reload the page without the 
                // search breaking characters so the user doesn't have to hit back to get to searchbar.
                var newUrl = "http://jisho.org/search/" + searchValue;
                console.log("Redirecting to: " + newUrl);
                document.location.assign(newUrl);
                return;
            }
            
            //console.log("Sending response for: " + document.location.href);
            sendResponse({method:"updateLastSearched", data: document.location.href});
            break;
            
    default:
        console.log("Method is invalid: " + request.method);
    }
    
    
    function themeClicked(themeClicked) {
        // Only used via popup.js button click
        // themeClicked = "Light" || "Dark";
        
        if ( document.location.host !== "jisho.org" )
            return; // We should only be performing these methods in the <iframe>
        
        switch( themeClicked ) 
        {
            case "Dark":
                // #.) Create <link> tag to add dark theme CSS file to the DOM
                var cssLink = document.createElement("link");
                    //console.log(chrome.extension.getURL("/css/jishoYoake.css"));
                    cssLink.href = chrome.extension.getURL("/css/jishoYoake.css"); 
                    cssLink .rel = "stylesheet";
                    cssLink .type = "text/css";
                    document.head.appendChild(cssLink);
                // cssLink.href = "chrome-extension://cpijlhjblmbllnphcaogikhdbdmmofhm/css/jishoYoake.css";
                break;

            case "Light":
                // #.) Gather all <link> tags
                var darkCssLink = document.head.getElementsByTagName("link"); // Search only <head>
                console.log(darkCssLink);
                
                // #.) Go through all <link> in <head> to determine if we can remove the dark theme <link> tag
                if ( darkCssLink.length > 0 ) {
                    //for ( var i = 0; i < darkCssLink.length; i++) { // need to go backwards
                    for ( var i = darkCssLink.length-1; i >= 0; i--) {
                        if ( darkCssLink[i].href.indexOf("/css/jishoYoake.css") > 0 ) {
                            console.log("Removed link: " + darkCssLink[i].href);
                            darkCssLink[i].parentNode.removeChild(darkCssLink[i]);
                            // Do not break, may have injected more than one.
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

function useStorageToChangeTheme() {
    // Different than button click, we don't care for the Light theme in this case.
    //  Used on content script methods that are invoked on injection.
    
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
           
           var linkTags;
           var foundJishoCSS = false;
           var foundJishoDark = false;
           var time = Date.now(); // Uses milliseconds
           var timeout = 10000; // 10 * 1000 milliseconds = 10 seconds
           
           
           //do - do loop kills our extension sometimes... try again later if needed.
           //{
               linkTags = document.getElementsByTagName('link');
               
               for (var i = 0; i < linkTags.length; i++)
               {
                   if ( linkTags[i].rel == "stylesheet" ) { 
                       
                       if ( linkTags[i].href.indexOf("/assets/") !== -1 )
                           foundJishoCSS = true; // Site's original CSS file loaded
                   
                        if ( linkTags[i].href.indexOf("/css/jishoYoake.css") !== -1 )
                            foundJishoDark = true; // Our custom CSS file loaded already
                   }
               }
           
           // JishoYoake is meant to override and not be overridden by NOT being last in the heirarchy.
           if ( foundJishoCSS == true && foundJishoDark == false ) 
           {
                // #.) Create <link> tag to add dark theme CSS file to the DOM
                       // *** copied from function themeClicked(themeClicked) - should be the same ***
                        var cssLink = document.createElement("link");
                            cssLink.href = chrome.extension.getURL("/css/jishoYoake.css"); 
                            cssLink .rel = "stylesheet";
                            cssLink .type = "text/css";
                            document.head.appendChild(cssLink);
           }
               
           //} while (foundJishoCSS == false || Date.now() < (time + timeout));
       }
    });
}

// #.) Targeting injected script in <iframe>; Make sure hostname is Jisho.org before processing
if ( document.location.host == "jisho.org" ) {
    
    // Direct approach to check Dark theme
    useStorageToChangeTheme();
    
    // Delayed message approach to check for Dark theme (maybe we can beat iframe load event)
    chrome.runtime.sendMessage({method: "delayCheckForDarkTheme"}, function(response) {
        useStorageToChangeTheme(); // Delay B: Reponse back directly rather than another message.
    });
    
    // See Issues and Features for additional ideas on how to make sure the CSS dark theme is
    // applied properly.
}

// PAGE MANIPULATIONS
// ------------------
// 1.) Change display on Ads to none as they do not size to mobile widths (at least for desktop browsing).
// This can be tested on a desktop browser by shrinking the width of the window and
// scrolling down until you see Ads. Note how the long (width-wise) ads produce
// ugly horizontal scrollbars. Setting them to none should still allow the Ad to load however
// they may not be clickable.
// 
// *** Take off Adblock or similar extensions when testing.
//
// 2.) When clicking on an external link (leading outside of Jisho.org) in the extension, we turn
// the <iframe> into a web browser, which really isn't the intent of it. It looks like links
// that have a target attribute of "_blank" cannot be opened when clicked within the <iframe>. Based
// on a Jisho.org forum discussion, external leading links will not be set with the attribute "_blank".
//
// METHOD A: Let's target extenal leading links to not open by adding this attribute. 
// METHOD B: Another way to handle this is to redirect the <iframe> when an external to Jisho.org webpage is loaded.
//
// 
document.addEventListener("DOMContentLoaded", function(event) {
    if ( document.location.host !== "jisho.org" )
        return; // Not sure what <ins> are in other pages
    
    // 1.) Set Ads to display:none;
    var Ads = document.getElementsByTagName("ins");
    for ( var i = 0; i < Ads.length; i++)
        Ads[i].style.display = "none";
    
    /* No longer setting target="_blank" since this will start to separate the
       Jisho.org website from the extension. Navigation links at the bottom of the extension
       will get you back to Jisho.org.
    
    // 2.) Set external links to have an attribute of target="_blank"
    //var aTags = document.getElementsByTagName("a");
    // http://stackoverflow.com/questions/24133231/concatenating-html-object-arrays-with-javascript
      var aTag1 = Array.prototype.slice.call(document.getElementById('secondary').getElementsByTagName('a'));
      var aTag2 = Array.prototype.slice.call(document.getElementsByTagName('footer')[0].getElementsByTagName('a'));
      var aTags = aTag1.concat(aTag2);
    
    for ( var i = 0; i < aTags.length; i++ ){
        aTag = aTags[i];
        //console.log(aTag);
        if ( aTag.getAttribute("href") && aTag.hostname !== location.hostname) {
            aTag.target = "_blank";
            //console.log(aTag.href);
        }
    }
    */
    
  });

document.addEventListener("load", function(event) {
    if ( document.location.host !== "jisho.org" )
        return;
    
    // 1.) Set Ads to display:none;
    var Ads = document.getElementsByTagName("ins");
    for ( var i = 0; i < Ads.length; i++)
        Ads[i].style.display = "none";
    
    // Do not determine if the page is 404 here. Use the message that is received
    // from Popup.html's <iframe>'s load event
  });