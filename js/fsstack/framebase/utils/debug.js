define(['fsstack/framebase/utils/polyfills',
        'fsstack/framebase/utils/elements'],
        function(polyfills, elements){
    var logging_history = [];
    var fn = function(){
        var args = [];
        for (var i in arguments) {
            try {
                if (polyfills.isElement(arguments[i])) {
                    args.push(elements.get_html(arguments[i]));
                } else {
                    args.push(arguments[i].toString());
                }
            } catch (err) {}
        }

        logging_history.push(args);
        if (window.location.hostname.match(/(\.int$|^localhost$|^127.0.0.1$|framebase\.io$)/) &&
            ('localStorage' in window && window['localStorage']['framebase_debug'] === "true") &&
            ('console' in window && 'log' in window['console'])) {
            window['console'].log.apply(window['console'], arguments);
        }
    }

    var expand_with_limit = function(obj, limit, stack_size)
    {
        if (typeof(stack_size) === 'undefined') {
            stack_size = 0;
        }

        if (stack_size >= limit) {
            return null;
        } else {
            var current_level_obj = {};
            for (var i in obj) {
                if (typeof(obj[i]) === 'object') {
                    current_level_obj[i] = expand_with_limit(obj[i], limit, stack_size + 1);
                } else if (typeof(obj[i]) === 'function') {
                } else if (i === '__proto__') {
                } else {
                    current_level_obj[i] = obj[i];
                }
            }
            return current_level_obj;
        }
    }

    fn.get_enviroment_info = function()
    {
        return expand_with_limit(navigator, 5);
    }

    fn.send_debug_info = function(lambda)
    {
        require(['jquery'], function(jQuery){
            jQuery.ajax({
                'type': 'POST',
                'url': 'https://api.framebase.io/debug.json',
                'data': {
                    'navigator': expand_with_limit(navigator, 3),
                    'logs': logging_history
                },
                'dataType': 'text',
                'success': function(data) {
                    lambda(data);
                }
            })
        });
    }

    fn.constructor = function()
    {
        setTimeout(function(){
            if ('olark' in window) {
                fn('olark detected!');
                window['olark']('api.chat.onMessageToVisitor', function(event) {
                    if (event.message.body === '#framebase debug') {
                        fn('Sending framebase debug!');
                        fn.send_debug_info(function(info) {
                            fn('debug info ' + info);
                            window['olark']('api.chat.sendNotificationToOperator',{
                                "body": info
                            });
                        });
                    }
                })
            }
        }, 5000);

        if (window.location.hostname.match(/(\.int$|^localhost$|^127.0.0.1$|framebase\.io$)/)) {
            window['framebase_debug'] = fn;
        }
    }

    fn.constructor();

    return fn;
})
