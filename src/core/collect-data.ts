import type { Context } from './context';
import type {
  BoilupAction,
  BoilupCanCollectDataMethodParams,
  BoilupCollectDataMethodParams,
  CollectedData,
} from './types';

export async function collectData(this: Context, actions: BoilupAction[] = []) {
  const collectedData: CollectedData = {};

  for (const action of actions) {
    const canCollectDataParams: BoilupCanCollectDataMethodParams = {
      files: this.files,
      context: this,
      upToNowData: collectedData,
    };

    if (
      action.canCollectData &&
      (await action.canCollectData(canCollectDataParams)) === false
    ) {
      // logger.debug(`Skipping collecting data for ${colors.bold(action.name)} action (canCollectData returned false).`)
      continue;
    }

    if (!action.collectData) {
      // logger.debug(`No collectData function for ${colors.bold(action.name)} action.`)
      continue;
    }

    const collectDataParams: BoilupCollectDataMethodParams = {
      files: this.files,
      context: this,
      upToNowData: collectedData,
    };

    const answers = await action.collectData(collectDataParams);

    // logger.debug(`Collected ${Object.keys(answers).length} data from ${colors.bold(action.name)} action.`)

    collectedData[action.name] = answers;
  }

  return collectedData;
}
