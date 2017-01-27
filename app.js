var express = require('express');
var app = express();
var serveIndex = require('serve-index');
var ba = require('basic-auth');
require('./lib/convert.js');

function entry(req, res, next) {
    var objUser = ba(req)
    if (objUser === undefined || objUser.name !== "" || objUser.pass !== "") {
        res.set("WWW-Authenticate", "Basic realm=Authorization Required")
        res.status(401).end()
    } else { next() }
}
app.use(entry);
app.use(express.static('public'));
app.use('/', serveIndex('public/', {
    'icons': true
}));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
