import type { Context } from './context';
import type {
  BoilupAction,
  BoilupPostWriteMethodParams,
  CollectedData,
} from './types';

export async function postWrite(
  this: Context,
  actions: BoilupAction[],
  data: CollectedData,
) {
  for (const action of actions) {
    const postWriteParams: BoilupPostWriteMethodParams<any> = {
      files: this.files,
      context: this,
      fullData: data,
      data: data[action.name],
    };

    if (!action.postWrite) {
      // logger.debug(`No postWrite function for ${colors.bold(action.name)} action.`)
      continue;
    }

    await action.postWrite(postWriteParams);

    // logger.debug(`Executed postWrite function for ${colors.bold(action.name)} action.`)
  }
}
