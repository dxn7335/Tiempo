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
		console.log(debug);
	}
	// Initialize App
	app.init();
	//

});


//Main object
var app = {};

app = (function(){
	//CONSTANTS
	var url = 'api.worldweatheronline.com/free/v1/weather.ashx?key=94166457dc9f7e711a7a84729364ed9af9c82fdc&format=json&num_of_days=5&'
	//INSTANCE VARS
	var debugMode;


	//PUBLIC METHODS
	function init(){
		var locations = ['New York', 'London', 'Seoul', 'Tokyo'];
		window.localStorage.setItem('locations', locations);
		window.localStorage.setItem('debugOn', true);

		//instantiates app's model and view
		this.model = new model;
	}

	//sends request to OpenWeatherMap API
	function getWeatherData(){

	}

	return{
		init: init,

	};

})(); //end app.main





// APP MODEL MODULE  ///////////////////////////
var model = Backbone.Model.extend({
	weekday: ['Sunday','Monday','Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday'],
	months: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun', 'Jul','Aug', 'Sept', 'Oct', 'Nov','Dec'],
	
	initialize: function() {
		//look in local storage for past locations
		var locations = window.localStorage.getItem('locations');

		//get current date
		var d = new Date();
		var day = this.weekday[d.getDay()];
		var month = this.months[d.getMonth()];
		var date = d.getDate();
		var year = d.getFullYear();
		var today = {day: day, month: month, year: year, date: date};
		console.log(today);

		/* default property for this application */
		this.set({
			'today':today,
			'recentLocations': locations,
		});
	},

	//Methods
	parseWeatherData: function(){

	},

});


// APP VIEW MODULE  ///////////////////////////
var view = Backbone.View.extend({

	initialize: function() {
		
	},

	//Methods

});