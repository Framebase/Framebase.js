define(['fsstack/framebase/utils/polyfills'], function(polyfills){return new(function(){
    this.copy = function(src, dst){
        for (var i=0, attrs=src.attributes, l=attrs.length; i<l; i++){
            var key = attrs.item(i).nodeName;
            var value = attrs.item(i).nodeValue;

            polyfills.attr(dst, key, value);
        }
        return dst;
    }

    this.get_html = function(elem)
    {
        var wrap = document.createElement('div');
        wrap.appendChild(elem.cloneNode(true));
        return wrap.innerHTML;
    }

    this.calculate_size = function(src_element, default_width, aspect_ratio_x, aspect_ratio_y)
    {
        var width = null; var height = null;
        if (polyfills.attr(src_element, 'width')) {
            width = polyfills.attr(src_element, 'width');
        } else if (src_element.style.width) {
            width = src_element.style.width;
        }

        var is_dynamic = false;
        if (width === null || width.replace(/[\-\d\.]+/, '') === '%') {
            polyfills.attr(src_element, 'width', '100%');
            src_element.style.width = '100% !important';
            src_element.style.display = 'inline !important';
            width = src_element.offsetWidth + 'px';

            is_dynamic = true;
        }

        if (is_dynamic) {
            var width_unit = width.replace(/[\-\d\.]+/,'');
            var width_number = parseInt(width.substring(0,width.length - width_unit.length));
            height = ((width_number / aspect_ratio_x) * aspect_ratio_y) + width_unit;
        } else if (polyfills.attr(src_element, 'height')) {
            height = polyfills.attr(src_element, 'height');
        } else if (src_element.style.height) {
            height = src_element.style.height;
        } else {
            var width_unit = width.replace(/[\-\d\.]+/,'');
            var width_number = parseInt(width.substring(0,width.length - width_unit.length));
            height = ((width_number / aspect_ratio_x) * aspect_ratio_y) + width_unit;
        }

        if (is_dynamic) {
            width = '100%';
        }

        return {width: width, height: height, is_dynamic: is_dynamic};
    }
})();})
