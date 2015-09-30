var HV_BODY = document.querySelector('body');

var HiveExample = (function() {

    var hvx;
    function HiveExample() {
        hvx = this;
        this.Elements = {};
        this.Elements.circle = document.getElementById('hvcircle');
        this.Elements.txSpan = document.getElementById('hvmettx');
        this.Elements.rxSpan = document.getElementById('hvmetrx');
        this.Elements.dtSpan = document.getElementById('hvmetdt');
        this.Elements.mps = document.getElementById('hvmps');
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

    HiveExample.prototype.mouseMoved = function(event) {
        var pos = {x: event.pageX, y: event.pageY};
        var message = new Paho.MQTT.Message(JSON.stringify(pos));
        message.destinationName = '/com.dglux.followme' + hvx.ssid;
        message.qos = 0;
        hvx.connection.send(message);
        hvx.Elements.txSpan.textContent = (hvx.tx += 1);
        hvx.Elements.dtSpan.textContent = (hvx.tx - hvx.rx);
    };

    HiveExample.prototype.messageCount = function() {
        var delta = hvx.rx - hvx.lastMsgTime;
        hvx.lastMsgTime = hvx.rx;
        hvx.Elements.mps.textContent = (delta / 5);
    };

    HiveExample.prototype.clientConnected = function() {
        hvx.connection.subscribe('/com.dglux.followme'+ hvx.ssid);

        HV_BODY.addEventListener('appready', function() {
            console.log('AppReady Received from: HiveMQ');
            window.setInterval(hvx.messageCount, 5000);
            HV_BODY.addEventListener('mousemove', hvx.mouseMoved);
        });
        HV_BODY.dispatchEvent(new CustomEvent('trialready', { detail: {trial: 'hive'}}));
    };

    HiveExample.prototype.messageReceived = function(msg) {
        var pos;
        try {
            pos = JSON.parse(msg.payloadString);
        } catch (e) {
            console.log('error:', e);
        }
        hvx.Elements.rxSpan.textContent = (hvx.rx += 1);
        if(hvx.rx > hvx.tx) {
            hvx.tx = hvx.rx;
            hvx.Elements.txSpan.textContent = hvx.tx;
        }
        hvx.Elements.dtSpan.textContent = (hvx.tx - hvx.rx);
        hvx.Elements.circle.style.left = pos.x + 'px';
        hvx.Elements.circle.style.top = pos.y + 'px';

        //if(hvx.lastMessageTime === 0) {
        //    hvx.lastMessageTime = window.performance.now();
        //}
        //
        //if(hvx.rx % 10 === 0) {
        //    var now = window.performance.now();
        //    var delta = now - hvx.lastMsgTime;
        //    hvx.lastMsgTime = now;
        //    hvx.Elements.mps.textContent = ((hvx.PER_SECOND / delta) * 10).toFixed(2);
        //}
    };

    HiveExample.prototype.init = function() {
        hvx.ssid = window.location.hash.substr(1);

        hvx.connection = new Paho.MQTT.Client('performance.iot-dsa.org', 8105, 'followme-1' + new Date().getTime());
        hvx.connection.onMessageArrived = hvx.messageReceived;
        hvx.connection.onConnectionLost = function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
                console.log(responseObject);
            }
        };

        hvx.connection.connect({onSuccess: hvx.clientConnected});
    };

    return HiveExample;
})();

HV_BODY.addEventListener('inittrials', function () {
    var hvExample = new HiveExample();
});
