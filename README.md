# mongoose-trigger
[![Build Status](https://travis-ci.org/crsten/mongoose-trigger.svg?branch=master&style=flat-square)](https://travis-ci.org/crsten/mongoose-trigger)
[![npm](https://img.shields.io/npm/dt/mongoose-trigger.svg?style=flat-square)](https://www.npmjs.com/package/mongoose-trigger)
[![npm](https://img.shields.io/npm/v/mongoose-trigger.svg?style=flat-square)](https://www.npmjs.com/package/mongoose-trigger)

[Mongoose](http://mongoosejs.com/) plugin to automatically emit needed events.

This modules lets you attach event listeners directly to your models and emit event at any mongoose hook you want in an extremly flexible way.

## Installation

`npm install --save mongoose-trigger`

## Usage

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MongooseTrigger = require('mongoose-trigger');

let UserSchema = new Schema({
  name: String,
  email: String,
  something: Array
});

const UserEvents = MongooseTrigger(UserSchema, {
  events: {
    create: {
      select: 'email skills',
      populate: {
        path: 'skills',
        select: 'name'
      }
    },
    update: {
      populate: 'skills'
    },
    remove: false
  },
  partials: [
    {
      eventName: 'custom_event',
      triggers: 'name',
      select: 'name email',
      populate: 'something' //if it is a reference...
    }
  ],
  debug: false
});

UserEvents.on('create', data => console.log('[create] says:', data));
UserEvents.on('update', data => console.log('[update] says:', data));
UserEvents.on('partial:skills', data => console.log('[partial:skills] says:', data));
UserEvents.on('partial:x', data => console.log('[partial:x] says:', data));
UserEvents.on('remove', data => console.log('[remove] says:', data));
```

## Initialization

Call `mongoose-trigger` as a function to initialize.
It takes 2 arguments:

* Schema
* Options

And returns an instance of [Node Events](https://nodejs.org/api/events.html) which you can attach listeners to.

The following events are supported:

* create
* update
* remove
* partials (you're free to define those and they are prefixed with 'partial')

```js
const Listener = MongooseTrigger(YourSchema, YourOptions);
Listener.on('partial:custom_event', data => console.log('do something...'));
```

## Options

### events

Define what events you want to emit. The following events are available:

- create
- update
- remove

#### Enabling / Disabling events

```js
events: {
  create: false || true
}
```

#### Advanced configuration

This configuration uses the same syntax as mongoose. Actually it uses mongoose functionallity to make it possible. So you can include exclude single & multiple fields

```js
events: {
  create: {
    select: 'name email',
    populate: 'something'
  }
}
```

```js
events: {
  create: {
    select: 'name email',
    populate: {
      path: 'something',
      select: 'example'
    }
  }
}
```

### partials

Partials gives you the power to create custom events with custom triggers and custom data. Very flexible...
The settings do also use mongoose built in functionality. So be sure to checkout mongoose documentation.

```js
partials: [
  {
    eventName: 'custom_eventname',
    triggers: 'name email',
    select: 'email',
    populate: 'something'
  }
]
```

```js
partials: [
  {
    eventName: 'custom_eventname',
    triggers: 'something',
    select: 'something name',
    populate: {
      path: 'something',
      select: 'random'
    }
  }
]
```

### debug

Set this to true if you want to output info about all emitted events.

## Development & Testing

`npm run dev` starts a server at [localhost:3000](http://localhost:3000).

## License

[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) Carsten Jacobsen
