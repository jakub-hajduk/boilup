import { colors } from 'consola/utils'
import type { Context } from './context'
import type { CollectedData, BoilupAction } from './types'

export async function collectData(context: Context, actions: BoilupAction[] = []) {
  const collectedData: CollectedData = {}

  for(const action of actions) {
    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    if (action.canCollectData && await action.canCollectData(collectedData, subContext) === false) {
      logger.debug(`Skipping collecting data for ${colors.bold(action.name)} action (canPrompt returned false).`)
      continue
    }

    if (!action.collectData) {
      logger.debug(`No collectData function for ${colors.bold(action.name)} action.`)
      continue
    }

    const answers = await action.collectData(collectedData, subContext)

    logger.debug(`Collected ${Object.keys(answers).length} data from ${colors.bold(action.name)} action.`)

    collectedData[action.name] = answers
  }


  return collectedData
}
