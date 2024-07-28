```markdown
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

1. **Loading Actions**
  - Loads the specified actions.

2. **Collecting Data**
  - Used for running terminal prompts for the user or fetching any other information needed for further processing.

3. **Executing Actions**
  - Runs the action, stacking files and their contents to be written.

4. **Writing Files**
  - Writes all stacked files to the disk.

5. **Post-write**
  - Runs additional actions after files are written, such as installing packages, running command line scripts, validating output, or displaying final messages.

### Creating Actions

Actions are the core of Boilup's functionality. Each action can be defined with methods that run at different stages. Here's a basic example of defining an action:

```typescript
import { exists } from 'node:fs'
import { installDependencies } from 'nypm'
import type { Action, CollectedData, BoilupAction, Context } from 'boilup'

const files = context.files
const moduleName = 'create-package-json'

export interface PackageJsonData {
  name: string
  version: string
  author: string
}

async function canLoad() {
  if (await exists('./package.json')) {
    return false
  }
}

async function collectData(): Promise<PackageJsonData> {
  const name = await input({ message: `Package name` })
  const version = await input({ message: `Version` })
  const author = await input({ message: `Author` })

  return { name, version, author }
}

async function action(data: PackageJsonData, fullData: CollectedData, actions: BoilupAction[], context: Context) {
  const { files } = context

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

  const packageJsonString = JSON.parse(template, null, 2)

  files.write('./package.json', packageJsonString, moduleName)
}

async function postWrite() {
  await installDependencies()
  console.log('Main package.json file successfully created!')
}

export const createPackageJson: Action<PackageJsonData> = {
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
import createPackageJson from './create-package-json.action.ts'

run(
  [ createPackageJson],
  {
    logger: {
      level: 5
    },
    files: {
      outDir: './new-project',
      dry: true
    }
  }
);
```

You can also run all the stages by yourself:

```typescript
import { createContext, loadActions, collectData, executeActions, write, postWrite, type Context, type ContextOptions, type BoilupAction } from 'boilup'

async function init() {
  const context: Context = createContext({ ... })

  const loadedActions = await loadActions(context, [ ... ])
  
  const data = await collectData(context, loadedActions)

  await executeActions(context, loadedActions, data)
  
  write(context)
  
  await postWrite(context, loadedActions, data)
}

init()
```

## BoilupAction API Reference

`BoilupAction` is a type used for creating custom actions in the Boilup library. Each action can have various methods that run in different stages of the boilerplate generation process. This documentation provides a detailed overview of the available properties and methods.

```typescript
interface BoilupAction<A extends Record<string, any> = any> {
  name: string;
  description: string;
  subActions?: BoilupAction[];

  canLoad?: (actions: BoilupAction[], context: Context) => Promise<boolean>;
  canCollectData?: (upToNowData: CollectedData, context: Context) => Promise<boolean>;
  collectData?: (upToNowData: CollectedData, context: Context) => Promise<A>;
  canExecuteAction?: (fullData: CollectedData, context: Context) => Promise<boolean>;
  action?: (currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) => Promise<void>;
  postWrite?: (currentData: A, fullData: CollectedData, context: Context) => Promise<void>;
}
```

### Properties

- **name**: `string`
  - Name of the action. Used for identification purposes.

- **description**: `string`
  - Description of the action.

- **subActions**: `BoilupAction[]`
  - Optional. Contains child actions. Can be used to create a group of actions that are loaded at once.

### Methods

- **canLoad**: `(actions: BoilupAction[], context: Context) => Promise<boolean>`
  - Optional. Determines whether the action and its child actions should be loaded. Returns `true` or `undefined` to load, `false` to skip.

  **Example**:
  ```typescript
  async function canLoad(actions) {
    if (actions.some(action => action.name.startsWith('package-manager'))) {
      return Promise.resolve(false);
    }
  }
  ```

- **canCollectData**: `(upToNowData: CollectedData, context: Context) => Promise<boolean>`
  - Optional. Determines whether the data collection step should be performed. Returns `true` or `undefined` to collect data, `false` to skip.

  **Example**:
  ```typescript
  async function canCollectData() {
    const data = await getConfigFromFile('./config.json');
    if (data.skipMonorepoSetup) {
      return false;
    }
  }
  ```

- **collectData**: `(upToNowData: CollectedData, context: Context) => Promise<A>`
  - Optional. Collects needed data for future processing. The return value will be added to the `fullData` under the action's name for subsequent actions. `upToNowData` contains all data collected up to this point.

  **Example**:
  ```typescript
  import { input } from '@inquirer/prompts';

  async function collectData(fullData) {
    const name = input({ message: 'Name of the project' });
    const cwd = process.cwd();

    return {
      name,
      cwd
    };
  }
  ```

- **canExecuteAction**: `(fullData: CollectedData, context: Context) => Promise<boolean>`
  - Optional. Determines whether the action should be executed. Returns `true` to execute, `false` to skip.

- **action**: `(currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) => Promise<void>`
  - Optional. Main logic of the action.

- **postWrite**: `(currentData: A, fullData: CollectedData, context: Context) => Promise<void>`
  - Optional. Additional action executed after all files are written.


# Writing Files in Boilup Actions

In all methods of an action, you have access to the current list of files in the `context`. This allows you to manage files that are about to be created or modified.

## Adding New Files

The `files.write` method accessible from the context doesn't write the file to the disk immediately. Instead, it stacks the new content for the file path, enabling you to modify files later or debug the file changes before they are written.

### Example

```typescript
async function action(currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) {
  const { files } = context;

  const time = await fetch('http://worldtimeapi.org/api/timezone/Europe/Warsaw');
  
  files.write('./created-at.txt', time.datetime);
}
```

It's a good practice to provide the origin of the change, usually the name of the action, but you can specify a custom name.

### Example

```typescript
files.write('./README.md', contents, 'readme-md-generator');
```

## Editing Stacked Files

You can edit a file that has already been created using the `write` method.

### Example

```typescript
async function action(currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) {
  const { files } = context;

  const [versionPath, versionContents] = files.get((path) => path.includes('version.json'));
  
  if (versionContents) {
    const parsedVersionContents = JSON.parse(versionContents);
    parsedVersionContents.version = 'v.2.0.0';
    files.write(versionPath, JSON.stringify(parsedVersionContents), 'version-bumper');
  }
}
```

## Debugging Changes

You can also track the changes made to a file.

### Example

```typescript
async function action(currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) {
  const { files } = context;

  const changes = files.getChanges('./package.json');
  
  // Compare the last and penultimate changes
  changes.diff(-1, -2); // Prints colored diff in the console
}
```

Or you can check which action caused the last change.

### Example

```typescript
async function action(currentData: A, fullData: CollectedData, actions: BoilupAction[], context: Context) {
  const { files } = context;

  const packageJsonChanges = files.getChanges('./package.json');

  const change = packageJsonChanges.get(-1);

  console.log('Change was performed by', change.origin, 'at', (new Date(change.timestamp)).toLocaleTimeString());
}
```
