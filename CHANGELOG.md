# Changelog

## 0.8.4

- Added Kafka Example

## 0.8.3

- Add HiveMQ Example

## 0.8.2

- Convert MPS calculation to be over duration than between messages

## 0.8.1

- Fix to prevent empty hash

## 0.8.0

- Use start button to trigger loading and provide status.

## 0.7.1

- Fix issue with streaming starting before all examples loaded

## 0.7.0

- Report messages received per second (averaged over 10 messages).

## 0.6.0

* Trigger events so all examples have time to initialize first, then
they can all start sending events at the same time.

## 0.5.2

- Balancing received data with transmitted if not currently transmitting.

## 0.5.1

- Fix bug in PubNub sample not starting on new session.
- Use a data store for DSA instead of storage link.

## 0.5.0

- Use sessions now (via location hash). If no session is provided
a new session is created automagically.

## 0.4.8

- Added delta values to metrics

## 0.4.7

- Add metrics to page

## 0.4.6

- Offset crossbar and dsa bubbles to give some spacial disparity

## 0.4.5

- Update Crossbar to add event listener like other samples

## 0.4.4

- Update QOS default values for MQTT and DSA

## 0.4.3

- Migrate crossbar to server.

## 0.4.2

- Start migrating to the server
- Bugfixes for MQTT sample.

## 0.4.0

- Added MQTT sample

## 0.3.0

- Added PubNub sample.

## 0.2.0

- Added crossbar.io sample

## 0.1.0

- Initial version with dsa.

## 0.0.1

- Initial version
