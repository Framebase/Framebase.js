/**
 * Player loading functions
 */
define(['jquery',
       'fsstack/framebase/utils/async',
       'fsstack/framebase/consts',
       'fsstack/framebase/utils/live',
       'fsstack/framebase/utils/polyfills',
       'fsstack/framebase/utils/validation',
       'fsstack/framebase/utils/foreach'],
       function(jQuery, async, consts, live, polyfills, validation, foreach){return new (function(){
    this.player = function(element_or_success_lambda, video_id, success_lambda)
    {
        async.attach_on_page_load(function(){
            if (typeof(element_or_success_lambda) === 'function' ||
                typeof(element_or_success_lambda) === 'string' ||
                typeof(element_or_success_lambda) === 'undefined' ||
                element_or_success_lambda === null) {
                framebase_player_all(element_or_success_lambda);
            } else {
                framebase_player_one(element_or_success_lambda, video_id, success_lambda);
            }
        });
    }

    var player_is_monitoring_document = false;
    var framebase_player_all = function(success_lambda)
    {
        if (!player_is_monitoring_document) {
            player_is_monitoring_document = true;

            // Add our CSS to hide the default video elements
            async.load_css('video[type=framebase]{display:none}');

            // Start looking for elements
            live.monitor_dom('video[type=framebase]', function(elem){
                elem.removeAttribute('type');
                framebase_player_one(elem, null, success_lambda);
            });
        }
    }


    /**
     * Initializes a single framebase player on a given object
     * @param  {DOMElement} video_object    The object to replace with a video player
     * @param  {string}     video_id        The ID of the video to load
     * @param  {function}   success_lambda  The function to run when the player is successfully loaded
     */
    var framebase_player_one = function(video_object, video_id, success_lambda)
    {
        require([consts.player.js], function(){
            window.jQuery = jQuery;

            // Figure out which skin to load
            var requested_skin = polyfills.attr(video_object, 'data-skin');
            var skin_url = consts.player.css + '/player.min.css';
            if (typeof(skin) !== 'undefined' && skin !== null && skin.length > 0) {
                if (validation.is_url(skin)) {
                    skin_url = requested_skin;
                } else {
                    skin_url = consts.player.css + '/player.' + requested_skin + '.min.css';
                }
            }

            // Load the CSS
            async.load_css(skin_url);

            if (typeof(video_id) === 'undefined' ||
                video_id === null) {
                video_id = video_object.getAttribute('data-video');
            }

            // vuhack
            var vdata = {"transcodingInfo" : {"status" : '1'}};
            add_player(video_object, vdata);
        });
    }

    /**
     * Vu what does this do?
     * @param {???} video_object ???
     * @param {???} vdata        ???
     */
    var add_player = function(video_object, vdata){
        // Check if transcoding is done TODO: extract this method and call it "addVideo"
        if(vdata.transcodingInfo.status != 'completed') {
            var xmlHttp = null;
            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlHttp = new XMLHttpRequest();
                if(window.XDomainRequest) xmlHttp = new XDomainRequest();
            }
            else
            {// code for IE6, IE5
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            var url = consts.api.location + "/videos/" + video_object.getAttribute('data-video') + ".json";

            // Callback on xmlHttp. Race condition IE9 returns empty responseText without it
            xmlHttp.onload=function(){
                vdata = JSON.parse(xmlHttp.responseText);
                // If already completed, add instantly
                if(vdata.transcodingInfo.status == 'completed') {
                    add_player(video_object, vdata);

                }
                // Else recurse and wait 3 seconds
                else setTimeout(function(){add_player(video_object, vdata)}, 3000);
                }
                xmlHttp.open( "GET", url, false);
                xmlHttp.send( null );
        }
        else {
            // Create the video tag
            video_object.width = video_object.width ? video_object.width : 640;
            video_object.height = video_object.height ? video_object.height: (video_object.width/16)*9;
            // video_object.setAttribute('controls', video_object.getAttribute('controls') ? video_object.getAttribute('controls') : true);
            video_object.setAttribute('preload', video_object.getAttribute('preload') ? video_object.getAttribute('preload') : 'auto');
            // video_object.setAttribute('poster', 'assets/img/magic.png');

            // Check if iOS
            var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );

            // Check if Android
            var ua = navigator.userAgent.toLowerCase();
            var android = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");

            var video_src = document.createElement('source');
            // User RTMP unless iOS or Android
            if(iOS || android) video_src.src = vdata.fileUriHttps;
            else video_src.src = vdata.rtmpUri;
            video_src.type = "video/mp4";
            video_object.appendChild(video_src);

            // TODO Refactor this if / else block
            if(iOS || android) {

                jQuery(video_object).mediaelementplayer({
                    plugins: ['flash', 'silverlight', 'html5'],
                    pluginPath: consts.player.plugins,
                    success: function(media, node, player){
                        if (polyfills.attr(media, 'data-controls') == 'none') player.controls[0].style.display = 'none';
                        else if (polyfills.attr(media, 'data-controls') == 'hideOnStart') player.hideControls(false);
                    }
                });
            }

            else {
                jQuery(video_object).mediaelementplayer({
                    mode: "shim",
                    plugins: ['flash', 'silverlight', 'html5'],
                    pluginPath: consts.player.plugins,
                    preload: true,
                    success: function(media, node, player) {
                     if (media.pluginType != 'native') {
                         media.play();
                         var playedOnce = 0;
                         media.addEventListener('play',function(){
                            if(!playedOnce) media.pause();
                            playedOnce = 1;
                         })
                        if (polyfills.attr(media, 'data-controls') == 'none') player.controls[0].style.display = 'none';
                        else if (polyfills.attr(media, 'data-controls') == 'hideOnStart') player.hideControls(false);
                     }
                 }
                });
            }
        }
    }
})()});
