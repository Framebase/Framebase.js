define([], function(){return new (function(){
    this.api = {
        location: "//api.framebase.io",
        endpoints: {
            videos: "/videos.json"
        }
    };

    this.recorder = {
        location: "//record.framebase.io",
        swf: "//s3-us-west-1.amazonaws.com/static.framebase.io/swf/record.swf",
        css: "//framebase.io/assets/framebase-js/recorder/css-new",
        //css: "/dz0073gza0pmo.cloudfront.net/framebase-js/recorder/css",
        endpoints: {
            uploads: '/uploads'
        }
    }

    this.sizzle = "//dz0073gza0pmo.cloudfront.net/sizzle.js";

    this.uploader = {
        js: "//dz0073gza0pmo.cloudfront.net/framebase-js/uploader/js/uploader.js",
        css: "//dz0073gza0pmo.cloudfront.net/framebase-js/uploader/css"
    }

    this.player = {
        js: "//dz0073gza0pmo.cloudfront.net/framebase-js/player/js/player.min.js",
        css: "//dz0073gza0pmo.cloudfront.net/framebase-js/player/css",
        plugins: "//dz0073gza0pmo.cloudfront.net/framebase-js/player/js/"
    }

    this.common = {
        js: {
            swfobject: "//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"
        }
    }
})()})
