import { EventEmitter } from 'events';

// This prevents Next.js from creating a new emitter every time you save a file
const globalForEvents = global as unknown as { eventEmitter: EventEmitter };

export const globalEvents = globalForEvents.eventEmitter || new EventEmitter();
// export const globalEvents = new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventEmitter = globalEvents;
}