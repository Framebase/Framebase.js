var framebase_done_loading = null;

require(['fsstack/framebase/play',
       'fsstack/framebase/upload'],
       function(play, upload){

        window.framebase_player = play.player;
        window.framebase_uploader = upload.uploader;
        framebase_done_loading();
});

// This is necessary because the way requirejs does loading makes it impossible to force the browser to wait until the
// dependencies load. On the bright side, this makes our page-load footprint almost 0.
(function(){
    var queue = [];
    var queue_request = function(name, args)
    {
        queue.push({
            name: name,
            args: args
        });
    }

    framebase_done_loading = function()
    {
        for(var i in queue) {
            var queue_item = queue[i];
            window[queue_item.name].apply(window, queue_item.args);
        }
        queue = {};
        delete framebase_done_loading;
    }

    // Public methods
    window.framebase_player = function()
    {
        queue_request('framebase_player', Array.prototype.slice.call(arguments));
    }

    window.framebase_uploader = function()
    {
        queue_request('framebase_uploader', Array.prototype.slice.call(arguments));
    }
})();
