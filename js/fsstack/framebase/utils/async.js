define(['fsstack/framebase/utils/debug', 'fsstack/framebase/utils/validation'],
       function(debug, validation){return new (function(){
    var onload_callbacks = [];
    var body_has_onload_callback_registered = false;
    this.attach_on_page_load = function(callback)
    {
        var body_has_loaded = document.readyState === "complete" || document.readyState === "interactive";
        if (body_has_loaded) {
            debug('page has already loaded, calling function', callback);
            callback();
        } else {
            debug('page has not loaded, registering function', callback);
            onload_callbacks.push(callback);
        }

        if (!body_has_onload_callback_registered && !body_has_loaded) {
            body_has_onload_callback_registered = true;

            var onload_function = function()
            {
                debug('page loaded, calling queued callbacks');
                body_has_loaded = true;
                for (var i in onload_callbacks) {
                    debug('calling function', onload_callbacks[i]);
                    onload_callbacks[i]();
                }
                onload_callbacks = [];
            }

            if(window.attachEvent) {
                window.attachEvent('onload', onload_function);
            } else {
                if(window.onload) {
                    var curronload = window.onload;
                    var newonload = function() {
                        curronload();
                        onload_function();
                    };
                    window.onload = newonload;
                } else {
                    window.onload = onload_function;
                }
            }
        }
    }

    this.load_css = function(location_or_css)
    {
        debug('loading css', location_or_css);

        var injection_point = null;
        if (document.getElementsByTagName('head').length > 0) {
            injection_point = document.getElementsByTagName('head')[0];
        } else {
            injection_point = document.getElementsByTagName('body')[0];
        }

        // Load the CSS file
        if (validation.is_url(location_or_css)) {
            debug('css was file, loading from file');
            var link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = location_or_css;
            injection_point.appendChild(link);
        // Insert the inline CSS
        } else {
            debug('inserting into head');
            var css = document.createElement('style');
            css.type = 'text/css';
            css.cssText = location_or_css;
            injection_point.appendChild(css);
        }
    }
})()})
