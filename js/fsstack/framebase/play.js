/**
 * Player loading functions
 */
define(['jquery',
       'fsstack/framebase/utils/debug',
       'fsstack/framebase/utils/async',
       'fsstack/framebase/consts',
       'fsstack/framebase/utils/live',
       'fsstack/framebase/utils/polyfills',
       'fsstack/framebase/utils/validation',
       'fsstack/framebase/utils/foreach',
       'fsstack/framebase/utils/elements'],
       function(jQuery, debug, async, consts, live, polyfills, validation, foreach, elements){return new (function(){
    this.player = function(config_or_element, config)
    {
        debug('player attached to page load');
        async.attach_on_page_load(function(){
            if (polyfills.isElement(config_or_element)) {
                framebase_player_one(config_or_element, config);
            } else {
                framebase_player_all(config_or_element);
            }
        });
    }

    var player_is_monitoring_document = false;
    var framebase_player_all = function(config)
    {
        debug('the player is watching you');
        if (!player_is_monitoring_document) {
            player_is_monitoring_document = true;

            // Add our CSS to hide the default video elements
            async.load_css('video[type=framebase]{display:none}');

            // Start looking for elements
            live.monitor_dom('*[type=framebase]', function(elem){
                if (elem.tagName.toLowerCase() !== 'video') { //IE hack
                    return;
                }
                elem.removeAttribute('type');
                framebase_player_one(elem, config);
            });
        }
    }


    /**
     * Initializes a single framebase player on a given object
     * @param  {DOMElement} video_object    The object to replace with a video player
     * @param  {object}     config          Config describing the object
     */
    var framebase_player_one = function(video_object, config)
    {
        debug('initializing the player on', video_object, config);
        var old_jquery = window['jQuery'];
        window['jQuery'] = jQuery;
        require([consts.player.js], function(){
            window['jQuery'] = old_jquery;
            // Figure out which skin to load
            var requested_skin = polyfills.attr(video_object, 'data-skin');
            var skin_url = consts.player.css + '/player.min.css';
            if (typeof(requested_skin) !== 'undefined' && requested_skin !== null && requested_skin.length > 0) {
                if (validation.is_url(requested_skin)) {
                    skin_url = requested_skin;
                } else {
                    skin_url = consts.player.css + '/player.' + requested_skin + '.min.css';
                }
            }

            // Load the CSS
            async.load_css(skin_url);


            // vuhack
            var vdata = {"transcodingInfo" : {"status" : '1'}, "first": true};

            // IE8 doesn't allow properties to be set on UnknownHTMLElements. In addition to being in violation of the
            // spec, it actually just crashes when you try. So we have to copy everything into this div. Ugh.
            /*var new_video_object = document.createElement('div');
            elements.copy(video_object, new_video_object);
            video_object.parentNode.replaceChild(new_video_object, video_object);*/

            add_player(video_object, vdata, config);
        });
    }

    var send_play = function(id, time)
    {
        jQuery.ajax({
            method: 'POST',
            url: consts.api.location + '/meter/' + id + '.json',
            data: {time: time}
        });
    }

    /**
     * Vu what does this do?
     * @param {???} video_object ???
     * @param {???} vdata        ???
     */
    var add_player = function(video_object, vdata, config, xyzzy){
        if (typeof(xyzzy) === 'undefined') {
            xyzzy = {first: true, wait_elem: null};
        }
        // Check if transcoding is done TODO: extract this method and call it "addVideo"
        if(vdata['transcodingInfo']['status'] != 'completed') {
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
                if(vdata['transcodingInfo']['status'] == 'completed') {
                    add_player(video_object, vdata, config, xyzzy);
                } else {
                    setTimeout(function(){add_player(video_object, vdata, config, xyzzy)}, 3000);
                    if (xyzzy.first) {
                        var wait_html = "<div class='mejs-transcode'><div class='mejs-transcode-spinner'><span></span></div><p><span>Your video is transcoding</span></br>This should take a couple of minutes depending on the length of your video.</p></div>";
                        xyzzy['wait_elem'] = document.createElement('div');
                        xyzzy['wait_elem'].innerHTML = wait_html;
                        video_object.parentNode.insertBefore(xyzzy['wait_elem'], video_object);
                        xyzzy.first = false;
                    }
                }
            }
                xmlHttp.onprogress = function() {};
                xmlHttp.ontimeout = function() {};
                xmlHttp.onerror = function() {};
                xmlHttp.open( "GET", url, false);
                xmlHttp.send( null );
        } else {
            if (xyzzy['wait_elem']) {
                xyzzy['wait_elem'].innerHTML = '';
            }
            // Create the video tag
            var size = elements.calculate_size(video_object, '640px', 16, 9);
            video_object.style.width = size.width;
            polyfills.attr(video_object, 'width', size.width);

            if (size.is_dynamic) {
                video_object.style.height = '100%';
                polyfills.attr(video_object, 'height', '100%');
            } else {
                video_object.style.height = size.height;
                polyfills.attr(video_object, 'height', size.height);
            }

            video_object.setAttribute('preload', video_object.getAttribute('preload') ? video_object.getAttribute('preload') : 'auto');

            // Check if iOS
            var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );

            // Check if FF
            var firefox = ('MozBoxSizing' in document.documentElement.style);

            // Check if Android
            var ua = navigator.userAgent.toLowerCase();
            var android = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");

            var video_src = document.createElement('source');
            // User RTMP unless iOS or Android
            if (!firefox) {
                video_src.src = vdata['fileUriHttps'];
            } else {
                video_src.src = vdata['rtmpUri'];
            }

            video_src.type = "video/mp4";
            video_object.appendChild(video_src);


            var local_events = {play: [], pause: [], stop: []};


            var is_done_loading = false;
            var add_event_listeners = function(me)
            {
                var has_played = false;
                var has_ended = false;
                var debounce = true;
                var s_debounce = function(){
                    debounce = false;
                    setTimeout(function(){
                        debounce = true;
                    }, 100);
                }

                var play_start_time = 0;
                me.addEventListener('play', function(){
                    if (is_done_loading && debounce) {
                        if (!has_played) {
                            config.event(['video', 'start'], {}, me);
                        }
                        play_start_time = me.currentTime;
                        has_ended = false;
                        has_played = true;
                        config.event(['video', 'play'], {
                            time: me.currentTime
                        }, me);
                        for (var i in local_events['play']) {
                            local_events['play'][i].apply(me, []);
                        }
                        s_debounce();
                    }
                });

                me.addEventListener('pause', function(){
                    if (is_done_loading && debounce) {
                        config.event(['video', 'pause'], {
                            time: me.currentTime
                        }, me);
                        for (var i in local_events['pause']) {
                            local_events['pause'][i].apply(me, []);
                        }
                        s_debounce();
                        var played_seconds = me.currentTime - play_start_time;
                        send_play(video_object.getAttribute('data-video'), played_seconds);
                    }
                });

                me.addEventListener('ended', function(){
                    if (is_done_loading) {
                        has_ended = true;
                        has_played = false;
                        config.event(['video', 'stop'], {complete: true}, me);
                        for (var i in local_events['stop']) {
                            local_events['stop'][i].apply(me, []);
                        }
                        var played_seconds = me.currentTime - play_start_time;
                        send_play(video_object.getAttribute('data-video'), played_seconds);
                        s_debounce();
                    }
                });

                polyfills.attachEvent(window, 'beforeunload', function(evt){
                    if (is_done_loading && debounce) {
                        if (!has_ended && has_played) {
                            config.event(['video', 'stop'], {complete: false, time: me.currentTime}, me);
                            for (var i in local_events['stop']) {
                                local_events['stop'][i].apply(me, []);
                            }
                        }
                        s_debounce();
                    }
                });
            }

            var media_config = {
                plugins: ['flash', 'silverlight', 'html5'],
                pluginPath: consts.player.plugins,
                preload: true,
                pauseOtherPlayers: false,
                success: function(media, node, player) {
                    if (media.pluginType != 'native') {
                        media.play();
                        var playedOnce = false;
                        media.addEventListener('play',function(){
                            if (!playedOnce) {
                                media.pause();
                            }

                            playedOnce = true;

                            setTimeout(function(){
                                is_done_loading = true;
                            }, 300);
                        })
                    } else {
                        is_done_loading = true;
                    }

                    setTimeout(function(){
                        is_done_loading = true;
                    }, 500);

                    if (polyfills.attr(media, 'data-controls') == 'none') {
                        player.controls[0].style.display = 'none';
                    } else if (polyfills.attr(media, 'data-controls') == 'hideOnStart') {
                        player.hideControls(false);
                    }

                    add_event_listeners(media);

                    var new_elem = player.container[0];
                    if (polyfills.attr(video_object, 'id')) {
                        polyfills.attr(new_elem, 'id', polyfills.attr(video_object, 'id'));
                    }

                    if (polyfills.attr(video_object, 'class') !== null) {
                        polyfills.attr(new_elem, 'class', polyfills.attr(new_elem, 'class') + ' ' + polyfills.attr(video_object, 'class'))
                    }

                    var can_play = false;
                    media.addEventListener('canplay', function(){
                        can_play = true;
                    });
                    var enqueue = function(event)
                    {
                        if (can_play) {
                            media[event]();
                        } else {
                            setTimeout(function(){enqueue(event)}, 500);
                        }
                    }

                    var add_to_events = function(event_name, lambda) {
                        local_events[event_name].push(lambda);
                    }

                    new_elem['play'] = function() { enqueue('play'); }
                    new_elem['pause'] = function(){ enqueue('pause'); }
                    new_elem['stop'] = function(){ enqueue('stop'); }
                    new_elem['seek'] = function(to) { media.currentTime = to; }
                    new_elem['register_callback'] = add_to_events;


                    if (size.is_dynamic) {
                        polyfills.attr(new_elem, 'height', size.height);
                        new_elem.style.height = size.height;
                        polyfills.attachEvent(window, 'resize', function(){
                            var new_size = elements.calculate_size(new_elem, '', 16, 9);
                        });
                    }
                }
            };

            if (firefox) {
                media_config['mode'] = 'shim';
            }

            window['mejs'].$(video_object).mediaelementplayer(media_config); //todo: remove jquery dependency
        }
    }
})()});
