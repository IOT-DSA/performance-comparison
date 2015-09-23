import "dart:html";
import 'dart:async';

import "package:dslink/browser.dart";

class MyExample {
  BodyElement _body;
  DivElement _circle;
  LinkProvider link;
  Requester _req;

  MyExample() {
    _body = querySelector('body');
    _circle = querySelector('#dgcircle');
  }

  Future init() async {
    var brokerUrl = await BrowserUtils.fetchBrokerUrlFromPath('broker_url',
        'http://localhost:8080/conn');
    link = new LinkProvider(brokerUrl,
        'Browser-', isResponder: false);

    await link.connect();

    _req = await link.onRequesterReady;
    _req.subscribe('/downstream/store/pos', bothUpdated);

    _body.onMouseMove.listen(mouseMoved);
  }

  void bothUpdated(ValueUpdate update) {
    _circle.style.left = '${update.value['x']}px';
    _circle.style.top = '${update.value['y']}px';
  }

  void mouseMoved(MouseEvent event) {
    var pos = {'x' : event.page.x, 'y': event.page.y };
    _req.set('/downstream/store/pos', pos);
  }
}

main() async {
  var example = new MyExample();
  example.init();
}