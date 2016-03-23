/*
 * JAVASCRIPT behind Jisho.org Browser-action Google Chrome Extension
 *
 * Search Jisho.org
 *  Select text and then open Jisho.org extension to seed search
 *  Use features of Jisho.org within <iframe>
 *
 * Chrome Storage
 *  Store and process user preferences (window size, theme colors)
 *
 * Dark/Yoake Theme modified from https://userstyles.org/styles/115621/jisho (see css file)
 */

  // Global Variables
  // ----------------

  function processViewChange(changedValue) {
      
      switch ( changedValue ) 
         {
             case "Wide":
                 bh = "580px", bw = "495px";
                 ih = "560px", iw = "495px";
                 updateHeightWidth({"height":bh, "width":bw}, {"height":ih, "width":iw});
                 break;
                 
             case "Narrow":
                 bh = "500px", bw = "335px";
                 ih = "480px", iw = "335px";
                 updateHeightWidth({"height":bh, "width":bw}, {"height":ih, "width":iw});
                 document.getElementById('btnWindow').innerHTML = "Narrow"; // Overriding "Wide" default
                 break;
                 
             default:
                 console.log("Window size request, " + changedValue + ", not acknowledged.");
         }
  }

  function updateHeightWidth(body, iframe) {
      $('body').css({
          'height' : body.height,
          'width' : body.width
      });
      
      $('iframe').css({
          'height' : iframe.height,
          'width' : iframe.width
      });
  }

  /*
   * By adding the IFrame at document ready, the extension should load quicker.
   * A network indicator, spinning gif animation icon, could be used to indicate network activity.
   *
   */
  function callIframe(url, view, callback) {
    // http://stackoverflow.com/questions/205087/jquery-ready-in-a-dynamically-inserted-iframe

    var iframe = '<iframe id="ifJisho" sandbox="allow-same-origin allow-forms allow-scripts" seamless="" src="" style="border:none; width:495px;height:540px;"></iframe>'; // default view, which is resized
      
    $(document.body).append(iframe);
    $('iframe#ifJisho').attr('src', url);

    $('iframe#ifJisho').ready(function() {
        
        // UPDATE SCREEN SIZE (NARROW, WIDE)
        callback(view); // processViewChange(view)
        
        // UPDATE SPINNER USED IN INITIAL CHROME EXTENSION LOAD
        setTimeout(function(){
            $('#spinner').remove(); // Remove initial spinner when frame loads.
        },500);
        
    });
  }

  function redirectIframe(selectedText) {
      console.log("Jisho.org: Selected text: " + selectedText);
      
      var url = "http://jisho.org/search/" + selectedText;
      $('iframe#ifJisho').attr('src', url);
      
      console.log("Jisho.org: Redirecting iframe to: " + url);
  }

  
  // Application Initialization
  // --------------------------
   $(document).ready(function(){
       var viewPref = "";
       
       chrome.storage.local.get("theme", function (result) {
           
           // #.) Check user settings for preferred Theme
           // -------------------------------------------
           // When a theme has never been defined before, it will be "undefined" so make it the default.
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
       
       chrome.storage.local.get("view", function (result) {
        viewPref = result.view;
        
       var url = "http://jisho.org/";
           
        if ( viewPref == "Wide" || viewPref == "Narrow") {
            callIframe(url, viewPref, processViewChange);
        } else {
            callIframe(url, "Wide", processViewChange); // Default for the first time.
        }
    });
     
     // Event Listeners
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
             processViewChange( changedValue );
        });
    });
    
    
    $('#btnTheme').on('click', function() {
        
        var btnTheme = document.getElementById('btnTheme');

        if ( btnTheme.innerHTML != "Dark" && btnTheme.innerHTML != "Light" ) {
            console.log("Invalid theme: " + theme);
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
            theme == "Light" ? chrome.runtime.sendMessage({method:"changeThemeLight"}) : chrome.runtime.sendMessage({method:"changeThemeDark"});

        });
    });
    
    // This will run as soon as the popup document is ready.
    // FEATURE: Find the word selected.
    // 1.) Find the active tab
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        // 2.) Communicate with the injected script on the active tab
        chrome.tabs.sendMessage(tabs[0].id, {method: "getSelection"}, function(response){
            // 3.) Get a reference to the popup window
            var popupWindows = chrome.extension.getViews({type:'popup'});
            if (popupWindows.length) { // A popup has been found
                
                // 4.) Validate the response.data (user's selected text)
                if ( !response || response.data == undefined ) {
                    console.log("Selection text is invalid or non-existent.");
                    return;
                }
                
                var selectedText = $.trim(response.data);

                if ( selectedText.length == 0 || selectedText == "" ) {
                    console.log("Selected text is empty.")
                    return;
                }

                // 5.) Redirect the iframe to search for the selected text
                popupWindows[0].redirectIframe(selectedText);
            }
        });
    });
    
      
   });


// DARK THEME - Process message from Content Script injection
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    
    // DEBUG:
    //console.log("Heard a message from Content Script");
    //console.log("Content Script's request method: " + request.method);
    
    if (request.method == "checkCurrentTheme") {
         
        var theme = document.getElementById('btnTheme').innerHTML;

        if ( theme == "Dark" )
            chrome.runtime.sendMessage( {method:"changeThemeDark"} );
    }
});