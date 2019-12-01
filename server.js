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

app.post('/employees',getEmployeesFromDb, showEmployees);
app.post('/schedule_date', getHoursByDate, showHoursByDate);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function findFirstAndLastName(result) {
	var response = "Employees: ";
	for (var i = 0; i < result.length; i++) {
			firstname = result[i].name_first;
			lastname =  result[i].name_last;
			skills = " -- Skills: ";
			if (result[i].server == 't')
				skills += "Server; ";
			if (result[i].host == 't')
				skills += "Host; ";
			if (result[i].kitchen == 't')
				skills += "Kitchen; ";
			if (result[i].cleanup == 't')
				skills += "Cleanup; ";
			if (result[i].Manager == 't')
				skills += "Manager; ";
			
			
			response += "<br>" + firstname + " " + lastname + " " + skills;
			console.log("working:");
		}	
	return response;
};

function showHoursByDate(req, res) {
		date = req.body.date;
		console.log(date);
		response = JSON.stringify(req.hour);
		
		res.render('schedule_date', {data: {response: response, date: date}});	
	};
	
function showEmployees(req, res) {
		response = findFirstAndLastName(req.employees);
		//date = JSON.stringify(req.body.date);
		//console.log(date);
		//response = req.employees;
		res.render('employees', {data: {response: response}});	
	};
	
function getHoursByDate(req, res, next) {
	date = req.body.date;
	var sql = "SELECT * FROM hour WHERE date ='" + date +"'";
	console.log(date);
	console.log(sql);
	
	//var response;
	
	pool.query(sql, function(err, result) {
		if(err) {
			console.log("Error in query: ");
			console.log(err);
			//callback(err, null);
			return null;
		} else {
			
		//console.log(1);	
		
		/*for (var i = 0; i < 1; i++) {
			firstname = JSON.stringify(result.rows[i].name_first);
			lastname =  JSON.stringify(result.rows[i].name_last);
			response += "\n" + firstname + " " + lastname;
			console.log("working:");
		}*/			
		
		console.log("Back from DB with result:");
		console.log(result.rows);
		//console.log(response);
		req.hour= result.rows;
		next();
		}
		
		
	});
	
}//end getHoursByDate

function getEmployeesFromDb(req, res, next) {
	const sql = "SELECT * FROM employees";
	
	//var response;
	
	pool.query(sql, function(err, result) {
		if(err) {
			console.log("Error in query: ");
			conole.log(err);
			//callback(err, null);
			return null;
		} else {
			
		//console.log(1);	
		
		/*for (var i = 0; i < 1; i++) {
			firstname = JSON.stringify(result.rows[i].name_first);
			lastname =  JSON.stringify(result.rows[i].name_last);
			response += "\n" + firstname + " " + lastname;
			console.log("working:");
		}*/			
		
		console.log("Back from DB with result:");
		console.log(result.rows);
		//console.log(response);
		req.employees= result.rows;
		next();
		}
		
		
	});


	
}//end of getEmployeesFromDb