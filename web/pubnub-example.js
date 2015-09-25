

var pnrx = 0;
var pntx = 0;
var pntxspan = document.getElementById('pnmettx');
var pnrxspan = document.getElementById('pnmetrx');
var pndtspan = document.getElementById('pnmetdt');

var pnCircle = document.getElementById('pncircle');
var pnbody = document.querySelector('html');
var hash = window.location.hash;

if(!hash) {
    window.addEventListener('hashchange', start);
} else {
    start();
}

function start() {
    hash = hash.substr(1);

    var pn = PUBNUB.init({
        publish_key: 'pub-c-85f4ff98-5adc-4c44-a915-90efb914f56e',
        subscribe_key: 'sub-c-2a0a5cb2-6228-11e5-bba9-02ee2ddab7fe'
    });

    pnbody.addEventListener('mousemove', function (event) {
        var pos = {x: event.pageX, y: event.pageY};
        pn.publish({
            channel: 'com.dglux.followme' + hash,
            message: pos
        });
        pntxspan.textContent = ++pntx;
        pndtspan.textContent = (pntx - pnrx);
    });

    function onUpdated(data) {
        pnrxspan.textContent = ++pnrx;
        pndtspan.textContent = (pntx - pnrx);
        pnCircle.style.left = data.x + 'px';
        pnCircle.style.top = data.y + 'px';
    }

    pn.subscribe({
        channel: 'com.dglux.followme' + hash,
        message: onUpdated
    });
}