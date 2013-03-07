define(['fsstack/framebase/consts'], function(consts){return new (function(){
    this.monitor_dom = function(selector, lambda){

        // Find elements currently matching the selector
        document.querySelectorAll(selector).forEach(function(elem){
            lambda(elem);
        });

        // Watch for new elements being inserted in the DOM
        document.body.addEventListener("DOMNodeInserted", function(evt) {
            try { // This has sub-elements which might match
                evt.target.querySelectorAll(selector).forEach(function(elem){
                    lambda(elem);
                });
            } catch (err) {
            }

            // Match the parent
            if (matches_selector(evt.target, selector)) {
                lambda(evt.target);
            }
        }, false);
    }

    // Hacks for IE8 and below
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
