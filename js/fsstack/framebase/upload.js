/**
 * Uploader loading functions
 */
define(['fsstack/framebase/utils/async',
       'fsstack/framebase/consts',
       'fsstack/framebase/utils/live',
       'fsstack/framebase/utils/polyfills',
       'fsstack/framebase/recorder',
       'fsstack/framebase/utils/foreach'],
        function(async, consts, live, polyfills, recorder, foreach){return new (function(){
    this.uploader = function(config_or_element, config)
    {
        async.attach_on_page_load(function(){
            if (polyfills.isElement(config_or_element)) {
                framebase_uploader_one(config_or_element, config);
            } else {
                framebase_uploader_all(config_or_element);
            }
        });
    }

    var uploader_is_monitoring_document = false;
    /**
     * Converts all <input type="framebase"> elements to framebase uploaders
     * @param  {string} token The API token
     */
    var framebase_uploader_all = function(config)
    {
        if (!uploader_is_monitoring_document) {
            uploader_is_monitoring_document = true;

            // Add our CSS to hide the default video elements
            async.load_css('input[type=framebase]{display:none}');

            // Start looking for elements
            live.monitor_dom('input[type=framebase]', function(elem){
                framebase_uploader_one(elem, config);
            });
        }
    }

    var is_uploader_init = false;
    /**
     * Creates a framebase uploader out of a specific element
     * @param  {DOM}      input_element  The element to make into an uploader
     * @param  {object}   config         The config object
     */
    var framebase_uploader_one = function(input_element, config)
    {
        // If it's a recording element, pass it off to the recorder
        if (polyfills.attr(input_element, 'record')) {
            return recorder.recorder(input_element, config);
        }

        require([consts.uploader.js], function(){
            // Figure out which skin to load
            var requested_skin = polyfills.attr(input_element, 'data-skin');
            var skin_url = consts.uploader.css + '/uploader.css';
            if (typeof(requested_skin) !== 'undefined' && requested_skin !== null && requested_skin.length > 0) {
                if (validation.is_url(requested_skin)) {
                    skin_url = requested_skin;
                } else {
                    skin_url = consts.uploader.css + '/uploader.' + requested_skin + '.min.css';
                }
            }

            // Load the CSS
            async.load_css(skin_url);

            var uploader_element = document.createElement('div');

            // Set properties of the uploader
            for (var i=0, attrs=input_element.attributes, l=attrs.length; i<l; i++){
                var key = attrs.item(i).nodeName;
                var value = attrs.item(i).nodeValue;

                if ((key.toLowerCase() === 'type' && value.toLowerCase() === 'framebase') ||
                    key.toLowerCase() === 'name') {
                    continue;
                }

                polyfills.attr(uploader_element, key, value);
            }

            input_element.parentNode.replaceChild(uploader_element, input_element);

            var uploader_result = document.createElement('input');
            polyfills.attr(uploader_result, 'type', 'hidden');
            var previously_uploaded = false;

            var uploader = new window['frame_upload'].FineUploader({
                element: uploader_element,
                request: {
                    endpoint: consts.api.location + consts.api.endpoints.videos,
                    token: config.get('token')
                },
                validation: {
                    allowedExtensions: ['mp4', 'mpeg', 'mov', 'avi', 'flv', 'mkv', '3gp', 'aac', 'wmv', 'm4v'],
                    sizeLimit: 1024 * 1024 * 1024 * 10
                },
                multiple: false,
                callbacks: {
                    onComplete: function(id, fileName, response, xhr){

                        if (response['response'] !== 200) {

                            // Set up a default error handler if necessary.
                            if (!config.has_event(['upload', 'error'])) {
                                config.add_event_lambda(['upload', 'error'], function(errors)
                                {
                                    var message_text = '';
                                    if (errors.length === 0) {
                                        message_text += 'An unknown error occured.';
                                    } else if (errors.length === 1 || typeof(errors) === 'string') {
                                        message_text += "We encountered an error in uploading your file. ";
                                        message_text += (typeof(errors) === 'string')? errors : errors[0];
                                    } else {
                                        message_text += "We encountered the following errors in uploading your file:\n";
                                        for (var i in errors) {
                                            message_text += '   * ' + errors[i] + "\n";
                                        }
                                    }

                                    alert(message_text);
                                });
                            }

                            config.event(['upload', 'error'], response['errors'], uploader_element);
                        } else {
                            // Clone the original properties
                            for (var i=0, attrs=input_element.attributes, l=attrs.length; i<l; i++){
                                var key = attrs.item(i).nodeName;
                                var value = attrs.item(i).nodeValue;

                                if ((key.toLowerCase() === 'type' && value.toLowerCase() === 'framebase') ||
                                        key.toLowerCase() === 'id') {
                                    continue;
                                }

                                polyfills.attr(uploader_result, key, value);
                            }
                            polyfills.attr(uploader_result, 'value', response['videoID']);
                            polyfills.attr(uploader_element, 'value', response['videoID']);

                            if (!previously_uploaded) {
                                previously_uploaded = true;
                                uploader_element.parentNode.insertBefore(uploader_result, uploader_element.nextSibling);
                            }

                            config.event(['upload', 'success'], response, uploader_element);
                        }
                    }
                }
            });
        });
    }
})()});
