define([], function(){return function(config){
    this.get = function()
    {
        var ret = config;
        for (var i in arguments) {
            if (arguments[i] in ret) {
                ret = ret[arguments[i]]
            } else {
                return null;
            }
        }

        return ret;
    }

    var set = function(where, what)
    {
        var ret = config;
        for (var i = 0; i < where.length - 1; i++) {
            if (!(where[i] in ret)) {
                ret[where[i]] = {};
            }
            ret = ret[where[i]]
        }
        ret[where[where.length - 1]] = what;
    }

    this.has = function()
    {
        return this.get.apply(this, arguments) !== null;
    }

    this.event = function(name, info, scope)
    {
        if (typeof(scope) === 'undefined') {
            scope = this;
        }
        name.unshift('events');
        var evt = this.get.apply(this, name);
        if (typeof(evt) === 'function') {
            evt.call(scope, info);
        } else if (Object.prototype.toString.call(evt) !== '[object Array]') {
            for (var i in evt) {
                evt[i].call(scope, info);
            }
        }

        var onEvent = this.get('events', 'on_event');
        if (typeof(onEvent) === 'function') {
            onEvent.call(scope, name.join('_'), info);
        } else if (Object.prototype.toString.call(evt) !== '[object Array]') {
            for (var i in onEvent) {
                onEvent[i].call(scope, name.slice(1).join('_'), info);
            }
        }
    }

    this.has_event = function(name)
    {
        name.unshift('events');
        return this.has(name);
    }

    this.add_event_lambda = function(where, what) {
        where.unshift('events');

        var list = this.get.apply(this, where);
        console.log(list);
        console.log(where, '=', list);
        if (Object.prototype.toString.call(list) !== '[object Array]') {
            if (typeof(list) === 'undefined' || list === null) {
                list = [];
            } else {
                list = [list];
            }
        }

        list.push(what);
        set(where, list);
    }
}})
