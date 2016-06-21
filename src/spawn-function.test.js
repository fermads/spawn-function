var ok = require('./minimal-assert')
var spawnFunction = require('./spawn-function')

// test first argument must be a function
try {
  spawnFunction('not-a-function')
}
catch (e) {
  ok(e.message, 'isolatedFunction must be of type function',
    'first argument should be of type function')
}

// test send message comms
var sf1 = spawnFunction(function () {
  var http = require('http')
  var response = 'hello'

  http.createServer(function (req, res) {
    res.end(response)
  }).listen(8080)

  process.on('message', function (m) {
    response = m.response
    process.send(m)
  })

  return response
})

sf1.send({response: 'world'})

sf1.on('message', function (msg) {
  ok(msg.response, 'world', 'response should be %2')
})

sf1.on('data', function (d) {
  ok(d.toString(), 'hello', 'response should be %2')
})

sf1.on('error', function (error) {
  console.log(error)
})

// calback mode test
var count = 0
var tid = setInterval(function () {
  ok(true, true, 'executing stuff while fibonacci is running '+ (++count))
}, 1000)

spawnFunction(() => {
  var fib = function (n) {
    if (n < 2) {
      return 1
    }
    else {
      return fib(n - 2) + fib(n - 1)
    }
  }
  return fib(41)
}, function (error, data) {
  clearTimeout(tid)
  if (error) return console.log(error)
  ok(data, '267914296', 'fibonacci result should be %2')
})

// stream mode test
var sf2 = spawnFunction(function () {
  var n = 1
  return n + 1
})

var chunk = []
sf2.on('data', function (data) {
  chunk.push(data)
})

sf2.on('end', function (aaa) {
  ok(chunk.join(''), '2', 'value from stream should be %2')
})

// test error event
var x = 1
var sf = spawnFunction(function () {
  var n = x
  return n + 1
})

sf.on('error', function (err) {
  ok(typeof err, 'object', 'error should be an object')
})

// simple stream test
let stream = spawnFunction(function () {
  return 'ok'
})

let chunk2 = []
stream.on('data', function (data) {
  chunk2.push(data)
})

stream.on('end', function () {
  ok(chunk2.join(''), 'ok', 'result should be %2')
})

stream.on('error', function (err) {
  console.log(err)
})