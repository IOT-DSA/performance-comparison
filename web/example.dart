library dsa.example;

import "dart:html";
import 'dart:async';
import 'dart:math';
import 'dart:convert';

import "package:dslink/browser.dart";
import "package:crypto/crypto.dart";

/// BodyElement to dispatch and listen to events.
final BodyElement BODY = querySelector('body');

/// Class manages unique session IDs and checks that all
/// samples are loaded before signaling the beginning of the tests
class ManageSession {
  static const TOTAL_TRIALS = 1;
  final MAX_SIZE = 10000;
  final LIST_SIZE = 10;
  String _hash;
  StorageExample se;

  int _messagesReceived = 0;

  ManageSession() {
    var hash = window.location.hash;
    if(hash.isEmpty) {
      var list = new List<int>(LIST_SIZE);
      var rnd = new Random(new DateTime.now().millisecond);
      for(var i = 0; i < LIST_SIZE; i++) {
        list[i] = rnd.nextInt(MAX_SIZE);
      }
      hash = CryptoUtils.bytesToHex(list);
      window.location.hash = hash;
    } else {
      hash = Uri.encodeQueryComponent(hash.substring(1));
    }
    se = new StorageExample(hash);
    BODY.on['trialready'].listen(prepTrials);
    BODY.dispatchEvent(new CustomEvent('inittrials'));
    se.init();
  }

  void prepTrials(CustomEvent e) {
    _messagesReceived += 1;
    print('Ready from: ${e.detail['trial']}');
    if(_messagesReceived >= TOTAL_TRIALS) {
      BODY.dispatchEvent(new CustomEvent('appready'));
    }
  }
}

/// DSA sample using data nodes to store values and retreive them.
class StorageExample {
  static const PER_SECOND = 1000.0;
  DivElement _circle;
  SpanElement _txSpan;
  SpanElement _rxSpan;
  SpanElement _dtSpan;
  SpanElement _mpsSpan;
  num _tx;
  num _rx;
  num _lastMessageTime;
  LinkProvider link;
  Requester _req;
  String hash;
  String _node;

  StorageExample(this.hash) {
    _node = '/data/follow/$hash';
    _circle = querySelector('#dgcircle');
    _txSpan = querySelector('#dgmettx');
    _rxSpan = querySelector('#dgmetrx');
    _dtSpan = querySelector('#dgmetdt');
    _mpsSpan = querySelector('#dgmps');
    _tx = 0;
    _rx = 0;
    _lastMessageTime = 0.0;
  }

  Future init() async {
    var brokerUrl = await BrowserUtils.fetchBrokerUrlFromPath('broker_url',
        'http://performance.iot-dsa.org:8080/conn');
    link = new LinkProvider(brokerUrl,
        'Browser-', isResponder: false);

    await link.connect();
    _req = await link.onRequesterReady;
    _req.subscribe(_node, bothUpdated, 3);

    // Listen for start event before sending messages
    BODY.on['appready'].listen((_) {
      print('AppReady Received from: DSA');
      BODY.onMouseMove.listen(mouseMoved);
    });
    BODY.dispatchEvent(
        new CustomEvent('trialready', detail: {'trial' : 'dsa'}));
  }

  void bothUpdated(ValueUpdate update) {
    _circle.style.left = '${(update.value as Map)['x']}px';
    _circle.style.top = '${(update.value as Map)['y'] - 10}px';
    _rxSpan.text = '${++_rx}';
    if(_rx > _tx) {
      _tx = _rx;
      _txSpan.text = '$_tx';
    }
    _dtSpan.text = '${_tx - _rx}';

    if(_lastMessageTime == 0.0) {
      _lastMessageTime = window.performance.now();
    }

    if(_rx % 10 == 0){
      var now = window.performance.now();
      var delta = now - _lastMessageTime;
      _lastMessageTime = now;
      _mpsSpan.text = (PER_SECOND / delta * 10).toStringAsFixed(2);
    }
  }

  void mouseMoved(MouseEvent event) {
    var pos = {'x' : event.page.x, 'y': event.page.y };
    _req.set(_node, pos);
    _txSpan.text = '${++_tx}';
    _dtSpan.text = '${_tx - _rx}';
  }
}

main() async {
  var ms = new ManageSession();
}