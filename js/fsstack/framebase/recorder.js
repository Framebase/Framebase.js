/**
 * Uploader loading functions
 */
define(['fsstack/framebase/utils/async',
       'fsstack/framebase/consts',
       'fsstack/framebase/utils/live',
       'fsstack/framebase/utils/polyfills',
       'jquery',
       'fsstack/framebase/utils/foreach'],
        function(async, consts, live, polyfills, jQuery, foreach){return new (function(){

    var is_recorder_init = false;
    /**
     * Creates a framebase uploader out of a specific element
     * @param  {string}   token          The API token
     * @param  {DOM}      input_element  The element to make into an uploader
     * @param  {callable} success_lambda The function to execute on success
     * @param  {callable} error_lambda   The function to execute on failure
     */
    this.recorder = function(token, input_element, success_lambda, error_lambda)
    {
        require([consts.common.js.swfobject], function(){
            // TODO:
            // swfobject seems to require IDs. So if they want IDs, we'll give 'em IDs. In the future, this is pretty
            // bad, because it means the element HAS to be in document. That shouldn't really matter, but it's still
            // fairly silly.
            var real_id = polyfills.attr(input_element, 'id');
            var initial_id = random_string(20);
            var final_id = real_id ? real_id : random_string(20);

            // Build the recorder_element
            var recorder_element = document.createElement('div');

            // Figure out which skin to load
            var requested_skin = polyfills.attr(recorder_element, 'data-skin');
            var skin_url = consts.recorder.css + '/recorder.min.css';
            if (typeof(skin) !== 'undefined' && skin !== null && skin.length > 0) {
                if (validation.is_url(skin)) {
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
            recorder_element.innerHTML = '<div class="fb_record_screen"><div id="' + initial_id + '"></div></div><div class="fb_record_controls" id="' + initial_id + '-controls"></div>';

            input_element.parentNode.replaceChild(recorder_element, input_element);

            var embed_attrs = {
                data: consts.recorder.swf,
                width: '100%',
                height: '100%',
                id: final_id,
                name: final_id
            };
            var embed_params = {
                allowScriptAccess: 'always',
                swliveconnect: 'true',
                wmode: "transparent"
            };

            // Embed the object
            var record_object = swfobject.createSWF(embed_attrs, embed_params, initial_id);

            // Get ready to keep track of the result
            var recorder_result = document.createElement('input');
            polyfills.attr(recorder_result, 'type', 'hidden');
            var previously_recorded = false;

            // Make the buttons
            var record_button;
            var stop_button;
            var save_button;

            var controls = document.getElementById(initial_id + '-controls');

            record_button = make_button('Record', 'record', function(){
                record_object.startRecord();
                controls.innerHTML = '';
                controls.appendChild(stop_button);
            });
            var last_video_id = null;
            stop_button = make_button('Stop', 'stop', function(){
                last_video_id = record_object.stopRecord();
                controls.innerHTML = '';
                controls.appendChild(record_button);
                controls.appendChild(save_button);
            });
            save_button = make_button('Save', 'save', function(){
                jQuery.ajax({
                    type: 'POST',
                    url: consts.recorder.location + '/uploads/' + last_video_id + '.json',
                    data: {
                        token: token
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

                        if (typeof(success_lambda) !== 'undefined') {
                            success_lambda(data);
                        }
                    },
                    error: function(err)
                    {
                        if (typeof(error_lambda) === 'undefined') {
                            error_lambda = function(err)
                            {
                                alert('An error occurred while saving the video: ' + err);
                            }
                        }

                        error_lambda();
                    }
                });

                recorder_element.innerHTML = 'Video upload done!';
            });

            controls.innerHTML = '';
            controls.appendChild(record_button);
        });
    }

    var make_button = function(text, css_class, lambda)
    {
        var a = document.createElement('a');
        a.innerText = text;
        polyfills.attr(a, 'class', css_class);
        a.onclick = lambda;
        return a;
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
