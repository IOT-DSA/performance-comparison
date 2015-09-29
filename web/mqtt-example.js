var MQ_BODY = document.querySelector('body');

var MQExample = (function() {

    var mqx;
    function MQExample() {
        mqx = this;
        this.Elements = {};
        this.Elements.circle = document.getElementById('mqttcircle');
        this.Elements.txSpan = document.getElementById('mqmettx');
        this.Elements.rxSpan = document.getElementById('mqmetrx');
        this.Elements.dtSpan = document.getElementById('mqmetdt');
        this.rx = 0;
        this.tx = 0;
        this.ssid = '';
        this.connection = null;

        var hash = window.location.hash;
        if(!hash) {
            window.addEventListener('hashchange', this.init);
        } else {
            this.init();
        }
    }

    MQExample.prototype.mouseMoved = function(event) {
        var pos = {x: event.pageX, y: event.pageY};
        var message = new Paho.MQTT.Message(JSON.stringify(pos));
        message.destinationName = '/com.dglux.followme' + mqx.ssid;
        message.qos = 0;
        mqx.connection.send(message);
        mqx.Elements.txSpan.textContent = (mqx.tx += 1);
        mqx.Elements.dtSpan.textContent = (mqx.tx - mqx.rx);
    };

    MQExample.prototype.clientConnected = function() {
        mqx.connection.subscribe('/com.dglux.followme'+ mqx.ssid);

        MQ_BODY.addEventListener('appready', function() {
            console.log('AppReady Received from: mosquito');
            MQ_BODY.addEventListener('mousemove', mqx.mouseMoved);
        });
        MQ_BODY.dispatchEvent(new CustomEvent('trialready', { detail: {trial: 'mosquito'}}));
    };

    MQExample.prototype.messageReceived = function(msg) {
        var pos;
        try {
            pos = JSON.parse(msg.payloadString);
        } catch (e) {
            console.log('error:', e);
        }
        mqx.Elements.rxSpan.textContent = (mqx.rx += 1);
        if(mqx.rx > mqx.tx) {
            mqx.tx = mqx.rx;
            mqx.Elements.txSpan.textContent = mqx.tx;
        }
        mqx.Elements.dtSpan.textContent = (mqx.tx - mqx.rx);
        mqx.Elements.circle.style.left = pos.x + 'px';
        mqx.Elements.circle.style.top = pos.y + 'px';
    };

    MQExample.prototype.init = function() {
        mqx.ssid = window.location.hash.substr(1);

        mqx.connection = new Paho.MQTT.Client('performance.iot-dsa.org', 8091, 'followme-1' + new Date().getTime());
        mqx.connection.onMessageArrived = mqx.messageReceived;
        mqx.connection.onConnectionLost = function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
                console.log(responseObject);
            }
        };

        mqx.connection.connect({onSuccess: mqx.clientConnected});
    };

    return MQExample;
})();

MQ_BODY.addEventListener('inittrials', function () {
    var mqExample = new MQExample();
});
