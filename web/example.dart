library dsa.example;

import "dart:html";
import 'dart:async';
import 'dart:math';

import "package:dslink/browser.dart";
import "package:crypto/crypto.dart";

/// BodyElement to dispatch and listen to events.
final BodyElement BODY = querySelector('body');

/// Class manages unique session IDs and checks that all
/// samples are loaded before signaling the beginning of the tests
class ManageSession {
  static const TOTAL_TRIALS = 6;
  final MAX_SIZE = 10000;
  final LIST_SIZE = 10;
  String _hash;
  StorageExample se;
  ButtonElement _start;

  int _messagesReceived = 0;

  ManageSession() {
    _start = document.querySelector('#start');
    _start.onClick.listen((_) {
      _start..disabled = true
        ..text = 'Loading...';
      BODY.on['trialready'].listen(prepTrials);
      BODY.on['inittrials'].listen((event) {
        se = new StorageExample(_hash);
        se.init();
      });
      BODY.dispatchEvent(new CustomEvent('inittrials'));
    });
    _hash = window.location.hash;
    if(_hash.isEmpty || _hash.substring(1).isEmpty) {
      var list = new List<int>(LIST_SIZE);
      var rnd = new Random(new DateTime.now().millisecond);
      for(var i = 0; i < LIST_SIZE; i++) {
        list[i] = rnd.nextInt(MAX_SIZE);
      }
      _hash = CryptoUtils.bytesToHex(list);
      window.location.hash = _hash;
    } else {
      _hash = Uri.encodeQueryComponent(_hash.substring(1));
    }
  }

  void prepTrials(CustomEvent e) {
    _messagesReceived += 1;
    print('Ready from: ${e.detail['trial']}');
    if(_messagesReceived >= TOTAL_TRIALS) {
      BODY.dispatchEvent(new CustomEvent('appready'));
      _start.text = 'Running';
    }
  }
}

/// DSA sample using data nodes to store values and retreive them.
class StorageExample {
  static const PER_SECOND = 1000.0;
  static const TIME_TO_COUNT = const Duration(seconds: 5);
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
  Timer _msgTimer;

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
        'http://performance.iot-dsa.org:80/conn');
    link = new LinkProvider(brokerUrl,
        'Browser-', isResponder: false);

    await link.connect();
    _req = await link.onRequesterReady;
    _req.subscribe(_node, bothUpdated, 3);

    // Listen for start event before sending messages
    BODY.on['appready'].listen((_) {
      print('AppReady Received from: DSA');
      _msgTimer = new Timer.periodic(TIME_TO_COUNT, countMessages);
      BODY.onMouseMove.listen(mouseMoved);
    });
    BODY.dispatchEvent(
        new CustomEvent('trialready', detail: {'trial' : 'dsa'}));
  }

  void countMessages(Timer _) {
    var delta = _rx - _lastMessageTime;
    _lastMessageTime = _rx;
    _mpsSpan.text = '${delta / 5}';
  }

  void bothUpdated(ValueUpdate update) {
    _circle.style.left = '${(update.value as Map)['x']}px';
    _circle.style.top = '${(update.value as Map)['y'] - 30}px';
    _rxSpan.text = '${++_rx}';
    if(_rx > _tx) {
      _tx = _rx;
      _txSpan.text = '$_tx';
    }
    _dtSpan.text = '${_tx - _rx}';

//    if(_lastMessageTime == 0.0) {
//      _lastMessageTime = window.performance.now();
//    }

//    if(_rx % 10 == 0){
//      var now = window.performance.now();
//      var delta = now - _lastMessageTime;
//      _lastMessageTime = now;
//      _mpsSpan.text = (PER_SECOND / delta * 10).toStringAsFixed(2);
//    }
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