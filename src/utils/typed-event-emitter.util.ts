import EventEmitter from 'node:events';

export class TypedEmitter<T extends Record<string, any>> {
  emitter = new EventEmitter();

  on<E extends keyof T>(name: E, listener: (payload: T[E]) => void) {
    this.emitter.on(name as string, listener);
  }

  off<E extends keyof T>(name: E, listener: (payload: T[E]) => void) {
    this.emitter.off(name as string, listener);
  }

  emit<E extends keyof T>(name: E, payload: T[E]): boolean {
    return this.emitter.emit(name as string, payload as any[]);
  }

  once<E extends keyof T>(name: E, listener: (payload: T[E]) => void) {
    this.emitter.once(name as string, listener);
  }
}
