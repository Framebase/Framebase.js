define([], function(){return new (function(){
    var is_https = window['location']['protocol'].indexOf('https') === 0;
    var proto = is_https ? 'https:' : 'http:';

    this.api = {
        location: proto + "//api.framebase.io",
        endpoints: {
            videos: "/videos.json"
        }
    };

    this.recorder = {
        location: proto + "//record.framebase.io",
        swf: proto + "//s3-us-west-1.amazonaws.com/static.framebase.io/swf/record.swf",
        css: proto + "//framebase.io/assets/framebase-js/recorder/css-new",
        //css: "/dz0073gza0pmo.cloudfront.net/framebase-js/recorder/css",
        endpoints: {
            uploads: '/uploads'
        }
    }

    this.help = {
        recorder: {
            update_flash: "http://get.adobe.com/flashplayer/",
            pepper_flash: "http://disablepepper.com/"
        }
    }

    this.sizzle = proto + "//dz0073gza0pmo.cloudfront.net/sizzle.js";

    this.uploader = {
        js: proto + "//dz0073gza0pmo.cloudfront.net/framebase-js/uploader/js/uploader.js",
        css: proto + "//dz0073gza0pmo.cloudfront.net/framebase-js/uploader/css"
    }

    this.player = {
        js: proto + "//dz0073gza0pmo.cloudfront.net/framebase-js/player/js/player.min.js",
        css: proto + "//dz0073gza0pmo.cloudfront.net/framebase-js/player/css",
        plugins: proto + "//dz0073gza0pmo.cloudfront.net/framebase-js/player/js/"
    }

    this.common = {
        js: {
            swfobject: proto + "//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"
        }
    }
})()})
