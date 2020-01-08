var express = require("express"),
	app = express(),
	path = require('path'),
	logger = require('morgan'),
	ROOT_DIRECTORY = __dirname,
	ASSETS_DIRECTORY = path.join(ROOT_DIRECTORY, 'public');

app.use(express.static(ASSETS_DIRECTORY));
app.use(express.bodyParser());
app.use(logger('dev'));
app.set('view engine', 'ejs');

var usersRepository = new require("./lib/Repository")("users");

app.get('/', function(request, response) {
	response.render("index");
});

app.get('/count', function(request, response) {
	usersRepository.stats(function(stats){
		//stats.count = 100000;
		response.send(String(stats.count));
	});
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});