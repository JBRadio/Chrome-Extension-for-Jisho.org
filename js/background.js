// --------- RIGHT-CLICK CONTEXT MENU ----------

// Template taken from
//  http://tomoprogramming.blogspot.com/2013/08/simple-tutorial-for-chrome-extension.html

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Jisho.org for Selected Text";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});  
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  var sText = info.selectionText;
  var url = "http://jisho.org/search/" + encodeURIComponent(sText);  
  window.open(url, '_blank');
};
