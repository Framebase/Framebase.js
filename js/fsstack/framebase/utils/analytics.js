define(['//dz0073gza0pmo.cloudfront.net/framebase-js/analytics/analytics.js'], function(analytics_noop){return function(config){

    var default_events = ['video_play', 'video_stop']

    var checkEnabled = function(what)
    {
        return  (config.has('analytics', 'track') &&
                config.get('analytics', 'track').indexOf(what) >= 0) || // Does the list of tracked events exist, and is
                                                                        // it there?
                (!config.has('analytics', 'track') &&
                 default_events.indexOf(what) >= 0); // Does the list of tracked events not exist, and is it in the
                                                     // defaults?
    }

    var events = {
        'video_start': 'Framebase Video Started',
        'video_pause': 'Framebase Video Paused',
        'video_play': 'Framebase Video Played',
        'video_stop': 'Framebase Video Stopped',
        'upload_success': 'Framebase Uploader Uploaded',
        'record_success': 'Framebase Uploader Recorded',
        'upload_record_discard': 'Framebase Uploader Recorded Discard'
    }

    this.track = function(event, info)
    {
        if (checkEnabled(event)) {
            window['analytics'].track(events[event], info);
        }
    }

    this.constructor = function()
    {
        window['analytics'].initialize(config.get('analytics', 'providers'));
    }
    this.constructor();
}})
