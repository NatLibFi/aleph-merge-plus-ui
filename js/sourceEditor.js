

define([
    'underscore',
    'utils',
    'jquery.contextMenu'
], function(_, Utils) {
     
    var SE = {
        selectedField: null,
        $buttonContainer: null,
        disabledFields: ["LOW","OWN","SID","STA"]
    };

    function onSourceRedraw( sourceRecord ) {
        
        
        SE.selectedField = null;
        if (SE.$buttonContainer !== null) {
              SE.$buttonContainer.detach();
          }
          
          $("#source .marc_varfield").contextMenu({
            menu: "sourceContextMenu"
          },
            function(action, el, pos) {
     
                var varfieldIndex = $(el).attr('c');
                var varfields = $(sourceRecord).find('varfield');
                
                var targetFieldTag = $(varfields[varfieldIndex]).attr('id').toUpperCase();
                
                if ( _(SE.disabledFields).contains(targetFieldTag) ) {
                    log("Editing " + $(varfields[varfieldIndex]).attr('id') + " fields is disabled.");
                    return;
                }
                
                //Mark the field as selected.
                SE.selectedField = $(el).attr('c');
                
                switch(action) {
                
                    case 'add':
                    addField(SE.selectedField, sourceRecord );
                    break;
                    
                
                }
                
            
        });
    }
    /**
     * Adds field from source record to merged record
     * 
     * 
     */
    function addField(fieldIndex, sourceRecord) {
        
        var varfieldIndex = fieldIndex;
        var varfields = $(sourceRecord).find('varfield');
        var targetFieldTag = $(varfields[varfieldIndex]).attr('id').toUpperCase();
        
        if ( _(SE.disabledFields).contains(targetFieldTag) ) {
            log("Editing " + $(varfields[varfieldIndex]).attr('id') + " fields is disabled.");
            return;
        }
        
      
        var fieldToAppend = $(varfields[varfieldIndex]).clone();
     
        var mergedRecord = Application.getMergedRecord();
        $(mergedRecord).find('oai_marc').append( fieldToAppend );
        
        Application.redrawMergedRecord();
        
        SE.selectedField = null;
        
        Application.log("Added field from source: " + Utils.varfieldStringRep(varfields[varfieldIndex]));
    }

    return {
        onSourceRedraw: onSourceRedraw
    };

});





