/*////////////////////////////////////////
Tiempo - Weather Forecast Mobile App
by Danny Nguyen

///////////////////////////////////////*/

"use strict";

$(function(){

	var isMobile = {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },
	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },
	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },
	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },
	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i);
	    },
	    any: function() {
	        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	    }
	};
	
	/////////////////////////////
	//VIEWING ON MOBILE DEVICE
	if( isMobile.any() ){
		
		/* CONFIGURE REQUIRED COMPONENTS TO RUN TIEMPO */
		$('#desktop-view').remove();

		requirejs.config({
		    //By default load any module IDs from js/lib
		    baseUrl: 'js/main.js',
		    //except, if the module ID starts with "app",
		    //load it from the js/app directory. paths
		    //config is relative to the baseUrl, and
		    //never includes a ".js" extension since
		    //the paths config could be for a directory.
		    paths: {
		        app: '../app/app',
		        model: '../app/model',
                	mainView: '../app/mainView',
		    }
		});

		// Start the main app logic.
		requirejs(['app', 'model', 'mainView'],
		function (app,model) {
            
			if( isMobile.iOS() ){
				app.iOS = true;
			}
            		// Initialize App
			app.init();
		});

	}
	
	//////////////////////
        // VIEWING ON DESKTOP 
        // Desktop version of app not yet implemented so a promotional page is given
	else{
		desktop_view.init();
	}

})

