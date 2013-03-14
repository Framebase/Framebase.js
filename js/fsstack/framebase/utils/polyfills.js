define([], function(){return new (function(){
    // Polyfills
    var propFix = {
        'tabindex': "tabIndex",
        'readonly': "readOnly",
        'for': "htmlFor",
        'class': "className",
        'maxlength': "maxLength",
        'cellpadding': "cellPadding",
        'cellspacing': "cellSpacing",
        'class': "className",
        'colspan': "colSpan",
        'contenteditable': "contentEditable",
        'for': "htmlFor",
        'frameborder': "frameBorder",
        'maxlength': "maxLength",
        'readonly': "readOnly",
        'rowspan': "rowSpan",
        'tabindex': "tabIndex",
        'usemap': "useMap"
    };

    this.attachEvent = function(target, evt, lambda) {
        if (typeof(target.addEventListener) !== 'undefined') {
            target.addEventListener(evt, lambda);
        } else {
            target.attachEvent(evt, lambda);
        }
    }

    this.isElement = function (o){
        // Via http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    }

    var isXMLDoc = function(elem)
    {
        var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    }

    var prop = function(elem, name, value)
    {
        var notxml, nType = elem.nodeType;

        notxml = nType !== 1 || !isXMLDoc( elem );

        if ( notxml ) {
            name = propFix[ name ] || name;
        }

        return ( elem[ name ] = value );
    };

    // getAttribute doesn't always work like you'd expect
    this.attr = function(elem,name,value,pass)
    {
        if(!value)
        {
            return elem.getAttribute(name);
        }
        var notxml, nType = elem.nodeType;

        // Fallback to prop when attributes are not supported
        if ( typeof elem.getAttribute === "undefined" ) {
            return prop( elem, name, value );
        }

        notxml = nType !== 1 || !isXMLDoc( elem );

        // All attributes are lowercase
        // Grab necessary hook if one is defined
        if ( notxml ) {
            name = name.toLowerCase();
        }

        elem.setAttribute( name, "" + value );
        return value;
    };
})()})
