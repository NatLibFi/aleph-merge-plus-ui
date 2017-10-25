/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* aleph-merge-plus-ui
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of aleph-merge-plus-ui
*
* aleph-merge-plus-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* aleph-merge-plus-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
/**
 * http://stackoverflow.com/a/18742574
 * 
 * License: http://creativecommons.org/licenses/by-sa/2.5/
 * 
 */

(function() {
    "use strict";
    
    var browser={};

    if (/(chrome\/[0-9]{2})/i.test(navigator.userAgent)) {
        browser.agent = navigator.userAgent.match(/(chrome\/[0-9]{2})/i)[0].split("/")[0];
        browser.version  = parseInt(navigator.userAgent.match(/(chrome\/[0-9]{2})/i)[0].split("/")[1]);
    } else if (/(firefox\/[0-9]{2})/i.test(navigator.userAgent)) {
        browser.agent = navigator.userAgent.match(/(firefox\/[0-9]{2})/i)[0].split("/")[0];
        browser.version  = parseInt(navigator.userAgent.match(/(firefox\/[0-9]{2})/i)[0].split("/")[1]);
    } else if (/(MSIE\ [0-9]{2})/i.test(navigator.userAgent)) {
        browser.agent = navigator.userAgent.match(/(MSIE\ [0-9]{2})/i)[0].split(" ")[0];
        browser.version  = parseInt(navigator.userAgent.match(/(MSIE\ [0-9]{2})/i)[0].split(" ")[1]);
	} else if (/(MSIE\ [0-9]{1})/i.test(navigator.userAgent)) {
        browser.agent = navigator.userAgent.match(/(MSIE\ [0-9]{1})/i)[0].split(" ")[0];
        browser.version  = parseInt(navigator.userAgent.match(/(MSIE\ [0-9]{1})/i)[0].split(" ")[1]);
    } else if (/(Opera\/[0-9]{1})/i.test(navigator.userAgent)) {
        browser.agent = navigator.userAgent.match(/(Opera\/[0-9]{1})/i)[0].split("/")[0];
        browser.version  = parseInt(navigator.userAgent.match(/(Opera\/[0-9]{1})/i)[0].split("/")[1]);
    } else if (/(Trident\/[7]{1})/i.test(navigator.userAgent)) {
        browser.agent = "MSIE";
        browser.version  = 11;
    } else {
        browser.agent = false;
        browser.version  = false;
    }

    if (/(Windows\ NT\ [0-9]{1}\.[0-9]{1})/.test(navigator.userAgent)) {
        browser.os = "Windows";
        switch(parseFloat(navigator.userAgent.match(/(Windows\ NT\ [0-9]{1}\.[0-9]{1})/)[0].split(" ")[2])) {
        case 6.0:
            browser.osversion = "Vista";
            break;
        case 6.1:
            browser.osversion = "7";
            break;
        case 6.2:
            browser.osversion = "8";
            break;
        default:
            browser.osversion = false;
        }
    } else if (/(OS\ X\ [0-9]{2}\.[0-9]{1})/.test(navigator.userAgent)) {
        browser.os = "OS X";
        browser.osversion = navigator.userAgent.match(/(OS\ X\ [0-9]{2}\.[0-9]{1})/)[0].split(" ")[2];
    } else if (/(Linux)/.test(navigator.userAgent)) {
        browser.os = "Linux";
        browser.osversion = false;
    }
    
    window.browser = browser;
})();
