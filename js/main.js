/*////////////////////////////////////////
Tiempo - Weather Forecast Mobile App
by Danny Nguyen
///////////////////////////////////////*/


"use strict";

// READY FUNCTION
$(function(){

	//Local storage vars
	//For debugging option
	var debug = window.localStorage.getItem('debugOn');
	if(debug){
		app.debugMode = true;
	}
	// Initialize App
	app.init();
	//

});


// Main object /////////////////////////////////////////////////////////////////////////////
var app = {};

app = (function(){
	//CONSTANTS
	var weatherURL = 'http://api.worldweatheronline.com/free/v1/weather.ashx?key=94166457dc9f7e711a7a84729364ed9af9c82fdc&format=json&num_of_days=5&q='
	var mapURL = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';
	//INSTANCE VARS
	var debugMode;
	var loaded = 0;

	//PUBLIC METHODS
	function init(){
		window.localStorage.setItem('debugOn', true);

		$('body').append("<div id='tiempo'></div>");

		//instantiates app's model and view
		this.model = new model;
		this.view = new mainView;
		
		setTimeout(function(){app.searchLocation()},1300);
	}

	//gets user's current location
	function searchLocation(){
		this.view.renderLoad();
		navigator.geolocation.getCurrentPosition(
			function(position){
				var coord = {lat: position.coords.latitude,
							 lon: position.coords.longitude};
				//return coord;
				var coords = coord.lat +","+ coord.lon;

				app.getLocationName(coords);

			}, 
			function(error){
				//return false
				app.view.showError('location');
			});

	}

	//sends request to google maps to get name of location from coords
	function getLocationName(coords){
		$.ajax({
			type:'GET',
			url: mapURL+coords,
			success: function(xhr){
				app.model.saveLocation(xhr);
				app.finishedLoading();

				//then runs ajax call to weather api
				app.getWeatherData(coords);
			},
			error: function(xhr, status, error){
				app.view.showError('name');
				return false;
			},
		});
	}

	//sends request to OpenWeatherMap API
	function getWeatherData(location){
		$.ajax({
			type: 'GET',
			url: weatherURL+location,
			success: function(xhr){
				app.model.parseWeatherData(xhr);
				app.finishedLoading();
			},
			error: function(xhr,status,error){
				app.view.showError('weather');
				return false;
			},
		});
	}


	//check if both ajax calls have been loaded
	function finishedLoading(){
		loaded ++;
		console.log(loaded);
		if(loaded == 2){
			//create header
			this.header = new headerView;
			//render current weather screen
			this.view.renderCurrentWeather( this.model.get('today'), this.model.get('currentWeather') );
			loaded = 0;
		}
		else{
			this.view.updateMessage();
		}
	}

	return{
		init: init,
		searchLocation: searchLocation,
		getWeatherData: getWeatherData,
		getLocationName: getLocationName,
		finishedLoading: finishedLoading,
	};

})(); //end app.main





// APP MODEL MODULE  ///////////////////////////////////////////////////////////////////////////////
var model = Backbone.Model.extend({
	weekday: ['Sunday','Monday','Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday'],
	months: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun', 'Jul','Aug', 'Sept', 'Oct', 'Nov','Dec'],
	//locations: [],
	initialize: function() {

		//look for Local Storage Variables
		var tempUnit = window.localStorage.getItem('tempSetting');
		if(!tempUnit)
			tempUnit = "F";

		var viewSet = window.localStorage.getItem('viewSetting');
		if(!viewSet)
			viewSet = "current";

		/*	var locations = window.localStorage.getItem('locations');
		if(locations)
			//this.getRecentLocations(locations); */

		//get current date
		var d = new Date();
		var day = this.weekday[d.getDay()];
		var month = this.months[d.getMonth()];
		var date = d.getDate();
		var year = d.getFullYear();
		var today = {day: day, month: month, year: year, date: date};

		/* default property for this application */
		this.set({
			'today':today,
			//'recentLocations': locations,
			'tempSetting' : tempUnit,
			'viewSetting' : viewSet,
		});
	},

	//Public Methods
	getRecentLocations: function(string){

	},

	parseWeatherData: function(data){
		var currentWeather = data.data.current_condition[0];
		this.saveCurrentWeather(currentWeather);

		var forecast = data.data.weather;
		this.saveWeeklyForecast(forecast);
	},

	saveCurrentWeather: function(data){
		var currTemp = [];
		//current conditions
		currTemp['F'] = data.temp_F;
		currTemp['C'] = data.temp_C;
		var currDesc = data.weatherDesc[0].value;

		if(currDesc.indexOf('ice pellets') != -1){
			currDesc.replace('ice pellets', 'hail');
		}

		var curr = { temp: currTemp, desc: currDesc };
		this.set({'currentWeather':curr});
	},

	saveWeeklyForecast: function(data){
		console.log(data);
		var forecast = [];
		for(var i=0; i<data.length; i++){
			var date = data[i].date;
			var desc = data[i].weatherDesc[0].value;
			if(desc.indexOf('ice pellets') != -1){
				desc.replace('ice pellets', 'hail');
			}
			var temp = [];

			//average out temperature resullts
			temp['F'] = data[i].tempMaxF + '/' + data[i].tempMinF;
			temp['C'] = data[i].tempMaxC + '/' + data[i].tempMinC;

			var weather = { date: date, desc: desc, temp: temp};
			forecast.push(weather);
		}

		this.set({'forecast':forecast});
	},

	saveLocation: function(data){
		console.log(data);
		if(data.results[0].address_components[3] != null){
			var name = data.results[0].address_components[3].long_name;
		}
		else if(data.results[0].address_components[2] != null){
			var name = data[0].address_components[2].long_name;
		}
		else{
			console.log(data);
		}
		this.set({'currentlocation': name});
		//this.updateLocations();
	},

	/* update user's recent locations
	updateLocations: function(){
		this.locations.push(app.model.get('currentlocation'));
		window.localStorage.setItem('locations', this.locations);
	}, */

	//updates temperature unit setting
	updateTempSetting: function(unit){
		this.set({'tempSetting': unit});
		window.localStorage.setItem('tempSetting', unit);

		app.view.toggleTemp(this.get('tempSetting'));
	},

	//updates temperature unit setting
	updateViewSetting: function(view){
		this.set({'viewSetting': view});
		window.localStorage.setItem('viewSetting', view);

		app.view.toggleView(this.get('viewSetting'));
	}

}); //end model



// APP VIEW MODULE  //////////////////////////////////////////////////////////
var mainView = Backbone.View.extend({
	el: '#tiempo',
	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
	},


	//Public Methods
	render: function(){
		//starts with splash screen
		var splash = "<div class='splash'></div>";
		this.$el.append(splash);
		return this;
	},

	renderLoad: function(){
		this.$el.find('.splash').fadeOut();

		var message = "<span>Finding Your Location</span>";
		var loading = "<div class='loading'>"+message+"</div>";
		this.$el.append(loading);
	},

	toggleTemp: function(unit){
		//toggles what unit of temp is shown 
		switch(unit){
			case 'F':
				this.$el.find('.temp_C').hide();
				this.$el.find('.temp_F').fadeIn(200);
				break;
			case 'C':
				this.$el.find('.temp_F').hide();
				this.$el.find('.temp_C').fadeIn(200);
				break;
		}
	},

	toggleView: function(view){
		//toggles what unit of temp is shown 
		switch(view){
			case 'F':
				this.$el.find('.temp_C').hide();
				this.$el.find('.temp_F').fadeIn(200);
				break;
			case 'C':
				this.$el.find('.temp_F').hide();
				this.$el.find('.temp_C').fadeIn(200);
				break;
		}
	},

	//renders screen depicting today's weather
	renderCurrentWeather: function(today, weatherData){
		//current data
		var weekday = "<span class='weekday'>"+today.day+"</span>";
		var date = "<span class='date'>"+ today.month + '.' + today.date + '.' + today.year +"</span>";
		var currDate = "<div id='current_date'>"+weekday+'<br/>'+date+"</div>";

		var icon = this.getWeatherIcon(weatherData.desc);

		var desc = "<div id='current_desc'><span>"+weatherData.desc+"</span></div>";

		var tempF = "<span class='temp temp_F'>"+weatherData.temp['F']+"&deg;F</span>";
		var tempC = "<span class='temp temp_C'>"+weatherData.temp['C']+"&deg;C</span>";
		var temp = "<div id='current_temp'>"+tempF+tempC+"</div>";

		var currentWeather = "<div id='weather_current'>"+currDate+icon+desc+temp+"</div>";
		this.$el.find('.loading').fadeOut(300);
		this.$el.append(currentWeather);

		//updates screen settings and visuals
		this.toggleTemp(app.model.get('tempSetting'));
		this.toggleView(app.model.get('viewSetting'));
		this.changeColor(weatherData.temp['F']);

	},

	//render screen with 5 day forecast
	renderWeekForecast: function(data){

	},

	//HELPER
	getWeatherIcon: function(description){
		//search string for keywords and returns icon
		var description =  description.toLowerCase();
		var icon;

		//SUNNY
		if( description.indexOf('sunny') != -1 || description.indexOf('clear') != -1){
			icon = "wi wi-day-sunny";
		}
		//CLOUDY
		else if ( description.indexOf('cloudy') != -1 || description.indexOf('overcast') != -1){

			if ( description.indexOf('partly') != -1 )
				icon = "wi wi-day-cloudy";
			else
				icon = "wi wi-cloudy";

		}
		else if (description.indexOf('overcast') != -1){
			icon = 'wi wi-day-sunny-overcast';
		}
		//HAIL
		else if ( description.indexOf('hail') != -1 ){
			icon = 'wi wi-hail';
		}
		//SLEET
		else if (description.indexOf('sleet') != -1){
			icon = 'wi wi-snow-wind';
		}
		//RAIN
		else if (description.indexOf('rain') != -1){

			if (description.indexOf('heavy') != -1 || description.indexof('torrential') != -1)
				icon = "wi wi-rain";

			else if (description.indexOf('thunder') != -1 )
				icon = "wi wi-thunderstorm";

			else if (description.indexOf('showers') != -1)
				icon = 'wi wi-sprinkle';

			else 
				icon = "wi wi-sprinkle";
		}
		//DRIZZLE
		else if (description.indexOf('drizzle') != -1){
			icon = "wi wi-sprinkle";
		}
		//SNOW
		else if (description.indexOf('snow')!= -1 || description.indexOf('blizzard') != -1){
			if (description.indexOf('thunder') != -1)
				icon = "wi wi-night-snow-thunderstorm"
			else
				icon = "wi wi-snow";
		}
		//FOG
		else if (description.indexOf('fog') != -1){
			icon = 'wi wi-fog';
		}
		//MIST
		else if (description.indexOf('mist') != -1){
			icon = 'wi wi-fog';
		}
		//WINDY
		else if (description.indexOf('wind') != -1){
			icon = "wi wi-cloudy-gusts";
		}

		var iconContent = "<i id='current_icon' class='"+icon+"'></i>";

		return iconContent;

	},

	//Change color of screen based on current temp
	changeColor: function(temp){
		var temp = parseInt(temp);
		if (temp >= 75){
			this.$el.addClass('high');
		}
		else if(temp < 75 && temp >= 60){
			this.$el.addClass('midhigh');
		}
		else if(temp < 60 && temp >=50){
			this.$el.addClass('mid');
		}
		else if(temp < 50 && temp >=40){
			this.$el.addClass('midlow');
		}
		else{
			this.$el.addClass('low');
		}
	},

	showError: function(type){
		this.$el.find('.loading').fadeOut();
		switch(type){
			case 'location':
				var error = "Couldn't Find Your Location";
				break;
			case 'weather':
				var error = "Couldn't load weather data";
				break;
			case 'name':
				var error = "Couldn't Search Location";
				break;
		}

		var div = "<div class='error'>"+error+"</div>";
		this.$el.append(div);
	},

	updateMessage: function(){
		this.$el.find('.loading span').hide();
		this.$el.find('.loading span').html('Checking Weather');
		this.$el.find('.loading span').fadeIn();
	},


}); //end main view



//APP VIEW FOR HEADER //////////////////////////////////////////////////////////////////
var headerView = Backbone.View.extend({
	el: '#tiempo', //will change to header object after it is added
	location: null,
	tempSetting: null,
	viewSetting : null,

	initialize: function(){
		this.location = app.model.get('currentlocation');
		this.tempSetting = app.model.get('tempSetting');
		this.viewSetting = app.model.get('viewSetting');
		
		_.bindAll(this, 'render');
		this.render();
		this.initializeSettings();
		
	},
	render: function(){
		//creates header 
		//has current location searched and other options (temp settings, etc)
		var currentLocation = "<div id='header_location'>"+this.location+"</div>";

		//temp toggle
		var F_toggle = "<span id='F' class='temp_toggle'>&deg;F</span>";
		var C_toggle = "<span id='C' class='temp_toggle'>&deg;C</span>";
		var tempToggle = "<div id='header_toggle'>"+F_toggle+C_toggle+"</div>";

		//view toggle (under)
		var viewToggle = this.renderViewToggle();

		//top portion of header
		var top = "<div id='tiempo_header_top'>"+currentLocation+tempToggle+"</div>";
		var bottom = "<div id='tiempo_header_bottom'>"+viewToggle+"</div>";
		var header = "<div id='tiempo_header'>"+top+bottom+"</div>";
		
		return this.$el.append(header);
	},

	initializeSettings: function(){
		//check settings on start
		this.updateSettingsOnRender();

		//Listeners for individual functions
		this.$el.find('.temp_toggle').on('touch click', this.onTempSettingClick);
		this.$el.find('.view_toggle').on('touch click', this.onViewSettingClick);
	},

	renderViewToggle: function(){
		var currentView = '<i id="current" class="view_toggle fa fa-square-o"></i>';
		var weekView = '<i id="week" class="view_toggle fa fa-list-ul"></i>';

		var viewToggle = "<div id='header_toggle_view'>"+currentView+weekView+"</div>";
		return viewToggle;
	},

	//checks app's tempSettings and view Settings and marks the appropriate ones
	updateSettingsOnRender: function(){
		//temperature
		if(this.tempSetting == 'F')
			this.$el.find('#F').addClass('checked');
		else
			this.$el.find('#C').addClass('checked');

		//view
		if(this.viewSetting == 'current')
			this.$el.find('#current').addClass('checked');
		else
			this.$el.find('#week').addClass('checked');
	},

	/* Callback functions for individual elements */

	//on click of temperature toggle item
	onTempSettingClick: function(e){
		e.stopImmediatePropagation();

		app.header.$el.find('.temp_toggle').removeClass('checked');
		$(this).addClass('checked');
		//changes setting in model
		app.model.updateTempSetting(this.id);
	},

	//on click of view toggle item
	onViewSettingClick: function(e){
		e.stopImmediatePropagation();
	
		app.header.$el.find('.view_toggle').removeClass('checked');
		$(this).addClass('checked');
		//changes setting in model
		app.model.updateViewSetting(this.id);
	},

}) //end header view






