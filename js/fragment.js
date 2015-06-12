
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
