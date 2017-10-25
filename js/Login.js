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

var supportedBrowsers = {
    'Firefox': 17,
    'Chrome': 25
	//  MSIE commented away because of broken XML
    //, 'MSIE': 11
};


function browserIsSupported() {
    
    console.log( supportedBrowsers[browser.agent] );

    if (supportedBrowsers[browser.agent] === undefined) {
        return false;
    }
    
    if (browser.version < supportedBrowsers[browser.agent] ) {
        return false;
    }
    

    return true;
}

$(document).ready(function() {

    if ( !browserIsSupported() ) {
        
        $("#login_box").remove();
        $("#login_message_box").remove();
        
        $("#notSupportedMessage").css('display','block');
        $("#notSupportedMessage").find('.title').text("Käyttämäsi selainohjelma ei ole tuettu");
        
        var message = "Järjestelmän käyttäminen edellyttää tuettua selainta. Sisäänkirjautuminen on mahdollista ainoastaan seuraavilla selaimilla:\n";
        message += "\n";
        var keys = Object.keys(supportedBrowsers);
        for (var i=0;i<keys.length;i++) {
            
            var version = supportedBrowsers[keys[i]];
            
            message += "* " + keys[i] + " v" + version + "\n";
            
        }
        message += "\n";
        message += "(Tai uudemmilla versioilla näistä selaimista)\n";
		message += "\n";
        message += "Huom! Internet Exploreria ei toistaiseksi tueta yhteensopivuusongelmien vuoksi. (12.8.2014)\n";
        message += "\n";
        message += "Järjestelmän mukaan selaimesi on: " + browser.agent + " v" + browser.version + "\n";
       
        $("#notSupportedMessage").find('.body').html(message);
        
        return;
    }


	
	$("#LoginForm").submit(function() {
	
		var username = $("#LoginForm").find("[name=username]").val();
		var password = $("#LoginForm").find("[name=password]").val();
		
		if (username !== "" && password !== "") {
			warningBox("<img src='images/loader.gif' alt='logging in' height='24' width='24'>Logging in...");
				
			$.ajax({
        type: 'POST',
        url: "index.pl", 
        data: $("#LoginForm").serialize(),
        dataType: 'json',
        success: function(data, textStatus, XMLHttpRequest) {
          
          if (data.success) {
            $.cookie(data.message.name, null, {path: data.message.path}); //deletes
            $.cookie(data.message.name, data.message.value, {path: data.message.path});
        
            window.location = "index.pl?action=main";
            warningBox("Logged in!");
          } else {
            warningBox(data.message);
          }
        
        },
        error: function(data, textStatus, XMLHttpRequest) {
          warningBox(textStatus);
        }
      });
		} else {
			warningBox("user/pass empty");
		}
		
		return false;
	});

	
	$(function() {
		$("#form-login").bind("mouseenter", function() {
			$("#form-login").addClass("ui-state-hover");
		});
		$("#form-login").bind("mouseleave", function() {
			$("#form-login").removeClass("ui-state-hover");
		});
	});

	
	if ($("#login_message_box:has(p)").length > 0) {
		$("#login_message_box").fadeIn("fast");
	}

});

function warningBox(message) {

	$("#login_message_box").empty();
	$("#login_message_box").append("<p>" + message +"</p>");
	$("#login_message_box").fadeIn("fast");

}
