# spawnFunction

Spawn a child_process and run a function in it. Get the function's results
on your main process using a stream or callback


## Install

```
npm install spawn-function
```


## Usage
### Callback mode

```js
spawnFunction(isolatedFunction, [options], [callback])
```

* **isolatedFunction**: Function to be executed on the spawned process.
Must be a self-contained/isolated function
* **options**: Object to be passed to child_process.spawn()
* **callback(error, data)**: Callback to be called when isoldatedFunction is done

#### Example
```js
let spawnFunction = require('spawn-function')

spawnFunction(function () {
  let fib = function (n) {
    if (n < 2)
      return 1
    else
      return fib(n - 2) + fib(n - 1)
  }
  return fib(41)
}, function (error, data) {
  if (error) return console.log(error)
  console.log('Fibonacci result is', data)
})

```

### Stream mode

```js
let stream = spawnFunction(isolatedFunction, [options])
```

* **stream**: Returned stream
* **isolatedFunction**: Function to be executed on the spawned process.
Must be a self-contained/isolated function.
* **options**: Object to be passed to child_process.spawn()

#### Example

```js
let stream = spawnFunction(function () {
  return 1
})

let chunk = []
stream.on('data', function (data) {
  chunk.push(data)
})

stream.on('end', function () {
  console.log(chunk.join(''))
})

stream.on('error', function (err) {
  console.log(err)
})
```