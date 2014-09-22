/*----------------------------------------------------------------------------/
 Desktop View
 if on desktop, this script is called and the desktop html page is rendered

 - Danny Nguyen
/----------------------------------------------------------------------------*/
var desktop_view = function(){

	function init(){
		initComponents();
	};

	function initComponents(){
		$('body').addClass('desktop');

		//click handler for try it button
		$('#info-btn').on('click', function(e){
			$('.overlay').show();
			$('#more-info').delay(500).show();
		});

		//click handler to get out of more info view
		$('.overlay').on('click', function(e){
			$(this).fadeOut(300);
			$('#more-info').fadeOut(300);
		})
	}

	return{
		init:init,
	}
}

