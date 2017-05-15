const cli = require('cli-color');

module.exports = function Log(options) {
  console.log(
    cli.blackBright('[mongoose-trigger] -> [Emitting] -> Event('),
    cli.greenBright(options.eventName),
    cli.blackBright(`) [${new Date().toLocaleTimeString()}]`)
  )
}
