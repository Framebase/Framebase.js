define(['fsstack/framebase/utils/validation'],
       function(validation){return new (function(){
    var onload_callbacks = [];
    var body_has_onload_callback_registered = false;
    this.attach_on_page_load = function(callback)
    {
        var body_has_loaded = document.readyState === "complete" || document.readyState === "interactive";
        if (body_has_loaded) {
            callback();
        } else {
            onload_callbacks.push(callback);
        }

        if (!body_has_onload_callback_registered && !body_has_loaded) {
            body_has_onload_callback_registered = true;

            var onload_function = function()
            {
                body_has_loaded = true;
                for (var i in onload_callbacks) {
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
        // Load the CSS file
        if (validation.is_url(location_or_css)) {
            var link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = location_or_css;
            document.getElementsByTagName('head')[0].appendChild(link);
        // Insert the inline CSS
        } else {
            var css = document.createElement('style');
            css.type = 'text/css';
            css.cssText = location_or_css;
            document.getElementsByTagName('head')[0].appendChild(css);
        }
    }
})()})
