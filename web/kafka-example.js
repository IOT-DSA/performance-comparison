// PORT: 7080
var KF_BODY = document.querySelector('body');

var KafkaExample = (function() {

    var kfx;
    function KafkaExample() {
        kfx = this;
        this.Elements = {};
        this.Elements.circle = document.getElementById('kfcircle');
        this.Elements.txSpan = document.getElementById('kfmettx');
        this.Elements.rxSpan = document.getElementById('kfmetrx');
        this.Elements.dtSpan = document.getElementById('kfmetdt');
        this.Elements.mps = document.getElementById('kfmps');
        this.rx = 0;
        this.tx = 0;
        this.lastMsgTime = 0;
        this.ssid = '';
        this.connection = null;
        this.PER_SECOND = 1000;

        var hash = window.location.hash;
        if(!hash) {
            window.addEventListener('hashchange', this.init);
        } else {
            this.init();
        }
    }

    KafkaExample.prototype.messageCount = function(event) {
        var delta = kfx.rx - kfx.lastMsgTime;
        kfx.lastMsgTime = kfx.rx;
        kfx.Elements.mps.textContent = (delta / 5);
    };

    KafkaExample.prototype.mouseMoved = function(event) {
        var pos = JSON.stringify({x: event.pageX, y: event.pageY});
        var message = {topic: kfx.ssid, message: pos};
        kfx.connection.send(JSON.stringify(message));
        kfx.Elements.txSpan.textContent = (kfx.tx += 1);
        kfx.Elements.dtSpan.textContent = (kfx.tx - kfx.rx);
    };

    KafkaExample.prototype.clientConnected = function(event) {
        KF_BODY.addEventListener('appready', function() {
            console.log('AppReady Received from: mosquito');
            window.setInterval(kfx.messageCount, 5000);
            KF_BODY.addEventListener('mousemove', kfx.mouseMoved);
        });
        KF_BODY.dispatchEvent(new CustomEvent('trialready', { detail: {trial: 'Kafka'}}));
    };

    KafkaExample.prototype.messageReceived = function(event) {
        var msg, pos;
        try {
            msg = JSON.parse(event.data);
            pos = JSON.parse(msg.message);
        } catch (e) {
            console.log(e);
        }

        kfx.Elements.rxSpan.textContent = (kfx.rx += 1);
        if(kfx.rx > kfx.tx) {
            kfx.tx = kfx.rx;
            kfx.Elements.txSpan.textContent = kfx.tx;
        }
        kfx.Elements.dtSpan.textContent = (kfx.tx - kfx.rx);
        kfx.Elements.circle.style.left = pos.x + 'px';
        kfx.Elements.circle.style.top = (pos.y - 15) + 'px';

    };

    KafkaExample.prototype.init = function() {
        kfx.ssid = window.location.hash.substr(1);

        kfx.connection = new WebSocket("ws://performance.iot-dsa.org:7080/v2/broker/?topics=" + kfx.ssid);
        kfx.connection.onmessage = kfx.messageReceived;
        kfx.connection.onopen = kfx.clientConnected;
    };

    return KafkaExample;
})();

KF_BODY.addEventListener('inittrials', function () {
    var kfExample = new KafkaExample();
});