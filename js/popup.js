/*
 * JAVASCRIPT behind Jisho.org Browser-action Google Chrome Extension
 * https://github.com/JBRadio/Chrome-Extension-for-Jisho.org
 *
 * Jisho Forum Post
 * http://jisho.org/forum/56eaf070d5dda72227000349-unofficial-jisho-dot-org-chrome-extension-chrome-developer-mode
 *
 * Search Jisho.org
 *  - On Extension load, an <iframe> is seeded with a URL in the following order:
      1. Selected text found on the current active tab's document
      2. Last search text criteria used
      3. Default is the homepage if you've never searched using the extension before.
 *  - Use features of Jisho.org within <iframe>
      1. Search bar with Advanced Search (#words)
      2. Draw (Free-hand drawing)
      3. Radical (Bushu)
 *  - Bottom extension body links allow you to go back/forward, to the top, and to the Jisho homepage
 *
 * Use of Chrome Storage
    - User preference for theme and extension window size
    - Last search word with/out Advanced Search Options
 *
 * Dark/Jisho Yoake Theme modified from https://userstyles.org/styles/115621/jisho (see css file)
 *
 * THOUGHTS / IMPROVEMENTS
   - If <iframe> takes a considerable time to load jisho.org on extension open, 
      consider using a persistent background html page (background.html) to host the <iframe>
      in the background and allow popup.html to adopt and/or clone the <iframe> node on the 
      popup.html page.
       Pros: Hopefully the loading of Jisho.org website is as short as possible consistently. 
             Also, last search results will appear when the extension opens and no current-tab 
             selected text is present.
       Cons: Persistent background.html will have an active process, which means that everything
             loading in the <iframe> or Jisho.org will continue to do so in the background. This
             will include advertisements I assume. 
       References:
             Google Background Pages: https://developer.chrome.com/extensions/background_pages
             Adopt/Clone iFrame Node Discussion: https://groups.google.com/a/chromium.org/forum/#!topic/chromium-extensions/us2cUTZl5ws
             DevDocs Clone: http://devdocs.io/dom/node/clonenode
             DevDocs Adopt: http://devdocs.io/dom/document/adoptnode
 *
  - Bottom bar for additional features as links
     Share/Copy to Clipboard: current location link.
     UI: 
          - Safari has on bottom: (Share), (Bookmarks), and (Switch tabs)
          - Chrome has on top: omnibox, tabs, "..." (More)
 *           
 *
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
              console.log("redirectIframeByLastSearch - Chrome.storage Get returned invalid.");
              return;
          }
          
          if ( !result.lastSearched || result.lastSearched == undefined || result.lastSearched.lenth == 0 ) {
              console.log("lastSearched is invalid or never been set.");
              return;
          }
          // 3.) Redirect <iframe>
          redirectIframe(result.lastSearched, true);
          //console.log("Redirected <iframe> by Last Search criteria");
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
               theme = result.theme;
           
           if ( theme == "Dark" )
               document.getElementById('btnTheme').innerHTML = "Dark";
           
           theme == "Light" ? $('body').removeClass("dark") : $('body').addClass("dark");
           theme == "Light" ? $('a').removeClass("dark") : $('a').addClass("dark");
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
                    if ( !response.data || response.data == undefined ) {
                        console.log("Last searched request is invalid: " + response.data);
                        return;
                    }

                    var homepage = "http://jisho.org/";
                    if ( response.data == homepage ) {
                        //console.log("Iframe loaded homepage. Not recording search results.");
                        return;
                    }

                    chrome.storage.local.set({lastSearched: response.data}, function() {
                     console.log("Last search recorded: " + response.data);
                    });
               });
           });
           
        });
     
         // ------------------------------------
         // Event Listeners (Top menu bar)
         // ------------------------------------
         $('#linkJisho').on('click', function() {
            window.open('http://jisho.org'); 
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
    
    // DARK THEME
    
    // #.) Determine if the incoming message should be processed by popup.js
    switch (request.method )
    {
        case "checkCurrentTheme":
         
        // #.) Determine if we should update the theme
        //     - This processing block should only be called once when the extension opens.
        //     - Default is Light so only check for Dark
        var theme = document.getElementById('btnTheme').innerHTML;
        
        var objArg = {method: "themeClick"};
            objArg.data = theme == "Light" ? "Light" : "Dark";
            chrome.runtime.sendMessage(objArg);
            break;
            
        default:
            //console.log("Popup.js will not process " + request.method);
    }
});