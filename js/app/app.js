/*////////////////////////////////////////
Tiempo - Weather Forecast Mobile App
by Danny Nguyen
///////////////////////////////////////*/


"use strict";

// Main object /////////////////////////////////////////////////////////////////////////////
define(['model', 'mainView'],function(model, mainView){
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
			$.ajax({
				type: 'GET',
				url: weatherURL+location,
				cache : false,
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
				if(Header == null)
					Header = new headerView({location: Model.get('currentlocation')}, 
											{tempSetting: Model.get('tempSetting')},
											{viewSetting: Model.get('viewSetting')});

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
			console.log('update');
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





	//APP VIEW FOR HEADER //////////////////////////////////////////////////////////////////
	var headerView = Backbone.View.extend({
		el: '#tiempo', //will change to header object after it is added
		location: null,
		tempSetting: null,
		viewSetting : null,

		initialize: function(locationData, tempData, viewData){
			this.location = locationData.location;
			this.tempSetting = tempData.tempSetting;
			this.viewSetting = viewData.viewSetting;
			console.log(this.viewSetting);
			_.bindAll(this, 'render');
			this.render();

			this.setting = new settingView;

			this.setSettings();
			this.setUIListeners();
			
		},
		render: function(){
			//creates header
			var settings = "<span id='tiempo_settings_btn'><i class='fa fa-cog'></i></span>";
			//has current location searched and other options (temp settings, etc)
			var currentLocation = "<div id='header_location'>"+this.location+"</div>";


			//refresh button
			var refresh = "<span id='tiempo_refresh'><i class='fa fa-refresh'></i></span>";

			//view toggle (under)
			var viewToggle = this.buildViewToggle();

			//top portion of header
			//var top = "<div id='tiempo_header_top'>"+menubtn+currentLocation+tempToggle+refresh+"</div>";
			var top = "<div id='tiempo_header_top'>"+currentLocation+settings+refresh+"</div>";
			var bottom = "<div id='tiempo_header_bottom'>"+viewToggle+"</div>";
			var header = "<div id='tiempo_header'>"+top+bottom+"</div>";
			
			return this.$el.append(header);
		},

		buildViewToggle: function(){
			var currentView = '<i id="current" class="view_toggle fa fa-square-o"></i>';
			var weekView = '<i id="list" class="view_toggle fa fa-list-ul"></i>';

			var viewToggle = "<div id='header_toggleView'>"+currentView+weekView+"</div>";
			return viewToggle;
		},

		updateHeaderView: function(location){
			this.location = location;
			//refresh header settings
			this.setSettings();
			return this.$el.find('#header_location').html(this.location);
		},

		//---------------------------------------------------------------------------------/
		// updateCurrentViewIcon: Updates the current view icon in header (list or current)
		//---------------------------------------------------------------------------------/
		updateCurrentViewIcon: function(view){
			if(view == "current"){
				this.$el.find('.view_toggle').removeClass('checked');
				this.$el.find('#current.view_toggle').addClass('checked');
			}
			else if(view == "list"){
				this.$el.find('.view_toggle').removeClass('checked');
				this.$el.find('#list.view_toggle').addClass('checked');
			}
		},

		setUIListeners: function(){
			//Listeners for individual functions
			//settings
			this.$el.find('#tiempo_settings_btn').on('touchend click', this.onSettingsClick);
			this.$el.find('.temp_toggle').on('touchstart click', this.setting.onTempSettingClick);
			this.$el.find('#settings_close').on('touchend click', this.setting.onSettingsCloseClick);
			//misc
			this.$el.find('.view_toggle').on('touchstart click', this.onViewSettingClick);
			this.$el.find('#tiempo_refresh').on('touchend click', this.onRefreshClick);
		},


		//checks app's tempSettings and view Settings and marks the appropriate ones
		setSettings: function(){
			//temperature
			if(this.tempSetting == 'F')
				this.$el.find('#F').addClass('checked');
			else
				this.$el.find('#C').addClass('checked');

			//view settings
			if(this.viewSetting == 'current'){
				this.$el.find('#current').addClass('checked');
				this.$el.find('#list').removeClass('checked');
			}
			else{
				this.$el.find('#list').addClass('checked');
				this.$el.find('#current').removeClass('checked');
			}
		},

		/* Callback functions for Clickable individual elements */
		//on click of view toggle item
		onViewSettingClick: function(e){
            e.preventDefault();
			e.stopImmediatePropagation();
			//changes setting in model
			app.updateView(this.id);
		},

		onRefreshClick: function(e){
            e.preventDefault();
			e.stopImmediatePropagation();
			if( $(this).hasClass('refresh-clicked') == false ){
				$(this).addClass('refresh-clicked');
				app.refreshWeather();
			}
		},

		onSettingsClick: function(e){
            e.preventDefault();
			e.stopImmediatePropagation();
			$('#tiempo_settings').show();
		}

	}) //end header view





	/* SETTINGS MENU VIEW */
	var settingView = Backbone.View.extend({
		el: '#tiempo',
		initialize: function(){
			_.bindAll(this, 'render');
			this.render();
		},

		render: function(){
			//header
			var head = "<span id='settings_head'>Settings</span>";
			//location
			var location = "<span></span>";

			//temp toggle
			var F_toggle = "<span id='F' class='temp_toggle'>&deg;F</span>";
			var C_toggle = "<span id='C' class='temp_toggle'>&deg;C</span>";
			var tempToggle = "<div id='settings_temp_toggle'>"+F_toggle+C_toggle+"</div>";
			var temp = "<div class='settings_sect'><span class='sect_title'>Temperature</span>"+tempToggle+"</div>";

			//about
			var link = "<a href='http://worldweatheronline.com' target='_blank'>World Weather Online</a>";
			var message = "<div>Made by Danny Nguyen</div><div>Powered by "+link+"</div>";
			var about = "<div class='settings_sect'><span class='sect_title'>About</span>"+message+"</div>";

			var close = "<span id='settings_close'>x</span>";

			var settings = "<div id='tiempo_settings'><section>"+head+temp+about+close+"</section></div>";

			return this.$el.append(settings);
		},

		/////////////////////////////////////////////////////////
		//on click of temperature toggle item
		onTempSettingClick: function(e){
			e.stopImmediatePropagation();

			$('.temp_toggle').removeClass('checked');
			$(this).addClass('checked');
			//changes setting in model
			app.updateTempUnit(this.id);
            return false;
		},
		//close setting window
		onSettingsCloseClick: function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
			$('#tiempo_settings').fadeOut(300);
			return false;
		},

	}); //end settingView

    

	return app;
});



