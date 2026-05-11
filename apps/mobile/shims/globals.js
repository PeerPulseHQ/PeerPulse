// Must be the first import in index.js — patches Hermes globals before
// any libp2p module is loaded.
//
// Pattern adapted from ipfs-shipyard/js-libp2p-react-native (their globals.js)
// which is the reference working setup for libp2p in a React Native app.

// 1. process.version — set BEFORE any other import.  Some packages read it
//    at module-init time (e.g. @peculiar/webcrypto).
globalThis.process            = globalThis.process ?? {};
globalThis.process.env        = globalThis.process.env ?? {};
globalThis.process.version    = 'v22.0.0';
globalThis.process.nextTick   = globalThis.process.nextTick ?? queueMicrotask;

// 2. crypto.getRandomValues
import 'react-native-get-random-values';

// 3. WeakMap (Hermes has it, polyfill guards older runtimes)
import 'weakmap-polyfill';

// 4. Event / EventTarget / CustomEvent.
//    Hermes in RN 0.83 does NOT expose these on globalThis at module-load time,
//    so any `class Foo extends globalThis.Event` would explode with
//    "Super expression must either be null or a function".
//    event-target-shim v6 has a static getter for Event.NONE and then tries
//    to Object.defineProperty it as enumerable — Hermes rejects with
//    "Cannot assign to read-only property NONE".
//    So we hand-roll minimal versions that libp2p's gossip/event code needs.
if (!globalThis.Event) {
  globalThis.Event = class Event {
    constructor(type, init) {
      this.type             = type;
      this.bubbles          = init?.bubbles ?? false;
      this.cancelable       = init?.cancelable ?? false;
      this.composed         = init?.composed ?? false;
      this.defaultPrevented = false;
      this.timeStamp        = Date.now();
      this.target           = null;
      this.currentTarget    = null;
    }
    preventDefault()           { if (this.cancelable) this.defaultPrevented = true; }
    stopPropagation()          { this._propagationStopped = true; }
    stopImmediatePropagation() { this._propagationStopped = true; this._immediateStopped = true; }
  };
}

if (!globalThis.CustomEvent) {
  globalThis.CustomEvent = class CustomEvent extends globalThis.Event {
    constructor(type, init) {
      super(type, init);
      this.detail = init?.detail;
    }
  };
}

if (!globalThis.EventTarget) {
  globalThis.EventTarget = class EventTarget {
    constructor() { this.__listeners = new Map(); }
    addEventListener(type, listener) {
      if (typeof listener !== 'function' && typeof listener?.handleEvent !== 'function') return;
      if (!this.__listeners.has(type)) this.__listeners.set(type, new Set());
      this.__listeners.get(type).add(listener);
    }
    removeEventListener(type, listener) {
      this.__listeners.get(type)?.delete(listener);
    }
    dispatchEvent(event) {
      event.target = event.currentTarget = this;
      const set = this.__listeners.get(event.type);
      if (set) {
        for (const l of set) {
          if (event._immediateStopped) break;
          try {
            (typeof l === 'function' ? l : l.handleEvent).call(this, event);
          } catch (e) { setTimeout(() => { throw e; }, 0); }
        }
      }
      return !event.defaultPrevented;
    }
  };
}

// 5. AbortSignal.timeout / throwIfAborted (libp2p v3 internals expect these).
if (!globalThis.AbortSignal.timeout) {
  globalThis.AbortSignal.timeout = (ms) => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new Error('Aborted')), ms);
    return ctrl.signal;
  };
}
if (!globalThis.AbortSignal.prototype.throwIfAborted) {
  globalThis.AbortSignal.prototype.throwIfAborted = function () {
    if (this.aborted) throw new Error('Aborted');
  };
}

// 6. Buffer
import { Buffer } from '@craftzdog/react-native-buffer';
globalThis.Buffer = globalThis.Buffer ?? Buffer;

// 7. crypto.subtle — react-native-quick-crypto covers ~60% of Node's crypto API
//    but not the full Web Crypto subtle interface.  @peculiar/webcrypto fills
//    the gap for libp2p's noise protocol.
import { Crypto as PeculiarCrypto } from '@peculiar/webcrypto';
globalThis.crypto        = globalThis.crypto ?? {};
globalThis.crypto.subtle = globalThis.crypto.subtle ?? new PeculiarCrypto().subtle;

// 8. TextEncoder / TextDecoder
import { TextEncoder, TextDecoder } from 'text-encoding';
if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;

// 9. setImmediate
if (!globalThis.setImmediate) {
  globalThis.setImmediate = (fn, ...args) => setTimeout(() => fn(...args), 0);
}

// 10. Promise.withResolvers — used in libp2p v2.x+ internals
if (!Promise.withResolvers) {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}
