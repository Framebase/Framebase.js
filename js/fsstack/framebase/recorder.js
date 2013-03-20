/**
 * Uploader loading functions
 */
define(['fsstack/framebase/utils/async',
       'fsstack/framebase/consts',
       'fsstack/framebase/utils/debug',
       'fsstack/framebase/utils/live',
       'fsstack/framebase/utils/polyfills',
       'fsstack/framebase/utils/validation',
       'fsstack/framebase/utils/elements',
       'jquery',
       'fsstack/framebase/utils/foreach'],
        function(async, consts, debug, live, polyfills, validation, elements, jQuery, foreach){return new (function(){

    var is_recorder_init = false;
    /**
     * Creates a framebase uploader out of a specific element
     */
    this.recorder = function(input_element, config)
    {
        require([consts.common.js.swfobject], function(){
            // TODO:
            // swfobject seems to require IDs. So if they want IDs, we'll give 'em IDs. In the future, this is pretty
            // bad, because it means the element HAS to be in document. That shouldn't really matter, but it's still
            // fairly silly.
            var real_id = polyfills.attr(input_element, 'id');
            var initial_id = 'fbr' + random_string(20);
            var final_id = real_id ? real_id : random_string(20);

            // Build the recorder_element
            var recorder_element = document.createElement('div');

            // Figure out which skin to load
            var requested_skin = polyfills.attr(recorder_element, 'data-skin');
            var skin_url = consts.recorder.css + '/recorder.min.css';
            if (typeof(requested_skin) !== 'undefined' && requested_skin !== null && requested_skin.length > 0) {
                if (validation.is_url(requested_skin)) {
                    skin_url = requested_skin;
                } else {
                    skin_url = consts.recorder.css + '/recorder.' + requested_skin + '.min.css';
                }
            }

            // Load the CSS
            async.load_css(skin_url);

            // Clone the attributes
            for (var i=0, attrs=input_element.attributes, l=attrs.length; i<l; i++){
                var key = attrs.item(i).nodeName;
                var value = attrs.item(i).nodeValue;

                if ((key.toLowerCase() === 'type' && value.toLowerCase() === 'framebase') ||
                    key.toLowerCase() === 'record' ||
                    key.toLowerCase() === 'name') {
                    continue;
                }

                polyfills.attr(recorder_element, key, value);
            }
            recorder_element.innerHTML = '<div class="fb_record_container"><div class="fb_record_screen"><div id="' + initial_id + '"></div></div><div id="' + initial_id + '-spinner" class="fb_record_spinner" style="display:none"><span></span></div><div class="fb_record_controls" id="' + initial_id + '-controls"></div></div>';

            input_element.parentNode.replaceChild(recorder_element, input_element);

            var size = elements.calculate_size(recorder_element, '400px', 4, 3);

            if (size.is_dynamic) {
                recorder_element.style.width = '100%';
            } else {
                recorder_element.style.width = size.width;
            }
            recorder_element.style.height = size.height;

            var embed_attrs = {
                data: consts.recorder.swf,
                width: size.width,
                height: size.height,
                id: final_id,
                name: final_id
            };
            var embed_params = {
                allowScriptAccess: 'always',
                swliveconnect: 'true',
                flashvars: 'id=' + initial_id,
                wmode: "transparent"
            };

            // Embed the object
            var record_object = window['swfobject'].createSWF(embed_attrs, embed_params, initial_id);

            var retina = window.devicePixelRatio > 1;
            var flashVersion = window['swfobject'].getFlashPlayerVersion();
            if (retina &&
                (flashVersion.major < 11 || (flashVersion.major == 11 && flashVersion.minor < 6))) {

                document.getElementById(initial_id).parentNode.innerHTML = '<div class="fb_record_error"><p><span>Error:</span> Your version of Flash has a bug with Retina displays which makes recording impossible.<br /><br /><a href="' + consts.help.recorder.update_flash + '" target="_new">Click here to update your Flash.</a><button id="' + initial_id + '-restart">Try Again</button></p></div>';
                document.getElementById(initial_id + '-restart').onclick = function(){
                    recorder_element.innerHTML = '';
                    recorder_element.appendChild(input_element);
                }

                return;
            }

            if (!window['swfobject'].hasFlashPlayerVersion("9.0")) {
                document.getElementById(initial_id).parentNode.innerHTML = '<div class="fb_record_error"><p><span>Error:</span> This feature requires flash.<br /><br /><a href="' + consts.help.recorder.update_flash + '" target="_new">Click here to download Flash.</a><button id="' + initial_id + '-restart">Try Again</button></p></div>';
                document.getElementById(initial_id + '-restart').onclick = function(){
                    recorder_element.innerHTML = '';
                    recorder_element.appendChild(input_element);
                }

                return;
            }

            var isPPAPI = false;
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;

            if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin &&
                mimeTypes[type].enabledPlugin.filename == 'pepflashplayer.dll') isPPAPI = true;

            if (isPPAPI) {
                document.getElementById(initial_id).parentNode.innerHTML = '<div class="fb_record_error"><p><span>Error:</span>Chrome\'s version of flash has a bug which prevents sound from being recorded.<br /><br /><a href="' + consts.help.recorder.pepper_flash + '" target="_new">Disable pepper to continue.</a><button id="' + initial_id + '-restart">Try Again</button></p></div>';
                document.getElementById(initial_id + '-restart').onclick = function(){
                    recorder_element.innerHTML = '';
                    recorder_element.appendChild(input_element);
                }

                return;
            }

            // Get ready to keep track of the result
            var recorder_result = document.createElement('input');
            polyfills.attr(recorder_result, 'type', 'hidden');
            var previously_recorded = false;

            // Make the buttons
            var record_button;
            var stop_button;
            var save_button;
            var play_button;

            var controls = document.getElementById(initial_id + '-controls');
            var spinner = document.getElementById(initial_id + '-spinner');
            var spinner_visible = function(enable)
            {
                spinner.style.display = enable? 'inherit' : 'none';
                controls.style.display = enable? 'none' : 'inherit';
            }

            window[initial_id + '_waitStart'] = function()
            {
                spinner_visible(true);
            }

            window[initial_id + '_waitStop'] = function()
            {
                spinner_visible(false);
            }

            window[initial_id + '_cameraDenied'] = window[initial_id + '_microphoneDenied'] = function()
            {
                document.getElementById(final_id).parentNode.innerHTML = '<div class="fb_record_error"><p><span>Error:</span> To use this application, you must have a working microphone and webcam and click &ldquo;Allow&rdquo; to grant access.<button id="' + initial_id + '-restart">Try Again</button></p></div>';
                document.getElementById(initial_id + '-restart').onclick = function(){
                    recorder_element.innerHTML = '';
                    recorder_element.appendChild(input_element);
                }
            }

            record_button = make_button('Record', 'record', function(){
                record_object.startRecord();

                if (last_video_id) {
                    config.event(['recorder', 'record_discard'], {}, recorder_element);
                }

                last_video_id = null;
                controls.innerHTML = '';
                controls.appendChild(stop_button);
            });
            var last_video_id = null;
            stop_button = make_button('Stop', 'stop', function(){
                if (!last_video_id) {
                    last_video_id = record_object.stopRecord();
                } else {
                    record_object.stopPreview();
                }

                controls.innerHTML = '';
                controls.appendChild(record_button);
                controls.appendChild(play_button);
                controls.appendChild(save_button);
            });
            play_button = make_button('Play', 'play', function(){
                record_object.playPreview();
                controls.innerHTML = '';
                controls.appendChild(record_button);
                controls.appendChild(stop_button);
                controls.appendChild(save_button);
            });
            save_button = make_button('Save', 'save', function(){
                jQuery.ajax({
                    type: 'POST',
                    url: consts.recorder.location + '/uploads/' + last_video_id + '.json',
                    data: {
                        token: config.get('token')
                    },
                    success: function(data)
                    {

                        for (var i=0, attrs=input_element.attributes, l=attrs.length; i<l; i++){
                            var key = attrs.item(i).nodeName;
                            var value = attrs.item(i).nodeValue;

                            if ((key.toLowerCase() === 'type' && value.toLowerCase() === 'framebase') ||
                                    key.toLowerCase() === 'id') {
                                continue;
                            }

                            polyfills.attr(recorder_result, key, value);
                        }
                        polyfills.attr(recorder_result, 'value', data['videoID']);
                        polyfills.attr(recorder_element, 'value', data['videoID']);

                        if (!previously_recorded) {
                            previously_recorded = true;
                            recorder_element.parentNode.insertBefore(recorder_result, recorder_element.nextSibling);
                        }

                        config.event(['record', 'success'], {videoID: data['videoID']}, recorder_element);
                    },
                    error: function(err)
                    {
                        if (!config.has_event(['record', 'error'])) {
                            config.add_event_lambda(['record', 'error'], function(err)
                            {
                                alert('An error occurred while saving the video: ' + err);
                            });
                        }

                        config.event(['record', 'error'], err, recorder_element);
                    }
                });

                document.getElementById(final_id).parentNode.innerHTML = '<div class="fb_record_container"><div class="fb_record_screen"><div class="fb_record_error"><p>Your upload is complete!</p><div class="fb_record_done"></div></div></div>';
            });

            if (size.is_dynamic) {
                polyfills.attachEvent(window, 'resize', function(){
                    var new_size = elements.calculate_size(recorder_element, '', 4, 3);
                    recorder_element.style.height = new_size.height;
                    record_object.style.width = new_size.width;
                    record_object.style.height = new_size.height;
                });
            }

            window[initial_id + '_cameraEnabled'] = function(){
                controls.innerHTML = '';
                controls.appendChild(record_button);
            };

            window[initial_id + '_previewEnd'] = function(){
                record_object.seekPreview(0);
                record_object.playPreview();
            }

            if (!('__framebase_recorder_onLog' in window)) {
                window['__framebase_recorder_onLog'] = function(text){
                    debug(text + ', whispers the recorder softly.');
                }
            }
        });
    }

    var make_button = function(text, css_class, lambda)
    {
        var div = document.createElement('div');
        var a = document.createElement('a');
        a.innerText = text;
        polyfills.attr(div, 'class', css_class);
        a.onclick = lambda;
        div.appendChild(a);
        return div;
    }


    var random_string = function(length)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
})()});
