define(['fsstack/framebase/utils/analytics',
       'fsstack/framebase/play',
       'fsstack/framebase/upload',
       'fsstack/framebase/utils/config'],
       function(analytics, play, upload, config_cls){return new (function(){

    this.initialize = function(config_info) {
        var config = new config_cls(config_info);

        // Load the analytics if needed
        if (config.has('analytics')) {
            var analytics_instance = new analytics(config);
            config.add_event_lambda(['on_event'], analytics_instance.track);
        }

        if (config.has('token')) {
            upload.uploader(config);
        }
        play.player(config);

        // This is awful :(
        setTimeout(function(){
            config.event(['load'], {}, this);
        }, 500);
    }
})()});
