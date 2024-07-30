import type { Context } from './context'
import type { Logger } from './logger'
import type { OutputCollection } from './output-files-collection'

export type BaseData = Record<string, any>

export interface Command {
  command: string,
  cwd: string
}

export type CollectedData = Record<string, BaseData>

export interface BoilupCanLoadMethodParams {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  actions: BoilupAction[],
}

export interface BoilupCanCollectDataMethodParams {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  upToNowData: CollectedData,
}

export interface BoilupCollectDataMethodParams {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  upToNowData: CollectedData,
}

export interface BoilupCanExecuteMethodParams {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  fullData: CollectedData,
}

export interface BoilupActionMethodParams<A> {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  fullData: CollectedData,
  data: A,
  actions: BoilupAction[],
}

export interface BoilupPostWriteMethodParams<A> {
  files: OutputCollection,
  logger: Logger,
  context: Context,
  data: A,
  fullData: CollectedData,
}

/**
 * @async
 * canLoad (optional)
 *
 * Function called to check whether action and its childActions shall be loaded.
 * Action and childActions are loaded when:
 *  - canLoad function is undefined
 *  - canLoad function returns nothing (undefined)
 *  - canLoad function returns true
 * Actions and childActions are skipped when:
 *  - canLoad returns false
 *
 * @example
 * ```
 * async function canLoad(actions) {
 *   if (actions.some(action => action.name.startsWith('package-manager'))) {
 *     return Promise.resolve(false)
 *   }
 * }
 * ```
 *
 * @example
 * ```
 * import { confirm } from '@inquirer/prompts';
 *
 * async function canLoad() {
 *   return await confirm({ message: `Do you wish to configure monorepo?` })
 * }
 * ```
 *
 * @param actions - actions to be loaded
 */
export type BoilupCanLoadMethod = (params: BoilupCanLoadMethodParams) => Promise<boolean | undefined>

/**
 * @async
 * canCollectData (optional)
 *
 * Defines whether data collection step should be performed or not.
 * Logic is the same as with canLoad function: Data is collected when:
 *  - canCollectData function is undefined
 *  - canCollectData function returns nothing (undefined)
 *  - canCollectData function returns true
 * Collecting data is skipped when:
 *  - canCollectData returns false
 *
 * the `fullData` parameter contains all the data collected so far from the previous actions.
 *
 * @example
 * ```
 * async function canCollectData() {
 *   const data = await getConfigFromFile('./config.json')
 *   if (data.skipMonorepoSetup) {
 *     return false
 *   }
 * }
 * ```
 *
 * @param upToNowData - data collected up to this action. Does not contain any data collected in later steps.
 */
export type BoilupCanCollectDataMethod = (params: BoilupCanCollectDataMethodParams) => Promise<boolean | undefined>

/**
 * @async
 * collectData (optional)
 *
 * Collects needed data for future processings, whether these are  user prompts to ge user's answers,
 * or data fetched from any request, checking files in filesystem, or any other operation
 *
 * The return value will be added to the `fullData` under the name of an action for the next Actions
 *
 * @example
 * ```
 * import { input } from '@inquirer/prompts'
 *
 * async function collectData(fullData) {
 *   const name = input({ message: 'Name of the project' })
 *   const cwd = process.cwd()
 *
 *   return {
 *     name,
 *     cwd
 *   }
 * }
 * ```
 *
 * @example
 * ```
 * async function collectData(fullData) {
 *   const isPnpmSelected = fullData['package-manager'].type === 'pnpm'
 *   const isYarnLock = existsSync('./yarn.lock')
 *
 *   return {
 *     updatePackageManager: isPnpmSelected && isYarnLock ? confirm({ message: 'Do you wish to migrate?' }) : false
 *   }
 * }
 * ```
 *
 * @param upToNowData - data collected up to this action. Does not contain any data collected in later steps.
 */
export type BoilupCollectDataMethod<A> = (params: BoilupCanCollectDataMethodParams) => Promise<A>

/**
 * @async
 * canExecute (optional)
 *
 * Function that determines whether the action should be executed or not.
 * Logic is the same as with canLoad function: Action is executed when:
 *  - canExecute function is undefined
 *  - canExecute function returns nothing (undefined)
 *  - canExecute function returns true
 * Collecting data is skipped when:
 *  - canExecute returns false
 *
 *  fullData contains all collected data from all actions.
 *
 * @param currentData
 */
export type BoilupCanExecuteActionMethod = (params: BoilupCanExecuteMethodParams) => Promise<boolean | undefined>

/**
 * @async
 * execute (optional)
 *
 * Main logic of an action.
 *
 * @param data - data collected for this action by 'collectData()' function
 * @param fullData - all data collected from this and other actions.
 * @param actions - all actions that are about to be runned
 */
export type BoilupActionMethod<A> = (params: BoilupActionMethodParams<A>) => Promise<void>

/**
 * @experimental
 * @async
 * postWrite (optional)
 *
 * Additional action that is executed after all files are written
 *
 * @param currentData
 * @param fullData
 */
export type BoilupPostWriteMethod<A> = (params: BoilupPostWriteMethodParams<A>) => Promise<void>

export interface BoilupAction<A extends Record<string, any> = any> {
  /**
   * Name of the action. This name is used for identification purposes.
   */
  name: string

  /**
   * Description of the action.
   */
  description: string

  /**
   * Each BoilupAction, can contain child actions.
   * This feature can be utilized to create group of actions that are loaded at once.
   */
  subActions?: BoilupAction[]

  canLoad?: BoilupCanLoadMethod

  canCollectData?: BoilupCanCollectDataMethod

  collectData?: BoilupCollectDataMethod<A>

  canExecuteAction?: BoilupCanExecuteActionMethod

  action?: BoilupActionMethod<A>

  postWrite?: BoilupPostWriteMethod<A>
}
