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


## Additional Features
Popup/popover window has two settings: Wide and Narrow (Mobile and Small Tablet sized viewing)
 - Settings are saved so that using the extension again uses the saved viewing settings.
 - "Draw" and "Radical" features work in both view settings.

## Credits and Chrome Web Store
If the creators of Jisho.org are satisfied with the extension, I'll try to get it on the Chrome Web Store. Otherwise, I hope they can use these files to help get started on their own version of their extension. Much respect goes out to this crew for making a popular and rich Japanese <-> English dictionary experience: Kim Ahlström (@Kimtaro), Miwa Ahlström (@miwa505) and Andrew Plummer (@l_andrew_l).

Icon credits for this project goes to Yaknor (also Jisho.org). Icons in this extension are modified versions of his icon from his public PopClip Jisho.org Search extension (see https://github.com/yaknor/jisho-search).

## Known issues
 - "Draw" feature in popover window does not work if window size was recently changed. Usually when the window starts as "Narrow" and then is changed to "Wide." This doesn't appear to be a problem if the window size starts as "Wide." As a workaround, please close the extension window and open it again (window size is saved as a preference) to use "Draw." The "radical" feature appears to work fine in either starting window size.