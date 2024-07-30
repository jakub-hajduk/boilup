import { colors } from 'consola/utils'
import type { Context } from './context'
import type {
  CollectedData,
  BoilupAction,
  BoilupCanCollectDataMethodParams,
  BoilupCollectDataMethodParams
} from './types'

export async function collectData(context: Context, actions: BoilupAction[] = []) {
  const collectedData: CollectedData = {}

  for(const action of actions) {
    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    const canCollectDataParams: BoilupCanCollectDataMethodParams = {
      files: context.files,
      logger: context.logger,
      context: context,
      upToNowData: collectedData
    }

    if (action.canCollectData && await action.canCollectData(canCollectDataParams) === false) {
      logger.debug(`Skipping collecting data for ${colors.bold(action.name)} action (canCollectData returned false).`)
      continue
    }

    if (!action.collectData) {
      logger.debug(`No collectData function for ${colors.bold(action.name)} action.`)
      continue
    }

    const collectDataParams: BoilupCollectDataMethodParams = {
      files: context.files,
      logger: context.logger,
      context: context,
      upToNowData: collectedData
    }

    const answers = await action.collectData(collectDataParams)

    logger.debug(`Collected ${Object.keys(answers).length} data from ${colors.bold(action.name)} action.`)

    collectedData[action.name] = answers
  }

  return collectedData
}
