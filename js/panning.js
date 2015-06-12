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


