define(['fsstack/framebase/utils/polyfills'], function(polyfills){return new(function(){
    this.copy = function(src, dst){
        for (var i=0, attrs=src.attributes, l=attrs.length; i<l; i++){
            var key = attrs.item(i).nodeName;
            var value = attrs.item(i).nodeValue;

            polyfills.attr(dst, key, value);
        }
        return dst;
    }

    this.calculate_size = function(src_element, default_width, aspect_ratio_x, aspect_ratio_y)
    {
        var width, height = null;
        if (polyfills.attr(src_element, 'width')) {
            width = polyfills.attr(src_element, 'width');
        } else if (src_element.style.width) {
            width = src_element.style.width;
        } else {
            width = default_width;
        }

        if (polyfills.attr(src_element, 'height')) {
            height = polyfills.attr(src_element, 'height');
        } else if (src_element.style.height) {
            height = src_element.style.height;
        } else {
            var width_unit = width.replace(/[\-\d\.]+/,'');
            var width_number = parseInt(width.substring(0,width.length - width_unit.length));
            height = ((width_number / aspect_ratio_x) * aspect_ratio_y) + width_unit;
        }

        return {width: width, height: height};
    }
})();})
