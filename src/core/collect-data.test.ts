import { deepStrictEqual, ok } from 'node:assert';
import { describe, test } from 'node:test';
import { createAction } from '../../test/create-action';
import { createContext } from '../../test/create-context';
import { collectData } from './collect-data';

describe('collectData', () => {
  const context = createContext();

  test('Should collect data from actions', async () => {
    const action = createAction({
      collectData: async () => ({ key: 'value' }),
    });

    const data = await collectData.call(context, [action]);

    ok(data[action.name]);
    deepStrictEqual(data[action.name], { key: 'value' });
  });

  test('Should skip action if canCollectData returns false', async () => {
    const action = createAction({
      canCollectData: async () => false,
      collectData: async () => ({ key: 'value' }),
    });

    const data = await collectData.call(context, [action]);

    ok(!data[action.name]);
  });

  test('Should skip action if collectData is not defined', async () => {
    const action = createAction();

    const data = await collectData.call(context, [action]);

    ok(!data[action.name]);
  });

  test('Should collect data from multiple actions', async () => {
    const action1 = createAction({
      collectData: async () => ({ key1: 'value1' }),
    });
    const action2 = createAction({
      collectData: async () => ({ key2: 'value2' }),
    });

    const data = await collectData.call(context, [action1, action2]);

    ok(data[action1.name]);
    ok(data[action2.name]);
    deepStrictEqual(data[action1.name], { key1: 'value1' });
    deepStrictEqual(data[action2.name], { key2: 'value2' });
  });

  test('Should merge collected data from actions', async () => {
    const action1 = createAction({
      collectData: async () => ({ key1: 'value1' }),
    });
    const action2 = createAction({
      collectData: async () => ({ key2: 'value2' }),
    });

    const data = await collectData.call(context, [action1, action2]);

    deepStrictEqual(data, {
      [action1.name]: { key1: 'value1' },
      [action2.name]: { key2: 'value2' },
    });
  });
});
