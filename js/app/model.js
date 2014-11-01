// APP MODEL MODULE  ///////////////////////////////////////////////////////////////////////////////
define(['app'], function(app){
	
var model = Backbone.Model.extend({
		weekday: ['Sunday','Monday','Tuesday','Wednesday', 'Thursday', 'Friday', 'Saturday'],
		months: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun', 'Jul','Aug', 'Sept', 'Oct', 'Nov','Dec'],
		//locations: [],
		initialize: function() {

			//look for Local Storage Variables
			var tempUnit = window.localStorage.getItem('tempSetting');
			if(!tempUnit)
				tempUnit = "F";

			var viewSet = "current";

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
			console.log('created model');
		},

		//Public Methods
		getRecentLocations: function(string){

		},

		parseWeatherData: function(data){
			var currentWeather = data.data.current_condition[0];
			this.saveCurrentWeather(currentWeather);

			var forecast = data.data.weather;
			this.saveWeeklyForecast(forecast);
			console.log('finish weather saving');
		},

		saveCurrentWeather: function(data){
			var currTemp = [];
			//current conditions
			currTemp['F'] = data.temp_F;
			currTemp['C'] = data.temp_C;
			var currDesc = this.checkDesc(data.weatherDesc[0].value);

			var curr = { temp: currTemp, desc: currDesc };
			this.set({'currentWeather':curr});
		},

		saveWeeklyForecast: function(data){
			var forecast = [];
			for(var i=0; i<data.length; i++){
				var dateString = data[i].date;
				dateString = dateString.replace(/-/g, "/");
				//date is given in year-month-day format;
				// date (year, month, day);
				var d = new Date(dateString);
				var day = this.weekday[d.getDay()];
				var month = this.months[d.getMonth()];
				var numdate = d.getDate();
				var year = d.getFullYear();
				var fulldate =  month+"."+numdate+"."+year;

				var date = {day: day, full: fulldate};
				//checks desc
				var desc = this.checkDesc(data[i].weatherDesc[0].value);
				

				var temp = [];

				//average out temperature results
				var averageF = Math.round((parseInt(data[i].tempMaxF) + parseInt(data[i].tempMinF)) / 2);
				temp['averageF'] = averageF;
				var averageC = Math.round((parseInt(data[i].tempMaxC) + parseInt(data[i].tempMinC)) / 2);
				temp['averageC'] = averageC;

				//regular temp
				temp['maxF'] = data[i].tempMaxF;
				temp['minF'] = data[i].tempMinF;
				temp['maxC'] = data[i].tempMaxC;
				temp['minC'] = data[i].tempMinC;

				var weather = { date: date, desc: desc, temp: temp,};
				forecast.push(weather);
			}


			this.set({'forecast':forecast});
		},

		checkDesc: function(string){
			//check description for 
			if(string.indexOf('ice pellets') != -1){
				string = string.replace("ice pellets", "hail");
			}
			else if(string.indexOf('Ice pellets') != -1){
				string = string.replace("Ice pellets", "Hail");
			}
			else if(string.indexOf('freezing rain') != -1){
				string = string.replace("freezing rain", "sleet");
			}
			else if(string.indexOf('Thundery') != -1){
				string = string.replace('Thundery', 'Thunder');
			}
			else if(string.indexOf('Moderate or heavy') != -1){
				string = string.replace('Moderate or heavy', 'Moderate/heavy');
			}
			else if(string.indexOf('in area') != -1){
				string = string.replace('in area', '');
			}

			return string;
		},

		saveLocation: function(data){
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
			console.log('finish saving location');
			//this.updateLocations();
		},

		//updates temperature unit setting
		updateTempSetting: function(unit){
			this.set({'tempSetting': unit});
			window.localStorage.setItem('tempSetting', unit);
		},

		//updates temperature unit setting
		updateViewSetting: function(view){
			this.set({'viewSetting': view});
			window.localStorage.setItem('viewSetting', view);
		},

		/* update user's recent locations
		updateLocations: function(){
			this.locations.push(app.model.get('currentlocation'));
			window.localStorage.setItem('locations', this.locations);
		}, */

	}); //end model
	
	return model;
});
