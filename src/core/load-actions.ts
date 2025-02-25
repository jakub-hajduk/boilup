import type { Context } from './context';
import type { BoilupAction, BoilupCanLoadMethodParams } from './types';

export async function loadActions(
  this: Context,
  actions: BoilupAction[] = [],
): Promise<BoilupAction[]> {
  const loadedActions = [];

  for (const action of actions) {
    const canLoadParameters: BoilupCanLoadMethodParams = {
      files: this.files,
      actions,
      context: this,
    };

    if (action.canLoad && (await action.canLoad(canLoadParameters)) === false) {
      // logger.debug(`skipped: ${colors.bold(action.name)} (canLoad returned false).`)
      continue;
    }

    loadedActions.push(action);
    // logger.debug(`Loaded ${colors.bold(action.name)} action`)

    if (action.subActions && action.subActions.length > 0) {
      // logger.debug(`Found ${action.subActions.length} subAction in ${colors.bold(action.name)} action.`)
      const submodules = await loadActions.call(this, action.subActions);
      loadedActions.push(...submodules);
    }
  }

  return loadedActions;
}
