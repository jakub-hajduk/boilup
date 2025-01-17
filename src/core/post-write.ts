import { colors } from 'consola/utils'
import type { Context } from './context'
import type { BoilupAction, BoilupPostWriteMethodParams, CollectedData } from './types'

export async function postWrite(context: Context, actions: BoilupAction[] = [], data: CollectedData) {
  const phaseContext = context.createSubContext('postWrite')

  for(const action of actions) {
    const subContext = phaseContext.createSubContext(action.name)
    const logger = subContext.logger
    const postWriteParams: BoilupPostWriteMethodParams<any> = {
      files: context.files,
      logger: context.logger,
      context: context,
      fullData: data,
      data: data[action.name]
    }

    if (!action.postWrite) {
      logger.debug(`No postWrite function for ${colors.bold(action.name)} action.`)
      continue
    }

    await action.postWrite(postWriteParams)

    logger.debug(`Executed postWrite function for ${colors.bold(action.name)} action.`)
  }
}
