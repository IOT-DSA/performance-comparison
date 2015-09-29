var CB_BODY = document.querySelector('body');

var CrossbarExample = (function() {
    var cbx;
    function CrossbarExample() {
        cbx = this;
        // the URL of the WAMP Router (Crossbar.io)
        this.wsuri = "ws://performance.iot-dsa.org:8095/ws";
        this.tx = 0;
        this.rx = 0;
        this.lastMsgTime = 0;
        this.Elements = {};
        this.Elements.circle = document.getElementById('cbcircle');
        this.Elements.txSpan = document.getElementById('cbmettx');
        this.Elements.rxSpan = document.getElementById('cbmetrx');
        this.Elements.dtSpan = document.getElementById('cbmetdt');
        this.Elements.mps = document.getElementById('cbmps');
        this.rxConnection = null;
        this.txConnection = null;
        this.ssid = '';
        this.PER_SECOND = 1000;

        var hash = window.location.hash;
        if(!hash) {
            window.addEventListener('hashchange', this.init);
        } else {
            this.init();
        }
    }

    CrossbarExample.prototype.init = function() {
        var hash = window.location.hash.substr(1);
        cbx.rxConnection = new autobahn.Connection({ url: cbx.wsuri, realm: "realm1" });
        cbx.txConnection = new autobahn.Connection({ url: cbx.wsuri, realm: "realm1" });

        cbx.ssid = 'com.dglogik.circles-' + hash;

        cbx.rxConnection.onopen = function (session, details) {
            // SUBSCRIBE to a topic and receive events
            function on_updated(args, kwargs, details) {
                var pos = args[0];
                cbx.Elements.circle.style.left = pos.x + 'px';
                cbx.Elements.circle.style.top = (pos.y + 10) + 'px';
                cbx.Elements.rxSpan.textContent = (cbx.rx += 1);
                if(cbx.rx > cbx.tx) {
                    cbx.tx = cbx.rx;
                    cbx.Elements.txSpan.textContent = cbx.tx;
                }
                cbx.Elements.dtSpan.textContent = (cbx.tx - cbx.rx);

                if(cbx.lastMsgTime === 0) {
                    cbx.lastMsgTime = window.performance.now();
                }

                if(cbx.rx % 10 === 0) {
                    var now = window.performance.now();
                    var delta = now - cbx.lastMsgTime;
                    cbx.lastMsgTime = now;
                    cbx.Elements.mps.textContent = ((cbx.PER_SECOND / delta) * 10).toFixed(2);
                }
            }

            session.subscribe(cbx.ssid, on_updated).then(
                function (sub) {
                },
                function (err) {
                    console.log('failed to subscribe to topic: ', topic, err);
                }
            );
        };

        cbx.txConnection.onopen = function (session, details) {
            function mouseMoved(event) {
                var pos = {x: event.pageX, y: event.pageY};
                session.publish(cbx.ssid, [pos], {}, {acknowledge: true}).then(
                    function (pub) {
                    },
                    function (err) {
                        console.log('pub error:', err);
                    }
                );
                cbx.Elements.txSpan.textContent = (cbx.tx += 1);
                cbx.Elements.dtSpan.textContent = (cbx.tx - cbx.rx);
            }
            CB_BODY.addEventListener('appready', function() {
                console.log('AppReady Received from: Crossbar');
                CB_BODY.addEventListener('mousemove', mouseMoved);
            });

            CB_BODY.dispatchEvent(new CustomEvent('trialready', { detail: {trial: 'crossbar'}}));
        };

        cbx.rxConnection.open();
        cbx.txConnection.open();
    };

    return CrossbarExample;
})();

CB_BODY.addEventListener('inittrials', function () {
    var cbExample = new CrossbarExample();
});