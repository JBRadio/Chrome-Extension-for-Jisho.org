/*
 * Jisho.org Browser-action Google Chrome Extension
 * 
 */

  // Global Variables
  // ----------------
  
  //window.imgSpinner = '<i id="spinner" class="fa fa-spinner fa-pulse fa-lg"></i>'; // Font-Awesome animation

  function processViewChange(changedValue) {
      /*
        Changes to body and iframe based on viewing preferences
  
        Wide/Large: height:580px; width:495px; 
        <iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless="" width="495" height="640" src="http://jisho.org"></iframe>
  
        Narrow: height:500px; width:335px; 
        <iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless="" width="335" height="480"    src="http://jisho.org"></iframe>
      */
      
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
                 document.getElementById("rbtnNarrow").checked = true; // Default is 'Wide' so we are overriding
                 break;
                 
             default:
                 console.log("Radio button change not acknowledged.");
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

    var iframe = '<iframe id="ifJisho" sandbox="allow-same-origin allow-forms allow-scripts" seamless="" src="" style="border:none; width:495px;height:540px;"></iframe>';
      
    $(document.body).append(iframe);
    $('iframe#ifJisho').attr('src', url);

    $('iframe#ifJisho').ready(function() {
        callback(view); // processViewChange(view)
        setTimeout(function(){
            $('#spinner').remove(); // Remove initial spinner when frame loads.
        },500);
        
    });
  }

  function redirectIframe(selectedText) {
      console.log("Selected text: " + selectedText);
      var url = "http://jisho.org/search/" + selectedText;
      $('iframe#ifJisho').attr('src', url);
      console.log("Redirecting iframe to: " + url);
  }


  
  // Application Initialization
  // --------------------------
   $(document).ready(function(){
       var viewPref = "";
       chrome.storage.local.get("view", function (result) {
        viewPref = result.view;
        
       var url = "http://jisho.org/";
           
        if ( viewPref == "Wide" || viewPref == "Narrow") {
            //processViewChange(viewPref);
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
       
     $('input[type="radio"]').on('change',function(){
         
         var bh, bw; // body height and width
         var ih, iw; // iframe height and width
         var changedValue = $('input[type="radio"]:checked ').val();
         
         chrome.storage.local.set({'view': changedValue}, function() {
          processViewChange( changedValue );
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
                var selectedText = response.data;
                
                if ( selectedText == undefined ) {
                    console.log("Selected text is undefined.");
                    return;
                }

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