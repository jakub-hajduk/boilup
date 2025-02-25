import type { Context } from './context';
import type {
  BoilupAction,
  BoilupActionMethodParams,
  BoilupCanExecuteMethodParams,
  CollectedData,
} from './types';

export async function executeActions(
  this: Context,
  actions: BoilupAction[],
  data: CollectedData,
) {
  for (const action of actions) {
    const canExecuteActionParams: BoilupCanExecuteMethodParams = {
      files: this.files,
      context: this,
      fullData: data,
    };

    if (
      action.canExecuteAction &&
      (await Promise.resolve(
        action.canExecuteAction(canExecuteActionParams),
      )) === false
    ) {
      // logger.debug(`Skipping execution for ${colors.bold(action.name)} action (canExecuteAction returned false).`)
      continue;
    }

    if (!action.action) {
      // logger.debug(`No execute for ${colors.bold(action.name)} action.`)
      continue;
    }

    const executeActionParams: BoilupActionMethodParams<any> = {
      files: this.files,
      context: this,
      actions,
      data: data[action.name],
      fullData: data,
    };

    await Promise.resolve(action.action(executeActionParams));
    // logger.debug(`Executed ${colors.bold(action.name)} action.`)
  }
}
