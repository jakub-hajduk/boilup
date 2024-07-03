import { colors } from 'consola/utils'
import type { Context } from './context'
import type { BoilupAction, CollectedData } from './types'

export async function executeActions(context: Context, actions: BoilupAction[], data: CollectedData) {
  for( const action of actions) {
    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    if (action.canExecuteAction && await action.canExecuteAction(data, subContext) === false) {
      logger.debug(`Skipping execution for ${colors.bold(action.name)} action (canExecute returned false).`)
      continue
    }

    if (!action.action) {
      logger.debug(`No execute for ${colors.bold(action.name)} action.`)
      continue
    }

    await action.action(data[action.name], data, actions, subContext)
    logger.debug(`Executed ${colors.bold(action.name)} action.`)
  }
}
