# @kanboon/normalizer: Modular Normalizer

---

**Table of contents**

* [Installation](#installation)
* [Introduction](#introduction)
  * [Concept](#concept)
  * [Architecture](#architecture)
  * [Built-in Modules](#built-in-modules)
  * [Context](#context)
* [Quickstart example](#quickstart-example)
* [Usage](#usage)
  * [Creating a normalizer](#creating-a-normalizer)
  * [Adding modules](#adding-modules)
  * [Normalization](#normalization)
  * [Denormalization](#denormalization)
  * [Marking](#marking)
* [Extending](#extending)
  * [Custom modules](#custom-modules)

---

## Installation

To install the library, run one of the following command depending on your package manager : 

**npm**
```shell
npm i @kanboon/normalizer
```

**yarn**
```shell
yarn add @kanboon/normalizer
```

## Introduction

**@kanboon/normalizer** is a powerful TypeScript/JavaScript library designed to transform complex data structures (objects, custom classes, dates) into simpler, interchangeable formats, and vice-versa.

It utilizes **Modules** to determine how each specific data type should be handled and as such, is highly customizable.

The library have no dependencies.

### Concept

The library implements the two fundamental operations essential for data serialization and deserialization:

- **Normalization** : Transforming complex or language-specific data (e.g., a `Date` instance, a custom class) into a primitive data structure (e.g., a string, a simple object).
    - *Example:* `new Date()` => `'2025-12-15T11:22:30.000Z'`
- **Denormalization** : Rebuilding the complex object from its primitive, normalized representation.
    - *Example:* `'2025-12-15T11:22:30.000Z'` => `new Date()`

### Architecture

The system is built upon three main components:

1.  **`Normalizer`:** The core class that orchestrates the entire process. It manages the registered modules and executes the appropriate logic based on the data type and priorities.
2.  **`NormalizerModule`:** An abstract class that every concrete module must extend. Each module defines the specific logic for a single data type (e.g., arrays, objects, custom classes).
3.  **`NormalizerContext`:** A configuration object that allows fine-tuning the behavior of the normalization/denormalization process (e.g., enabling type marking, defining property names).

### Built-in Modules

The library comes with built-in modules :

|     Module     | Description                                             | Default Priority |
|:--------------:|:--------------------------------------------------------|:----------------:|
|  `DateModule`  | Converts `Date` instances to ISO 8601 strings.          |       -50        |
| `ArrayModule`  | Recursively normalizes every item within an array.      |       -100       |
| `ObjectModule` | Recursively normalizes every property within an object. |       -100       |

### Context Options

A configuration object that controls the behavior of normalization/denormalization

|        Module         | Description                                                                  | Default Value |                       Value                         |
|:---------------------:|:-----------------------------------------------------------------------------|:-------------:|:---------------------------------------------------:|
|       `marker`        | Use [markers](#marking) for normalization/denormalization.                   | `false`       |                      `boolean`                      |
| `markerMarkProperty`  | Define the name of the marker property in the normalized object.             | `'__mark__'`  |                      `string`                       |
| `markerValueProperty` | Define the name of the value property in the normalized object.              | `'__value__'` |                      `string`                       |
|  `markerUnknownMark`  | Define the behavior when encountering an unknown marker on deserialization.* |   `'throw'`   | `'throw' \| 'ignore' \| 'ignore_raw' \| 'fallback'` |

\* The behaviors are the following:
  - `throw`: trigger an error.
  - `ignore`: the normalized value will be returned (the content of `__value__`).
  - `ignore_raw`: the whole normalized value with marker will be returned (the object containing `__mark__` and `__value__`).
  - `fallback`: the denormalizer will try to find a module that supports the `__value__` and will use it. If no module is found, same as `ignore`.

## Quickstart example

Here is a normalization with the built-in modules :

```typescript
import { Normalizer, ObjectModule, ArrayModule, DateModule } from '@kanboon/normalizer';

const normalizer = new Normalizer({
  '-100': [new ObjectModule(), new ArrayModule()],
  '-50': [new DateModule()],
});

const originalData = {
    id: 1,
    name: 'John Doe',
    birthDate: new Date('1990-01-01T10:00:00.000Z'),
    attributes: [10, 20, new Date('2025-10-10')],
};

const normalizedData = normalizer.normalize(originalData);

console.log(normalizedData);
/*
{
    id: 1,
    name: 'John Doe',
    birthDate: '1990-01-01T10:00:00.000Z',
    attributes: [10, 20, '2025-10-10T00:00:00.000Z'],
}
*/
```

## Usage

### Creating a normalizer

Here is how you create a normalizer with no modules (which mean it does nothing, it will return the data as is).

```typescript
import { Normalizer } from '@kanboon/normalizer';

const normalizer = new Normalizer();
```

### Adding modules

Modules are passed either by the Normalizer constructor's or by calling `addModule()`. You can create your own [custom modules](#custom-modules) if needed.

```typescript
import { Normalizer, ObjectModule, ArrayModule, DateModule } from '@kanboon/normalizer';

// You can either use an array, which will set the priority of the modules to 0
const normalizer1 = new Normalizer([new ObjectModule(), new ArrayModule()]);

// ... Or set the priority yourself with an object
const normalizer2 = new Normalizer({
    '-100': [new ObjectModule(), new ArrayModule()],
    '-50': [new DateModule()],
});

// You can also add modules later with addModule().
const normalizer3 = new Normalizer();

normalizer3.addModule(new DateModule()); // No priority specified, it will default to 0

normalizer3
    .addModule(new ObjectModule(), -100)
    .addModule(new ArrayModule(), -50)
;
```

### Normalization

The `normalize` method transforms the data structure using the first module found that supports the current data type.

```typescript
import { Normalizer, ObjectModule, ArrayModule, DateModule } from '@kanboon/normalizer';

const normalizer = new Normalizer({
    '-100': [new ObjectModule(), new ArrayModule()],
    '-50': [new DateModule()],
});

const originalData = {
    id: 1,
    date: new Date('1990-01-01T10:00:00.000Z'),
    list: [new Date('2025-01-01'), 'text'],
};

const normalizedData = normalizer.normalize(originalData);

console.log(normalizedData);
/* Result:
{ // Handled by ObjectModule which will pass each property into the normalizer
    id: 1, // Not handled: returned as is
    date: '1990-01-01T10:00:00.000Z', // Handled by DateModule
    list: [ // Handled by ArrayModule which will pass each item into the normalizer
        '2025-01-01T00:00:00.000Z', // Handled by DateModule
        'text' // Not handled: returned as is
    ]
}
*/
```

### Denormalization

The `denormalize` method rebuild the complexe data structure using the first module found that supports the current data type.

```typescript
import { Normalizer, ObjectModule, ArrayModule, DateModule } from '@kanboon/normalizer';

const normalizer = new Normalizer({
    '-100': [new ObjectModule(), new ArrayModule()],
    '-50': [new DateModule()],
});
const normalizedData = {
    id: 1,
    date: '1990-01-01T10:00:00.000Z',
    list: [
        '2025-01-01T00:00:00.000Z',
        'text',
    ],
};

const originalData = normalizer.normalize(normalizedData);

console.log(originalData);
/* Result:
{ // Handled by ObjectModule which will pass each property into the normalizer
    id: 1, // Not handled: returned as is
    date: Date, // Handled by DateModule
    list: [ // Handled by ArrayModule which will pass each item into the normalizer
        Date, // Handled by DateModule
        'text' // Not handled: returned as is
    ]
}
*/
```

### Marking

To ensure that denormalization uses the exact module that performed the original normalization, the library can embed a type marker into the processed data.

When the `marker` option is enabled in the context:

1. **Normalization :** The result is encapsulated into an object containing the marker and the value :

```typescript
const data = new Date('2025-01-01T00:00:00.000Z');
const normalizedAndMarkedData = normalizer.normalize(data, { marker: true });
```

```json
// Normalized result for a Date object
{
    "__mark__": "DateModule", // <- The stored marker
    "__value__": "2025-01-01T00:00:00.000Z"
}
```

2. **Denormalization :** The Normalizer reads the marker ("DateModule") and directly looks up the corresponding module. This bypasses the need to check supportsDenormalization for all modules, resulting in a significantly faster and more reliable reversal process.
```typescript
const data = normalizer.denormalize(normalizedAndMarkedData, { marker: true });
```


## Extending

### Custom modules

To add support for a custom class or specific data structure, you must extend the abstract `NormalizerModule` class and implement the four abstract methods.

Assuming you have a User class like that :
```typescript
export class User {
    id: number;
    fullName: string;
    createdAt: Date;

    constructor(id: number, fullName: string, createdAt: Date) {
        this.id = id;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }
}
```

To normalize it, you could have a module like that :

```typescript
import { Normalizer, NormalizerModule, NormalizerContext } from '@kanboon/normalizer';

export class CustomUserModule extends NormalizerModule {
    constructor() {
        // Provide a unique marker for reliable denormalization
        super({ marker: 'CustomUserModule' });
    }

    // 1. Check if the data is supported for normalization by the module
    supportsNormalization(data: any): boolean {
        return data instanceof User;
    }

    // 2. Check if the data is supported for normalization by the module
    supportsDenormalization(data: any): boolean {
        return typeof data === 'object' && 'id' in data && 'name' in data && 'createdAt' in data;
    }

    // 3. Define the transformation logic to a primitive type
    normalize(data: User, context: NormalizerContext, normalizer: Normalizer): { id: number, name: string } {
        return {
            id: data.id,
            name: data.fullName,
            createdAt: normalizer.normalize(data.createdAt, context), // You can use the normalizer recusively. Here, createdAt will be handled by the DateModule.
        };
    }

    // 4. Define the transformation logic back to the class instance
    denormalize(data: any, context: NormalizerContext, normalizer: Normalizer): User {
        return new User(
            data.id,
            data.name,
            normalizer.denormalize(data.createdAt, context),
        );
    }
}
```

Register your custom module with a high priority to ensure it's checked before generic modules like `ObjectModule`.

```typescript
const normalizer = new Normalizer({
    '-100': [new ObjectModule(), new ArrayModule()],
    '-50': [new DateModule()],
    '0': [new CustomUserModule()],
});
```
