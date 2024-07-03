import { colors } from 'consola/utils'
import type { Context } from './context'
import type { CollectedData, BoilupAction } from './types'

export async function postWrite(context: Context, actions: BoilupAction[] = [], data: CollectedData) {
  const phaseContext = context.createSubContext('postWrite')

  for(const action of actions) {
    const subContext = phaseContext.createSubContext(action.name)
    const logger = subContext.logger

    if (!action.postWrite) {
      logger.debug(`No postWrite function for ${colors.bold(action.name)} action.`)
      continue
    }

    await action.postWrite(data[action.name], data, subContext)

    logger.debug(`Executed postWrite function for ${colors.bold(action.name)} action.`)
  }
}
