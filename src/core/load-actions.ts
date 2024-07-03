import { colors } from 'consola/utils'
import type { Context } from './context'
import type { BoilupAction } from './types'

export async function loadActions(context: Context, actions: BoilupAction[] = []): Promise<BoilupAction[]> {
  const loadedActions = []

  for (const action of actions) {
    const subContext = context.createSubContext(action.name)
    const logger = subContext.logger

    if (action.canLoad && await action.canLoad(actions, subContext) === false ) {
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
