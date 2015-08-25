var http  = require('http');
var hits  = require('./lib/hits');
var port  = process.env.PORT || 8000;
var wreck = require('wreck');

http.createServer(function handler(req, res) {
  var url = req.url;
  var agent = req.headers.user-agent
  var r = req.headers;
  r.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  r.url = url.replace('.svg', '');

  if (url.match(/svg/)) {
    hits.add(r, function(err, count) {
      console.log(r.url, ' >> ', count)
      var newurl = "https://img.shields.io/badge/hits-" + count +"-brightgreen.svg"
      wreck.get(newurl, function (error, response, html) {
        // expiry headers see: http://stackoverflow.com/a/2068407/1148249
        var head = {
          "Cache-Control": "no-cache, no-store, must-revalidate", // HTTP 1.1
          "Pragma": "no-cache",                                   // HTTP 1.0
          "Expires": "0",                                         // Proxies
          "Location": newurl,
          "Content-Type":"image/svg+xml"
        }
        res.writeHead(200, head);
        res.end(html);
      });
    })

  }
  else if(url === '/favicon.ico') {
    var fav = 'https://www.google.com/images/google_favicon_128.png'
    res.writeHead(301, {"Location": fav });
    res.end();
  }
  else {
    console.log(" - - - - - - - - - - record:", r);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end(JSON.stringify(r, null, "  ")); // see next line
  } // For pretty JSON in Browser see: http://stackoverflow.com/a/5523967/1148249
}).listen(port);

console.log('Visit http://localhost:' + port);