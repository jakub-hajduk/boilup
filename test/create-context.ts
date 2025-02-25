import type { Writepool } from 'writepool';
import type { Context } from '../src';

export const createContext = (): Context => {
  return {
    cwd: './',
    options: {},
    name: 'hello',
    files: {
      write: () => {},
    } as unknown as Writepool,
  };
};
