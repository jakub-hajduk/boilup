import { colors } from 'consola/utils'
import type { Context } from './context'
import type { BoilupAction, BoilupCanLoadMethodParams } from './types'

export async function loadActions(context: Context, actions: BoilupAction[] = []): Promise<BoilupAction[]> {
  const loadedActions = []

  for (const action of actions) {

    const canLoadParameters: BoilupCanLoadMethodParams = {
      files: context.files,
      logger: context.logger,
      actions,
      context
    }

    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    if (action.canLoad && await action.canLoad(canLoadParameters) === false ) {
      logger.debug(`skipped: ${colors.bold(action.name)} (canLoad returned false).`)
      continue
    }

    loadedActions.push(action)
    logger.debug(`Loaded ${colors.bold(action.name)} action`)

    if (action.subActions && action.subActions.length > 0) {
      logger.debug(`Found ${action.subActions.length} subAction in ${colors.bold(action.name)} action.`)
      const submodules = await loadActions(subContext, action.subActions)
      loadedActions.push(...submodules)
    }
  }

  return loadedActions
}
