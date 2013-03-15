var framebase_done_loading = null;

require(['fsstack/framebase/play',
       'fsstack/framebase/upload',
       'fsstack/framebase/initialize',
       'fsstack/framebase/utils/config'],
       function(play, upload, initialize, config){

        // Main Framebase function
        window['framebase_initialize'] = window['framebase_init'] = initialize.initialize;

        // API compatibility
        var old_player_shim = function() {
            play.player(new config({}));
        }
        var old_uploader_shim = function(token, lambda, error_lambda) {
            upload.uploader(new config({token: token,events:{upload:{success:lambda,error:error_lambda}}}));
        }
        window['framebase_player'] = old_player_shim;
        window['framebase_uploader'] = old_uploader_shim;

        // Call old events
        framebase_done_loading();
});

// This is necessary because the way requirejs does loading makes it impossible to force the browser to wait until the
// dependencies load. On the bright side, this makes our page-load footprint almost 0.
(function(){
    var queue = [];
    var queue_request = function(name)
    {
        return function(args){
            var args = Array.prototype.slice.call(arguments);
            queue.push({
                name: name,
                args: args
            });
        }
    }

    framebase_done_loading = function()
    {
        for(var i in queue) {
            var queue_item = queue[i];
            window[queue_item.name].apply(window, queue_item.args);
        }
        queue = {};
    }

    // Public methods
    window['framebase_player'] = queue_request('framebase_player');
    window['framebase_uploader'] = queue_request('framebase_uploader');
    window['framebase_initialize'] = queue_request('framebase_initialize');
    window['framebase_init'] = queue_request('framebase_init');
})();
