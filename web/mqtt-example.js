var mqcircle = document.getElementById('mqttcircle');
var mqtx = 0;
var mqrx = 0;
var mqtxspan = document.getElementById('mqmettx');
var mqrxspan = document.getElementById('mqmetrx');
var mqdtspan = document.getElementById('mqmetdt');
var hash = window.location.hash;

if(!hash) {
    window.addEventListener('hashchange', startmq);
} else {
    startmq();
}
function startmq() {
    hash = window.location.hash.substr(1);
    var mqclient = new Paho.MQTT.Client('performance.iot-dsa.org', 8091, 'followme-1' + new Date().getTime());

    mqclient.onMessageArrived = function (msg) {
        try {
            var pos = JSON.parse(msg.payloadString);
        } catch (e) {
            console.log('error:', e);
        }
        mqrxspan.textContent = ++mqrx;
        mqdtspan.textContent = (mqtx - mqrx);
        mqcircle.style.left = pos.x + 'px';
        mqcircle.style.top = pos.y + 'px';
    };
    mqclient.onConnectionLost = function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
            console.log(responseObject);
            body.removeEventListener('mousemove', bodyListener);
        }
    };

    function clientConnected() {
        mqclient.subscribe('/com.dglux.followme'+hash);
        var body = document.querySelector('body');

        body.addEventListener('mousemove', bodyListener);
    }

    function bodyListener(event) {
        var pos = {x: event.pageX, y: event.pageY};
        var message = new Paho.MQTT.Message(JSON.stringify(pos));
        message.destinationName = '/com.dglux.followme' + hash;
        message.qos = 0;
        mqclient.send(message);
        mqtxspan.textContent = ++mqtx;
        mqdtspan.textContent = (mqtx - mqrx);
    }

    mqclient.connect({onSuccess: clientConnected});
}
