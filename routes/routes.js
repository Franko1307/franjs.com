module.exports = function (app) {
  app.get('/', function(req, res) {
		res.render('index');
	});
  app.get('*', function(req, res) {
		res.send('Hey, what are you doing?');
	});
}
