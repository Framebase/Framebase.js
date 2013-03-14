define(['fsstack/analytics'], function(analytics){return function(config){

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
        'uploader_success': 'Framebase Uploader Uploaded',
        'recorder_success': 'Framebase Uploader Recorded',
        'uploader_record_discard': 'Framebase Uploader Recorded Discard'
    }

    this.track = function(event, info)
    {
        console.log(event, info, this);
        if (checkEnabled(event)) {
            analytics.track(events[event], info);
        }
    }

    this.constructor = function()
    {
        analytics.initialize(config.get('analytics', 'providers'));
    }
    this.constructor();
}})
