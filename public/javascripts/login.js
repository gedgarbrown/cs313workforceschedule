function usernameValid() {

		if((document.loginForm.username.value == "") || (document.loginForm.username.value == "<enter username>")) {
			document.getElementById("invalidUsername").innerHTML = "enter username!!";
			return false;
		}
		
		document.getElementById("invalidUsername").innerHTML = "";
		return true;
}

function passwordValid() {
	
		if(document.loginForm.pswd.value == "") {
			document.getElementById("invalidPassword").innerHTML = "enter password!!";
			return false;
		}
		
		document.getElementById("invalidPassword").innerHTML = "";
		return true;
}		

function loginIsValid(){
	var isValid = true;
	
	if(!usernameValid()) {
		isValid = false;
	}
	
	if(!passwordValid()) {
		isValid = false;
	}
	
	return isValid;
	
}

function submitLogin() {
	
	if(!loginIsValid()){
		alert("Enter username and password!!");
		return false;
	}
	
	//alert("Login Successful!");
	
	return true;
}