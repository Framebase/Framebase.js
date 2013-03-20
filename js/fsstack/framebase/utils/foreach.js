/**
 * Adds foreach to DOM nodes. Bad practice.
 */
define(['fsstack/framebase/utils/debug'], function(debug){
    debug('inserting foreach shim');
    NodeList.prototype.forEach = Array.prototype.forEach;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
});
