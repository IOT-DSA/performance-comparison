// the URL of the WAMP Router (Crossbar.io)
//
var wsuri = "ws://performance.iot-dsa.org:8095/ws";
var cbtx = 0;
var cbrx = 0;
var cbtxspan = document.getElementById('cbmettx');
var cbrxspan = document.getElementById('cbmetrx');
var cbdtspan = document.getElementById('cbmetdt');

var hash = window.location.hash;
if(!hash) {
    window.addEventListener('hashchange', startcb);
} else {
    startcb();
}

function startcb() {
    hash = window.location.hash.substr(1);
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
    var topic = "com.dglogik.circles" + hash;
// fired when connection is established and session attached
    connection.onopen = function (session, details) {
        console.log("Connected");

        // SUBSCRIBE to a topic and receive events
        //
        function on_updated(args, kwargs, details) {
            var pos = args[0];
            circle.style.left = pos.x + 'px';
            circle.style.top = (pos.y + 10) + 'px';
            cbrxspan.textContent = ++cbrx;
            cbdtspan.textContent = (cbtx - cbrx);
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

    connection2.onopen = function (session, details) {
        // PUBLISH an event every second
        var body = document.querySelector('body');
        body.addEventListener('mousemove', function (event) {
            var pos = {x: event.pageX, y: event.pageY};
            session.publish(topic, [pos], {}, {acknowledge: true}).then(
                function (pub) {
                    cbtxspan.textContent = ++cbtx;
                    cbdtspan.textContent = (cbtx - cbrx);
                },
                function (err) {
                    console.log('pub error:', err);
                }
            );
        });

    };
// now actually open the connection
//
    connection.open();
    connection2.open();
}

