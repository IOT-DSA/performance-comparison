var PN_BODY = document.querySelector('body');

var PNExample = (function() {

    var pnx;
    function PNExample() {
        pnx = this;
        this.rx = 0;
        this.tx = 0;
        this.lastMsgTime = 0;
        this.Elements = {};
        this.Elements.circle = document.getElementById('pncircle');
        this.Elements.txSpan = document.getElementById('pnmettx');
        this.Elements.rxSpan = document.getElementById('pnmetrx');
        this.Elements.dtSpan = document.getElementById('pnmetdt');
        this.Elements.mps = document.getElementById('pnmps');
        this.connection = null;
        this.ssid = '';
        this.PER_SECOND = 1000;

        var hash = window.location.hash;
        if(!hash) {
            window.addEventListener('hashchange', this.init);
        } else {
            this.init();
        }
    }

    PNExample.prototype.messageReceived = function(data) {
        pnx.Elements.rxSpan.textContent = (pnx.rx += 1);
        if(pnx.rx > pnx.tx) {
            pnx.tx = pnx.rx;
            pnx.Elements.txSpan.textContent = pnx.tx;
        }
        pnx.Elements.dtSpan.textContent = (pnx.tx - pnx.rx);
        pnx.Elements.circle.style.left = data.x + 'px';
        pnx.Elements.circle.style.top = data.y + 'px';

        if(pnx.lastMsgTime === 0) {
            pnx.lastMsgTime = window.performance.now();
        }

        if(pnx.rx % 10 === 0) {
            var now = window.performance.now();
            var delta = now - pnx.lastMsgTime;
            pnx.lastMsgTime = now;
            pnx.Elements.mps.textContent = (pnx.PER_SECOND / delta * 10).toFixed(2);
        }
    };

    PNExample.prototype.mouseMoved = function(event) {
        var pos = {x: event.pageX, y: event.pageY};
        pnx.connection.publish({
            channel: 'com.dglux.followme' + pnx.ssid,
            message: pos
        });
        pnx.Elements.txSpan.textContent = (pnx.tx += 1);
        pnx.Elements.dtSpan.textContent = (pnx.tx - pnx.rx);
    };

    PNExample.prototype.init = function() {
        pnx.ssid = window.location.hash.substr(1);
        pnx.connection = PUBNUB.init({
            publish_key: 'pub-c-85f4ff98-5adc-4c44-a915-90efb914f56e',
            subscribe_key: 'sub-c-2a0a5cb2-6228-11e5-bba9-02ee2ddab7fe'
        });

        pnx.connection.subscribe({
            channel: 'com.dglux.followme' + pnx.ssid,
            message: pnx.messageReceived
        });
        PN_BODY.addEventListener('appready', function() {
            console.log('AppReady Received from: PubNub');
            PN_BODY.addEventListener('mousemove', pnx.mouseMoved);
        });
        PN_BODY.dispatchEvent(new CustomEvent('trialready', { detail: {trial: 'pubnub'}}));
    };

    return PNExample;
})();

CB_BODY.addEventListener('inittrials', function () {
    var pnExample = new PNExample();
});