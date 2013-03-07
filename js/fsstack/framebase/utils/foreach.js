/**
 * Adds foreach to DOM nodes. Bad practice.
 */
define([], function(){
    NodeList.prototype.forEach = Array.prototype.forEach;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
});
