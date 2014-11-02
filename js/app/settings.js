/* SETTINGS MENU VIEW */
define(['app'], function(app){
    
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
        
        updateTempSetting: function(unit){
            //temperature unit
            this.$el.find('.checked').removeClass('checked');
            
            this.$el.find("#"+unit).addClass('checked');
        },

		/////////////////////////////////////////////////////////
		//on click of temperature toggle item
		onTempSettingClick: function(e){
			e.stopImmediatePropagation();
            
			$('.temp_toggle').removeClass('checked');
			$(this).addClass('checked');
            
            var unit = this.id;
    
            require(['app'],function(app){
			   app.updateTempUnit(unit);
            });
            
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
    
    return settingView;
});