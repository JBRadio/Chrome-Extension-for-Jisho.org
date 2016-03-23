# Unofficial Jisho.org Google Chrome Extension

Unofficial Google Chrome Extension which allows users to easily search Jisho.org in a popover extension window or right-click context menu.

## Installation
If you wish to install this extension, you will need to do the following:

1. Download ZIP from Github to a folder of your choice
2. Extract ZIP folder contents
3. Open a new tab to chrome://extensions/
4. Check "Developer mode" at the top
5. Click "Load unpacked extension..."
6. Navigate to the extracted folder, click to select, click "Select" button


## Usage
To use it:
- click the new Jisho extension button to access the site in a popup/popover window
- select text and then using the right-click context menu to search Jisho.org with that text
- Use menu bar (very top) to change preferences


## Additional Features
Popup/popover window has two settings: Wide and Narrow (Mobile and Small Tablet sized viewing)
 - Settings are saved so that using the extension again uses the saved viewing settings.
 - "Draw" and "Radical" features work in both view settings.
 - Click the button in the extensions menu bar (very top) to change these values
 
Popup/popover window theme has two settings: Light and Dark
 - Dark theme modified from https://userstyles.org/styles/115621/jisho, style created by wekateka
 - Dark theme suggestions/bugs to wktk [AT] wekateka [DOT] com
 - Light theme are Jisho.org defaults


## Chrome Permissions
 - Access to all websites and its contents: Allows for content script injection which allows CSS modifying and right-click text selection seeding
 - Access to tabs: Same as above.
 - Access to context menu: This is the right-click menu
 - Access to Chrome/local storage: Used for storing window size and theme preferences.


## Credits and Chrome Web Store
If the creators of Jisho.org are satisfied with the extension, I'll try to get it on the Chrome Web Store. Otherwise, I hope they can use these files to help get started on their own version of their extension. Much respect goes out to this crew for making a popular and rich Japanese <-> English dictionary experience: Kim Ahlström (@Kimtaro), Miwa Ahlström (@miwa505) and Andrew Plummer (@l_andrew_l).

Icon credits for this project goes to Yaknor (also Jisho.org). Icons in this extension are modified versions of his icon from his public PopClip Jisho.org Search extension (see https://github.com/yaknor/jisho-search).

Dark theme credits go to wekateka. Copyright: CC BY-SA 4.0. Slight modifications are noted on the CSS file.


## Known Extension Behaviors and Issues
 - "Draw" feature in popover window does not work if window size was recently changed. Usually when the window starts as "Narrow" and then is changed to "Wide." This doesn't appear to be a problem if the window size starts as "Wide." As a workaround, please close the extension window and open it again (window size is saved as a preference) to use "Draw." The "radical" search feature appears to work fine in either starting window size.
 - While dark theme is set, searches in the extension start off Light and then go Dark where the speed of this happening can vary. This happens for me when I am not using stylish or any CSS injecting extension. When the iframe document is loaded, the content script injected makes a call to the extension to see which theme should be used based on user settings. The extension then tells the document, with the content-script injected, to update its theme. It takes some time but should be quick as resources/extension is local - experience can vary based on PC's technical specs. Perhaps the desired effect will occur more gracefully with stylish on and the theme set to Light (site's original css).
 
 
 ## Discussion and Feedback
 For questions/comments/suggestions please make a post on the Jisho.org forum. Here is the link that introduces the extension: http://jisho.org/forum/56eaf070d5dda72227000349-unofficial-jisho-dot-org-chrome-extension-chrome-developer-mode