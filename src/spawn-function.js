var cp = require('child_process')

function spawnFunction (isolatedFunction /*, options, callback */) {
  var options = {}, callback

  if (!isFunction(isolatedFunction)) {
    throw new TypeError('isolatedFunction must be of type function')
  }

  if (isFunction(arguments[1])) {
    callback = arguments[1]
  }
  else if (isObject(arguments[1])) {
    options = arguments[1]
    callback = arguments[2]
  }

  options.stdio = ['pipe', 'pipe', 'pipe', 'ipc']

  var cmd = cp.spawn(process.execPath, ['-e', 'process.stdout.write((('
    + isolatedFunction.toString() +')()||String()).toString())'], options)

  return isFunction(callback) ? callbackMode(cmd, callback) : streamMode(cmd)
}

function streamMode (cmd) { // stream mode
  var err = []

  cmd.stderr.on('data', function (data) {
    err.push(data)
  })

  cmd.stderr.on('end', function () {
    if (err.length > 0) {
      cmd.stdout.emit('error', new Error(err.join('')))
    }
  })

  cmd.on('error', function (error) {
    cmd.stdout.emit('error', error)
  })

  cmd.on('message', function (message) {
    cmd.stdout.emit('message', message)
  })

  cmd.stdout.send = function (message) {
    cmd.send(message)
  }

  return cmd.stdout
}

function callbackMode (cmd, callback) { // callback mode
  var err = [], out = []

  cmd.stderr.on('data', function (data) {
    err.push(data)
  })

  cmd.stdout.on('data', function (data) {
    out.push(data)
  })

  cmd.on('error', function (error) {
    callback(error)
  })

  cmd.on('close', function () {
    if (err.length > 0) return callback(err.join(''))
    callback(undefined, out.join(''))
  })
}

function isFunction (fun) {
  return fun instanceof Function
}

function isObject (obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object
}

module.exports = spawnFunction