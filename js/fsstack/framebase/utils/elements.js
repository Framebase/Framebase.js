define(['fsstack/framebase/utils/polyfills'], function(polyfills){return new(function(){
    this.copy = function(src, dst){
        for (var i=0, attrs=src.attributes, l=attrs.length; i<l; i++){
            var key = attrs.item(i).nodeName;
            var value = attrs.item(i).nodeValue;

            polyfills.attr(dst, key, value);
        }
        return dst;
    }
})();})
