const Intersect = require('intersect');
const EventEmitter = require('events');

class MongooseEmitter extends EventEmitter {}

const Emitter = require('./emitter');
const Fetcher = require('./utils/fetcher');

const defaultOptions = {
  events: {
    create: true,
    update: true,
    remove: true
  },
  partials: null,
  debug: false
}

module.exports = exports = function MongooseTrigger(schema, options) {
  options = Object.assign({}, defaultOptions, options);

  const emitter = new MongooseEmitter();

  schema.pre('save', function(next) {
    this.wasNew = this.isNew

    if(options.partials) {
      let modifiedPartials = new Set();

      options.partials.forEach(partial => {
        partial.triggers.split(' ').forEach(key => {
          if(this.isModified(key)) modifiedPartials.add(key);
        });
      })

      if(modifiedPartials.size) this.modifiedPartials = [...modifiedPartials];
    }

    next();
  });

  schema.post('save', function() {
    if((this.wasNew && !options.events.create) || (!this.wasNew && !options.events.update && !this.modifiedPartials)) return;

    if(this.wasNew && options.events.create) {
      let EventName = 'create';

      Fetcher(this, {
        select: options.events.create.select,
        populate: options.events.create.populate
      })
      .then(res => {
        Emitter(res, {
          eventName: EventName,
          debug: options.debug
        }, emitter);
      })
      .catch(err => console.error('[ERROR] -> mongoose-trigger -> ', err))
    }

    if(!this.wasNew && options.events.update) {
      let EventName = 'update';

      Fetcher(this, {
        select: options.events.update.select,
        populate: options.events.update.populate
      })
      .then(res => {
        Emitter(res, {
          eventName: EventName,
          debug: options.debug
        }, emitter);
      })
      .catch(err => console.error('[ERROR] -> mongoose-trigger -> ', err))
    }

    if(!this.wasNew && this.modifiedPartials) {
      options.partials
        .filter(partial => Intersect(partial.triggers.split(' '), this.modifiedPartials).length)
        .forEach(partial => {
          if(!partial.eventName) return console.warning(`EventName is not spesified`);
          let EventName = `partial:${partial.eventName}` ;

          Fetcher(this, {
            select: partial.select,
            populate: partial.populate
          })
          .then(res => {
            Emitter(res, {
              eventName: EventName,
              debug: options.debug
            }, emitter);
          })
          .catch(err => console.error('[ERROR] -> mongoose-trigger -> ', err))
        })
    }

  });

  schema.post('remove', function() {
    if(options.events.remove) {
      let EventName = 'remove' ;

      Emitter({ _id: this._id}, {
        eventName: EventName,
        debug: options.debug
      }, emitter);
    }
  });


  return emitter;
}
