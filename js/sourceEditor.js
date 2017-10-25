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





