module.exports = function (app) {

    app.get('/', function(req, res) {
		  res.render('index');
	  });
    app.get('/ga-n-queen-problem', function(req, res) {
		    res.render('genetic-algorithm/n-queen-problem');
	  });
    app.get('/stuff', function(req,res){
        res.render('links')
    })

    app.get('/ada-sort-algorithms',function(req,res){
        res.render('ada/s_algorithms');
    });
    app.get('*', function(req, res) {
		    res.send('Hey, what are you doing?');
	});
}
