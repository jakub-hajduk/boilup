import type { BoilupAction } from '../src';

let count = 0;

export const createAction = (
  action: Partial<BoilupAction> = {},
): BoilupAction => {
  const number = ++count;
  return {
    name: `test-action-${number}`,
    description: `test action ( ${number} )`,
    ...action,
  };
};
