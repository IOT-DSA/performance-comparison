import "dart:html";
import 'dart:async';

import "package:dslink/browser.dart";

class StorageExample {
  BodyElement _body;
  DivElement _circle;
  LinkProvider link;
  Requester _req;

  StorageExample() {
    _body = querySelector('body');
    _circle = querySelector('#dgcircle');
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
  }

  void mouseMoved(MouseEvent event) {
    var pos = {'x' : event.page.x, 'y': event.page.y };
    _req.set('/downstream/store/pos', pos);
  }
}

main() async {
  var se = new StorageExample();
  se.init();
}