import "dart:html";
import 'dart:async';

import "package:dslink/browser.dart";

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

  StorageExample() {
    _body = querySelector('body');
    _circle = querySelector('#dgcircle');
    _txSpan = querySelector('#dgmettx');
    _rxSpan = querySelector('#dgmetrx');
    _dtSpan = querySelector('#dgmetdt');
    _tx = 0;
    _rx = 0;
  }

  Future init() async {
    var brokerUrl = await BrowserUtils.fetchBrokerUrlFromPath('broker_url',
        'http://performance.iot-dsa.org/conn');
    link = new LinkProvider(brokerUrl,
        'Browser-', isResponder: false);

    await link.connect();

    _req = await link.onRequesterReady;
    _req.subscribe('/downstream/store/pos', bothUpdated, 3);

    _body.onMouseMove.listen(mouseMoved);
  }

  void bothUpdated(ValueUpdate update) {
    _circle.style.left = '${update.value['x']}px';
    _circle.style.top = '${update.value['y'] - 10}px';
    _rxSpan.text = '${++_rx}';
    _dtSpan.text = '${_tx - _rx}';
  }

  void mouseMoved(MouseEvent event) {
    var pos = {'x' : event.page.x, 'y': event.page.y };
    _req.set('/downstream/store/pos', pos);
    _txSpan.text = '${++_tx}';
    _dtSpan.text = '${_tx - _rx}';
  }
}

main() async {
  var se = new StorageExample();
  se.init();
}