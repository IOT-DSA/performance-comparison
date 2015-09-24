var mqcircle = document.getElementById('mqttcircle');

var mqclient = new Paho.MQTT.Client('test.mosquitto.org', 8080, 'followme-1');
mqclient.onMessageArrived = function(msg) {
    var pos = JSON.parse(msg.payloadString);
    mqcircle.style.left = pos.x + 'px';
    mqcircle.style.top = pos.y + 'px';
};
mqclient.onConnectionLost = function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
    }
}

function clientConnected() {
    mqclient.subscribe('/com.dglux.followme');
    var body = document.querySelector('body');

    body.addEventListener('mousemove', function(event) {
        var pos = {x : event.pageX, y : event.pageY};
        var message = new Paho.MQTT.Message(JSON.stringify(pos));
        message.destinationName = '/com.dglux.followme';
        mqclient.send(message);
    });
}

mqclient.connect({onSuccess: clientConnected});

