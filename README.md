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
- click extension button to access the Jisho.org in a popup/popover window and access website features
- right-click context menu allows you to search Jisho.org quickly in a new tab based on selected text
- selecting text and opening the extension will seed Jisho.org search results with selected text
- last search result page is remembered so that you can pick up where you left off
- Use menu bar (very top) to change preferences
- Use menu bar (very bottom) to navigate
- Theme set in the extension will also be set for Jisho.org website when viewed in the tabs of the main browser window (located outside the extension).


## Additional Features - Top Menu
Popup/popover window has two settings: Wide and Narrow (Mobile and Small Tablet sized viewing)
 - Settings are saved so that using the extension again uses the saved viewing settings.
 - "Draw" and "Radical" features work in both view settings.
 - Click the button in the extensions menu bar (very top) to change these values
 
Popup/popover window theme has two settings: Light and Dark
 - Dark theme modified from https://userstyles.org/styles/115621/jisho, style created by wekateka
 - Dark theme suggestions/bugs to wktk [AT] wekateka [DOT] com
 - Light theme are Jisho.org defaults

Open Jisho.org homepage in a new tab.

Open Unofficial Jisho Google Extension GitHub project page (check back for updates!).


## Additional Features - Bottom menu
- Navigation: Navigate forwards and backwards for pages loaded in one session (non-closing of extension)
- Scroll Top: Like to make a another search? In addition to Ctrl+Home or Cmd+Up, you can click "Top."
- Search Documentation: Link to Advanced Search Options to use in search bar
- Copy Link: Copy current page location to clipboard for sharing with other applications.


## Chrome Permissions
 - Access to all websites and its contents: Allows for content script injection which allows CSS modifying and right-click text selection seeding
 - Access to tabs: Same as above.
 - Access to context menu: This is the right-click menu
 - Access to Chrome/local storage: Used for storing window size and theme preferences and last search save.
 - Clipboard Write, allow access to "Copy Link" from the current search page


## Credits and Chrome Web Store
If the creators of Jisho.org are satisfied with the extension, I'll try to get it on the Chrome Web Store. Otherwise, I hope they can use these files to help get started on their own version of their extension. Much respect goes out to this crew for making a popular and rich Japanese <-> English dictionary experience: Kim Ahlström (@Kimtaro), Miwa Ahlström (@miwa505) and Andrew Plummer (@l_andrew_l).

Icon credits for this project goes to Yaknor (also Jisho.org). Icons in this extension are modified versions of his icon from his public PopClip Jisho.org Search extension (see https://github.com/yaknor/jisho-search).

Dark theme credits go to wekateka. Copyright: CC BY-SA 4.0. Slight modifications are noted on the CSS file.


## Known Extension Behaviors and Issues
 - "Draw" feature in popover window does not work if window size was recently changed. Usually when the window starts as "Narrow" and then is changed to "Wide." This doesn't appear to be a problem if the window size starts as "Wide." As a workaround, please close the extension window and open it again (window size is saved as a preference) to use "Draw." The "radical" search feature appears to work fine in either starting window size.
 
 
## Considered fixed
 - While dark theme is set, searches in the extension start off Light and then go Dark where the speed of this happening can vary. On 2016.03.30, chrome local storage API is utilized when the content script is executed. I think this is the faster way to check the theme and inject the CSS overriding file. Code is available on GitHub, please let me know if you see a more efficient way to handle this. At this time, this is considered fixed.
 - Jisho.org's 404 Error Page on extension launch. If periods (.) are seeded into the search URL, Jisho.org loads a 404 error page. The extension now filters out periods (.) to prevent this and will even redirect you to what it thinks you are looking for. You should no longer get stuck on a 404 error page in the extension. I have created a discussion for the Jisho.org webmaster to review the usage of periods (.) in search urls/criteria. http://jisho.org/forum/57085ba1d5dda75465000048-periods-in-search-criteria-breaks-search-and-404-error-page-suggestion
 
 
## Discussion and Feedback
For questions/comments/suggestions please make a post on the Jisho.org forum. Here is the link that introduces the extension: http://jisho.org/forum/56eaf070d5dda72227000349-unofficial-jisho-dot-org-chrome-extension-chrome-developer-mode
 

## FAQ (Frequently Asked Questions)
 - If any piece of functionality doesn't work. Please first reload the page and try again. The content script in the extension may have not been injected properly or at all in the tab if you just installed the extension or reloaded it.
 - Text selection seeding does not work. First, reload the page for the content script to be properly loaded. If it still continues, it could be possible that the current page does not allow text selections
 to be gathered by the chrome API or that I haven't anticipated the webpage issue you are having. If you are familiar with the console, please list any errors found that are related to the extension (content_script.js, popup.js).
 - Dark theme set in the extension will affect your tabbed browsing experience on Jisho.org only. Please open the extension and change the theme to set it back to normal ("Light"). I don't expect you to have issues on pages outside of Jisho.org.