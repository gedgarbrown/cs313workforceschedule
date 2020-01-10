const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 8888;
const connectionString = process.env.DATABASE_URL;
const path = require('path');
var sess;
app.set('view engine','ejs');

// comment
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.use(session({
	secret: '171jd174yi3378',
	resave: true,
	saveUninitialized: true
	
}));

const {Pool} = require("pg");

const pool = new Pool({connectionString: connectionString});

app.set('port', port);
//app.use(express.static(__dirname + '/public'));

//app.get('/', (req, res) => res.send("index.html"));
app.get('/', function(req, res) {
	
	sess = req.session;
	
	if(sess.username) {
		res.render('menu', {data: {user: sess.username}});
	} else {
		res.sendFile(path.join(__dirname + '/index.html'));
	}
});

app.get('/newemployee', function(req, res) {
	//res.sendFile(path.join(__dirname + '/newemployee.html'));
	res.render('newemployee', {data: {newcreated: ""}});
});

app.get('/logout', function(req, res) {
	sess = req.session;
	sess.username = null;
	
	//res.sendFile(path.join(__dirname + '/newemployee.html'));
	res.render('login', {data: {loginresult: "Logout Successful!"}});
});

app.post('/login', checkPassword, showLoginResult);
app.post('/employees', getEmployeesFromDb, showEmployees);
app.post('/schedule_date', getEmployeesFromDb, getEmployeesByDate, showSchedule);
app.post('/createemployee', setNewEmployee, showAddedEmployee);
app.post('/removename', removeNames, displayRemoved);
app.post('/addname', addName, displayAdded);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function findFirstAndLastName(result) {
	var response = "Employees: <br>" + "<table> <tr><th>First Name</th><th>Last Name</th><th>Skills</th><tr>";
	for (var i = 0; i < result.length; i++) {
			firstname = result[i].name_first;
			lastname =  result[i].name_last;
			skills = "";
			//console.log(result[i].server);
			//console.log(result[i].host);
			//console.log(result[i].kitchen);
			//console.log(result[i].cleanup);
			//console.log(result[i].manager);
			if (result[i].server == true)
				skills += "Server;<br> ";
			if (result[i].host == true)
				skills += "Host;<br> ";
			if (result[i].kitchen == true)
				skills += "Kitchen;<br> ";
			if (result[i].cleanup == true)
				skills += "Cleanup;<br> ";
			if (result[i].manager == true)
				skills += "Manager;<br> ";
			
			//console.log(skills);
			response += "<tr><td>" + firstname + "</td><td>" + lastname + "</td><td>" + skills + "</td></tr>";
			//console.log("working:");
		}	
			response+= "<br><br></table>";
	return response;
};

/*function showHoursByDate(req, res) {
		date = req.body.date;
		console.log(date);
		
		response = JSON.stringify(req.hour);
		
		res.render('schedule_date', {data: {response: response, date: date}});	
	};//end showHoursByDate*/
	
function findEmployeeNameById(result, id){
	name = "";
	
	for (var i = 0; i < result.length; i++){
		if (result[i].id == id){
			name += result[i].name_last + ", " + result[i].name_first;
		}
	}
	
	return name;
}	
	
function showSchedule(req, res) {
	date = req.body.date;
	datelist = req.employeesbydate;
	employeelist = req.employees;
	var servers = '';
	var hosts = '';
	var kitchen = '';
	var cleanup = '';
	var managers = '';
	
	
	for (var i = 0; i < datelist.length; i++){
		
		var currentname = findEmployeeNameById(employeelist, datelist[i].employee_id);
		
		switch(datelist[i].shift_code){
			case 0:
				servers += currentname + '<input type="checkbox" name="remove[]" value="' + datelist[i].employee_id + '"><br>';
			break;
			case 1:
				hosts += currentname + '<input type="checkbox" name="remove[]" value="' + datelist[i].employee_id + '"><br>';
			break;
			case 2:
				kitchen += currentname + '<input type="checkbox" name="remove[]" value="' + datelist[i].employee_id + '"><br>';
			break;
			case 3:
				cleanup += currentname + '<input type="checkbox" name="remove[]" value="' + datelist[i].employee_id + '"><br>';
			break;
			case 4:
				managers += currentname + '<input type="checkbox" name="remove[]" value="' + datelist[i].employee_id + '"><br>';
			break;
			default:
				console.log("Error-Shift_Code incorrect.");
		}
		
	}		
	
	var employees ='';
	
	for (var x = 0; x < employeelist.length; x++){
		
		employees += '<option value="' + employeelist[x].id +'">' + employeelist[x].name_last + ', ' + employeelist[x].name_first + '</option>';
		
		
	}
	
	employees += '<input type="hidden" name="date" value="' + date + '">';
	
	console.log(employees);
	
	res.render('schedule_date', {data: {date: date, servers: servers, hosts: hosts, kitchen: kitchen, cleanup: cleanup, managers: managers, employees: employees}});	
}

function showAddedEmployee(req, res) {
		newcreated = "Record created for " + req.name_first + " " + req.name_last;
		//date = JSON.stringify(req.body.date);
		console.log(newcreated);
		//response = req.employees;
		res.render('newemployee', {data: {newcreated: newcreated}});	
	};//end showAddedEmployee

function showEmployees(req, res) {
	response = findFirstAndLastName(req.employees);
		//date = JSON.stringify(req.body.date);
		//console.log(date);
		//response = req.employees;
		res.render('employees', {data: {response: response}});	
};//end showEmployees

function showLoginResult(req, res) {
	  login_verified = false;
	  sess = req.session;
	  
	  if (req.userfound){
		pswd = req.body.pswd;
		passcheck = req.dbpass;
		console.log("pswd: " + pswd);
		console.log("passcheck: " + passcheck);
		
		if(pswd == passcheck){
			login_verified = true;
			console.log("Passwords Match");
		}
		
	  }
	  
	  if (login_verified){
		  
		  sess.username = req.body.username;
		  
		  res.render('menu', {data: {user: sess.username}});
		  
	  }else {
		  
		  loginresult = "Login not verified. Please Try again.";
		  
		  res.render('login',{data: {loginresult: loginresult}});
		  
	  }
};//end showEmployees

function setTFforSkill(skill) {
	if (skill)
		return true;
	else
		return false;
}
function displayRemoved (req, res) {
	
	
	 res.render('removed');
		
}

function displayAdded (req, res) {
	
	 res.render('added');
	
}

function removeNames(req, res, next) {
	
	
	var removelist = req.body.remove;
	
	if (removelist.length = 0){
		
		next();
	} else {
	
		console.log(removelist);
	
	
		var i = 0;
		for (i = 0; i < removelist.length; i++){
			var sql = {
				text: 'DELETE FROM employees to date WHERE employee_id = $1',
				values: [removelist[i]],
			};
			console.log(username);
			console.log(sql);
	
			//var response;
	
			pool.query(sql, function(err, result) {
			if(err) {
				console.log("Username not found. ");
				console.log(err);
				//callback(err, null);
				req.userfound = false;
				next();
			} else {
			
				
		
			
				
			
			}
		
				
			});
		}
			req.i = i;
			next();
	}
}// end checkPassword 

function addName (req, res, next) {
	
	var date = req.body.date;
	var id = req.body.employee;
	var code = req.body.code;
	const sql = {
		text: 'INSERT INTO employeetodate(date, employee_id, shift_code) VALUES($1, $2, $3)',
		values: [date, id, code],
	};
	
	
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
		
		console.log("Employee added to Shift");
		//console.log(username);
		//console.log(response);
		//req.name_first = name_first;
		//req.name_last = name_last;
		
		next();
		}
		
		
	});
}// end addName


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
	
	const sql = {
		text: 'INSERT INTO employees(name_first, name_last, username, password, server, host, kitchen, cleanup, manager, hours) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
		values: [name_first, name_last, username, pswd, server, host, kitchen, cleanup, manager, hours],
	};
	
	
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
}// end setNewEmployee

function checkPassword(req, res, next) {
	sess = req.session;
	var username = req.body.username;
		
	const sql = {
		text: 'SELECT password FROM employees WHERE username = $1',
		values: [username],
	};
	console.log(username);
	console.log(sql);
	
	//var response;
	
	pool.query(sql, function(err, result) {
		if(err) {
			console.log("Username not found. ");
			console.log(err);
			//callback(err, null);
			req.userfound = false;
			next();
		} else {
			
				
		
		//console.log(result.rows);
		//console.log(result.rows[0]['password']);
		//console.log(response);
		if(result.rows[0] != null) {
			req.dbpass = result.rows[0]['password'];
			req.userfound = true;
			console.log("Username exists");
		}
		
		next();
		}
		
		
	});
	
}// end checkPassword 
	
/*function getHoursByDate(req, res, next) {
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
			

		
	
		console.log("Back from DB with result:");
		console.log(result.rows);
		//console.log(response);
		req.date= result.rows[0].date;
		req.dateID = result.rows[0].id;
		next();
		}
		
		
	});
	
}//end getHoursByDate*/

function getEmployeesByDate(req, res, next) {
	var date = req.body.date;
	const sql = {
		text: 'SELECT * FROM employeetodate WHERE date = $1',
		values: [date], 
	};
	
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
			

		
	
		console.log("Back from DB with result:");
		console.log(result.rows);
		//console.log(response);
		req.employeesbydate = result.rows;
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