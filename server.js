var port = 5000 || process.env.PORT;
var express = require('express');
var app = express();
var cors = require('cors');
var request = require('request');
var path = require("path");
var data = require('./data');

app.use(express.static(__dirname + '/images'));
app.set('view engine', 'html');
app.engine('html', require('hogan-express'));
app.use(cors());

app.get('/', function (req, res) {
	var c = 0;
	for (i = 0; i < data.length; i++)
		if (req.query.regno == data[i].regno)
			var c = i;
	if (c != 0)
		res.render(path.join(__dirname + '/cert'), {
			name: data[c].name
		});
	else
		res.send('Registration number not found !!')
});

app.get('/*', function (req, res) {
	res.send('403')
});


app.listen(port);
console.log('Server running on port: ' + port);
