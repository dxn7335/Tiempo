// APP VIEW MODULE  //////////////////////////////////////////////////////////
define(['app'], function(app){
var mainView = Backbone.View.extend({
		el: '#tiempo',
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();

			this.addSwipe();
		},


		//initial load
		render: function(){
			//starts with splash screen
			var splash = "<div class='splash'></div>";
			return this.$el.append(splash);
		},

		renderLoad: function(){
			this.$el.find('.splash').fadeOut();
			var loading = "<div class='loading'><span>Finding Your Location</span></div>";
			return this.$el.append(loading);
		},

		renderViews: function(today, currentData, listData, tempSetting){
			var currentView = this.buildCurrentWeather(today,currentData,listData);
			var listView = this.buildListWeather(listData);

			//clear loading
			this.$el.find('.loading').fadeOut(300);
			//add views
			this.$el.append(currentView+listView);

			//updates screen settings and visuals
            //initial view will show Current Weather
			this.toggleTemp(tempSetting);
			this.toggleView('current');
			this.changeColor(currentData.temp['F']);

			console.log('finish view');

			//setTimeout(function(){app.header.$el.find('#tiempo_refresh').removeClass('refresh-clicked');},5000);

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
				case 'current':
					this.$el.find('#weather_list').hide();
					this.$el.find('#weather_current').show();
					this.$el.find('.list_day').hide();
					break;
				case 'list':
					this.$el.find('#weather_current').hide();
					this.$el.delay(10).find('#weather_list').show();
			
					$(".list_day").each(function(index) {
					    $(this).delay(100*index).fadeIn(200);
					});
					break;
			}
		},


		// Private

		/* CURRENT WEATHER */
		//renders screen depicting today's weather
		buildCurrentWeather: function(today, weatherData, weekForecast){
			//current data
			var weekday = "<span class='weekday'>"+today.day+"</span>";
			var date = "<span class='date'>"+ today.month + '.' + today.date + '.' + today.year +"</span>";
			var currDate = "<div id='current_date'>"+weekday+'<br/>'+date+"</div>";

			var icon = "<span id='current_icon'>"+this.getWeatherIcon(weatherData.desc)+"</span>";

			var desc = "<div id='current_desc'><span>"+weatherData.desc+"</span></div>";

			var tempF = "<span class='temp temp_F'>"+weatherData.temp['F']+"&deg;F</span>";
			var tempC = "<span class='temp temp_C'>"+weatherData.temp['C']+"&deg;C</span>";
			var temp = "<div id='current_temp'>"+tempF+tempC+"</div>";

			//weather of current 5 days on bottom of screen
			var bottom = this.buildBottomDailyWeather(weekForecast);

			var currentWeather = "<div id='weather_current' class='mainView'>"+currDate+icon+desc+temp+bottom+"</div>";
			return currentWeather;
		},

		//bottom daily weather section for current weather view
		buildBottomDailyWeather: function(weekForecast){
			var bottom = "<div id='bottom_daily'>";

			for(var i=1; i<weekForecast.length; i++){
				var day = "<span class='day'>"+weekForecast[i].date.day.substr(0,3)+"</span>";
				var tempF = "<span class='temp temp_F'>"+weekForecast[i].temp['averageF']+"</span>";
				var tempC = "<span class='temp temp_C'>"+weekForecast[i].temp['averageC']+"</span>";
				var temp = "<span class='temp'>"+tempF+tempC+"</span>";

				var icon = "<span class='day_icon'>"+this.getWeatherIcon(weekForecast[i].desc)+"</span>";

				var dayItem = "<div class='current_day'>"+day+icon+temp+"</div>";

				bottom += dayItem;
			}
			
			bottom = bottom + "</div>";

			return bottom;
		},


		/* LIST FORECAST VIEW */
		//render screen with 5 day forecast
		buildListWeather: function(data){
			var list = "<div id='weather_list' class='mainView'>";
			for(var i=0; i<data.length; i++){
				var day = "<span class='day'>"+data[i].date.day+"</span>";
				var desc = "<span class='list_desc'>"+data[i].desc+"</span>";

				var left = "<div class='list_left'>"+day+desc+"</div>";
				var tempF = "<span class='temp temp_F'>"+data[i].temp['maxF']+"&deg;F / "+data[i].temp['minF']+"&deg;F"+"</span>";
				var tempC = "<span class='temp temp_C'>"+data[i].temp['maxC']+"&deg;C / "+data[i].temp['minC']+"&deg;C"+"</span>";
				var temp = "<span class='temp'>"+tempF+tempC+"</span>";

				var icon = "<span class='list_icon'>"+this.getWeatherIcon(data[i].desc)+"</span>";

				var right = "<div class='list_right'>"+icon+temp+"</div>";
				var dayItem = "<div class='list_day'>"+left+right+"</div>";

				list = list+ dayItem;
			}

			list = list +"</div>";
			return list;
		},


		//REFRESHING VIEW
		refreshView: function(){
			this.$el.find('.overlay').fadeOut(300);
            var overlay = this.$el.find('.overlay');
			setTimeout(function(){overlay.remove();},500);
			this.$el.removeClass();
			this.$el.find('.error').remove();
			this.$el.find('#weather_current').remove();
			this.$el.find('#weather_list').remove();
			this.render();
		},


		//HELPER Functions **
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
				icon = 'wi wi-snow';
			}
			//SLEET
			else if (description.indexOf('sleet') != -1){
				icon = 'wi wi-snow-wind';
			}
			//RAIN
			else if (description.indexOf('rain') != -1){

				if (description.indexOf('thunder') != -1 )
					icon = "wi wi-storm-showers";

				else if (description.indexOf('showers') != -1)
					icon = 'wi wi-sprinkle';

				else 
					icon = "wi wi-rain";
			}
			//THUNDER
			else if (description.indexOf('thunder') != -1){
				icon = "wi wi-night-lightning";
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

			var iconContent = "<i class='"+icon+"'></i>";

			return iconContent;

		},

		//Change color of screen based on current temp
		changeColor: function(temp){
			var temp = parseInt(temp);
			if (temp >= 79){
				this.$el.prepend("<div class='overlay high'></div>");
				return this.$el.addClass('high');
			}
			else if(temp < 79 && temp >= 70){
				this.$el.prepend("<div class='overlay midhigh'></div>");
				return this.$el.addClass('midhigh');
			}
			else if(temp < 69 && temp >=60){
				this.$el.prepend("<div class='overlay mid'></div>");
				return this.$el.addClass('mid');
			}
			else if(temp < 60 && temp >=50){
				this.$el.prepend("<div class='overlay midlow'></div>");
				return this.$el.addClass('midlow');
			}
			else{
				this.$el.prepend("<div class='overlay low'></div>");
				return this.$el.addClass('low');
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

			if(app.header != null){
				app.header.$el.find('#tiempo_refresh').removeClass('refresh-clicked');
			}
		},

		updateMessage: function(){
			this.$el.find('.loading span').hide();
			this.$el.find('.loading span').html('Checking Weather');
			this.$el.find('.loading span').fadeIn();
		},

		//changes view to FirstTime Visit View if first time user
		pauseload: function(){
			this.$el.find('.splash').fadeOut();
		},


		//Event Listners for main view
		
		//swipe body to switch views
		addSwipe: function(){
            var view = this;
            require(['app'], function(app){
                /* natural swipe direction */
                view.$el.swipe({
                    //swipe left to go to list view
                    swipeLeft:function(){
                        app.updateView('list');
                    },
                    //swipe right to go to current view
                    swipeRight:function(){
                        app.updateView('current');
                    },
                })
            });
		},


	}); //end main view
    
    
    
    return mainView;
});
