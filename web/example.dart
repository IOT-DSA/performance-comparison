import "dart:html";
import 'dart:async';
import 'dart:math';

import "package:dslink/browser.dart";
import "package:crypto/crypto.dart";

class StorageExample {
  BodyElement _body;
  DivElement _circle;
  SpanElement _txSpan;
  SpanElement _rxSpan;
  SpanElement _dtSpan;
  num _tx;
  num _rx;
  LinkProvider link;
  Requester _req;
  String hash;
  String _node;

  StorageExample(this.hash) {
    _node = '/data/follow/$hash';
    _body = querySelector('body');
    _circle = querySelector('#dgcircle');
    _txSpan = querySelector('#dgmettx');
    _rxSpan = querySelector('#dgmetrx');
    _dtSpan = querySelector('#dgmetdt');
    _tx = 0;
    _rx = 0;
  }

  Future init() async {
    print('Initializing');
    var brokerUrl = await BrowserUtils.fetchBrokerUrlFromPath('broker_url',
        'http://performance.iot-dsa.org:8080/conn');
    link = new LinkProvider(brokerUrl,
        'Browser-', isResponder: false);

    await link.connect();
    _req = await link.onRequesterReady;
//    var nd = await _req.getRemoteNode('/downstream/store');
//    if(!nd.children.keys.contains(hash)) {
//      var _ = await _req.invoke('/downstream/store/Create_Entry',
//          {r'name' : hash, r'type' : 'Map', r'editor' : 'none'})
//          .drain();
//      _ = await _req.set('/downstream/store/$hash', { 'x' : 0, 'y' : 0});
//    }
    _req.subscribe(_node, bothUpdated, 3);

    _body.onMouseMove.listen(mouseMoved);
  }

  void bothUpdated(ValueUpdate update) {
    _circle.style.left = '${update.value['x']}px';
    _circle.style.top = '${update.value['y'] - 10}px';
    _rxSpan.text = '${++_rx}';
    if(_rx > _tx) {
      _tx = _rx;
      _txSpan.text = '$_tx';
    }
    _dtSpan.text = '${_tx - _rx}';
  }

  void mouseMoved(MouseEvent event) {
    var pos = {'x' : event.page.x, 'y': event.page.y };
    _req.set(_node, pos);
    _txSpan.text = '${++_tx}';
    _dtSpan.text = '${_tx - _rx}';
  }
}

class ManageSession {
  final MAX_SIZE = 10000;
  final LIST_SIZE = 10;
  String _hash;
  StorageExample se;

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
    se.init();
  }
}

main() async {
  var ms = new ManageSession();
}