const express = require('express');
const app = express();
const port = process.env.PORT || 8888;
const connectionString = process.env.DATABASE_URL ;
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
app.get('/newemployee', function(req, res) {
	//res.sendFile(path.join(__dirname + '/newemployee.html'));
	res.render('newemployee', {data: {newcreated: ""}});
});

app.post('/employees', getEmployeesFromDb, showEmployees);
app.post('/schedule_date', getHoursByDate, showHoursByDate);
app.post('/createemployee', setNewEmployee, showAddedEmployee);


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function findFirstAndLastName(result) {
	var response = "Employees: ";
	for (var i = 0; i < result.length; i++) {
			firstname = result[i].name_first;
			lastname =  result[i].name_last;
			skills = " -- Skills: ";
			//console.log(result[i].server);
			//console.log(result[i].host);
			//console.log(result[i].kitchen);
			//console.log(result[i].cleanup);
			//console.log(result[i].manager);
			if (result[i].server == true)
				skills += "Server; ";
			if (result[i].host == true)
				skills += "Host; ";
			if (result[i].kitchen == true)
				skills += "Kitchen; ";
			if (result[i].cleanup == true)
				skills += "Cleanup; ";
			if (result[i].manager == true)
				skills += "Manager; ";
			
			//console.log(skills);
			response += "<br>" + firstname + " " + lastname + " " + skills;
			//console.log("working:");
		}	
	return response;
};

function showHoursByDate(req, res) {
		date = req.body.date;
		console.log(date);
		response = JSON.stringify(req.hour);
		
		res.render('schedule_date', {data: {response: response, date: date}});	
	};
	
function showAddedEmployee(req, res) {
		newcreated = "Record created for " + req.name_first + " " + req.name_last;
		//date = JSON.stringify(req.body.date);
		console.log(newcreated);
		//response = req.employees;
		res.render('newemployee', {data: {newcreated: newcreated}});	
	};

function showEmployees(req, res) {
	response = findFirstAndLastName(req.employees);
		//date = JSON.stringify(req.body.date);
		//console.log(date);
		//response = req.employees;
		res.render('employees', {data: {response: response}});	
	
	
};

function setTFforSkill(skill) {
	if (skill)
		return true;
	else
		return false;
}

function setNewEmployee(req, res, next) {
	var name_first = req.body.name_first;
	var name_last = req.body.name_last;
	var username = req.body.username;
	var pswd = req.body.pswd;
	var server = setTFforSkill(req.body.server);
	var host = setTFforSkill(req.body.host);
	var kitchen = setTFforSkill(req.body.kitchen);
	var cleanup = setTFforSkill(req.body.cleanup);
	var manager = setTFforSkill(req.body.manager);
	var hours = req.body.hours;
	
	
	
	var sql = "INSERT INTO employees(name_first, name_last, username, password, server, host, kitchen, cleanup, manager, hours)" +
		"VALUES ('" + name_first + "', '" + name_last + "', '" + username + "', '" + pswd + "', '" + server +"', '" +
		host + "', '" + kitchen + "', '" + cleanup + "','" + manager + "', '" + hours + "')";
		
	//console.log(date);
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
		
		console.log("Created New Employee");
		console.log(username);
		//console.log(response);
		req.name_first = name_first;
		req.name_last = name_last;
		
		next();
		}
		
		
	});
}
	
function getHoursByDate(req, res, next) {
	var date = req.body.date;
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
		req.employees = result.rows;
		next();
		}
		
		
	});


	
}//end of getEmployeesFromDb