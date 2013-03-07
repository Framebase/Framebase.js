var xhrObj = new XMLHttpRequest();
xhrObj.open('GET', '../js/r.js', false);
xhrObj.send('');
eval(xhrObj.responseText);

require.config({
    baseUrl: "../js/"
})

var xhrObj = new XMLHttpRequest();
xhrObj.open('GET', '../js/fsstack/framebase.js', false);
xhrObj.send('');
eval(xhrObj.responseText);
