'use strict';

// Patched copy of react-native/src/private/webapis/dom/events/Event.js.
//
// Upstream bug in RN 0.83.6: the module sets Event.prototype.NONE via
//
//   Object.defineProperty(Event.prototype, 'NONE', { enumerable: true, value: 0 })
//
// with missing `writable`/`configurable` defaulting to false. The constructor
// then does `this.NONE = void 0` which throws "Cannot assign to read-only
// property 'NONE'" in strict mode on every `new Event(...)`.
//
// We define the same shape but with writable: true so the constructor's
// instance-shadowing assignment succeeds.

Object.defineProperty(exports, '__esModule', { value: true });

const EventInternals = require('react-native/src/private/webapis/dom/events/internals/EventInternals');
const PlatformObjects = require('react-native/src/private/webapis/webidl/PlatformObjects');

class Event {
  constructor(type, options) {
    if (arguments.length < 1) {
      throw new TypeError("Failed to construct 'Event': 1 argument required, but only 0 present.");
    }
    const typeOfOptions = typeof options;
    if (options != null && typeOfOptions !== 'object' && typeOfOptions !== 'function') {
      throw new TypeError("Failed to construct 'Event': The provided value is not of type 'EventInit'.");
    }

    this._type = String(type);
    this._bubbles = Boolean(options?.bubbles);
    this._cancelable = Boolean(options?.cancelable);
    this._composed = Boolean(options?.composed);
    this._defaultPrevented = false;
    this._timeStamp = performance.now();
    this[EventInternals.COMPOSED_PATH_KEY] = [];
    this[EventInternals.CURRENT_TARGET_KEY] = null;
    this[EventInternals.EVENT_PHASE_KEY] = 0;
    this[EventInternals.IN_PASSIVE_LISTENER_FLAG_KEY] = false;
    this[EventInternals.IS_TRUSTED_KEY] = false;
    this[EventInternals.STOP_IMMEDIATE_PROPAGATION_FLAG_KEY] = false;
    this[EventInternals.STOP_PROPAGATION_FLAG_KEY] = false;
    this[EventInternals.TARGET_KEY] = null;
  }

  get bubbles()          { return this._bubbles; }
  get cancelable()       { return this._cancelable; }
  get composed()         { return this._composed; }
  get currentTarget()    { return EventInternals.getCurrentTarget(this); }
  get defaultPrevented() { return this._defaultPrevented; }
  get eventPhase()       { return EventInternals.getEventPhase(this); }
  get isTrusted()        { return EventInternals.getIsTrusted(this); }
  get target()           { return EventInternals.getTarget(this); }
  get timeStamp()        { return this._timeStamp; }
  get type()             { return this._type; }

  composedPath() {
    return EventInternals.getComposedPath(this).slice();
  }

  preventDefault() {
    if (this._cancelable && !EventInternals.getInPassiveListenerFlag(this)) {
      this._defaultPrevented = true;
    }
  }

  stopImmediatePropagation() {
    EventInternals.setStopPropagationFlag(this, true);
    EventInternals.setStopImmediatePropagationFlag(this, true);
  }

  stopPropagation() {
    EventInternals.setStopPropagationFlag(this, true);
  }
}

// Writable constants — the upstream bug is the missing `writable: true` here.
const phases = { NONE: 0, CAPTURING_PHASE: 1, AT_TARGET: 2, BUBBLING_PHASE: 3 };
for (const [name, value] of Object.entries(phases)) {
  Object.defineProperty(Event,           name, { enumerable: true, value, writable: true, configurable: true });
  Object.defineProperty(Event.prototype, name, { enumerable: true, value, writable: true, configurable: true });
}

PlatformObjects.setPlatformObject(Event);

exports.default = Event;
