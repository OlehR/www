var apiUrl = "http://api.spar.uz.ua/znp"
//var apiUrl = "http://znp.vopak.local/api/api_v1_utf8.php";
//var apiUrl = "http://195.16.78.134:7654/api/api_v1_utf8.php";

$.ajaxSetup({
        url: apiUrl,
        method: "POST",
		contentType:"application/json; charset=utf-8",
        processData: false,
		dataType: 'json',   
		crossDomain: true,		
		xhrFields: {withCredentials: true}});