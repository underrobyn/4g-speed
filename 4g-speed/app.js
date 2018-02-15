/* 
 * 4G Speed Calculator
*/

var dev = true;
var rbs = [6,15,25,50,75,100]; 	// Bandwidth Multiplier
var mod = [1,1.5,1.95]; 		// Modulation Multiplier
var mimo = [1,2,4]; 			// MiMo Multiplier
var carriers = 0;

// Sneaky TDD bands
var checkType = function(band){
	if (band == 32){
		return "SDL";
	} else if (band >= 33 && band <= 48) {
		return "TDD";
	} else {
		return "FDD";
	}
};

var doCalc = function(carrier){
	// Get information from elements
	var sb = $("#ca_id" + carrier + " .sel_freq").val();
	var sw = $("#ca_id" + carrier + " .sel_width").val();
	var sm = $("#ca_id" + carrier + " .sel_modulation").val();
	var si = $("#ca_id" + carrier + " .sel_inout").val();
	
	var base = .5;
	
	// Calculate result
	var ans = base * rbs[sw] * mod[sm] * mimo[si];
	
	// If TDD error out
	if (checkType(sb) === "TDD"){
		return false;
	}
	
	ans = Math.round(ans*100)/100;
	
	return ans;
};

var overallCalc = function(){
	var total = 0;
	for (var i = 0; i < carriers; i++){
		var x = doCalc(i);
		console.log(x);
		if (x === false){
			$("#answer").html("No TDD Support...");
			return;
		}
		total = total + x;
	}
	$("#answer").html(total + "Mbps");
};

var addRow = function(){
	// Append new carrier
	$("#blocks").append(
		'<div class="carrier_block" id="ca_id' + carriers + '">\
			<h2>Carrier #' + (carriers+1) + '</h2>\
			<div class="sect">\
				<h3>Band Number</h3>\
				<select class="sel_freq">\
					<option value="1">B1&nbsp;&nbsp; | FDD (2100MHz)</option>\
					<option value="2">B2&nbsp;&nbsp; | FDD (1900MHz)</option>\
					<option value="3">B3&nbsp;&nbsp; | FDD (1800MHz)</option>\
					<option value="4">B4&nbsp;&nbsp; | FDD (1700MHz)</option>\
					<option value="5">B5&nbsp;&nbsp; | FDD (850MHz)</option>\
					<option value="7">B7&nbsp;&nbsp; | FDD (2600MHz)</option>\
					<option value="8">B8&nbsp;&nbsp; | FDD (900MHz)</option>\
					<option value="10">B10 | FDD (1700MHz)</option>\
					<option value="11">B11 | FDD (1500MHz)</option>\
					<option value="12">B12 | FDD (700MHz)</option>\
					<option value="13">B13 | FDD (700MHz)</option>\
					<option value="14">B14 | FDD (700MHz)</option>\
					<option value="17">B17 | FDD (700MHz)</option>\
					<option value="18">B18 | FDD (850MHz)</option>\
					<option value="19">B19 | FDD (850MHz)</option>\
					<option value="20">B20 | FDD (800MHz)</option>\
					<option value="21">B21 | FDD (1500MHz)</option>\
					<option value="22">B22 | FDD (3500MHz)</option>\
					<option value="24">B24 | FDD (1600MHz)</option>\
					<option value="25">B25 | FDD (1900MHz)</option>\
					<option value="26">B26 | FDD (850MHz)</option>\
					<option value="27">B27 | FDD (800MHz)</option>\
					<option value="28">B28 | FDD (700MHz)</option>\
					<option value="29">B29 | FDD (700MHz)</option>\
					<option value="30">B30 | FDD (2300MHz)</option>\
					<option value="31">B31 | FDD (450MHz)</option>\
					<option value="32">B32 | SDL (1500MHz)</option>\
					<option value="33">B33 | TDD (2100MHz)</option>\
					<option value="34">B34 | TDD (2100MHz)</option>\
					<option value="35">B35 | TDD (1900MHz)</option>\
					<option value="36">B36 | TDD (1900MHz)</option>\
					<option value="37">B37 | TDD (1900MHz)</option>\
					<option value="38">B38 | TDD (2600MHz)</option>\
					<option value="39">B39 | TDD (1900MHz)</option>\
					<option value="40">B40 | TDD (2300MHz)</option>\
					<option value="41">B41 | TDD (2500MHz)</option>\
					<option value="42">B42 | TDD (3500MHz)</option>\
					<option value="43">B43 | TDD (3700MHz)</option>\
					<option value="44">B44 | TDD (700MHz)</option>\
					<option value="45">B45 | TDD (1500MHz)</option>\
					<option value="46">B46 | TDD (5200MHz)</option>\
					<option value="47">B47 | TDD (5900MHz)</option>\
					<option value="48">B48 | TDD (3600MHz)</option>\
					<option value="65">B65 | FDD (2100MHz)</option>\
					<option value="66">B66 | FDD (1700MHz)</option>\
					<option value="67">B67 | FDD (700MHz)</option>\
					<option value="68">B68 | FDD (700MHz)</option>\
					<option value="69">B69 | FDD (2600MHz)</option>\
					<option value="70">B70 | FDD (2000MHz)</option>\
					<option value="71">B71 | FDD (600MHz)</option>\
				</select>\
			</div>\
			<div class="sect">\
				<h3>Band Width</h3>\
				<select class="sel_width">\
					<option value="0">1.4MHz</option>\
					<option value="1">3MHz</option>\
					<option value="2">5MHz</option>\
					<option value="3" selected="selected">10MHz</option>\
					<option value="4">15MHz</option>\
					<option value="5">20MHz</option>\
				</select>\
			</div>\
			<div class="sect">\
				<h3>Band Modulation</h3>\
				<select class="sel_modulation">\
					<option value="0">16 QAM</option>\
					<option value="1" selected="selected">64 QAM</option>\
					<option value="2">256 QAM</option>\
				</select>\
			</div>\
			<div class="sect">\
				<h3>MiMo?</h3>\
				<select class="sel_inout">\
					<option value="0">1x1 - SiSo</option>\
					<option value="1" selected="selected">2x2 - MiMo</option>\
					<option value="2">4x4 - MiMo</option>\
				</select>\
			</div>\
		</div>'
	);
	$("#ca_id" + carriers + " select").on("change",overallCalc);
	
	carriers++;
	overallCalc();
};

$(document).ready(function(){
	$("#blocks").empty();
	addRow();
	$("#add_carrier").on("click enter",addRow);
	
	if (window.dev !== true){
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').then(function(registration){
				console.log('ServiceWorker registration successful with scope: ',registration.scope);
			},function(err){
				console.log('ServiceWorker registration failed: ',err);
			});
		}
	}
});