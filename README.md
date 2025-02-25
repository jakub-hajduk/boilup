# Boilup

Boilup is a tool for generating boilerplate code for projects. It allows you to build custom actions consisting of various methods that run in different stages. Each action can have child actions, providing a flexible and extensible system.

## Features
- Generate boilerplate code for projects
- Build custom actions
- Support for action stages
- Extensible and flexible

## Installation

Install Boilup using your package manager:

```bash
pnpm add boilup
```

## Usage

Boilup works in stages, each stage serving a specific purpose in the boilerplate generation process.

### Stages

1. **Loading Actions** - Loads the specified actions.

2. **Collecting Data** - Used for running terminal prompts for the user or fetching any other information needed for further processing.

3. **Executing Actions** - Runs the action, stacking files and their contents to be written.

4. **Writing Files** - Writes all stacked files to the disk.

5. **Post-write** - Runs additional actions after files are written, such as installing packages, running command line scripts, validating output, or displaying final messages.

### Creating Actions

Actions are the core of Boilup's functionality. Each action can be defined with methods that run at different stages. Here's a basic example of defining an action:

```typescript
import { exists } from 'node:fs'
import { installDependencies } from 'nypm'
import { input } from '@inquirer/prompts'
import type { BoilupCanLoadMethod, BoilupAction, BoilupActionMethod, BoilupCollectDataMethod, BoilupPostWriteMethod } from 'boilup'

const moduleName = 'create-package-json'

export interface PackageJsonData {
  name: string
  version: string
  author: string
}

const canLoad: BoilupCanLoadMethod = async () => {
  if (await exists('./package.json')) {
    return false
  }
}

const collectData: BoilupCollectDataMethod<PackageJsonData> = async () => {
  const name = await input({ message: `Package name` })
  const version = await input({ message: `Version` })
  const author = await input({ message: `Author` })

  return { name, version, author }
}

const action: BoilupActionMethod<PackageJsonData> = async ({ data, files }) => {
  const template = {
    name: data.name,
    version: data.version,
    author: data.author,
    type: 'module',
    dependencies: {
      'typescript': '^5.4.5'
    },
    devDependencies: {
      '@types/node': '^20.14.5'
    }
  }

  const packageJsonString = JSON.stringify(template, null, 2)

  files.write('./package.json', packageJsonString, moduleName)
}

const postWrite: BoilupPostWriteMethod<PackageJsonData> = async () => {
  await installDependencies()
  console.log('Main package.json file successfully created!')
}

export const createPackageJson: BoilupAction<PackageJsonData> = {
  name: moduleName,
  description: 'Generates package.json file with provided data.',
  canLoad,
  collectData,
  action,
  postWrite
}
```

### Running Boilup

To run Boilup with your defined actions:

```typescript
import { run } from 'boilup'
import { createPackageJson } from './create-package-json.action'

run(
  [ createPackageJson ],
  {
    outDir: './new-project',
    dryRun: true
  }
);
```

You can also run all the stages by yourself:

```typescript
import { createContext, loadActions, collectData, executeActions, write, postWrite, type Context, type ContextOptions, type BoilupAction } from 'boilup'

async function init() {
  const context: Context = createContext({ ... })

  const loadedActions = await loadActions.call(context, [ ... ])
  
  const data = await collectData.call(context, loadedActions)

  await executeActions.call(context, loadedActions, data)
  
  await write.call(context)
  
  await postWrite.call(context, loadedActions, data)
}

init()
```
# Boilup API Documentation

## Boilup Methods

### BoilupCanLoadMethod

```typescript
type BoilupCanLoadMethod = (params: BoilupCanLoadMethodParams) => MaybePromise<boolean | void>;

interface BoilupCanLoadMethodParams {
  files: Writepool;
  context: Context;
  actions: BoilupAction[];
}
```

Checks whether an action and its child actions should be loaded. Returns `true` to load, `false` to skip, or `undefined` for default behavior.

### BoilupCanCollectDataMethod

```typescript
type BoilupCanCollectDataMethod = (params: BoilupCanCollectDataMethodParams) => MaybePromise<boolean | undefined>;

interface BoilupCanCollectDataMethodParams {
  files: Writepool;
  context: Context;
  upToNowData: CollectedData;
}
```

Determines if the data collection step should be performed. Returns `true` to collect data, `false` to skip, or `undefined` for default behavior.

### BoilupCollectDataMethod

```typescript
type BoilupCollectDataMethod<A> = (params: BoilupCollectDataMethodParams) => MaybePromise<A>;

interface BoilupCollectDataMethodParams {
  files: Writepool;
  context: Context;
  upToNowData: CollectedData;
}
```

Collects necessary data for future processing. The return value is added to `fullData` under the action's name.

### BoilupCanExecuteActionMethod

```typescript
type BoilupCanExecuteActionMethod = (params: BoilupCanExecuteMethodParams) => MaybePromise<boolean | undefined>;

interface BoilupCanExecuteMethodParams {
  files: Writepool;
  context: Context;
  fullData: CollectedData;
}
```

Determines if the action should be executed. Returns `true` to execute, `false` to skip, or `undefined` for default behavior.

### BoilupActionMethod

```typescript
type BoilupActionMethod<A> = (params: BoilupActionMethodParams<A>) => MaybePromise<void>;

interface BoilupActionMethodParams<A> {
  files: Writepool;
  context: Context;
  fullData: CollectedData;
  data: A;
  actions: BoilupAction[];
}
```

Main logic of an action, processing the collected data and performing tasks.

### BoilupPostWriteMethod

```typescript
type BoilupPostWriteMethod<A> = (params: BoilupPostWriteMethodParams<A>) => MaybePromise<void>;

interface BoilupPostWriteMethodParams<A> {
  files: Writepool;
  context: Context;
  data: A;
  fullData: CollectedData;
}
```

Additional tasks executed after all files are written.

## BoilupAction Interface

```typescript
interface BoilupAction<A extends Record<string, any> = any> {
  name: string;
  description: string;
  subActions?: BoilupAction[];
  canLoad?: BoilupCanLoadMethod;
  canCollectData?: BoilupCanCollectDataMethod;
  collectData?: BoilupCollectDataMethod<A>;
  canExecuteAction?: BoilupCanExecuteActionMethod;
  action?: BoilupActionMethod<A>;
  postWrite?: BoilupPostWriteMethod<A>;
}
```

Defines a Boilup action with the following properties:

- **name**: `string` - The name of the action.
- **description**: `string` - A description of the action.
- **subActions**: `BoilupAction[]` - Optional child actions.
- **canLoad**: `BoilupCanLoadMethod` - Optional method to check if the action should be loaded.
- **canCollectData**: `BoilupCanCollectDataMethod` - Optional method to check if data should be collected.
- **collectData**: `BoilupCollectDataMethod` - Optional method to collect necessary data.
- **canExecuteAction**: `BoilupCanExecuteActionMethod` - Optional method to check if the action should be executed.
- **action**: `BoilupActionMethod` - Optional method for the main logic of the action.
- **postWrite**: `BoilupPostWriteMethod` - Optional method for tasks after all files are written.


# Writing Files in Boilup Actions

In all methods of an action, you have access to the current list of files in the `context`. This allows you to manage files that are about to be created or modified.

## Adding New Files

Please refer to [Writepool docs](https://github.com/jakub-hajduk/writepool?tab=readme-ov-file#adding-new-files)

## Editing Stacked Files

Please refer to [Writepool docs](https://github.com/jakub-hajduk/writepool?tab=readme-ov-file#editing-stacked-files) 

## Debugging Changes

Please refer to [Writepool docs](https://github.com/jakub-hajduk/writepool?tab=readme-ov-file#debugging-changes).
