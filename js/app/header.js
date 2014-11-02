//APP VIEW FOR HEADER //////////////////////////////////////////////////////////////////
// uses the setting view 
define(['app', 'settings'], function(app, settings){
    
	var header = Backbone.View.extend({
		el: '#tiempo', //will change to header object after it is added
		location: null,
		//tempSetting: null,
		viewSetting : null,

		initialize: function(locationData, tempData, viewData){
			this.location = locationData.location;
			this.tempSetting = tempData.tempSetting;
			this.viewSetting = viewData.viewSetting;
			console.log(this.viewSetting);
			_.bindAll(this, 'render');
			this.render();
            
            //create inner settings view
			this.setting = new settings;

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
        
        //---------------------------------------------------------------------------------/
		// updateHeaderView: On refresh of app, updates header view
		//---------------------------------------------------------------------------------/
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
			this.setting.updateTempSetting(this.tempSetting);

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
            var view = this.id;
            require(['app'],function(app){
			 app.updateView(view);
            });
		},

		onRefreshClick: function(e){
            e.preventDefault();
			e.stopImmediatePropagation();
			if( $(this).hasClass('refresh-clicked') == false ){
				$(this).addClass('refresh-clicked');
                require(['app'],function(app){
				    app.refreshWeather();
                });
			}
		},

		onSettingsClick: function(e){
            e.preventDefault();
			e.stopImmediatePropagation();
			$('#tiempo_settings').show();
		}

	}) //end header view
    
    return header;
});