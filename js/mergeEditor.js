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
    "use strict";

    var ME = {
       selectedField: null,
       $buttonContainer: null,
       disabledFields: ["LOW","OWN","SID","STA"]
    };

    function onMergeRedraw() {

        ME.selectedField = null;

        if (ME.$buttonContainer !== null) {
              ME.$buttonContainer.detach();
              ME.$buttonContainer = null;
          }
     
          $("#merged .marc_varfield").contextMenu({ menu: "editmenu" }, function(action, el, pos) {
            
                  var varfields = $(Application.getMergedRecord()).find('varfield');
                  
                  
                 // Cancel any selections
                 if (ME.selectedField !== null) {
                     // Pressing cancel will cause redrawing of the record, thus the selected object is removed. 
                     // Save the id for referring the object after redraw
                     var fieldIndex = $(el).attr('c');
                 
                     ME.$buttonContainer.find('#cancelFieldEditButton').trigger('click');
                     
                     el = $('#merged .marc_varfield[c='+fieldIndex+']');
                 
                 }
     
                var varfieldIndex=$(el).attr('c');
                //Check whether editing is allowed.
                for (var i=0;i<ME.disabledFields.length;i++) {
                    if ($(varfields[varfieldIndex]).attr('id').toUpperCase() == ME.disabledFields[i].toUpperCase()) {
                      Application.log("Editing " + $(varfields[varfieldIndex]).attr('id') + " fields is disabled.");
                      return;
                    }
                }
                //Mark the field as selected.
                ME.selectedField = $(el).attr('c');
            
                
                switch(action) {
                
                    case 'new':
                    newField(el, ME.selectedField);
                    break;
                    
                    case 'edit':
                    editField(el, ME.selectedField);
                    break;
                    
                    case 'delete':
                    deleteField(ME.selectedField);
                    break;
                
                }
                
            
        });
        
    }


    function newField() {

        //add empty field
        
        var newfield = document.createElementNS(null, 'varfield');
        newfield.setAttribute('id', '000');
        newfield.setAttribute('i1', ' ');
        newfield.setAttribute('i2', ' ');
        
        var newfield_sub = document.createElementNS(null, 'subfield');
        newfield_sub.setAttribute('label', ' ');
        

        newfield.appendChild(newfield_sub);
        
        var mergedRecord = Application.getMergedRecord();
        $(mergedRecord).find('oai_marc').append(newfield);

        
      /*  Application.redrawMergedRecord(); */
        Application.redrawMergedRecord( mergedRecord );
        
        
        var $el = $('#merged .marc_varfield > span.code:contains(000)').parent();
        var fieldNumber = $el.attr('c');
        
        ME.selectedField = fieldNumber;
        
        //make it editable
        editField($el, fieldNumber);
        //change cancel button behaviour to delete the newly created field.
        ME.$buttonContainer.find('#cancelFieldEditButton').unbind('click').bind('click', function() {
            deleteField(fieldNumber);
        });
    }



    function editField(fieldElement, fieldNumber) {

        var mergedRecord = Application.getMergedRecord();
        var varfields = $(mergedRecord).find('varfield');
         
        var varfieldIndex=fieldNumber;
        //Check whether editing is allowed.
        for (var i=0;i<ME.disabledFields.length;i++) {
            if ($(varfields[varfieldIndex]).attr('id').toUpperCase() == ME.disabledFields[i].toUpperCase()) {
              log("Editing " + $(varfields[varfieldIndex]).attr('id') + " fields is disabled.");
              return;
            }
        }
        
        
        ME.$buttonContainer = $("<div id='editButtons'></div>");
        ME.$buttonContainer.css('paddingLeft', '9ex');
        
        
        var $cancelButton = $("<button id='cancelFieldEditButton' class='ui-state-default ui-corner-all'>Peruuta</button>");
        var $okButton = $("<button id='okFieldEditButton' class='ui-state-default ui-corner-all'>Tallenna</button>");

         $okButton.css('width', '80px');
         $okButton.css('margin-right', '3px');
         $cancelButton.css('width', '80px');    
         $cancelButton.css('margin-right', '3px');
        
        ME.$buttonContainer.append($okButton);
        ME.$buttonContainer.append($cancelButton);
        

      
        $(fieldElement).after(ME.$buttonContainer);
        
        //Change field code to editable
        {
            var $fieldCode = $(fieldElement).find('.code').first();
            var content = $fieldCode.text();
            $fieldCode.text("");
            var $editField = $("<input maxlength='3' class='editfield' type='text' value='"+content+"'/>");
            $editField.css('width', '4ex');
            $fieldCode.append($editField);
           }
           

        //Change subfield labels to editable
        $(fieldElement).find('.subcode').each(function() {
          var content = $(this).text();
          $(this).text("");
          var $editField = $("<input maxlength='1' class='editfield' type='text' value='"+content+"'/>");
          $editField.css('width', '1.5ex');
          $(this).append($editField);
        });

           
           var editLength = Utils.getLongestSubfieldLength('#merged .data');
        //Change subfields to editable
        $(fieldElement).find('.subvalue').each(function() {
        
          var content = $(this).text();
          $(this).text("");
          var $editField = $("<input class='editfield' type='text'/>");
          $editField.val(content);
          
          //Pressing enter in the subvalue editfield will move the cursor to the next subfield, or create a new if in last one.
          $editField.bind('keypress', function(e) {
            subfieldKeypress(e, this);
          });
           $editField.bind('keyup', function(e) {
            resizeEditField(e, this);
          });      
          
            resizeEditField(null, $editField);
              
            
          $(this).append($editField);
          
          var $deleteButton = $('<button class="ui-state-default ui-icon ui-icon-trash ui-corner-all subdelete" alt="poista" />');
          $(this).append($deleteButton);
          $deleteButton.bind('click', function() {
          

              $(this).parents('.sub').first().remove();

        
          
          });
        });
        
        //Focus the first field, otherwise if user is using firefox on windows/mac backspace will navigate back.
        $(fieldElement).find('.subvalue .editfield').first().focus();
        
         $(fieldElement).find('.ind').each(function() {
            
             var content = $(this).text();
             content = content.replace(/_/g,' ');
             $(this).text("");
             var $editField = $("<input maxlength='2' class='editfield' type='text' value='"+content+"'/>");
             $editField.css('width', '3ex');
            $(this).append($editField);
        });
        
        
       $cancelButton.bind('click', cancelEdit);
       $okButton.bind('click', function() { saveField(fieldNumber); });
    }
     
    // Resize the a field to it's content
    function resizeEditField(e, field) {

        var fieldLength = 1.3 * (3 + $(field).val().length);
        if (fieldLength < 20) { 
            fieldLength = 20;
        }
        $(field).css('width', fieldLength + "ex");

    } 
       
    /*
     * Handles keypresses done in subfields (up,down,enter etc.)
     */
    function subfieldKeypress(e, field) {

            var keyCode = e.keyCode || e.which;
            var key = {up: 38, down: 40, enter: 13};
            
            var $next;
            
            switch (keyCode) {
                
             
                case key.enter:
                
                      $next = $(field).parents('.sub').first().next('.sub');
                      var $parent =$(field).parents('.marc_varfield').first();
                      if ($next.length > 0) {
                          $next.find('.subvalue .editfield').focus();
                      } else {
                          
                  
                          var $newNode = $(field).parents('.sub').first().clone(true);
                          
                          $parent.append($newNode);
                          
                          // Reset handlers since cloning handlers fail in firefox
                        $newNode.find('.subvalue .editfield').val("").unbind('keypress').bind('keypress', function(e) {
                            subfieldKeypress(e, this);
                        });
                        $newNode.find('.subdelete').unbind('click').bind('click', function() {
                              $(this).parents('.sub').first().remove();
                          });
                        $newNode.find('.subvalue .editfield').unbind('keyup').bind('keyup', function(e) {
                            resizeEditField(e, this);
                          });      
                          
                          $newNode.find('.subcode .editfield').val("");
                          
                          
                          $newNode.find('.subvalue .editfield').first().focus();
                          $newNode.before("       ");
                          $newNode.after("\n");
                          
                      }
                      
                      break;
                  
                  case key.up: 
                      var $prev = $(field).parents('.sub').first().prev('.sub');
                      if ($prev.length > 0) { 
                          $prev.find('.subvalue .editfield').first().focus();
                      }
                  break;
                  
                  case key.down:
                      $next = $(field).parents('.sub').first().next('.sub');
                      if ($next.length > 0)  $next.find('.subvalue .editfield').first().focus();
                  break; 
                  
                  default:
                      
                  break;
          
              }
        

    }


    function saveField(fieldID) {

        //Validate record
        {
            var fieldCode = $('#merged .marc_varfield[c='+fieldID+']').find('.code .editfield').first().val();
            if (fieldCode.length != 3) {
                Application.warn("Kenttäkoodi ei ole kelvollinen. Koodin pitää olla 3 merkkinen. Koodi on nyt: '" + fieldCode+"'");
                return false;
            }
            if (parseInt(fieldCode, 10) <= 10) {
                Application.warn("Kenttäkoodi ei ole kelvollinen. Vain kiinteänmittaiset kenttien koodit saa olla 000-010 väliltä. Koodi on nyt: '" + fieldCode+"'");
                return false;
            }
            
            if ( _(ME.disabledFields).contains(fieldCode.toUpperCase()) ) {
                Application.warn("Editing " + fieldCode + " fields is disabled.");
                return false;
            }
          
            var errors = false;
            
            //check subfields
            if ($('#merged .marc_varfield[c='+fieldID+']').find('.sub').length === 0) {
                Application.warn("Kentän '"+fieldCode+"' osakenttien lukumäärä ei saa olla 0. Jos haluat poistaa koko kentän, valitse 'peruuta' jonka jälkeen valitse pudotusvalikosta 'poista'.");
                
                return false;    
            }
            
            $('#merged .marc_varfield[c='+fieldID+']').find('.sub').each(function() {
            
                var subfieldCode = $(this).find('.subcode').find('.editfield').first().val();
                 var subfieldContent = $(this).find('.subvalue').find('.editfield').first().val();
        
                 if (subfieldCode.length != 1) {
                    Application.warn("Osakentän tunnus ei ole kelvollinen. Tunnuksen pitää olla 1 merkkinen. Tunnus on nyt: '" + subfieldCode +"'");
                    errors=true;
                 }
                 
                 if (subfieldContent.length === 0) {
                    Application.warn("Osakentän "+subfieldCode+" sisältö ei ole kelvollinen. Sisältö ei saa olla tyhjä");
                    errors=true;
                 }
                 
            
            });
            if (errors) {
                return false;
            }
        
        
        }


       
        var mergedRecord = Application.getMergedRecord();
        
        //Get target field
        var targetVarfield = $(mergedRecord).find('varfield').eq(fieldID);
        $(targetVarfield).find('subfield').remove();


        //Update fieldcode
        var afieldCode = $('#merged .marc_varfield[c='+fieldID+']').find('.code .editfield').first().val();
        $(targetVarfield).attr('id', afieldCode);
          
        

        //Add new subfields
        $('#merged .marc_varfield[c='+fieldID+']').find('.sub').each(function() {
            
            var subfieldCode = $(this).find('.subcode').find('.editfield').first().val();
             var subfieldContent = $(this).find('.subvalue').find('.editfield').first().val();
        
             
            var nSubfield = document.createElementNS(null, 'subfield');
            nSubfield.setAttribute('label', subfieldCode);
        
            nSubfield.appendChild(document.createTextNode(subfieldContent));
            $(targetVarfield).append(nSubfield);
        
            
        });
        //Update indicators
        $('#merged .marc_varfield[c='+fieldID+']').find('.ind').each(function() {
        
            var indfieldContent = $(this).find('.editfield').first().val();
            
            while (indfieldContent.length < 2) {
                indfieldContent +=' ';
            }
        
            var ind1 = indfieldContent.substring(0,1);
            var ind2 = indfieldContent.substring(1,2);
            
           
            $(targetVarfield).attr('i1', ind1);
            $(targetVarfield).attr('i2', ind2);
      
        });

        
        //Redraw
        Application.redrawMergedRecord( mergedRecord );

    }

    function cancelEdit() {
        if (ME.$buttonContainer !== null) {
            ME.$buttonContainer.detach();
            ME.$buttonContainer = null;
        }
        ME.selectedField = null;
        Application.redrawMergedRecord( mergedRecord );

    }

    function deleteField(fieldNumber) {
        
        var mergedRecord = Application.getMergedRecord();
        

          var varfieldIndex = fieldNumber;
          
          var varfields = $(mergedRecord).find('varfield');
          
          for (var i=0;i<ME.disabledFields.length;i++) {
            if ($(varfields[varfieldIndex]).attr('id').toUpperCase() == ME.disabledFields[i].toUpperCase()) {
              Application.log("Editing " + $(varfields[varfieldIndex]).attr('id') + " fields is disabled.");
              return;
            }
          }
          
          var $removed = $(varfields[varfieldIndex]).detach();
            
          var record = $(mergedRecord).find('oai_marc');
            
          Application.redrawMergedRecord( mergedRecord );
          ME.selectedField = null;
          Application.log("Removed field from merged: " + Utils.varfieldStringRep(varfields[varfieldIndex]));


    }


    return {
        onMergeRedraw: onMergeRedraw
    };
});

