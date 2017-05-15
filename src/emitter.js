const Logger = require('./utils/logger');

module.exports = function Emitter(data, options, emitter){
  emitter.emit(options.eventName, data);
  if(options.debug) Logger({
    eventName: options.eventName
  });
}
