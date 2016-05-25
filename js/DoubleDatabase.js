
define(['config','jquery'], function(config,$) {
        
    var currentID;
   
    $(document).ready(function() {

        $('.records').find("[name=sourceID]").change(function() {
            currentID=undefined;
        });
        $('.records').find("[name=targetID]").change(function() {
            currentID=undefined;
        });
    
        // Enable buttons
        $('#doubleDB').css('display', 'inline');
      
        $('#getDoubleButton').click( getDouble );
        $('#notDoubleButton').click( markNotDouble );
        $('#skipButton').click(skip);
        $('#dontMerge').click(handledNotMerged);
        $('#source_double').click(markAsSourceDouble);

        updateCount();
        

    });


  function getDouble() {

            Application.log("---------------------------------------");
            Application.log("Haetaan tuplaehdotusta tietokannasta.");
            
            var url = config.DDB + "?a=getDouble&uid=" + username; 
        
            $.getJSON(url, function(data) {
                
                console.log(data);
                
                if (data.success) {
                    
                    console.log(data.message);
                
                    var src = data.message.rec_id_1;
                    var tgt = data.message.rec_id_2;
                
                    Application.log("Tuplaehdotus numero " + data.message.id);
                    Application.log("Luotu: " + data.message.created);
                    Application.log("Message: " + data.message.system_message);
                    Application.log("---------------------------------------");
                    
                    $('.records').find("[name=sourceID]").val(src).trigger('change');
                    $('.records').find("[name=targetID]").val(tgt).trigger('change');
            
                    currentID = data.message.id;
     
                } else {
                    Application.log(data.message);
                }
                updateCount();
            });

        }

 function markNotDouble() {
            
            var src = $('.records').find("[name=sourceID]").val();
            var tgt = $('.records').find("[name=targetID]").val();

            if (currentID === undefined) {
                Application.log("Tuplaehdotuksia jotka eivät ole tietokannasta ei tarvitse merkitä.");
                return;
            }
            
            Application.log("Merkitään tuplaehdotus numero " + currentID +" ei-tuplaksi (" + src + " ja " + tgt + ")");
            
            var url = config.DDB + "?a=handleDouble&id="+currentID+"&action=not-double&uid=" + username; 
        
            $.getJSON(url, function(data) {
                if (data.success) {
                
                    Application.log(data.message);
            

                } else {
                    Application.log(data.message);
                }
                updateCount();
            });
        
        }
        
        
    function skip() {
            
            var src = $('.records').find("[name=sourceID]").val();
            var tgt = $('.records').find("[name=targetID]").val();
                
            if (currentID === undefined) {
                Application.log("Tuplaehdotuksia jotka eivät ole tietokannasta ei tarvitse merkitä.");
                return;
            }
            
            Application.log("Hypätään tuplaehdotuksen numero " + currentID +" yli (" + src + " ja " + tgt + ")");
            
            var url = config.DDB + "?a=handleDouble&id="+currentID+"&action=Skip&uid=" + username; 
        
            $.getJSON(url, function(data) {
                if (data.success) {
                
                    Application.log(data.message);
            

                } else {
                    Application.log(data.message);
                }
                updateCount();
            });
            
        }
        
        
    function handledNotMerged() {
        
        var src = $('.records').find("[name=sourceID]").val();
        var tgt = $('.records').find("[name=targetID]").val();
    
        var id = $.data(storage, 'tupla_id');
        jQuery.removeData(storage);
        if (id === undefined) {
            Application.log("Tuplaehdotuksia jotka eivät ole tietokannasta ei tarvitse merkitä.");
            return;
        }
        
        log("Merkitään tuplaehdotus numero " + id +" käsitellyksi, mutta ei yhdistetyksi (" + src + " ja " + tgt + ")");
        
        var url = "merger.pl" + "?action=action_dont_merge&id=" + id + "&message=not-merged";
        
        $.getJSON(url, function(data) {
            if (data.success) {
            
                Application.log(data.message);
                clearAll();

            } else {
                Application.log(data.message);
            }
            updateCount();
        });
    
    }
    
    
    function markAsSourceDouble() {
        
        var src = $('.records').find("[name=sourceID]").val();
        var tgt = $('.records').find("[name=targetID]").val();
    
        var id = $.data(storage, 'tupla_id');
        jQuery.removeData(storage);
        
        if (id === undefined) {
            log("Tuplaehdotuksia jotka eivät ole tietokannasta ei tarvitse merkitä.");
            return;
        }
        
        log("Merkitään tuplaehdotus numero " + id +" source-tuplaksi (" + src + " ja " + tgt + ")");
        
        var url = "index.pl" + "?action=action_dont_merge&id=" + id + "&message=Sourcedouble";
        
        $.getJSON(url, function(data) {
            if (data.success) {
            
                Application.log(data.message);
                clearAll();

            } else {
                Application.log(data.message);
            }
            
        });
    }
    
    
    
    function bindTo(messageBus) {
        messageBus.addMergeListener(onMerge);
        messageBus.addSourceChangeListener(onSourceChange);
        messageBus.addTargetChangeListener(onTargetChange);
      
    }


    function onMerge() {


        var src = $('.records').find("[name=sourceID]").val();
        var tgt = $('.records').find("[name=targetID]").val();
            

        if (currentID !== undefined) {
                    
            var url = config.DDB + "?a=handleDouble&id="+currentID+"&action=merged&uid="+username+"&source="+src+"&target="+tgt; 
            
                $.getJSON(url, function(data) {
                    if (data.success) {
                
                        Application.log(data.message);
                        
                    } else {
                        Application.log(data.message);
                    }
                });
            
        }
        
        currentID=undefined;
        updateCount();
    }
    
    function onSourceChange() {
      currentID=undefined;
    }
    
    function onTargetChange() {
      currentID=undefined;
    }


    function updateCount() {
     
        var url = config.DDB + "?a=count";
      
        $.getJSON(url, function(data) {
                if (data.success) {
                    $('#doublecount').html("Tuplia: " + data.message);
                } else {
                    warn("Tuplatietokannassa olevien tuplien laskeminen epäonnistui.");
                    $('#doublecount').html("Tuplia: ?");
                }
        });
            
    }
    
    return {
        bindTo: bindTo
    };

});
