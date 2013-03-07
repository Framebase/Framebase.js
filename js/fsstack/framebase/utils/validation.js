define([], function(){return new (function(){
    this.is_url = function(str) {
        return /^(https?:)?\/\//.test(str); // good enough
    }
})()})
