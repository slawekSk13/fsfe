const http = require('http');

http.createServer(function(req, res){
res.write("Another server");
res.end();
}).listen(3333);

console.log("Server started on port 3333");
