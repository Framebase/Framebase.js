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
    this.uploader = function(token, element_or_success_lambda, success_lambda_or_failure_lambda,
                                                failure_lambda)
    {
        async.attach_on_page_load(function(){
            if (typeof(element_or_success_lambda) === 'function' ||
                typeof(element_or_success_lambda) === 'string' ||
                typeof(element_or_success_lambda) === 'undefined' ||
                element_or_success_lambda === null) {
                framebase_uploader_all(token, element_or_success_lambda, success_lambda_or_failure_lambda);
            } else {
                framebase_uploader_one(token, element_or_success_lambda, success_lambda_or_failure_lambda, failure_lambda);
            }
        });
    }

    var uploader_is_monitoring_document = false;
    /**
     * Converts all <input type="framebase"> elements to framebase uploaders
     * @param  {string} token The API token
     */
    var framebase_uploader_all = function(token, success_lambda, failure_lambda)
    {
        if (!uploader_is_monitoring_document) {
            uploader_is_monitoring_document = true;

            // Add our CSS to hide the default video elements
            async.load_css('input[type=framebase]{display:none}');

            // Start looking for elements
            live.monitor_dom('input[type=framebase]', function(elem){
                framebase_uploader_one(token, elem, success_lambda, failure_lambda);
            });
        }
    }

    var is_uploader_init = false;
    /**
     * Creates a framebase uploader out of a specific element
     * @param  {string}   token          The API token
     * @param  {DOM}      input_element  The element to make into an uploader
     * @param  {callable} success_lambda The function to execute on success
     * @param  {callable} error_lambda   The function to execute on failure
     */
    var framebase_uploader_one = function(token, input_element, success_lambda, error_lambda)
    {
        // If it's a recording element, pass it off to the recorder
        if (polyfills.attr(input_element, 'record')) {
            return recorder.recorder(token, input_element, success_lambda, error_lambda);
        }

        require([consts.uploader.js], function(){
            // Figure out which skin to load
            var skin = polyfills.attr(input_element, 'data-skin');

            // Load the CSS
            var vidcss = document.createElement('link');

            if(!skin) vidcss.href = consts.uploader.css + '/uploader.css';
            else if(skin.indexOf('/') > 0) vidcss.href = skin;
            else vidcss.href = consts.uploader.css + '/uploader.'+ skin +'.min.css';

            vidcss.rel = 'stylesheet';
            vidcss.type = 'text/css';
            document.head.appendChild(vidcss);

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

            var uploader = new frame_upload.FineUploader({
                element: uploader_element,
                request: {
                    endpoint: consts.api.location + consts.api.endpoints.videos,
                    token: token
                },
                validation: {
                    allowedExtensions: ['mp4', 'mpeg', 'mov', 'avi', 'flv', 'mkv', '3gp', 'aac', 'wmv', 'm4v'],
                    sizeLimit: 1024 * 1024 * 1024 * 10
                },
                multiple: false,
                callbacks: {
                    onComplete: function(id, fileName, response, xhr){

                        if (response.response !== 200) {

                            // Set up a default error handler if necessary.
                            if (typeof(error_lambda) === 'undefined') {
                                error_lambda = function(errors)
                                {
                                    var message_text = '';
                                    if (errors.length === 0) {
                                        message_text += 'An unknown error occured.';
                                    } else if (errors.length === 1) {
                                        message_text += "We encountered an error in uploading your file. ";
                                        message_text += errors[0];
                                    } else {
                                        message_text += "We encountered the following errors in uploading your file:\n";
                                        for (var i in errors) {
                                            message_text += '   * ' + errors[i] + "\n";
                                        }
                                    }

                                    alert(message_text);
                                }
                            }

                            error_lambda(response.errors);
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

                            if (typeof(success_lambda) !== 'undefined') {
                                success_lambda(response);
                            }
                        }
                    }
                }
            });
        });
    }
})()});
