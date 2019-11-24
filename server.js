const express = require('express');
const app = express();
const port = process.env.PORT || 8888;
const connectionString = process.env.DATABASE_URL;
const path = require('path');
app.set('view engine','ejs');

app.use(express.urlencoded());


const {Pool} = require("pg");

const pool = new Pool({connectionString: connectionString});

app.set('port', port);
//app.use(express.static(__dirname + '/public'));

//app.get('/', (req, res) => res.send("index.html"));
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/employees',function(req,res){
	//var sql = "SELECT * FROM employees";
	

	
	employees_json = getEmployeesFromDb(function(err, res) {
		
		if(err || res == null) {
			console.log("Error");
		}
	
	});
	
	console.log(employees_json);
	
	const response = "Employees: " + employees_json;
	//console.log(response);
	//res.send(employees_json);
	res.render('employees', {data: {response: response}});	
		
	res.end();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function getEmployeesFromDb(callback) {
	const sql = "SELECT * FROM employees";
	
	var response = "Employees: ";
	
	pool.query(sql, function(err, result) {
		if(err) {
			console.log("Error in query: ");
			conole.log(err);
			callback(err. null);
		}
	
		console.log("Back from DB with result:");
		console.log(result.rows);
		
		
		
		for (var i = 0; i <= result.rows.legnth; i++) {
			firstname = JSON.stringify(result.rows[i].name_first);
			lastname =  JSON.stringify(result.rows[i].name_last);
			response += "\n" + firstname + " " + lastname;
			console.log(response);
		}			
		
		console.log(response);
		
		
	});
	
	callback(response);
}//end of getEmployeesFromDb