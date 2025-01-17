import { colors } from 'consola/utils'
import type { Context } from './context'
import type { BoilupAction, BoilupActionMethodParams, BoilupCanExecuteMethodParams, CollectedData } from './types'

export async function executeActions(context: Context, actions: BoilupAction[], data: CollectedData) {
  for( const action of actions) {
    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    const canExecuteActionParams: BoilupCanExecuteMethodParams = {
      files: context.files,
      logger: context.logger,
      context: context,
      fullData: data
    }

    if (action.canExecuteAction && await action.canExecuteAction(canExecuteActionParams) === false) {
      logger.debug(`Skipping execution for ${colors.bold(action.name)} action (canExecuteAction returned false).`)
      continue
    }

    if (!action.action) {
      logger.debug(`No execute for ${colors.bold(action.name)} action.`)
      continue
    }

    const executeActionParams: BoilupActionMethodParams <any> = {
      files: context.files,
      logger: context.logger,
      context: context,
      actions,
      data: data[action.name],
      fullData: data
    }

    await action.action(executeActionParams)
    logger.debug(`Executed ${colors.bold(action.name)} action.`)
  }
}
