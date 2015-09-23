// the URL of the WAMP Router (Crossbar.io)
//
var wsuri = "ws://demo.crossbar.io:8080";

// the WAMP connection to the Router
//
var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});

var connection2 = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});

var circle = document.getElementById('cbcircle');

// Topic
var topic = "com.dglogik.circles";
// fired when connection is established and session attached
connection.onopen = function (session, details) {
    console.log("Connected");

    // SUBSCRIBE to a topic and receive events
    //
    function on_updated (args, kwargs, details) {
        var pos = args[0];
        circle.style.left = pos.x + 'px';
        circle.style.top = pos.y + 'px';
    }
    session.subscribe(topic, on_updated).then(
        function (sub) {
            console.log('subscribed to topic: ', topic, sub);
        },
        function (err) {
            console.log('failed to subscribe to topic: ', topic, err);
        }
    );

};

// fired when connection was lost (or could not be established)
//
connection2.onclose = function (reason, details) {
    console.log("Connection lost: " + reason);
};

connection2.onopen = function(session, details) {
    // PUBLISH an event every second
    var body = document.querySelector('html');
    body.onmousemove = function(event) {
        var pos = {x : event.pageX, y : event.pageY};
        session.publish(topic, [pos], {}, {acknowledge: true}).then(
            function(pub) {

            },
            function(err) {
                console.log('pub error:', err);
            }
        );
    };

};
// now actually open the connection
//
connection.open();
connection2.open();

