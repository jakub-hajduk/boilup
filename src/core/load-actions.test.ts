import { ok } from 'node:assert';
import { describe, test } from 'node:test';
import { createAction } from '../../test/create-action';
import { createContext } from '../../test/create-context';
import { loadActions } from './load-actions';
import { run } from './run';
import type { BoilupAction } from './types';

const isActionLoaded = (output: BoilupAction[], action: BoilupAction) => {
  return !!output.find((a) => a.name === action.name);
};

describe('loadActions', async () => {
  const context = createContext();

  test('Should load action if no canLoad is not defined', async () => {
    const action = createAction();

    const output = await loadActions.call(context, [action]);

    ok(output.length === 1);
    ok(isActionLoaded(output, action));
  });

  test('Should load action if canLoad returns true ', async () => {
    const action = createAction({
      canLoad: async () => true,
    });

    const output = await loadActions.call(context, [action]);

    ok(output.length === 1);
    ok(isActionLoaded(output, action) === true);
  });

  test('Should load subActions if canLoad not defined', async () => {
    const subAction = createAction();
    const action = createAction({
      subActions: [subAction],
    });

    const output = await loadActions.call(context, [action]);

    ok(output.length === 2);
    ok(isActionLoaded(output, action));
    ok(isActionLoaded(output, subAction));
  });

  test('Should load subActions if canLoad returns true', async () => {
    const subAction = createAction();
    const action = createAction({
      canLoad: async () => true,
      subActions: [subAction],
    });

    const output = await loadActions.call(context, [action]);

    ok(output.length === 2);
    ok(isActionLoaded(output, action));
    ok(isActionLoaded(output, subAction));
  });

  test('should not load action if canLoad returns false', async () => {
    const action: BoilupAction = createAction({
      canLoad: async () => false,
    });

    const output = await loadActions.call(context, [action]);

    ok(output.length === 0);
    ok(!isActionLoaded(output, action));
  });

  test('Should not load subActions if canLoad returns false', async () => {
    const subAction = createAction();
    const action: BoilupAction = createAction({
      subActions: [subAction],
      canLoad: async () => false,
    });

    const output = await loadActions.call(context, [action]);

    ok(output.length === 0);
    ok(!isActionLoaded(output, action));
    ok(!isActionLoaded(output, subAction));
  });
});
