/*////////////////////////////////////////
Tiempo - Weather Forecast Mobile App
by Danny Nguyen
///////////////////////////////////////*/


"use strict";

// Main object /////////////////////////////////////////////////////////////////////////////
define(['model', 'mainView', 'header'],function(model, mainView, header){
	var app = {};

	app = (function(){
		//CONSTANTS
		/* missing key 
		var key */
		var weatherURL = 'http://api.worldweatheronline.com/free/v1/weather.ashx?key=94166457dc9f7e711a7a84729364ed9af9c82fdc&format=json&num_of_days=5&q='
		var mapURL = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';
		//INSTANCE VARS
		var iOS = false;
		var debugMode;
		var loaded = 0;
		var visited = false;

		var Model,View,Header;

		//Initialzing METHODS
		function init(){
			window.localStorage.setItem('debugOn', true);

			$('body').append("<div id='tiempo'></div>");

			//instantiates app's model and view
			Model = new model;
			View = new mainView;

			setTimeout(function(){ searchLocation()},1300);	

		}

		// Private Methods --------------------------------------------/

		//gets user's current location
		function searchLocation(){
			View.renderLoad();
			
				navigator.geolocation.getCurrentPosition(
					function(position){
						var coord = {lat: position.coords.latitude,
									 lon: position.coords.longitude};
						//return coord;
						var coords = coord.lat +","+ coord.lon;

						getLocationName(coords);

					}, 
					function(error){
						//return false
						View.showError('location');
					});
			

		}

		//sends request to google maps to get name of location from coords
		function getLocationName(coords){
			$.ajax({
				type:'GET',
				url: mapURL+coords,
				success: function(xhr){

					Model.saveLocation(xhr);
					finishedLoading();
					//then runs ajax call to weather api
					getWeatherData(coords);

				},
				error: function(xhr, status, error){
					View.showError('name');
					return false;
				},
			});
		}

		//sends request to OpenWeatherMap API
		function getWeatherData(location){
			console.log('query weather data');
			$.support.cors = true;
			$.ajax({
				type: 'GET',
				url: weatherURL+location,
				crossDomain: true,
				dataType:'jsonp',
				success: function(xhr){
					console.log('start weather data');
					Model.parseWeatherData(xhr);
					finishedLoading();
				},
				error: function(xhr,status,error){
					View.showError('weather');
					return false;
				},
			});
		}


		//check if both ajax calls have been loaded
		function finishedLoading(){
			loaded ++;
			if(loaded == 2){
				//create header if none exists
				if(Header == null){
					Header = new header({location: Model.get('currentlocation')}, 
											{tempSetting: Model.get('tempSetting')},
											{viewSetting: Model.get('viewSetting')});
                }

				//renders view
				var today_data = Model.get('today');
				var currentWeather_data = Model.get('currentWeather');
				var forecast_data = Model.get('forecast');
                var tempSetting = Model.get('tempSetting');
				View.renderViews( today_data, currentWeather_data, forecast_data, tempSetting);
				
				loaded = 0;
			}
			else{
				View.updateMessage();
			}
		}

		// Public methods -------------------------------------------------------/

		//Refreshing/updating Weather information in model and then re-rendering view
		function refreshWeather(){
			View.refreshView();
			
			setTimeout(function(){
				searchLocation();
				var newLocation = Model.get('currentlocation');
				Header.updateHeaderView(newLocation).location;
                $('.refresh-clicked').removeClass('refresh-clicked');
			},300);

		}

		//when updating temperature units shown on screen from settings view
		function updateTempUnit(unit){
			Model.updateTempSetting(unit); // updates temp unit in model
            Header.tempSetting = unit;
			View.toggleTemp(Model.get('tempSetting')); // update view with temp unit 
		}

		/* When view is changed, updates info in model, and corresponding view indicators are changed in main view and header */
		function updateView(view){
			//Model.updateViewSetting(view);
			Header.updateCurrentViewIcon(view);
			View.toggleView(view);
		}

		//returns temp setting in model
		function getTempSetting(){
			return Model.get('tempSetting');
		}

		return{
			init: init,
			iOS: iOS,
			refreshWeather: refreshWeather,
			updateTempUnit: updateTempUnit,
			updateView: updateView,
			getTempSetting: getTempSetting,
		};

	})(); //end app.main

    

	return app;
});



