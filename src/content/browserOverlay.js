/* ***** BEGIN LICENSE BLOCK *****
 *
 * Copyright 2013 Namit Bhalla (oyenamit@gmail.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * The original code is the "Penny: IMDB Boards Formatting Helper" Firefox extension.
 *
 * ***** END LICENSE BLOCK ***** */


/*jslint browser: true, vars: true, white: true, indent: 4 */

"use strict";

// ---------------------------------------------------------------------------------------------------------
// The Penny Namespace. 
// All functions and 'global' variables reside inside it.
// Define it if it has not been done before.
// ---------------------------------------------------------------------------------------------------------
if ( typeof NSPenny === 'undefined' )
{
    var NSPenny = {};
}


// ---------------------------------------------------------------------------------------------------------
// The BrowserOverlay object contains all variables and functions that are related 
// to browser overlay XUL.
// Define it if it has not been done before.
// ---------------------------------------------------------------------------------------------------------
if ( typeof NSPenny.BrowserOverlay === 'undefined' )
{
    NSPenny.BrowserOverlay = {};
}


// ---------------------------------------------------------------------------------------------------------
// This is a callback function that is invoked during "onLoad" event of the "window" object.
// It registers our method for the popup menu.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.init = function()
{
   var FirefoxContextMenu = document.getElementById("contentAreaContextMenu");
   if (FirefoxContextMenu)
   {
      FirefoxContextMenu.addEventListener("popupshowing", NSPenny.BrowserOverlay.showHideContextMenuEntry, false);
   }

}; // NSPenny.BrowserOverlay.init()


// ---------------------------------------------------------------------------------------------------------
// Decides if our entry into the Firefox context menu should be visible or not.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.showHideContextMenuEntry = function(aEvent)
{
    // When ANY menu popup is going to be shown (not just right click menu), this method will be called.
    // We need to process the event only if it was for the right click context menu.
    if (aEvent.target.id === "contentAreaContextMenu")
    {
        // Abbreviation for our namespace for a cleaner code.
        var nsbo             = NSPenny.BrowserOverlay;

        var contextMenuEntry = null;
        var isTextArea       = false;
        var isIMDBBoard      = false;
        var canShowMenu      = false;

        isIMDBBoard          = nsbo.isCurrentSiteIMDBBoard();
        isTextArea           = nsbo.isContextMenuForTextArea(aEvent.target);

        // Show the context menuitem only if we are on IMDB site and user has right clicked on the textarea.
        canShowMenu = isIMDBBoard && isTextArea;

        contextMenuEntry = document.getElementById("penny-menu");
        if( contextMenuEntry )
        {
            contextMenuEntry.hidden = !canShowMenu;
        }
    }

}; // NSPenny.BrowserOverlay.showHideContextMenuEntry()


// ---------------------------------------------------------------------------------------------------------
// Checks if the site loaded in current tab/window is IMDB or not.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.isCurrentSiteIMDBBoard = function()
{
    var retVal          = false;
    var isIMDBSite      = false;
    var currentUrl      = content.location.href;
    var IMDBSiteRegExp  = new RegExp("^http://www.imdb.com/", "i");

    isIMDBSite          = IMDBSiteRegExp.test(currentUrl);
    retVal              = isIMDBSite;

    return retVal;

}; // NSPenny.BrowserOverlay.isCurrentSiteIMDBBoard()


// ---------------------------------------------------------------------------------------------------------
// Checks if user has right-clicked on a textarea of IMDB boards site.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.isContextMenuForTextArea = function(firefoxContextMenu)
{
    var retVal                 = false;
    var contextMenuTriggerNode = firefoxContextMenu.triggerNode;

    if (  contextMenuTriggerNode                            &&
         (contextMenuTriggerNode.type     === "textarea")   &&   // User has right clicked on a textarea.
         (contextMenuTriggerNode.readOnly === false)        &&   // The textarea is not read-only.
         (contextMenuTriggerNode.name     === "body") )          // Name of the textarea object is same as what is on IMDB boards site.
    {
        retVal = true;
    }

    return retVal;

}; // NSPenny.BrowserOverlay.isContextMenuForTextArea()


// ---------------------------------------------------------------------------------------------------------
// Checks if the specified text is already enclosed in the specified starting & ending tags.
// If so, it returns the text after stripping off the tags.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.isTextTagged = function(text, startTagUnescaped, endTagUnescaped)
{
    var startTagTemp    = "";
    var startTagEscaped = "";
    var endTagTemp      = "";
    var endTagEscaped   = "";
    var pattern         = "";
    var regExpr         = null;
    var regExprResult   = null;
    var retVal          = "";

    //
    // The starting and ending tags contain square brackets []
    // They cannot be used as it is in a regexpr pattern as they assume special meaning in the pattern.
    // So, we need to esacpe them before use.
    //
    startTagTemp    = startTagUnescaped.replace("[", "\\[");
    startTagEscaped = startTagTemp.replace("]", "\\]");
    endTagTemp      = endTagUnescaped.replace("[", "\\[");
    endTagEscaped   = endTagTemp.replace("]", "\\]");

    //
    // We are searching for a pattern where some arbitrary text is enclosed in starting and ending tags.
    // For example, [url]www.google.com[/url]
    // Note that enclosing parts of the pattern in parentheses allows us to refer to the corresponding matched text later.
    // Here, we have 3 parts in the pattern which are enclosed in parentheses.
    //
    pattern =  "(^[\\s]*)"         // Zero or more whitespace characters in the beginning of the text
               + startTagEscaped   // The starting tag
               + "([\\s\\S]*)"     // Zero or more sequence of arbitrary characters (including whitespace)
               + endTagEscaped     // The ending tag
               + "([\\s]*$)";      // Zero or more whitespace characters at the end of the text


    // Test the pattern against the specified text while ignoring case (i)
    regExpr = new RegExp(pattern, "im");
    regExprResult = regExpr.exec(text);

    if (regExprResult !== null)
    {
        //
        // A match was found !
        // For each part enclosed in parentheses in the pattern, extract the corresponding matching text.
        // The 3 parts of matching text are placed in regExprResult as array elements.
        //

        if (regExprResult[1] !== null)
        {
            // Zero or more whitespace characters in the beginning of the text
            retVal += regExprResult[1];
        }

        if (regExprResult[2] !== null)
        {
            // Zero or more sequence of arbitrary characters (including whitespace)
            retVal += regExprResult[2];
        }

        if (regExprResult[3] !== null)
        {
            // Zero or more whitespace characters at the end of the text
            retVal += regExprResult[3];
        }
    }
    else
    {
        // No match was found. No text was enclosed with specified tags 
        retVal = null;
    }

    return retVal;

}; // NSPenny.BrowserOverlay.isTextTagged()


// ---------------------------------------------------------------------------------------------------------
// This function is called when user clicks on a formatting menuitem in the right click menu.
// It encloses the currently selected text with the specified formatting tags.
// If the selected text is already enclosed with the formatting tags, the tags are removed.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.toggleFormattingTag = function(aEvent)
{
    // Abbreviation for our namespace for a cleaner code.
    var nsbo            = NSPenny.BrowserOverlay;

    var menuitem        = null;
    var startTag        = "";
    var endTag          = "";
    var textarea        = null;
    var offsetStart     = 0;
    var offsetEnd       = 0;
    var leftText        = "";
    var rightText       = "";
    var selectedText    = "";
    var taggedText      = "";
    var cursorPosOrig   = "";
    var cursorPosNew    = "";
    

    // The menuitem that was clicked
    menuitem = aEvent.target;
    if (menuitem)
    {
        // The starting and ending tags associated with the menuitem
        // They are specified in the XUL entry for the menuitem.
        startTag = menuitem.getAttribute("startTag");
        endTag   = menuitem.getAttribute("endTag");

        if (startTag && endTag)
        {
            // We assume that user right clicked on a textarea.
            // See isContextMenuForTextArea()
            textarea = document.commandDispatcher.focusedElement;

            if (textarea && "selectionStart" in textarea)
            {
                //
                // The user may or may not have selected any text.
                // It does not matter if the selection is forward or backward.
                // selectionStart and selectionEnd values are always normalized.
                // That is, selectionStart is always greater than selectionEnd.
                //
                offsetStart = textarea.selectionStart;
                offsetEnd   = textarea.selectionEnd;

                // Before we toggle the formatting tags, store the original position of cursor.
                // We will need it to place the cursor correctly after insertion.
                cursorPosOrig   = textarea.textLength - offsetEnd;

                // Extract the selected text and text to the left & right of the cursor (or currently selected text).
                // This text would be used to construct the resulting value of textarea.
                selectedText    = textarea.value.substr(offsetStart, offsetEnd - offsetStart);
                leftText        = textarea.value.slice(0, offsetStart);
                rightText       = textarea.value.slice(offsetEnd, textarea.textLength);

                taggedText = nsbo.isTextTagged(selectedText, startTag, endTag);
                if (taggedText !== null)
                {
                    // The selected text is already tagged with starting and ending tags.
                    // We need to remove them.
                    textarea.value = leftText + taggedText + rightText;
                }
                else
                {
                    // The selected text is not already tagged with starting and ending tags.
                    // Add them now.
                    textarea.value = leftText + startTag + selectedText + endTag + rightText;
                }

                // Restore the cursor position to the right of the inserted iconTag.
                cursorPosNew = textarea.textLength - cursorPosOrig;
                textarea.setSelectionRange(cursorPosNew, cursorPosNew);
            }
        }
    }

}; // NSPenny.BrowserOverlay.toggleFormattingTag()


// ---------------------------------------------------------------------------------------------------------
// This function is called when user clicks on an icon menuitem in the right click menu.
// It inserts the tag corresponding to the specified icon.
// ---------------------------------------------------------------------------------------------------------
NSPenny.BrowserOverlay.insertIconTag = function(aEvent)
{
    var menuitem      = null;
    var iconTag       = "";
    var textarea      = null;
    var offsetStart   = "";
    var offsetEnd     = "";
    var leftText      = "";
    var rightText     = "";
    var cursorPosOrig = "";
    var cursorPosNew  = "";
    
    
    // The menuitem that was clicked
    menuitem = aEvent.target;
    if (menuitem)
    {
        // The tag associated with the menuitem
        // It is specified in the XUL entry for the menuitem.
        iconTag = menuitem.getAttribute("iconTag");

        if (iconTag)
        {
            // We assume that user right clicked on a textarea.
            // See isContextMenuForTextArea()
            textarea = document.commandDispatcher.focusedElement;

            if (textarea && "selectionStart" in textarea)
            {
                //
                // Normally, we would insert the iconTag where cursor is currently located.
                // However, it is possible that the user has selected some text.
                // In that case, we need to replace the selected text with iconTag.
                // It does not matter if the selection is forward or backward.
                // selectionStart and selectionEnd values are always normalized.
                // That is, selectionStart is always greater than selectionEnd.
                //
                offsetStart = textarea.selectionStart;
                offsetEnd   = textarea.selectionEnd;

                // Extract the text to the left and right of the cursor (or currently selected text).
                // This text would be used to construct the resulting value of textarea.
                leftText    = textarea.value.slice(0, offsetStart);
                rightText   = textarea.value.slice(offsetEnd, textarea.textLength);

                // Before we insert the iconTag, store the original position of cursor.
                // We will need it to place the cursor correctly after insertion.
                cursorPosOrig = textarea.textLength - offsetEnd;

                // Construct the resulting value of the textarea.
                textarea.value = leftText + iconTag + rightText;

                // Restore the cursor position to the right of the inserted iconTag.
                cursorPosNew = textarea.textLength - cursorPosOrig;
                textarea.setSelectionRange(cursorPosNew, cursorPosNew);
            }
        }

    }

}; // NSPenny.BrowserOverlay.insertIconTag()


// ---------------------------------------------------------------------------------------------------------
// Register our initialization method so that is is called when the window finishes loading.
// ---------------------------------------------------------------------------------------------------------
window.addEventListener("load", NSPenny.BrowserOverlay.init, false);
