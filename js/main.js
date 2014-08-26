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


//Main object
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

		//instantiates app's model and view
		this.model = new model;
		this.view = new view;
		
		setTimeout(function(){app.searchLocation()},1000);
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

				app.getWeatherData(coords);
				app.getLocationName(coords);

			}, 
			function(error){
				//return false
				app.view.showError('location');
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

	//sends request to google maps to get name of location from coords
	function getLocationName(coords){
		$.ajax({
			type:'GET',
			url: mapURL+coords,
			success: function(xhr){
				app.model.saveLocation(xhr);
				app.finishedLoading();
			},
			error: function(xhr, status, error){
				app.view.showError('name');
				return false;
			},
		});
	}

	//check if both ajax calls have been loaded
	function finishedLoading(){
		loaded ++;
		console.log(loaded);
		if(loaded == 2){
			//render current weather screen
			this.view.renderCurrentWeather( this.model.get('today'), this.model.get('currentWeather') );
			loaded = 0;
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





// APP MODEL MODULE  ///////////////////////////
var model = Backbone.Model.extend({
	weekday: ['Sunday','Monday','Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday'],
	months: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun', 'Jul','Aug', 'Sept', 'Oct', 'Nov','Dec'],
	locations: [],
	initialize: function() {
		//look in local storage for past locations
		var locations = window.localStorage.getItem('locations');
		if(locations)
			//this.getRecentLocations(locations);

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
			'recentLocations': locations,
			'tempSetting' : 'F',
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
			temp['F'] = ( parseInt(data[i].tempMaxF) + parseInt(data[i].tempMinF) ) / 2;
			temp['C'] = ( parseInt(data[i].tempMaxC) + parseInt(data[i].tempMinC) ) / 2;

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
		this.updateLocations();
	},

	//update user's recent locations
	updateLocations: function(){
		this.locations.push(app.model.get('currentlocation'));
		window.localStorage.setItem('locations', this.locations);
	},

}); //end model



// APP VIEW MODULE  ///////////////////////////
var view = Backbone.View.extend({
	el: 'body',
	initialize: function() {
		this.renderSplash();
	},

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

	//Public Methods
	render: function(){
		this.renderLoad();
	},

	renderSplash: function(){
		var splash = "<div class='splash'></div>";
		this.$el.html(splash);
	},

	renderLoad: function(){
		this.$el.find('.splash').fadeOut();

		var message = "<span>Finding Your Location</span>";
		var loading = "<div class='loading'>"+message+"</div>";
		this.$el.append(loading);
	},

	renderHeader: function(){
		//creates header 
		//has current location searched and other options (temp settings, etc)
	},

	//renders screen depicting today's weather
	renderCurrentWeather: function(today, weatherData){
		//current data
		var weekday = "<span class='weekday'>"+today.day+"</span>";
		var date = "<span class='date'>"+ today.month + '.' + today.date + '.' + today.year +"</span>";
		var currDate = "<div id='current_date'>"+weekday+'<br/>'+date+"</div>";

		var icon = this.getWeatherIcon(weatherData.desc);

		var desc = "<div id='current_desc'><span>"+weatherData.desc+"</span></div>";

		var tempF = "<span class='temp_F'>"+weatherData.temp['F']+"&deg;F</span>";
		var tempC = "<span class='temp_C'>"+weatherData.temp['C']+"&deg;C</span>";
		var temp = "<div id='current_temp'>"+tempF+tempC+"</div>";

		var currentWeather = "<div id='weather_current'>"+currDate+icon+desc+temp+"</div>";
		this.$el.find('.loading').fadeOut(300);
		this.$el.append(currentWeather);
	},

	//render screen with 5 day forecast
	renderWeekForecast: function(data){

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

}); //end view







