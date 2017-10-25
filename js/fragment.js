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

define(function() {
    
    var poller;
    var vent;
    var skipEmit = false;

    function startPolling() {
        var POLL_INTERVAL = 200;
        var currentHash;
        
        poller = setInterval(function() { 
            var hash = window.location.hash;
           
                
            if (hash != currentHash) {
                
                hashChange(currentHash, hash);
                currentHash = hash;
            }
        }, 
        
        POLL_INTERVAL);

    }

    function stopPolling() {
        stopInterval(poller);
    }

    function bindTo(messageBus) {
        vent = messageBus;
        
        messageBus.addSourceChangeListener(handleRecordChange);
        messageBus.addTargetChangeListener(handleRecordChange);
    }

    function hashChange(from, to) {
      if (skipEmit) {
        skipEmit = false;
        return;
      }
      
    
      var obj = {};
      var parts = /#(.*):(.*)/.exec(to);
      if (parts) {
        var part1 = parts[1].split("=");
        var part2 = parts[2].split("=");
        obj[part1[0]] = part1[1];
        obj[part2[0]] = part2[1];
        
      } else {
        obj = undefined;
      }
      
      if (vent !== undefined) {
            vent.notifyHashChange(obj, from, to);
      }
    }
    
    
    function setHash(src_id, tgt_id, noEmit) {

        window.location.hash = "s=" + src_id + ":" + "t=" + tgt_id;
        if (noEmit && noEmit === true) {
          skipEmit = true;
        }
    }

    function handleRecordChange() {
   
        var tgt = $('.records').find("[name=targetID]").val();
        var src = $('.records').find("[name=sourceID]").val();
        setHash(src, tgt, true);
    }

    
    return {
        startPolling:startPolling,
        bindTo:bindTo
    };

});
