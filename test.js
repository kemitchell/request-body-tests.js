var Readable = require('stream').Readable
var http = require('http')
var tape = require('tape')

tape('infinite request body', function(test) {
  test.plan(1)
  var REQUEST_BODY_LIMIT = 256
  http
    .createServer(function(request, response) {
      var bytesReceived = 0
      request
        .on('data', function onData(chunk) {
          bytesReceived += chunk.length
          if (bytesReceived > REQUEST_BODY_LIMIT) {
            response.statusCode = 413
            response.end() } }) })
    .listen(0, function() {
      var server = this
      var port = server.address().port
      var request = { method: 'POST', path: '/', port: port }
      makeInfiniteStream()
        .pipe(http.request(request, function(response) {
          test.equal(response.statusCode, 413)
          server.close() })) })
  function makeInfiniteStream() {
    var stream = new Readable()
    stream._read = function () {
      var numberOfChunks = ( 1 + Math.floor(Math.random() * 10) )
      setTimeout(
        function() {
          for (var i = 0; i < numberOfChunks; i++) {
            stream.push(Math.random().toString(32).repeat(32 * 4)) } },
        100) }
    stream.resume()
    return stream } })
