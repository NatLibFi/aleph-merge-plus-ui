
require([
    'config',
    'mbus',
    'jquery',
    'jquery.ui',
    'WorkingDialog',
    'sourceEditor',
    'mergeEditor',
    'utils',
    'fragment',
    'DoubleDatabase'
], function(config, MessageBus, $, jqui, WorkingDialog, SourceRecordEditor, MergedRecordEditor, Utils, Fragment, DoubleDatabase) {
   "use strict";
   
    window.Application = {
        redrawMergedRecord: redrawMergedRecord,
        log: log,
        warn: warn,
        getMergedRecord: function() {
            return mergedRecord;
        }
    };
   
   
    var storage;
    var sourceRecord;
    var targetRecord;
    var mergedRecord;

    var username;
    var password;

    /*
     Check that the configuration variables are set.
     Variables are set in config.js
    */

    if (
     config.XAPI === undefined ||
     config.XPOSTAPI === undefined ||
     config.MERGEAPI === undefined ||
     config.XCHILDAPI === undefined ||
     config.NOHOSTCHECK === undefined ||
     config.NOSOURCEDELETE === undefined
    ) {
      alert("Configuration parameters missing.");

    }

    if (config.UILOGGER === undefined) {
        if (window.console && console.log) {
            console.log("UILOGGER not configured, not saving log to backend.");
        }
    }

    var recordOptions = {
      "expand_subfields": "1",
      "hide_fields": ["CAT"],
    };
    
    var messageBus = new MessageBus();
    
    messageBus.addSourceRedrawListener(SourceRecordEditor.onSourceRedraw);
    messageBus.addMergeRedrawListener(MergedRecordEditor.onMergeRedraw);
        
    $(document).ready(function() {

        Fragment.bindTo(messageBus);
        Fragment.startPolling();
        
        DoubleDatabase.bindTo(messageBus);

        log("");
        $.get("viesti_fenni.txt", function(data) { 
            log(data, false);
        });
      
        WorkingDialog.autoclosedelay = 1000;
        $('#WorkingDialog').dialog({ 
            beforeClose: function(event, ui) {
                /* Here is the problem - this shouldn't happen after merge-chk */ 
                updateRecordsAfterMerge();
            }
        });
        WorkingDialog.hide();
            
        username = $("#username").attr('value');
        password = $("#password").attr('value');

        storage = $("#storage").get(0);

        $('button').on('mouseover mouseout', function(event) {
          if (event.type == 'mouseover') {
            // in
            $(this).addClass('ui-state-hover'); 
          } else {
            // out
            $(this).removeClass('ui-state-hover'); 
          }
        });

        
      $('.records').find("[name=sourceID]").change(function(e) {

            jQuery.removeData(storage);
            updateSourceRecord($(this).val());
            messageBus.notifySourceChange();
       
        }).keypress(function(e) {
        
            if (e.which == 13) { //Enter
         
                $(this).blur().focus().trigger('change');
      
            }
        
        });
        
	

        $('.records').find("[name=targetID]").change(function(e) {
        
            jQuery.removeData(storage);
            updateTargetRecord($(this).val());
            messageBus.notifyTargetChange();

        }).keypress(function(e) {
        
            if (e.which == 13) { //Enter

                $(this).blur().focus().trigger('change');

            }
        });
        
        $('#transpose').click(transposeRecords);
        $('#merge').click(validateRecords(mergeRecords));
        $('#save').click(saveRecord);
        $('#merge-chk').click(mergeCheck);
        
        $('#clearAll').click(clearAll);
        $('#searchDspace').click(searchDspace);



        $('#logout').click(function() {
            window.location = "index.pl?action=logout";
        });
        
        messageBus.addHashListener(function(obj, from, to) {
            if (obj === undefined) {
              return;
            }
           if (obj.s !== undefined) $('.records').find("[name=sourceID]").val(obj.s);
           if (obj.t !== undefined) $('.records').find("[name=targetID]").val(obj.t);
           if (obj.s !== undefined) updateSourceRecord(obj.s);
           if (obj.t !== undefined) updateTargetRecord(obj.t);
           
        });
      
    });
    
    
    function validateRecords(doneCallback) {

        return function(){

        var src = $('.records').find("[name=sourceID]").val();
        var tgt = $('.records').find("[name=targetID]").val();

        var errorHandler = function(errorText) {
              warn("cannot merge: "+ errorText );
              $('#merged .data').html(errorText);
           }

        $.when(notHostRecord(src), notHostRecord(tgt))
          .done(doneCallback)
          .fail(errorHandler);

        }

   }


   function searchDspace() {

	 var isbn = $(targetRecord).find("varfield[id='020']").text(); ;

	  $(targetRecord).find('[id=020]').each(function() {
        	isbn = $(this).find('[label=a]').first().text();
	        console.log("ISBN: "+isbn);
	  });

	
	 var title;

	  $(targetRecord).find('[id=245]').each(function() {
        	title = $(this).find('[label=a]').first().text();
	        console.log("Title: "+title);
	  });

	if (title) {
	 title = title.replace("/\W*/g", "");
	}

	 var urn;
	  $(targetRecord).find('[id=856]').each(function() {
        	urn = $(this).find('[label=u]').first().text();
	        console.log("URN: "+urn);
	  });

	 var query = "title:\""+title+"\" OR isbn:"+isbn;

	 var url=config.DSPACEURL+query+"&submit=Hae";
	 warn("Avataan DSpacehaku uuteen ikkunaan!");
	  /* https://luovutus-kk.lib.helsinki.fi/search?query=title:%22testi%22&submit=Hae */
	 window.open(url,"dspace");	   
        }        
    
    function transposeRecords() {
     
        // Get double id if exist, we want to preserve it when records are just changed mutually
        var id = $.data(storage, 'tupla_id');
        
        var new_src = $('.records').find("[name=targetID]").val();
        var new_tgt = $('.records').find("[name=sourceID]").val();
        $('.records').find("[name=targetID]").val(new_tgt);
        $('.records').find("[name=sourceID]").val(new_src);

        sourceRecord=undefined;
        targetRecord=undefined;
        mergedRecord=undefined;
        
        var errorHandler = function(errorText) {
              warn("(Transpose) cannot merge: "+ errorText );
              $('#merged .data').html(errorText);
        }

        var opts = {
            noValidate: false,
            updateProposal: false
        };
  
        $.when(updateSourceRecord(new_src, opts), updateTargetRecord(new_tgt, opts))
               .done(updateMergeProposal)
               .fail(errorHandler);
        
        //Set the id again, since changing the records will clear it.
        if (id !== undefined) {
            $.data(storage, 'tupla_id', id);
        }
        
    }
    
    
    function mergeCheck() {
      
    // TODO: This breaks merged record! Needs fixing!
    // See: UpdateRecordsAfterMerge

    warn("Check functionality not in use.");
    return;
    
        var src = $('.records').find("[name=sourceID]").val();
        var tgt = $('.records').find("[name=targetID]").val();

        var docnum = $(mergedRecord).find("fixfield[id='001']").text();
        
        WorkingDialog.clear();
        WorkingDialog.show({width: "700px"});
        var checkJob = WorkingDialog.addJob("Tarkistetaan yhdistettyä tietuetta " + docnum);
        $.ajax({
          'url': config.XPOSTAPI, 
          'type': 'POST',
          'data': { 'xml_full_req': Utils.xmlToString(mergedRecord),
                    'op': 'update-doc',
                    'library': 'fin01',
                    'doc_action': 'UPDATE-CHK',
                    'user_name': username,
                    'user_password': password,
                    'doc_num': docnum
                  } ,
          'processdata': false,
          'beforeSend': function(xhr) {
            checkJob.start();
          },
          'success': function(oai_marcxml_rec, textStatus, xhr) {
          
             if (xhr.status < 99) {
                    checkJob.fail();
                    warn("Operation failed due to a network error.");
             } else {
                
                 if ($(oai_marcxml_rec).find('error').length > 0) {
                 
                  checkJob.fail();

                  $(oai_marcxml_rec).find('error').each(function(i) {
                    warn($(this).text());
                  });
                  
                 } else {
                  checkJob.end();
                 }
             }
            
          }
        });
      

        
    }
    
    
    function mergeRecords() {
       
        if (!Utils.validateRecord(sourceRecord)) { 
          warn("cannot merge.");
          return;
        }
        if (!Utils.validateRecord(targetRecord)) {     
          warn("cannot merge.");
          return;
        }

        if (mergedRecord === undefined) {
          warn("Errors: cannot merge.");
          return;
        }
        var docnum = $(mergedRecord).find("fixfield[id='001']").text();
	        
        WorkingDialog.clear();
        WorkingDialog.show({width: "700px"});
        
	if (docnum > 0) {

        var mergeJob = WorkingDialog.addJob('Tallennetaan tietue ' + docnum);
        $.ajax({
          'url': config.XPOSTAPI, 
          'type': 'POST',
          'data': { 'xml_full_req': Utils.xmlToString(mergedRecord),
                    'op': 'update-doc',
                    'library': 'fin01',
                    'doc_action': 'UPDATE',
                    'user_name': username,
                    'user_password': password,
                    'doc_num': docnum
                  } ,
          'processdata': false,
          'beforeSend': function(xhr) {
            mergeJob.start();
          },
          'success': function(message, textStatus, xhr) {
          
            if (xhr.status < 99) {
                mergeJob.fail();
                warn("Operation failed due to a network error.");
            } else {
            
                var $errors = $(message).find('error');

                if ($errors.length > 0) {
                    
                    //X-api gives the success message in error tag (don't try this at home).
                    var ok = false;

                    $errors.each(function(i) {

                        if ( /^\[0018\] Document: \d* was updated successfully\.$/.test( $(this).text() )) {
                            ok = true;
                        }
                    });
                    
                    if (ok) {
                        mergeJob.end();
                        $errors.each(function(i) { log( $(this).text() ); });
                        messageBus.notifyMergeSuccess();
                    } else {
                        mergeJob.fail();
                        $errors.each(function(i) { warn( $(this).text() ); });
                    }
                    
                } else {
                  mergeJob.end();
                  $errors.each(function(i) { log( $(this).text() ); });
                  messageBus.notifyMergeSuccess();
                 
                }
            }

          },
          'error': function(xhr, text, err) {
            if (window.console && console.log) {
              console.log(xhr);
            }
            warn(text);
            if (typeof(err) !== 'undefined') {
                warn(err);
            }
            warn("Error code: " + xhr.status);
            mergeJob.fail();
          }
        });
      
	}

	else {

	if (docnum == 0) { 
	console.log("Add (docnum: ."+docnum);

	/* TODO: here, add record */
	   warn("Adding new record to Melinda.");
           
	   var mergeJob = WorkingDialog.addJob('Tallennetaan tietue ' + docnum);
	   $.ajax({
          'url': config.XPOSTAPI, 
          'type': 'POST',
          'data': { 'xml_full_req': Utils.xmlToString(mergedRecord),
                    'op': 'update-doc',
                    'library': 'fin01',
                    'doc_action': 'UPDATE',
                    'user_name': username,
                    'user_password': password,
                    'doc_num': docnum
                  } ,
          'processdata': false,
          'beforeSend': function(xhr) {
            mergeJob.start();
          },
          'success': function(message, textStatus, xhr) {
          
            if (xhr.status < 99) {
                mergeJob.fail();
                warn("Operation failed due to a network error.");
            } else {
            
                var $errors = $(message).find('error');
	         
                if ($errors.length > 0) {
                    
                    //X-api gives the success message in error tag (don't try this at home).
              
	            var ok = false;
                   
		    $errors.each(function(i) {
	                console.log($(this).text());
		 
	                var successTextRegexp=/^\[0018\] Document: (\d*) was updated successfully\.$/;			

                        if ( successTextRegexp.test( $(this).text() )) {
	                    console.log("Found success message!");
			    var strText = $(this).text();
			    var strDocNum = strText.replace(successTextRegexp, "$1");
			    alert(strDocNum); 
			    docnum = strDocNum;
			    
			    /* Add new doc num to target record */
			    var tgt = $('.records').find("[name=targetID]");
			    tgt.val(docnum);

                            ok = true;
                        }

                    });
                   
		    console.log(ok);
                    if (ok) {
                        mergeJob.end();
                        $errors.each(function(i) { log( $(this).text() ); });
                        messageBus.notifyMergeSuccess();
                    } else {
                        mergeJob.fail();
                        $errors.each(function(i) { warn( $(this).text() ); });
                    }
                    
                } else {
                  mergeJob.end();
                  $errors.each(function(i) { log( $(this).text() ); });
                  messageBus.notifyMergeSuccess();
                 
                }
            }

          },
          'error': function(xhr, text, err) {
            if (window.console && console.log) {
              console.log(xhr);
            }
            warn(text);
            if (typeof(err) !== 'undefined') {
                warn(err);
            }
            warn("Error code: " + xhr.status);
            mergeJob.fail();
          }
        });

	}
	else {
	   warn("No valid docnum"); 
	   
	}

	}

	/* Here deleting sourceRecord */
	
	console.log("No source delete -configuration: " + config.NOSOURCEDELETE);

      if (config.NOSOURCEDELETE == "0") {
	
        var sdocnum = $(sourceRecord).find("fixfield[id='001']").text();
        var deleteJob = WorkingDialog.addJob('Poistetaan tietue ' + sdocnum);

        $(sourceRecord).find('[id=STA]').each(function() {
          if ($(this).text() == "DELETED") {
            $(this).remove();
          }
        });
              
        var delfield = document.createElementNS(null, 'varfield');
        delfield.setAttribute('id', 'STA');
        delfield.setAttribute('i1', ' ');
        delfield.setAttribute('i2', ' ');
        
        var delsubfield = document.createElementNS(null, 'subfield');
        delsubfield.setAttribute('label', 'a');
        
        delsubfield.appendChild(document.createTextNode("DELETED"));
        delfield.appendChild(delsubfield);
        
        $(sourceRecord).find('oai_marc').append(delfield);
        
        $.ajax({
          'url': config.XPOSTAPI, 
          'type': 'POST',
          'data': { 'xml_full_req': Utils.xmlToString(sourceRecord),
                    'op': 'update-doc',
                    'library': 'fin01',
                    'doc_action': 'UPDATE',
                    'user_name': username,
                    'user_password': password,
                    'doc_num': sdocnum
                  } ,
          'processdata': false,
          'beforeSend': function(xhr) {
            deleteJob.start();
          },
          'success': function(message, textStatus, xhr) {
          
            if (xhr.status < 99) {
                deleteJob.fail();
                warn("Operation failed due to a network error.");
            } else {
            
            
                var $errors = $(message).find('error');

                if ($errors.length > 0) {
                    
                    //X-api gives the success message in error tag (don't try this at home).
                    var ok = false;
                    $errors.each(function(i) {
                        if ( /^\[0018\] Document: \d* was updated successfully\.$/.test( $(this).text() )) {
                            ok = true;
                        }
                    });
                
                    if (ok) {
                        deleteJob.end();
                        $errors.each(function(i) { log( $(this).text() ); });
                    } else {
                        deleteJob.fail();
                          
                        $(sourceRecord).find('[id=STA]').each(function() {
                            if ($(this).text() == "DELETED") {
                                $(this).remove();
                            }
                        });
                        
                        $errors.each(function(i) { warn( $(this).text() ); });
                    }
                
                } else {
                  deleteJob.end();
                  $(message).find('log').each(function(i) {
                    
                    log( $(this).text() );
                    
                  });
                }
                
                redrawSourceRecord();
            }
          
          },
          'error': function(xhr, text, err) {
            if (window.console && console.log) {
              console.log(xhr);
            }
            warn(text);
            if (typeof(err) !== 'undefined') {
                warn(err);
            }
            warn("Error code: " + xhr.status);
            deleteJob.fail();
          }
        });
    
	}
   
         
    }
    
    
    /**
     *  Save button functionality 
     *  
     * Saves the merged record to database without trying to delete the sourcerecord.
     **/

    function saveRecord() {
      
            if (mergedRecord === undefined) {
              warn("Errors: cannot save.");
              return;
            }
            var docnum = $(mergedRecord).find("fixfield[id='001']").text();
            
            WorkingDialog.clear();
            WorkingDialog.show({width: "700px"});
            
            var saveJob = WorkingDialog.addJob('Tallennetaan tietue ' + docnum);

            $.ajax({
              'url': config.XPOSTAPI, 
              'type': 'POST',
              'data': { 'xml_full_req': Utils.xmlToString(mergedRecord),
                        'op': 'update-doc',
                        'library': 'fin01',
                        'doc_action': 'UPDATE',
                        'user_name': username,
                        'user_password': password,
                        'doc_num': docnum
                      } ,
              'processdata': false,
              'beforeSend': function(xhr) {
                saveJob.start();
              },
              'success': function(message, textStatus, xhr) {

                if (xhr.status < 99) {
                    saveJob.fail();
                    warn("Operation failed due to a network error.");
                } else {
                
                    var $errors = $(message).find('error');

                    if ($errors.length > 0) {

                        //X-api gives the success message in error tag (don't try this at home).
                        var ok = false;
                        $errors.each(function(i) {
                            if ( /^\[0018\] Document: \d* was updated successfully\.$/.test( $(this).text() )) {
                                ok = true;
                            }
                        });
                    
                        if (ok) {
                            saveJob.end();
                            $errors.each(function(i) { log( $(this).text() ); });
                            updateMergedRecord(docnum);
                        } else {
                            saveJob.fail();
                            $errors.each(function(i) { warn( $(this).text() ); });
                        }
                    
                    }
                }

              },
              'error': function(xhr, text, err) {
                if (window.console && console.log) {
                  console.log(xhr);
                }
                warn(text);
                if (typeof(err) !== 'undefined') {
                    warn(err);
                }
                warn("Error code: " + xhr.status);
                saveJob.fail();
              }
            });
            
        
    }
    

    function updateRecordsAfterMerge() {
        var src_id = $('.records').find("[name=sourceID]").val();
        var tgt_id = $('.records').find("[name=targetID]").val();

        var opts = {
            noValidate: true,
            updateProposal: false
        };
        
        if (src_id !== "" && tgt_id !== "") {
            updateSourceRecord(src_id, opts);
            updateTargetRecord(tgt_id, opts);
            updateMergedRecord(tgt_id, opts);
        }
      
        $("#save").show();

    }

    function redrawMergedRecord() {
        Utils.sortRecord(mergedRecord);
        var record = $(mergedRecord).find('oai_marc');
        $('#merged .data').html( Utils.htmlRep(record, recordOptions));
        messageBus.notifyMergeRedraw();
    }

    function redrawSourceRecord() {

        Utils.sortRecord(sourceRecord);     
        $('#source .data').html( Utils.htmlRep(sourceRecord, recordOptions));
        messageBus.notifySourceRedraw(sourceRecord, mergedRecord);
        
    }

    function clearAll() {
        $('.records').find("[name=sourceID]").val('');
        $('.records').find("[name=targetID]").val('');
        $('#source .data').html('');
        $('#target .data').html('');
        $('#merged .data').html('');
        sourceRecord = undefined;
        targetRecord = undefined;
        mergedRecord = undefined;
        log("");
        log("Cleared all.");
    }

    function updateTargetRecord(rec_key, options) {
        var deferred=$.Deferred();
        targetRecord=undefined;
        
        $('#target .data').html("");
        
        if (rec_key > 0) {

        $.get(config.XAPI + rec_key, function(oai_marcxml_rec) {
        
          var error = $(oai_marcxml_rec).find('error');
          
          if (error.length) {
        
            $('#target .data').html(error.text());
            warn("Failed to load target record: " + rec_key);
            deferred.reject("Failed to load target record: " + rec_key);

          } else {
          
            var record = $(oai_marcxml_rec).find('oai_marc');
            targetRecord = oai_marcxml_rec;
            Utils.sortRecord(targetRecord);
            
            $('#target .data').html( Utils.htmlRep(record, recordOptions));
            log("Loaded target record: " + rec_key);
            deferred.resolve();
            if (options && options.noValidate) {
                
            } else {
                Utils.validateRecord(targetRecord);
            }
          }
	
          if (options && options.updateProposal === false) {
          
          } else {
              updateMergeProposal();
          }
	 
        });
	}
	
	else {

	if (rec_key == "0") { 

 	     warn("Using empty template");
	    
	    $.get("fenni_web_template.xml", function(oai_marcxml_rec) { 
            var record = $(oai_marcxml_rec).find('oai_marc');
            targetRecord = oai_marcxml_rec;
            Utils.sortRecord(targetRecord);

            $('#target .data').html( Utils.htmlRep(record, recordOptions));
            log("Loaded empty target record: " + rec_key);

          	if (options && options.updateProposal === false) {
          
          	} else {
              	updateMergeProposal();
          	}
             deferred.resolve();

            });   
	}
    
	else {
	 warn("No target record specified");
	if (options && options.updateProposal === false) {

                } else {
                updateMergeProposal();
                }
             deferred.resolve();
         }



	}
        
	return deferred.promise();        
	
    }

    function updateSourceRecord(rec_key, options) {
        
        var deferred= $.Deferred();
        sourceRecord=undefined;
        
        if (rec_key === undefined || rec_key === null || rec_key === "") {
            return;
        }
        
        $('#source .data').html("");
        
        $.get(config.XAPI + rec_key, function(oai_marcxml_rec) {
        
            var error = $(oai_marcxml_rec).find('error');
          
            if (error.length) {
        
                $('#source .data').html(error.text());
                warn("Failed to load source record: " + rec_key);
                deferred.reject("Failed to load source record: " + rec_key);

            } else {
          
                var record = $(oai_marcxml_rec).find('oai_marc'); 
                sourceRecord = oai_marcxml_rec;
                
                redrawSourceRecord();

                log("Loaded source record: " + rec_key);
                deferred.resolve();    

                if (options && options.noValidate) {
                    
                } else {
                    Utils.validateRecord(sourceRecord);
                }
            }
            if (options && options.updateProposal === false) {
          
            } else {
                updateMergeProposal();
            }
        });
        return deferred.promise();
    }


    /**
     * Update merged record view with rec_key from database.
     * Useful after merge to reload the merged record from db 
     * to see changes applied by ils
     * 
     */

    function updateMergedRecord(rec_key, options) {
     
       var deferred= $.Deferred();   
       mergedRecord=undefined;
        
        if (rec_key === undefined || rec_key === null || rec_key === "") {
            return;
        }
        
        $('#merged .data').html("");
        
        $.get(config.XAPI + rec_key, function(oai_marcxml_rec) {
        
          var error = $(oai_marcxml_rec).find('error');
          
          if (error.length) {
        
            $('#merged .data').html( error.text() );
            warn("Failed to refresh merged record: " + rec_key);
            deferred.reject("Failed to refresh merged record: " + rec_key);

          } else {
          
            var record = $(oai_marcxml_rec).find('oai_marc'); 
            mergedRecord = oai_marcxml_rec;
            
            redrawMergedRecord();

            log("Refreshed merged record: " + rec_key);
            deferred.resolve();
            if (options && options.noValidate) {
                
            } else {
                Utils.validateRecord(mergedRecord);
            }
            
          }
          
        });
        return deferred.promise();

   }

    function updateMergeProposal() {
        
        $("#save").hide();

        mergedRecord=undefined;
        $('#merged .data').html("");

	if (sourceRecord === undefined || targetRecord === undefined) {
          // warn("Errors: cannot merge.");
          return;
        }

        if (!Utils.validateRecord(sourceRecord)) {
          var errorText="Cannot merge: source record is deleted";
          warn(errorText);
          $('#merged .data').html(errorText);	
          return;
        }
        if (!Utils.validateRecord(targetRecord)) {
          var errorText="Cannot merge: target record is deleted";
          warn(errorText);
          $('#merged .data').html(errorText);	
          return;
        }

      validateRecords(queryMergedRecord)();
 
      function queryMergedRecord() {

      $('#merged .data').html("");
        
        if (typeof(sourceRecord) != "undefined" &&
            typeof(targetRecord) != "undefined") {

        $.ajax({
          'url': config.MERGEAPI, 
          'type': 'POST',
          'data': {'rec1': Utils.xmlToString(sourceRecord), 'rec2': Utils.xmlToString(targetRecord)} ,
          'processdata': false,
          'success': function(oai_marcxml_rec) {
          
            var error = $(oai_marcxml_rec).find('error');
            if (error.length) {
              $('#merged .data').html(error.text());
              warn(error.text());
              return;
            }
            mergedRecord = oai_marcxml_rec;
            
            redrawMergedRecord();
            
            
            /* Disabled for now, until configuration is possible 
            var lines = record.find('subfield').length + record.find('fixfield').length;
            
            $('#merged .data').css('height', 32 + lines * 16);
            $('#source .data').css('height', 32 + lines * 16);
            $('#target .data').css('height', 32 + lines * 16);
            
            */

            
          }
         
        });
        
      
      }
      }
    }

    function notHostRecord(rec_key) {

      /* Checks whether given record has child/component records */
       
      var deferred = $.Deferred();
      var expanded_rec_key = pad(rec_key,9);	 

      console.log("No host check -configuration: " + config.NOHOSTCHECK);

      if (config.NOHOSTCHECK == "1") {
	deferred.resolve();
	}	
	else {

	console.log("Running host check for records.");
      	$.get(config.XCHILDAPI + expanded_rec_key, function(child_query_response) {
	
        var error = $(child_query_response).find('error');
        if (error.text() === "empty set") {
            //  log(expanded_rec_key + "'s children: " + error.text());
              deferred.resolve();
        }
	else {
              var child_no = $(child_query_response).find('no_records');
              deferred.reject(rec_key + " is host record! ("+child_no.text()+" children)");
        }
    });
    }
     	   return deferred.promise();  
	
}

function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}


    function loaderHTML() {

        var HTML = "<img src='images/loader.gif' />Loading";        
        return HTML;

    }

    function warn(message) {
        log("<font color=\"#FF0000\">" + message + "</font>", false);
        writelog("[WARN] " + message);
    }

    function log(message, uselog) {

      uselog = (uselog === undefined) ? true : uselog;

        $('.log').append(message +"\n");
        $('.log').scrollTop($('.log')[0].scrollHeight);
      
      if (uselog) {
        writelog(message);
      }
    }

    function writelog(message) {
        message = "[" + username + "] "+ message;
      
        if (config.UILOGGER) {
            $.get(config.UILOGGER + message);
        }
    }


    if (!Array.prototype.indexOf) {

        Array.prototype.indexOf = function(obj) {
          for (var i = 0; i < this.length; i++) {
            if (this[i] == obj)
              return i;
          }
          return -1;
        };
    }

    if (!Array.prototype.has) {
        Array.prototype.has = function(obj) {
          return this.indexOf(obj) >= 0;
        };
        
    }

});
