define(['fsstack/framebase/consts',
       'fsstack/framebase/utils/foreach',
       'fsstack/framebase/utils/polyfills'],
       function(consts, foreach, polyfills){return new (function(){
    this.monitor_dom = function(selector, lambda){

        // Find elements currently matching the selector
        eachElement(document, selector, lambda);

        // Watch for new elements being inserted in the DOM
        polyfills.attachEvent(document.getElementsByTagName('body')[0], "DOMNodeInserted", function(evt) {
            try { // This has sub-elements which might match
                eachElement(evt.target, selector, lambda);
            } catch (err) {
            }

            // Match the parent
            if (matches_selector(evt.target, selector)) {
                lambda(evt.target);
            }
        }, false);
    }

    // Hacks for IE8 and below
    var eachElement = function(target, selector, lambda) {
        if (typeof(Array.prototype.map) !== 'undefined') {
            return target.querySelectorAll(selector).forEach(lambda);
        } else {
            // Slow, IE8 fix
            map(convertToArray(target.querySelectorAll(selector)), lambda);
        }
    }

    var convertToArray = function(nodes){
        var array = null;
        try {
             array = Array.prototype.slice.call(nodes, 0); //non-IE and IE9+
        } catch (ex) {
            array = new Array();
            for (var i=0, len=nodes.length; i < len; i++){
                array.push(nodes[i]);
            }
        }
        return array;
    }

    var map = function(thisp, fun) {
        var object = Object(thisp),
            self = object,
            length = self.length >>> 0,
            result = Array(length);

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };

    var matches_selector = function(element, selector) {
        var node = element;
        var result = false;
        var root, frag;

        // crawl up the tree
        while (node.parentNode) {
            node = node.parentNode;
        }

        // root must be either a Document or a DocumentFragment
        if (node instanceof Document || node instanceof DocumentFragment) {
            root = node;
        } else {
            root = frag = document.createDocumentFragment();
            frag.appendChild(node);
        }

        // see if selector matches
        var matches = root.querySelectorAll(selector);
        for (var i = 0; i < matches.length; i++) {
            if (element === matches.item(i)) {
                result = true;
                break;
            }
        }

        // detach from DocumentFragment and return result
        while (frag && frag.firstChild) {
            frag.removeChild(frag.firstChild);
        }
        return result;
    }
})()})
