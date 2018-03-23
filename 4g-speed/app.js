/*
 * 	4G Speed Calculator
 *	Developed by AbsoluteDouble
 *	https://github.com/jake-cryptic/4g-speed
*/

// Universal configurations
var base = .5;							// Base number for multipliers
var bw = [1.4,3,5,10,15,20];			// Band widths (MHz)
var gbp = [.23,.1,.1,.1,.1,.1];			// Guard band percent (Decimal %)
var mod = [1,1.5,1.95]; 				// Modulation Multiplier
var mimo = [1,2,4]; 					// MiMo Multiplier
var carriers = 0;						// Number of LTE Carriers (CA)

// TDD Specific Configurations
var tddbase = .0005;
// Extended CP rarely used in UK
var tcpl = {
	"normal":7,
	"extended":6
};
var tldir = {
	"D":0,
	"U":2
};
var tddmod = [4,6,8];
var tscprb = 12;							// Sub carriers per resource block
var tconf = {
	// tconf[CONFIG][D/S/U]
	0:[2,2,6],
	1:[4,2,4],
	2:[6,2,2],
	3:[6,1,3],
	4:[7,1,2],
	5:[8,1,1],
	6:[3,2,5]
};
var ssubconf = {
	"normal":{
		// ssubconf[CONFIG][DwPTS/GP/UpPTS]
		0:[3,10,1],
		1:[9,4,1],
		2:[10,3,1],
		3:[11,2,1],
		4:[12,1,1],
		5:[3,9,2],
		6:[9,3,2],
		7:[10,2,2],
		8:[11,1,2]
	},
	"extended":{
		// ssubconf[CONFIG][DwPTS/GP/UpPTS]
		0:[3,8,1],
		1:[8,3,1],
		2:[9,2,1],
		3:[10,1,1],
		4:[3,7,2],
		5:[8,2,2],
		6:[9,1,2],
		7:[0,0,0],
		8:[0,0,0]
	}
};

// Get LTE Link Type
var checkType = function(band){
	if (band == 32){ // Supplementary Downlink - Could also be used for uplink
		return "SDL";
	} else if (band >= 33 && band <= 48) {
		return "TDD";
	} else {
		return "FDD";
	}
};

var sensibleRound = function(n){
	return Math.round(n*100)/100;
};

var rb = function(sw){
	// ( Bandwidth (Hz) - Guard % of Bandwidth (Hz) ) / Resource block size in frequency domain (Hz)
	var rbs = Math.round(
		(
			bw[sw]*1000-(
				bw[sw]*1000*gbp[sw]
			)
		)/180					
	);
	return rbs;
};

var tdd = function(sw,sm,si,tc,tf,tl){
	var dir = ["D",0];
	var consider = dir[1];
	
	// TDD Sect 1
	var symps = tcpl[tl];							// # of OFDM symbols per slot of 0.5ms [symbols]
	var sympsfo = symps/tddbase/1000				// # of OFDM symbols per subframe of 1ms [symbols]
	var sympsft = sympsfo*10						// # of OFDM symbols per frame of 10ms [symbols]
	
	// TDD Sect 2
	var linkoff = tldir[dir[0]];					// TDD Link Direction offset Download|Upload
	
	// TDD Configuration Section
	var tddsconf = tconf[tc];						// TDD Selected Config
	var frames = tddsconf[consider];
	var sect1t = frames*sympsfo;
	
	// TDD Special Configuration Section
	var ssubsconf = ssubconf[tl][tf];				// TDD Special Selected Config
	var sframes = ssubsconf[consider];
	var sect2t = sframes*tddsconf[1];				// Consider special frames
	
	// TDD Total config
	var totalc = sect1t + sect2t;
	
	// Throughput per sub carrier
	var dltpsc = (totalc*100*tddmod[sm]/1000);
	
	// Sub carriers per RB
	var scprb = dltpsc*(tscprb/1000);
	
	// Rbs * Throughput per RBs
	var tpea = rb(sw)*scprb;
	
	// MiMo multipliers
	var atm = tpea * mimo[si];
	
	// Take off 25% to account for RBs used in control channel
	var ctrl = atm * .25;
	var fin = atm-ctrl;
	
	return fin;
};

var fdd = function(sw,sm,si){
	return base * rb(sw) * mod[sm] * mimo[si];
};

var doCalc = function(carrier){
	// Get information from elements
	var sb = $("#ca_id" + carrier + " .sel_freq").val();
	var sw = $("#ca_id" + carrier + " .sel_width").val();
	var sm = $("#ca_id" + carrier + " .sel_modulation").val();
	var si = $("#ca_id" + carrier + " .sel_inout").val();
	var tl = $("#ca_id" + carrier + " .sel_tddcpl").val();
	var tc = $("#ca_id" + carrier + " .sel_tddconfig").val();
	var tf = $("#ca_id" + carrier + " .sel_tddsframe").val();
	
	// Determine calculation type
	var ty = checkType(sb);
	
	// Calculate result
	if (ty === "TDD"){
		
		var ans = tdd(sw,sm,si,tc,tf,tl);
		
	} else if (ty === "FDD" || ty === "SDL"){
		
		var ans = fdd(sw,sm,si);
		
	} else {
		
		console.error("Unknown type:",ty);
		
	}
	
	var rounded = sensibleRound(ans);
	
	return rounded;
};

var overallCalc = function(){
	var total = 0;
	for (var i = 0; i < carriers; i++){
		if ($("#ca_id" + i).length !== 0){
			var x = doCalc(i);
			if (isNaN(x)){
				$("#speeds").html("There was an error");
				return;
			}
			total = total + x;
		}
	}
	$("#speeds").html(sensibleRound(total) + "Mbps");
};

var showTddOpts = function(e){
	if (checkType($("#ca_id" + $(this).data("carrier") + " .sel_freq").val()) === "TDD"){
		$("#tddoptblock" + $(this).data("carrier")).show();
		$(".tdditm").show();
	} else {
		$(".tdditm").hide();
		$("#tddoptblock" + $(this).data("carrier")).hide();
	}
};

var addRow = function(){
	
	// Append new carrier
	var block = $('<tr class="carrier_block" id="ca_id' + carriers + '">\
		<td>\
			<select class="sel_freq" data-carrier="' + carriers + '">\
				<option value="1">B1 | FDD (2100MHz)</option>\
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
			<div id="tddoptblock' + carriers + '" class="tdd_config" style="display:none;">\
				<label for="tdd_cpl' + carriers + '">Cyclic Prefix Length</label>\
				<select class="sel_tddcpl" id="tdd_cpl' + carriers + '">\
					<option value="normal">Normal CP (6)</option>\
					<option value="extended">Extended CP (7)</option>\
				</select>\
				<br />\
				<label for="tdd_conf' + carriers + '">TDD Configuration</label>\
				<select class="sel_tddconfig" id="tdd_conf' + carriers + '">\
					<option value="0">TDD Config 0</option>\
					<option value="1">TDD Config 1</option>\
					<option value="2">TDD Config 2</option>\
					<option value="3">TDD Config 3</option>\
					<option value="4">TDD Config 4</option>\
					<option value="5">TDD Config 5</option>\
					<option value="6">TDD Config 6</option>\
				</select>\
				<br />\
				<label for="tdd_subf' + carriers + '">Special Subframe Configuration</label>\
				<select class="sel_tddsframe" id="tdd_subf' + carriers + '">\
					<option value="0">Special Config 0</option>\
					<option value="1">Special Config 1</option>\
					<option value="2">Special Config 2</option>\
					<option value="3">Special Config 3</option>\
					<option value="4">Special Config 4</option>\
					<option value="5">Special Config 5</option>\
					<option value="6">Special Config 6</option>\
					<option value="7">Special Config 7</option>\
					<option value="8">Special Config 8</option>\
				</select>\
			</div>\
		</td>\
		<td>\
			<select class="sel_width">\
				<option value="0">1.4MHz</option>\
				<option value="1">3MHz</option>\
				<option value="2">5MHz</option>\
				<option value="3" selected="selected">10MHz</option>\
				<option value="4">15MHz</option>\
				<option value="5">20MHz</option>\
			</select>\
		</td>\
		<td>\
			<select class="sel_modulation">\
				<option value="0">16 QAM</option>\
				<option value="1" selected="selected">64 QAM</option>\
				<option value="2">256 QAM</option>\
			</select>\
		</td>\
		<td>\
			<select class="sel_inout">\
				<option value="0">1x1 - SiSo</option>\
				<option value="1" selected="selected">2x2 - MiMo</option>\
				<option value="2">4x4 - MiMo</option>\
			</select>\
		</td>\
		<td>\
			<button class="delete_row" data-carrierid=' + carriers + '>Remove</button>\
		</td>\
	</tr>');
	
	if (carriers !== 0){
		block.insertAfter("#ca_id" + (carriers-1))
	} else {
		$("#carriers").append(block);
	}
	
	$("#ca_id" + carriers + " select").on("change",overallCalc);
	$("#ca_id" + carriers + " .sel_freq").on("change",showTddOpts);
	$("#ca_id" + carriers + " .delete_row").on("click enter",removeRow);
	
	carriers++;
	overallCalc();
};

var removeRow = function(){
	if ($(this).data("carrierid") === 0){
		alert("Can't remove the first carrier");
		return;
	}
	$("#ca_id" + $(this).data("carrierid")).remove();
	overallCalc();
};

var addCreator = function(){
	$("#carriers").append(
		$("<tr/>",{
			"id":"add_carrier"
		}).append(
			$("<td/>",{
				"colspan":"5"
			}).text("Add Carrier")
		).on("click enter",addRow)
	);
};

// A text description of the config
var breakItDown = function(){
	var string = "";
	
	
	return string;
};

$(document).ready(function(){
	$("#carriers").empty();
	addRow();
	addCreator();
	breakItDown();
	
	/*if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').then(function(registration){
			console.log('ServiceWorker registration successful with scope: ',registration.scope);
		},function(err){
			console.log('ServiceWorker registration failed: ',err);
		});
	}*/
});