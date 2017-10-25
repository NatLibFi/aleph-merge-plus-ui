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
/*
  TextareaPanning

*/


/*
  0 = left mouse button
  1 = middle
  2 = right
*/

activateButton = 0;

var panning=false;
var y_last=-1;
var x_last=-1;



$(document).ready(function() {

	if (activateButton == 2) {
		//Disable context menus
		$('.pannable').bind("contextmenu",function(e){
            return false;
		}); 
    }
    
  
       

	$('.pannable').mousedown(function(e) {

		if (e.button == activateButton) {
			
			panning=true;
			
			
		}
	});
	
	$('.pannable').mouseup(function(e) {

		if (e.button == activateButton) {
			
			panning=false;
			x_last = -1;
			y_last = -1;
		}
	});
	
	$('.pannable').mouseout(function(e) {

		if (panning) {
			
			panning=false;
			x_last = -1;
			y_last = -1;
		}
	});
	
	
	$('.pannable').mousemove(function(e) {

		if (panning) {
		
			x_now = e.clientX;
			y_now = e.clientY;
			
			if (x_last >= 0 && y_last >= 0) {
			
				x_diff = x_last - x_now;
				y_diff = y_last - y_now;
			
			
				$(this).scrollLeft( $(this).scrollLeft() + x_diff );
				$(this).scrollTop( $(this).scrollTop() + y_diff );
				
				
				
			}
		
		
			x_last = x_now;
			y_last = y_now;
		}
	
	});
	
	
	
	




});


