var mqcircle = document.getElementById('mqttcircle');

var mqclient = new Paho.MQTT.Client('performance.iot-dsa.org', 8091, 'followme-1' + new Date().getTime());
mqclient.onMessageArrived = function(msg) {
    try {
        var pos = JSON.parse(msg.payloadString);
    } catch (e) {
        console.log('error:', e);
    }
    mqcircle.style.left = pos.x + 'px';
    mqcircle.style.top = pos.y + 'px';
};
mqclient.onConnectionLost = function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
        console.log(responseObject);
        body.removeEventListener('mousemove', bodyListener);
    }
};

function clientConnected() {
    mqclient.subscribe('/com.dglux.followme');
    var body = document.querySelector('body');

    body.addEventListener('mousemove', bodyListener);
}
 function bodyListener(event) {
     var pos = {x : event.pageX, y : event.pageY};
     var message = new Paho.MQTT.Message(JSON.stringify(pos));
     message.destinationName = '/com.dglux.followme';
     mqclient.send(message);
 }

mqclient.connect({onSuccess: clientConnected});

