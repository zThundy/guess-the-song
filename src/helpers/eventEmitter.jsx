class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    if (this.events[event].includes(listener)) console.warn(`[EventEmitter] Listener already registered for event: ${event}`);
    else console.debug(`[EventEmitter] Adding listener for event: ${event}`);
    this.events[event].push(listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    console.debug(`[EventEmitter] Removing listener for event: ${event}`);
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    console.debug(`[EventEmitter] Emitting event: ${event} with args:`, args);
    this.events[event].forEach(listener => listener(...args));
  }
}

const eventEmitter = new EventEmitter();
export const useEventEmitter = () => {
  return eventEmitter;
};