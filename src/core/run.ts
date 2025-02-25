import { collectData } from './collect-data';
import { type Context, type ContextOptions, createContext } from './context';
import { executeActions } from './execute-actions';
import { loadActions } from './load-actions';
import { postWrite } from './post-write';
import type { BoilupAction } from './types';
import { write } from './write';

export async function run(actions: BoilupAction[], options?: ContextOptions) {
  const context: Context = createContext(options);

  // context.logger.debug( colors.bold(`Phase: Loading actions`) )
  const loadedActions = await loadActions.call(context, actions);

  // context.logger.debug( colors.bold(`Phase: Collecting data`) )
  const data = await collectData.call(context, loadedActions);

  // context.logger.debug( colors.bold(`Phase: Executing main actions`) )
  await executeActions.call(context, loadedActions, data);

  // context.logger.debug( colors.bold(`Phase: Writing files`) )
  write.call(context);

  // context.logger.debug( colors.bold(`Phase: Executing post write actions`) )
  await postWrite.call(context, loadedActions, data);
}
