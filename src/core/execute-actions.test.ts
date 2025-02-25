import { ok, strictEqual } from 'node:assert';
import { describe, test } from 'node:test';
import { createAction } from '../../test/create-action';
import { createContext } from '../../test/create-context';
import { executeActions } from './execute-actions';

describe('executeActions', () => {
  const context = createContext();

  test('Should execute action if canExecuteAction returns true', async () => {
    let executed = false;
    const action = createAction({
      canExecuteAction: async () => true,
      action: async () => {
        executed = true;
      },
    });

    await executeActions.call(context, [action], {});

    ok(executed);
  });

  test('Should skip action if canExecuteAction returns false', async () => {
    let executed = false;
    const action = createAction({
      canExecuteAction: async () => false,
      action: async () => {
        executed = true;
      },
    });

    await executeActions.call(context, [action], {});

    ok(!executed);
  });

  test('Should execute multiple actions', async () => {
    let executed1 = false;
    let executed2 = false;
    const action1 = createAction({
      action: async () => {
        executed1 = true;
      },
    });
    const action2 = createAction({
      action: async () => {
        executed2 = true;
      },
    });

    await executeActions.call(context, [action1, action2], {});

    ok(executed1);
    ok(executed2);
  });

  test('Should pass correct parameters to action', async () => {
    const data: Record<string, any> = {};
    const actionData = { key: 'value' };
    const action = createAction({
      action: async (params) => {
        strictEqual(params.data, actionData);
        strictEqual(params.fullData, data);
      },
    });

    data[action.name] = actionData;
    await executeActions.call(context, [action], data);
  });
});
