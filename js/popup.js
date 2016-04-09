/*
 * JAVASCRIPT behind Jisho.org Browser-action Google Chrome Extension
 * https://github.com/JBRadio/Chrome-Extension-for-Jisho.org
 *
 * Jisho Forum Post
 * http://jisho.org/forum/56eaf070d5dda72227000349-unofficial-jisho-dot-org-chrome-extension-chrome-developer-mode
 *
 * Unofficial Jisho.org Extension
 *  - On Extension load, an <iframe> is seeded with a URL in the following order:
      1. Selected text found on the current active tab's document
      2. Last search text criteria used
      3. Default is the homepage if you've never searched using the extension before.
      
 *  - Use features of Jisho.org within <iframe>
      1. Search bar with Advanced Search (#words)
      2. Draw (Free-hand drawing)
      3. Radical (Bushu)
      
 *  - Bottom extension body links allow you to manipulate the <iframe>
      1. go back/forward
      2. scroll to the top (calls .focus() on input text field)
      3. change url to specific pages (Advanced Search Options)
      
 *  - Bottom extension body links allows additional functionality
      1. Copy Link: Copy current <iframe> url to clipboard for pasting (sharing and other uses)
 *
 * Use of Chrome Storage
    - User preference for theme and extension window size
    - Last search word with/out Advanced Search Options
 *
 * Dark/Jisho Yoake Theme modified from https://userstyles.org/styles/115621/jisho (see css file)
 */

  // Global Variables
  // ----------------

  function updateWindowSize(changedValue) {
      
      switch ( changedValue ) 
         {
             case "Wide":
                 $(document.body).removeClass('narrow'); // Removes only class 'narrow'; Dark theme ok
                 $('iframe').removeClass('narrow'); // Removes only class 'narrow'
                 break;
                 
             case "Narrow":
                 $(document.body).addClass('narrow');
                 $('iframe').addClass('narrow');
                 break;
                 
             default:
                 console.log("Window size request, " + changedValue + ", not acknowledged.");
         }
  }


  // REDIRECTING IFRAME / SEEDING EXTENSION PAGE SEARCH RESULTS
  // ----------------------------------------------------------

  function redirectIframe(selectedText, fullURL) {
      // If fullURL is true, this was called by redirectIframeByLastSearch 
      //  otherwise it was text selection seed.
      var url = fullURL ? selectedText : "http://jisho.org/search/" + selectedText;
      $('iframe#ifJisho').attr('src', url);
  }

  function redirectIframeByLastSearch() {
      // *** We are only here because no text was selected in the current text ***
      // 1.) Get value from chrome.storage
      chrome.storage.local.get("lastSearched", function (result) {
          // 2.) Validate results from storage
          if ( !result || result == undefined ) {
              //console.log("redirectIframeByLastSearch - Chrome.storage Get returned invalid.");
              return;
          }
          
          if ( !result.lastSearched || result.lastSearched == undefined || result.lastSearched.lenth == 0 ) {
              //console.log("lastSearched is invalid or never been set.");
              return;
          }
          // 3.) Redirect <iframe>
          redirectIframe(result.lastSearched, true);
          //console.log("Redirected <iframe> by Last Search criteria");
       });
  }

  function displayStatusWindowText(statusText) {
      // 1.) Overwrite any message currently in div
      $('#statusWindow').html(statusText);
      
      // 2.) JQUERY - Slide down status window  
      $('#statusWindow').slideDown( 1500, function() {
              $("#statusWindow").slideUp(500);
          });
  }



  // --------------------------
  // Application Initialization (When extension opens)
  // --------------------------
   $(document).ready(function(){
       
       // #.) Get User Preference: THEME
       // ------------------------------
       // 1. Set up popup.html CSS style
       // 2. Rely on content_script.js load to update <iframe> CSS
       chrome.storage.local.get("theme", function (result) {
           
           // #.) No set theme = undefined so make it the default CSS style (Light).
           var theme;
           
           if ( result.theme == undefined || result.theme == "" || result.theme.length == 0 )
               theme = "Light"; // default
           else
               theme = result.theme; // Whatever is saved: Light or Dark
           
           if ( theme == "Dark" )
               document.getElementById('btnTheme').innerHTML = "Dark";
           
           theme == "Light" ? $('body').removeClass("dark") : $('body').addClass("dark");
           theme == "Light" ? $('a').removeClass("dark") : $('a').addClass("dark");
           
           if ( document.getElementById('ifJisho') !== null )
               theme == "Light" ? $('#ifJisho').removeClass('dark') : $('#ifJisho').addClass('dark');
       });
       
       // #.) Get User Preference: WINDOW SIZE
       // ------------------------------------
       // 1. Set up popup.html CSS Style based on user preference
       // 2. Set up CSS Style to "Wide" by default or when user preference is "undefined"
       var userWindowSizePref = "";
       
       chrome.storage.local.get("view", function (result) {
           userWindowSizePref = result.view; 
        
            // Insert <iframe> into popup.html
            // --------------------------------
            // As for the url:
            //  1. On initial load, we will set up the URL to default (http://jisho.org/)
            //  2. If selected text is found on extension launch, chrome.tabs.sendMessage, an update 
            //      an update will be made via extension messaging.
            var url = "http://jisho.org/";
            var iframe  = '<iframe id="ifJisho" ';
                iframe += 'sandbox="allow-same-origin allow-forms allow-scripts" seamless="" src="">';
                iframe += '</iframe>';

            $('#searchSite').append(iframe); // Append to specific container for <iframe>
            $('iframe#ifJisho').attr('src', url);
 
            // Event fires once when the <iframe> is originally added to the DOM
            $('iframe#ifJisho').ready(function() { // Event fires when <iframe> fully loads a page.

                // UPDATE SCREEN SIZE (NARROW, WIDE)
                if ( userWindowSizePref == undefined || userWindowSizePref == "Wide")
                    updateWindowSize("Wide")
                else {
                    updateWindowSize(userWindowSizePref);
                    document.getElementById('btnWindow').innerHTML = "Narrow"; // Overriding "Wide" default
                }
                // UPDATE SPINNER USED IN INITIAL CHROME EXTENSION LOAD
                setTimeout(function(){
                    $('#spinner').remove(); // Remove initial spinner when frame loads.
                },500);
            });
           
           // Event fires every time a new page is loaded into the <iframe>
           $('iframe#ifJisho').load(function() {
               
               // TRACKING LAST SEARCH CRITERIA
               // -----------------------------
               // 1.) Send a message to the Extension indicating we loaded a new page
               //     - We cannot simply access the location due to Cross-origin issues
               //     - Chrome-extension:// to http://
               
               chrome.runtime.sendMessage({method: "getNewIframeLocation"}, function(response) {
                   // {method:"updateLastSearched", data: document.location.href}
                   
                   // TRACKING - User's last search item.
                    if ( !response.data || response.data == undefined || response.data == null) {
                        //console.log("Last searched request is invalid: " + response.data);
                        return;
                    }

                    if ( response.data == "http://jisho.org/" )
                        return; // Do not record the homepage
                   
                    if ( response.data.indexOf("http://jisho.org/search/") == -1 )
                        return; // Do not record pages that are not the Jisho.org search results.
                   
                    // We may be asked to record a 404 Error page.
                    response.data = $.trim(response.data); // remove preceeding and trailing spaces.
                   
                    // Filter any invalid characters in search criteria.
                    // - periods (.) in search values cause Jisho.org 
                    var searchValue = response.data.substring(24, response.data.length);
                        searchValue = searchValue.replace(/\./g,"");
                    
                    if ( searchValue.length == 0 || searchValue == "")
                        return; // Do not record a blank search page.
                   
                    response.data = "http://jisho.org/search/" + searchValue; // piece together.

                    chrome.storage.local.set({lastSearched: response.data}, function() {
                     //console.log("Last search updated: " + response.data);
                    });
               });
           });
           
           document.getElementById('ifJisho').addEventListener("progress", function() {
               chrome.runtime.sendMessage({method: "delayRunOfUseStorageToChangeTheme"});
           });
           
           
        });
     
         // ------------------------------------
         // Event Listeners (Top menu bar)
         // ------------------------------------
       
         $('#aJisho').on('click', function() {
            window.open('http://jisho.org'); 
         });
       
         $('#aGitHub').on('click', function() {
             window.open('https://github.com/JBRadio/Chrome-Extension-for-Jisho.org');
         });
       
       
        $('#btnWindow').on('click', function() {

            // UPDATE WINDOW SIZE
            // ------------------
            // 1.) Validate button values
            var btnWindow = document.getElementById('btnWindow');
            if ( btnWindow.innerHTML != "Wide" && btnWindow.innerHTML != "Narrow" ) {
                console.log("Invalid window size: " + theme);
                return;
            }

            // 2.) Update button value
            btnWindow.innerHTML == "Wide" ? btnWindow.innerHTML = "Narrow" : btnWindow.innerHTML = "Wide";

            // 3.) Process new button value
            var changedValue = btnWindow.innerHTML;
            chrome.storage.local.set({'view': changedValue}, function() {
                 updateWindowSize( changedValue );
            });
        });


        $('#btnTheme').on('click', function() {

            var btnTheme = document.getElementById('btnTheme');

            if ( btnTheme.innerHTML != "Dark" && btnTheme.innerHTML != "Light" ) {
                console.log("Invalid theme: " + btnTheme.innerHTML);
                return;
            }

            // #.) Update button
            // -----------------
            // #a.) Change innerHTML value (Light <-> Dark)
            btnTheme.innerHTML == "Light" ? btnTheme.innerHTML = "Dark" : btnTheme.innerHTML = "Light";
            var theme = btnTheme.innerHTML;

            // #.) Update chrome storage to save theme and then apply on extension re-launch
            chrome.storage.local.set({'theme': theme}, function() {

                // 1.) Update body of extension 
                // ----------------------------
                // 1a.) Body background color (white for "Light", black for "Dark")
                theme == "Light" ? $('body').removeClass("dark") : $('body').addClass("dark");

                // 1b.) Body links colors
                theme == "Light" ? $('a').removeClass("dark") : $('a').addClass("dark");
                
                // 1c.) Update iframe background color
                theme == "Light" ? $('#ifJisho').removeClass('dark') : $('#ifJisho').addClass('dark');

                // 2.) Update iFrame's CSS to use theme
                // ------------------------------------
                var iframe = $('#ifJisho');
                var objArg = {method: "themeClick"};
                    objArg.data = theme == "Light" ? "Light" : "Dark";
                chrome.runtime.sendMessage(objArg);

            });
        });


        // ------------------------------------
        // Event Listeners (Bottom menu bar)
        // ------------------------------------
        // Back, Forward, Top, Home (buttons but actually <a> onclick)

        $('#aBack').on('click', function(e) {
            // #.) Send a message to the iframe to change its hitsory. (Cross-origin)
            chrome.runtime.sendMessage( {method:"bottomMenuClick", data:"back"} );
            e.stopPropagation();
            e.preventDefault();
        });

        $('#aForward').on('click', function(e) {
            // #.) Send a message to the iframe to change its hitsory. (Cross-origin)
            chrome.runtime.sendMessage( {method:"bottomMenuClick", data:"forward"} );
            e.stopPropagation();
            e.preventDefault();
        });

        $('#aTop').on('click', function(e) { // Scroll <iframe> to top; Jisho.org search bar is there.
            // #.) Send a message to the iframe to change its properties. (Cross-origin)
            chrome.runtime.sendMessage( {method:"bottomMenuClick", data:"top"} );
            e.stopPropagation();
            e.preventDefault();
        });

        $('#aHome').on('click', function(e) {
            // #.) Send a message to the iframe to change its properties. (Cross-origin)
            chrome.runtime.sendMessage( {method:"bottomMenuClick", data:"home"} );
            e.stopPropagation();
            e.preventDefault();
        });
       
        $('#aAdvSearch').on('click', function(e) {
            // #.) Send a message to the iframe to change its properties. (Cross-origin)
            chrome.runtime.sendMessage( {method:"bottomMenuClick", data:"advSearch"} );
            e.stopPropagation();
            e.preventDefault();
        });
       
       $('#aLink').on('click', function (e) {
        chrome.runtime.sendMessage({method: "bottomMenuClick", data:"link"}, function(response) {
            if ( !response || response == undefined )
                return;
            
            if ( !response.data || !response.data == undefined )
                return;
            
            var url = $.trim(response.data);
            //console.log("URL to copy: " + url);
            
            if ( url.length > 0 )
            {
                try {
                    // REFERENCE
                    // http://www.pakzilla.com/2012/03/20/how-to-copy-to-clipboard-in-chrome-extension/
                    var copyDiv = document.createElement('div');
                    copyDiv.contentEditable = true;
                    document.body.appendChild(copyDiv);
                    copyDiv.innerHTML = url;
                    copyDiv.unselectable = "off";
                    copyDiv.focus();
                    document.execCommand('SelectAll');
                    document.execCommand("Copy", false, null);
                    document.body.removeChild(copyDiv);
                } catch (e) {
                    displayStatusWindowText("Unable to copy to clipboard!");
                    console.log("Copy to clipboard error: " + e.message);
                    return;
                }
                //alert("Copied URL to Clipboard."); // Alerts break extensions
                displayStatusWindowText("Copied link to clipboard!");
            }
        });
            e.stopPropagation();
            e.preventDefault();
       });
       

        // This will run as soon as the popup document is ready.
        // FEATURE: Find the word selected.
        // 1.) Find the active tab
        //
        // **** WE WILL TACK ON A NEW FEATURE: OPEN LAST SEARCH RESULT PAGE ****
        //       If there is no selected text to lookup, check lastSearch in chrome.storage, 
        //        otherwise default homepage
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            // 2.) Communicate with the injected script on the active tab
            chrome.tabs.sendMessage(tabs[0].id, {method: "getSelection"}, function(response){
                // 3.) Validate message response / text selection
                if ( !response || response.data == undefined ) {
                    console.log("Selection text is invalid or non-existent.");
                    // Check if we have the last searched item
                    redirectIframeByLastSearch();
                    return;
                }

                var selectedText = $.trim(response.data);

                if ( selectedText.length == 0 || selectedText == "" ) {
                    console.log("Selected text is empty.");
                    // Check if we have the last searched item
                    redirectIframeByLastSearch();
                    return;
                }

                // 5.) Redirect the iframe to search for the selected text
                redirectIframe(selectedText);
                //console.log("Redirected <iframe> by text selection.");
            });
        });
      
   });


// Outside document.ready()
// ------------------------
// Process message from Content Script injection
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    
    /*
    Issue: 
    A message sent from popup.js can be recevied by popup.js and all pages with 
    chome.runtime.onMessage.addListener functions defined. When placing console.log to determine
    origin of messages, you may see duplicate console.log messages and then think your functions
    are getting called times however many console.log message.
    
    Reason:
    If tabs aren't specified in the chrome sendMessage call, chrome.tabs.sendMessage(...),
    for example, chrome.runtime.sendMessage(...) is used, then all extension message Event 
    Listening pages can hear/receive the same sent extension message.
    
    Application:
    In our extension, we are communicating with a content script injected into an iframe loaded 
    into our popup.html and not a content script from a tab's page. So in this case, I used 
    chrome.runtime.sendMessage which results in popup.js hearing its own message. Make sure
    determing message values for processing are unique.
    
    Reference:
    https://developer.chrome.com/extensions/messaging
    
    On the receiving end, you need to set up an runtime.onMessage event listener to handle the message. This looks the same from a content script or extension page.
    
    If multiple pages are listening for onMessage events, only the first to call sendResponse() for a particular event will succeed in sending the response. All other responses to that event will be ignored.
    */
    
    // DEBUG:
    //console.log("Popup.js received a message: " + request.method);
    
    
    // #.) Determine if the incoming message should be processed by popup.js
    switch (request.method )
    {
        // Insert cases here.
        case "delayCheckForDarkTheme":
            // Delayed messaging attempt to apply dark theme before iframe's load event.
            chrome.runtime.sendMessage({method: "delayRunOfUseStorageToChangeTheme"});
            
            // Also send response so that original sender can check for dark as well
            sendResponse("Check"); // Content Script.js - chrome.runtime.sendMessage({method: "delayCheckForDarkTheme"}
            break;
            
        default:
            //console.log("Popup.js will not process " + request.method);
    }
});