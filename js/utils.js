define(function() {
    "use strict";

    function varfieldStringRep(field) {

        var stringRepresentation = $(field).attr('id') +" " + ind($(field).attr('i1')) + ind($(field).attr('i2')) +" ";
          
        var subfields = $(field).find('subfield');
     
        $(subfields).each(function() {
          stringRepresentation += "‡"+$(this).attr('label') + $(this).text();
        });
          
        return stringRepresentation;
    }



    function xmlToString(XMLDoc) {
        if (XMLDoc === undefined || XMLDoc === null) {
            return ""; 
        }
        
        // IE 
        if (window.ActiveXObject) {
            return XMLDoc.xml;
        } else { // Others
            var str = (new XMLSerializer()).serializeToString(XMLDoc);
            return str;
        }
    
    }

    function ind(indicator) {

      return (indicator && indicator.length > 0 && indicator != ' ') ? indicator : '_';

    }

    function htmlRep(record, options) {

        var stringRepresentation = "";

        var fixfields = $(record).find('fixfield');
        $(fixfields).each(function(index) {
          stringRepresentation += "<span class='marc_fixfield' f='"+index+"'><span class='code'>" + $(this).attr('id') + "</span>    " + $(this).text() +  "</span>\n";
        });
        
        var varfields = $(record).find('varfield');
        $(varfields).each(function(vIndex) {
        
          if ( options && options.hide_fields.has($(this).attr('id'))) {
            return;
          }
        
          stringRepresentation += "<span class='marc_varfield' c='"+vIndex+"'><span class='code'>" + $(this).attr('id') +"</span> <span class='ind'>" + ind($(this).attr('i1')) + ind($(this).attr('i2')) +"</span> ";
          
          var subfields = $(this).find('subfield');
          
          if (options && options.expand_subfields == 1) {
          
            $(subfields).each(function(index) {
              
              if (index===0) {
                stringRepresentation += "<span class='sub'><span class='submarker'>‡</span><span class='subcode'>"+$(this).attr('label') +"</span><span class='subvalue'>"+ $(this).text() +"</span></span>\n";
              } else {
                stringRepresentation += "       " + "<span class='sub'><span class='submarker'>‡</span><span class='subcode'>"+$(this).attr('label') +"</span><span class='subvalue'>"+ convertTags($(this).text()) +"</span></span>\n";
              }
              
            });
     
          } else {
            $(subfields).each(function() {
              stringRepresentation += "<span class='sub'><span class='submarker'>‡</span><span class='subcode'>"+$(this).attr('label') +"</span><span class='subvalue'>"+ convertTags($(this).text()) + "</span></span>";
            });
            
          }
          stringRepresentation += "</span>";
        });


      return stringRepresentation;
    }

    function stringRep(record, options) {
    /* Note: No tag conversion in this - is it used anywhere?*/

        var stringRepresentation = "";

        fixfields = $(record).find('fixfield');
        $(fixfields).each(function() {
          stringRepresentation += $(this).attr('id') + "    " + $(this).text() +"\n";
        });
        
        varfields = $(record).find('varfield');
        $(varfields).each(function() {
        
          if ( options && options.hide_fields.has($(this).attr('id'))) {
            return;
          }
          
          stringRepresentation += $(this).attr('id') +" " + ind($(this).attr('i1')) + ind($(this).attr('i2')) +" ";
          
          subfields = $(this).find('subfield');
          if (options && options.expand_subfields == 1) {
          
            $(subfields).each(function(index) {
              
              if (index===0) {
                stringRepresentation += "‡"+$(this).attr('label') + $(this).text() +"\n";
              } else {
                stringRepresentation += "       " + "‡"+$(this).attr('label') + $(this).text() +"\n";
              }
            });
          } else {
            $(subfields).each(function() {
              stringRepresentation += "‡"+$(this).attr('label') + $(this).text();
            });
            stringRepresentation += "\n";
          }

        });

      return stringRepresentation;
    }

    function convertTags(text) {      
       return text.replace(/&/, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
    }

    function sortKey(field) {
      field = (field == 'SID') ? '996' : field;
      field = (field == 'CAT') ? '997' : field;
      field = (field == 'LOW') ? '998' : field;
      field = (field == 'STA') ? '999' : field;
      return field;
    }

    function sorter(a,b) {
      var av = $(a).attr('id');
      var bv = $(b).attr('id');
      
      if (sortKey(av) > sortKey(bv)) { return 1; }
      if (sortKey(av) < sortKey(bv)) { return -1; }
      
      if (a.textContent < b.textContent) { return 1; }
      if (a.textContent > b.textContent) { return -1; }
      
      return 0;
    }

    function sortRecord(xmlRecord) {

      var varfields = $(xmlRecord).find('varfield').detach();
      varfields.sort(sorter);
      $(xmlRecord).find('oai_marc').append(varfields);

    }

    function validateRecord(record) {
      var status = true;
      var id = $(record).find("fixfield[id='001']").text();

      $(record).find('[id=STA]').each(function() {
        if ($(this).find('[label=a]').first().text() == "DELETED") {
          status = false;
        }
      });
     
      return status;
    }

    function getLongestSubfieldLength(selector) {

        var longest = 0;

        $(selector).find('.marc_varfield').each(function() { 
            if ($(this).width() > longest) {
                longest = $(this).width();
            }
        });
        return longest;

    }

    return {
        varfieldStringRep: varfieldStringRep,
        getLongestSubfieldLength:getLongestSubfieldLength,
        validateRecord:validateRecord,
        sortRecord:sortRecord,
        stringRep:stringRep,
        htmlRep:htmlRep,
        xmlToString:xmlToString
    };

});
