var assert = require('assert')
var util = require('util')

var negate = false
var color = {
  pass: '\x1b[1;32m',
  fail: '\x1b[1;31m',
  skip: '\x1b[1;33m',
  reset: '\x1b[39m',
  stack: '\x1b[0;37m',
  label: '\x1b[1;30m'
}

var mark = {
  pass: '\u2713',
  fail: '\u2717',
  skip: '\u301C'
}

function shouldNotThrow (out, block, expect, message) {
  try {
    block()
    pass(out, message)
  }
  catch (e) {
    fail(out, message, new Error('Should have not thrown'))
  }
}

function shouldThrow (out, block, expect, message) {
  try {
    block()
    fail(out, message, new Error('Did not throw'))
  }
  catch (error) {
    if (typeof expect === 'string') { // comparing error message
      if (error.message === expect) {
        pass(out, message)
      }
      else {
        out.actual = util.inspect(error.message, {colors: true})
        fail(out, message, error)
      }
    }
    else if (typeof expect === 'function') { // comparing error type
      if (error.constructor === expect) {
        pass(out, message)
      }
      else {
        out.actual = error.name
        out.expect = expect.name
        fail(out, message, error)
      }
    }
    else {
      fail(out, message, error)
    }
  }
}

function colorMessage (out, message, type) {
  return message.replace('%1', color.reset + out.actual + color[type])
    .replace('%2', color.reset + out.expect + color[type])
}

function getStackLine (stack) {
  var lines = stack.toString().split(/\n/g)

  for (var i = 1; i < lines.length; i++) {
    if (lines[i].indexOf(__filename) === -1) {
      return lines[i].split(/\(|\)/)[1].replace(/ +/, '')
    }
  }

  return stack.toString()
}

function fail (out, message, error) {
  var cmessage = colorMessage(out, message, 'fail')
  console.log(color.fail + mark.fail, cmessage, color.reset,
    '\n', color.label, 'actual:'+ color.reset, out.actual,
    '\n', color.label, 'expect:'+ color.reset, out.expect,
    '\n', color.label, 'atfile:'+ color.stack,
    getStackLine(error.stack), color.reset)
}

function pass (out, message) {
  var cmessage = colorMessage(out, message, 'pass')
  console.log(color.pass + mark.pass, cmessage, color.reset)
}

function skip (out, message) {
  var cmessage = colorMessage(out, message, 'skip')
  console.log(color.skip + mark.skip, cmessage, color.reset)
}

function shouldEqual (out, actual, expect, message) {
  try {
    assert.deepStrictEqual(actual, expect, message)
    pass(out, message)
  }
  catch (error) {
    fail(out, message, error)
  }
}

function shouldNotEqual (out, actual, expect, message) {
  try {
    assert.notDeepStrictEqual(actual, expect, message)
    pass(out, message)
  }
  catch (error) {
    fail(out, message, error)
  }
}

function parseArgs (args) {
  if (args.length === 3 && typeof args[2] === 'string')
    return args[2]

  if (args.length < 3)
    return undefined

  var arr = Array.prototype.slice.call(args)
  var res = []

  for (var i = 2; i < arr.length; i++)
    res.push(typeof arr[i] === 'string' ? arr[i] : util.inspect(arr[i]))

  return res.join(' ')
}

function ok (actual, expect, message) {
  var out = {
    actual: util.inspect(actual, {colors: true}),
    expect: util.inspect(expect, {colors: true})
  }

  message = parseArgs(arguments)

  if (!message)
    skip(out, 'skipping test with invalid parameters')
  else if (message.indexOf('~') === 0)
    skip(out, message.substring(1))
  else if (typeof actual === 'function')
    negate ? shouldNotThrow(out, actual, expect, message)
      : shouldThrow(out, actual, expect, message)
  else
    negate ? shouldNotEqual(out, actual, expect, message)
      : shouldEqual(out, actual, expect, message)
  negate = false
}

ok.not = function (actual, expect, message) {
  negate = true
  ok(actual, expect, message)
}

module.exports = ok