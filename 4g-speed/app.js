/*
 * 	4G Speed Calculator
 *	Developed by AbsoluteDouble
 *	GitHub: https://github.com/jake-cryptic/4g-speed
 * 	Website: https://absolutedouble.co.uk/
*/
if (!window.location.host.includes("absolutedouble.co.uk")){
	console.log("\n4G Theoretical Throughput Calculator");
	console.log("Developed by AbsoluteDouble");
	console.log("Website: https://absolutedouble.co.uk");
	console.log("Github: https://github.com/jake-cryptic/4g-speed");
}

// For more info on the LAA band, see here: https://en.wikipedia.org/wiki/LTE_in_unlicensed_spectrum

// Fallback for jQuery
if (!window.jQuery){
	var j = document.createElement("script");
	j.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
	j.type = "text/javascript";
	document.head.append(j);
}

// Universal configurations
var base = .5;							// Base number for multipliers
var mod = [.5,1,1.5,1.958]; 			// Modulation Multiplier
var mimo = [1,2,4]; 					// MiMo Multiplier
var carriers = 0;						// Number of LTE Carriers (CA)
var primary = 0;						// Primary carrier ID
var uploadcarriers = [];				// Array of IDs of uplink carriers

// TDD Specific Configurations
var defaultTddBase = .0005;				// 5ms

// Extended CP rarely used in UK
var tcpl = {
	"normal":7,
	"extended":6
};
var tddmod = [2,4,6,8];
var tscprb = 12;						// Sub carriers per resource block
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

/* \\ This is the big table of LTE data //
 type 			= Has to be FDD/TDD/SDL, this is used to determine calculation
 frequency 		= If this isn't set the band won't show in the selector
 range 			= This is what's shown to the user, not used for anything else
 bandwidths 	= These show up in the selector, stops users setting 20MHz bandwidth when the band is only 10MHz wide
 widthEstimated = If the bandwidths for a band are unknown then I guessed the values, let the user know that
*/
var lteBandData = {
	1:{"type":"FDD","frequency":"2100","range":["1920-1980","2110-2170"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	2:{"type":"FDD","frequency":"1900","range":["1850-1910","1930-1990"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	3:{"type":"FDD","frequency":"1800","range":["1710-1785","1805-1880"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	4:{"type":"FDD","frequency":"1700","range":["1710-1755","2110-2155"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	5:{"type":"FDD","frequency":"850","range":["824-849","869-894"],"bandwidths":[1.4,3,5,10],"widthEstimated":false},
	7:{"type":"FDD","frequency":"2600","range":["2500-2570","2620-2690"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	8:{"type":"FDD","frequency":"900","range":["880-915","925-960"],"bandwidths":[1.4,3,5,10],"widthEstimated":false},
	9:{"type":"FDD","frequency":"1800","range":["1749.9-1784.9","1844.9-1879.9"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	10:{"type":"FDD","frequency":"1700","range":["1710-1770","2110-2170"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	11:{"type":"FDD","frequency":"1500","range":["1427.9-1447.9","1475.9-1495.9"],"bandwidths":[5,10],"widthEstimated":false},
	12:{"type":"FDD","frequency":"700","range":["699-716","729-746"],"bandwidths":[1.4,3,5,10],"widthEstimated":false},
	13:{"type":"FDD","frequency":"700","range":["777-787","746-756"],"bandwidths":[5,10],"widthEstimated":false},
	14:{"type":"FDD","frequency":"700","range":["788-798","758-768"],"bandwidths":[5,10],"widthEstimated":false},
	17:{"type":"FDD","frequency":"700","range":["704-716","734-746"],"bandwidths":[5,10],"widthEstimated":false},
	18:{"type":"FDD","frequency":"850","range":["815-830","860-875"],"bandwidths":[5,10,15],"widthEstimated":false},
	19:{"type":"FDD","frequency":"850","range":["830-845","875-890"],"bandwidths":[5,10,15],"widthEstimated":false},
	20:{"type":"FDD","frequency":"800","range":["832-862","791-821"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	21:{"type":"FDD","frequency":"1500","range":["1447.9-1462.9","1495.9-1510.9"],"bandwidths":[5,10,15],"widthEstimated":false},
	22:{"type":"FDD","frequency":"3500","range":["3410-3490","3510-3590"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	//23:{"type":"S-Band","frequency":"2000","range":["2000-2020","2180-2200"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	24:{"type":"FDD","frequency":"1600","range":["1626.5-1660.5","1525-1559"],"bandwidths":[5,10],"widthEstimated":false},
	25:{"type":"FDD","frequency":"1900","range":["1850-1915","1930-1995"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	26:{"type":"FDD","frequency":"850","range":["814-849","859-894"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	27:{"type":"FDD","frequency":"800","range":["807-824","852-869"],"bandwidths":[1.4,3,5,10],"widthEstimated":false},
	28:{"type":"FDD","frequency":"700","range":["703-748","758-803"],"bandwidths":[3,5,10,15,20],"widthEstimated":false},
	29:{"type":"SDL","frequency":"700","range":["717-728"],"bandwidths":[3,5,10],"widthEstimated":false},
	30:{"type":"FDD","frequency":"2300","range":["2305-2315","2350-2360"],"bandwidths":[5,10],"widthEstimated":false},
	31:{"type":"FDD","frequency":"450","range":["452.5-457.5","462.5-467.5"],"bandwidths":[1.4,3,5],"widthEstimated":false},
	32:{"type":"SDL","frequency":"1500","range":["1452-1496"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	33:{"type":"TDD","frequency":"2100","range":["1900-1920"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	34:{"type":"TDD","frequency":"2100","range":["2010-2025"],"bandwidths":[5,10,15],"widthEstimated":false},
	35:{"type":"TDD","frequency":"1900","range":["1850-1910"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	36:{"type":"TDD","frequency":"1900","range":["1930-1990"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	37:{"type":"TDD","frequency":"1900","range":["1910-1930"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	38:{"type":"TDD","frequency":"2600","range":["2570-2620"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	39:{"type":"TDD","frequency":"1900","range":["1880-1920"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	40:{"type":"TDD","frequency":"2300","range":["2300-2400"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	41:{"type":"TDD","frequency":"2500","range":["2496-2690"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	42:{"type":"TDD","frequency":"3400","range":["3400-3600","2110-2170"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	43:{"type":"TDD","frequency":"3700","range":["3600-3800"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	44:{"type":"TDD","frequency":"700","range":["703-803"],"bandwidths":[3,5,10,15,20],"widthEstimated":false},
	45:{"type":"TDD","frequency":"1500","range":["1447-1467"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	46:{"type":"LAA","frequency":"5200","range":["5150-5925"],"bandwidths":[10,20],"widthEstimated":false},
	47:{"type":"TDD","frequency":"5900","range":["5855-5925"],"bandwidths":[10,20],"widthEstimated":false},
	48:{"type":"TDD","frequency":"3600","range":["3550-3700"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	49:{"type":"TDD","frequency":"3600","range":["3550-3700"],"bandwidths":[10,20],"widthEstimated":false},
	50:{"type":"TDD","frequency":"1500","range":["1432-1517"],"bandwidths":[3,5,10,15,20],"widthEstimated":false},
	51:{"type":"TDD","frequency":"1500","range":["1427-1432"],"bandwidths":[3,5],"widthEstimated":false},
	65:{"type":"FDD","frequency":"2100","range":["1920-2010","2110-2200"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	66:{"type":"FDD","frequency":"1700","range":["1710-1780","2110-2200"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	67:{"type":"SDL","frequency":"700","range":["738-758"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	68:{"type":"FDD","frequency":"700","range":["698-728","753-783"],"bandwidths":[5,10,15],"widthEstimated":false},
	69:{"type":"SDL","frequency":"2600","range":["2570-2620"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	70:{"type":"FDD","frequency":"2000","range":["1695-1710","1995-2020"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	71:{"type":"FDD","frequency":"600","range":["663-698","617-652"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	72:{"type":"FDD","frequency":"450","range":["451-456","461-466"],"bandwidths":[1.4,3,5],"widthEstimated":false},
	73:{"type":"FDD","frequency":"450","range":["450-455","460-465"],"bandwidths":[1.4,3,5],"widthEstimated":false},
	74:{"type":"FDD","frequency":"1500","range":["1427-1470","1475-1518"],"bandwidths":[1.4,3,5,10,15,20],"widthEstimated":false},
	75:{"type":"SDL","frequency":"1500","range":["1432-1517"],"bandwidths":[5,10,15,20],"widthEstimated":false},
	76:{"type":"SDL","frequency":"1500","range":["1427-1432"],"bandwidths":[1.4,3,5],"widthEstimated":true},
	85:{"type":"FDD","frequency":"700","range":["698-716","728-746"],"bandwidths":[5,10],"widthEstimated":false}
};

// A nice function for rounding to 2 dp
var sensibleRound = function(n){
	return Math.round(n*100)/100;
};

var rb = function(sw,bw){
	// ( Bandwidth (Hz) - Guard % of Bandwidth (Hz) ) / Resource block size in frequency domain (Hz)
	
	var gbp = (bw[sw] === 1.4 ? .23 : .1);
	var rbs = Math.round(
		(
			bw[sw]*1000-(
				bw[sw]*1000*gbp
			)
		)/180					
	);
	return rbs;
};

var tdd = function(selWidth,bandWidths,selModulation,selMimo,selTddCnf,selTddCpl,selTddFrm,link,tddBase){
	// TDD Sect 1
	var symps = tcpl[selTddCpl];					// # of OFDM symbols per slot of 0.5ms [symbols]
	var sympsfo = symps/tddBase/1000;				// # of OFDM symbols per subframe of 1ms [symbols]
	var sympsft = sympsfo*10;						// # of OFDM symbols per frame of 10ms [symbols]
	
	// TDD Sect 2
	var linkoff = (link === "D" ? 0 : 2);			// TDD Link Direction offset Download|Upload
	
	// TDD Configuration Section
	var tddsconf = tconf[selTddCnf];				// TDD Selected Config
	var frames = tddsconf[linkoff];
	var sect1t = frames*sympsfo;
	
	// TDD Special Configuration Section
	var ssubsconf = ssubconf[selTddCpl][selTddFrm];	// TDD Special Selected Config
	var sframes = ssubsconf[linkoff];
	var sect2t = sframes*tddsconf[1];				// Consider special frames
	
	// TDD Total config
	var totalc = sect1t + sect2t;
	
	// Throughput per sub carrier
	var dltpsc = (totalc*100*tddmod[selModulation]/1000);
	
	// Sub carriers per RB
	var scprb = dltpsc*(tscprb/1000);
	
	// Rbs * Throughput per RBs
	var tpea = rb(selWidth,bandWidths)*scprb;
	
	// MiMo multipliers
	var atm = tpea * mimo[selMimo];
	
	// Take off 25% to account for RBs used in control channel
	var ctrl = atm * .25;
	var fin = atm-ctrl;
	
	return fin;
};

var fdd = function(bw,sw,sm,si){
	return base * rb(sw,bw) * mod[sm] * mimo[si];
};

var doCalc = function(carrier){
	// Get the band
	var selBand = $("#carrier_id_n" + carrier + " .rowopt_band").val();
	
	// Check that the band was set
	if (selBand === "0"){
		return "Please select a band";
	}
	
	// Get the bandwidth
	var selWidth = $("#carrier_id_n" + carrier + " .rowopt_width").val();
	var selDlModulation = $("#carrier_id_n" + carrier + " .rowopt_dlmod").val();
	var selUlModulation = $("#carrier_id_n" + carrier + " .rowopt_ulmod").val();
	var selMimo = $("#carrier_id_n" + carrier + " .rowopt_mimo").val();
	
	// Determine calculation type
	var bandType = lteBandData[selBand].type;
	var bandWidths = lteBandData[selBand].bandwidths;
	
	// Initialise result containers
	var uplink = 0;
	var downlink = 0;
	
	// Calculate result
	if (bandType === "TDD"){
		
		// Get TDD options
		var selTddCpl = $("#carrier_id_n" + carrier + " .rowopt_tddcpl").val();
		var selTddCnf = $("#carrier_id_n" + carrier + " .rowopt_tddcnf").val();
		var selTddFrm = $("#carrier_id_n" + carrier + " .rowopt_tddssf").val();
		
		if (selTddCpl === undefined || selTddCnf === undefined || selTddFrm === undefined){
			return "Please enter TDD Configuration";
		}
		
		// Get results
		downlink = tdd(selWidth,bandWidths,selDlModulation,selMimo,selTddCnf,selTddCpl,selTddFrm,"D",defaultTddBase);
		uplink = tdd(selWidth,bandWidths,selUlModulation,0,selTddCnf,selTddCpl,selTddFrm,"U",defaultTddBase);
		
	} else if (bandType === "LAA") {
		// LAA Band is not supported yet
		return "LAA Band is not supported yet";
	} else if (bandType === "FDD"){
		
		// Get results
		downlink = fdd(bandWidths,selWidth,selDlModulation,selMimo);
		uplink = fdd(bandWidths,selWidth,selUlModulation,0);
		
	} else if (bandType === "SDL"){
		
		// Get L-Band direction
		var selLBDir = $("#carrier_id_n" + carrier + " .rowopt_lbdir").val();
		if (selLBDir === "0"){
			downlink = fdd(bandWidths,selWidth,selDlModulation,selMimo);
		} else {
			uplink = fdd(bandWidths,selWidth,selUlModulation,0);
		}
		
	} else {
		console.error("Unknown type:",bandType);
	}
	
	var rDl = sensibleRound(downlink);
	var rUl = sensibleRound(uplink);
	
	return [rDl,rUl];
};

var tryCalculateSpeed = function(){
	var items = $(".carrier_row");
	var totalDownlink = 0, totalUplink = 0, errMsg = false;
	for (var i = 0,l = items.length;i<l;i++){
		caid = $(items[i]).data("caid");
		calc = doCalc(caid);
		
		if (typeof calc !== "object"){
			$("#speeds").text(calc);
			errMsg = true;
			continue;
		}
		
		totalDownlink += calc[0];
		if (uploadcarriers.indexOf(caid) !== -1 || caid === primary){
			totalUplink += calc[1];
		}
		
		setCarrierTitle($("#carrier_id_n" + caid + " .rowopt_band").val(),caid,calc);
	}
	
	if (!errMsg) $("#speeds").html(sensibleRound(totalDownlink) + "Mbps &#8595; &amp; " + sensibleRound(totalUplink) + "Mbps &#8593;");
};

var generateBandSelector = function(caid){
	var sel = $("<select/>",{
		"class":"rowopt_band",
		"id":"rowopt_band"+caid,
		"data-carrier":caid
	});
	
	sel.append($("<option/>",{"value":0}).text("Select a band"))
	
	var dKeys = Object.keys(lteBandData);
	for (var i = 0, l = dKeys.length;i<l;i++){
		if (lteBandData[dKeys[i]].frequency !== ""){
			txt = "Band " + dKeys[i];
			txt += " | " + lteBandData[dKeys[i]].type;
			txt += " (" + lteBandData[dKeys[i]].frequency + "MHz)";
			
			sel.append(
				$("<option/>",{
					"value":dKeys[i]
				}).text(txt)
			);
		}
	}
	
	return sel;
};

var generateTddOptSelector = function(caid){
	var opts = $("<div/>",{
		"data-carrier":caid
	});
	
	// Cyclic Prefix Selector
	opts.append(
		$("<label/>",{"for":"tddconf_cpl" + caid}).text("Cyclic Prefix Length"),
		$("<select/>",{"class":"rowopt_tddcpl","id":"tddconf_cpl" + caid}).append(
			$("<option/>",{"value":"normal"}).text("Normal CP [6]"),
			$("<option/>",{"value":"extended"}).text("Extended CP [7]")
		)
	);
	
	// TDD Config Selector
	opts.append(
		$("<label/>",{"for":"tddconf_cnf" + caid}).text("TDD Configuration"),
		$("<select/>",{"class":"rowopt_tddcnf","id":"tddconf_cnf" + caid}).append(
			$("<option/>",{"value":"0"}).text("TDD Config 0"),
			$("<option/>",{"value":"1"}).text("TDD Config 1"),
			$("<option/>",{"value":"2"}).text("TDD Config 2"),
			$("<option/>",{"value":"3"}).text("TDD Config 3"),
			$("<option/>",{"value":"4"}).text("TDD Config 4"),
			$("<option/>",{"value":"5"}).text("TDD Config 5"),
			$("<option/>",{"value":"6"}).text("TDD Config 6")
		)
	);
	
	// Special Subframe Config Selector
	opts.append(
		$("<label/>",{"for":"tddconf_ssf" + caid}).text("Special Subframe Configuration"),
		$("<select/>",{"class":"rowopt_tddssf","id":"tddconf_ssf" + caid}).append(
			$("<option/>",{"value":"0"}).text("Special Config 0"),
			$("<option/>",{"value":"1"}).text("Special Config 1"),
			$("<option/>",{"value":"2"}).text("Special Config 2"),
			$("<option/>",{"value":"3"}).text("Special Config 3"),
			$("<option/>",{"value":"4"}).text("Special Config 4"),
			$("<option/>",{"value":"5"}).text("Special Config 5"),
			$("<option/>",{"value":"6"}).text("Special Config 6"),
			$("<option/>",{"value":"7"}).text("Special Config 7"),
			$("<option/>",{"value":"8"}).text("Special Config 8")
		)
	);
	
	return opts;
};

var generateLBandSelector = function(caid){
	var opts = $("<div/>",{
		"data-carrier":caid
	});
	
	// Cyclic Prefix Selector
	opts.append(
		$("<select/>",{"class":"rowopt_lbdir","id":"lband_dir" + caid,"data-carrier":caid}).append(
			$("<option/>",{"value":"0"}).text("Downlink (SDL)"),
			$("<option/>",{"value":"1"}).text("Uplink (SUL)")
		)
	);
	
	return opts;
};

var generateBandWidthSelector = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text("Band Width"));;
	
	opts.append(
		$("<select/>",{
			"class":"rowopt_width",
			"id":"rowopt_width" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":"0"}).text("Select a band first")
		)
	);
	
	return opts;
};

var generateModulationSelector = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text("Modulation"));;
	
	opts.append(
		$("<label/>",{"for":"rowopt_dlmod" + caid,"id":"rowlabel_dlmod"+caid}).text("Downlink Modulation"),
		$("<select/>",{
			"class":"rowopt_dlmod",
			"id":"rowopt_dlmod" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":"0"}).text("Select a band first")
		),
		$("<label/>",{"for":"rowopt_ulmod" + caid,"id":"rowlabel_ulmod"+caid}).text("Uplink Modulation"),
		$("<select/>",{
			"class":"rowopt_ulmod",
			"id":"rowopt_ulmod" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":"0"}).text("Select a band first")
		)
	);
	
	return opts;
};

var generateMiMoSelector = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text("MiMo"));;
	
	opts.append(
		$("<select/>",{
			"class":"rowopt_mimo",
			"id":"rowopt_mimo" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":0}).text("Select a band first")
		),
		$("<span/>",{
			"id":"rowmsg_mimo" + caid,
			"style":"display:none"
		}).text("Upload can only be SISO")
	);
	
	return opts;
};

var generateRowOptions = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text("Options"));
	
	// Every carrier should have this option
	opts.append(
		$("<button/>",{
			"class":"b_rmrow",
			"data-carrier":caid
		}).text("Remove Carrier")
	);
	
	// Options for carriers that aren't the primary
	if (caid !== primary){
		opts.append(
			$("<button/>",{
				"class":"b_aggupl",
				"id":"rowbt_aggupl"+caid,
				"data-carrier":caid
			}).text("Aggregate Uplink"),
			$("<button/>",{
				"class":"b_primaryc",
				"data-carrier":caid,
				"style":"display:none"
			}).text("Set as Primary")
		);
	}
	
	return opts;
};

var bandSelect = function(){
	var band = $(this).val();
	var carrier = $(this).data("carrier");
	
	if (band === "0"){
		$("#rowopt_width"+carrier).empty().append($("<option/>",{"value":"0"}).text("Select a band..."));
		$("#rowopt_dlmod"+carrier).empty().append($("<option/>",{"value":"0"}).text("Select a band..."));
		$("#rowopt_ulmod"+carrier).empty().append($("<option/>",{"value":"0"}).text("Select a band..."));
		$("#rowopt_mimo"+carrier).empty().append($("<option/>",{"value":"0"}).text("Select a band..."));
		$("#band_title"+carrier).html("Carrier #"+(carrier+1) + " - Select a band");
	} else {
		setCarrierTitle(band,carrier,"");
		populateSelectors(band,carrier);
		bandOptions(band,carrier);
	}
};

var bandOptions = function(band,carrier){
	// Reset some stuff
	$("#rowopt_dlmod"+carrier+",#rowlabel_dlmod"+carrier+",#rowopt_ulmod"+carrier+",#rowlabel_ulmod"+carrier+",#rowopt_mimo"+carrier+",#rowbt_aggupl"+carrier).show();
	
	// Band type specific configurations
	if (lteBandData[band].type === "TDD"){
		$("#row_extra"+carrier).empty().append(generateTddOptSelector(carrier));
		$("#row_extra"+carrier+" select").on("change",tryCalculateSpeed).trigger("change");
	} else if (lteBandData[band].type === "SDL"){
		$("#row_extra"+carrier).empty().append(generateLBandSelector(carrier));
		$("#row_extra"+carrier+" select").on("change",tryCalculateSpeed);
		$("#rowbt_aggupl"+carrier).hide();
		$("#row_extra"+carrier+" select.rowopt_lbdir").on("change",lbandUxModifier).trigger("change");
	} else {
		$("#row_extra"+carrier).empty().append($("<span/>").text("No extra options for FDD bands"));
	}
};

var lbandUxModifier = function(){
	var caid = $(this).data("carrier");
	$("#rowlabel_ulmod" + caid + ",#rowlabel_dlmod" + caid).hide();
	
	if ($(this).val() === "0"){
		$("#rowopt_dlmod" + caid + ",#rowopt_mimo" + caid).show();
		$("#rowopt_ulmod" + caid + ",#rowmsg_mimo" + caid).hide();
		if (uploadcarriers.indexOf(caid) !== -1){
			uploadcarriers.slice(uploadcarriers.indexOf(caid),1);
		}
	} else {
		$("#rowopt_dlmod" + caid + ",#rowopt_mimo" + caid).hide();
		$("#rowopt_ulmod" + caid + ",#rowmsg_mimo" + caid).show();
		if (uploadcarriers.indexOf(caid) === -1){
			uploadcarriers.push(caid);
		}
	}
	tryCalculateSpeed();
};

var setCarrierTitle = function(band,carrier,speed){
	var freqInf, caname, stext = "";
	if (lteBandData[band].range.length === 2){
		freqInf = "Band: " + lteBandData[band].frequency + "MHz, Uplink: " + lteBandData[band].range[0] + "MHz, ";
		freqInf += "Downlink: " + lteBandData[band].range[1] + "MHz";
	} else {
		freqInf = "Band: " + lteBandData[band].frequency + "MHz, Range: " + lteBandData[band].range[0] + "MHz";
	}
	
	var uploadUsed = (uploadcarriers.indexOf(carrier) !== -1 || carrier === primary ? true : false);
	if (speed[0] !== 0){
		stext += "<strong>" + calc[0] + "Mbps &#8595;</strong>";
		if (speed[1] !== 0){
			stext += " &amp; "
		}
	}
	if (speed[1] !== 0){
		stext += (uploadUsed ? "<strong>":"") + calc[1] + "Mbps &#8593; " + (uploadUsed ? "</strong>":"");
	}
	
	$("#band_title"+carrier).html(freqInf + "<br />" + stext);
};

var populateSelectors = function(band,carrier){
	// Populate bandwidth selector
	$("#rowopt_width"+carrier).empty();
	for (var i = 0, l = lteBandData[band].bandwidths.length;i<l;i++){
		$("#rowopt_width"+carrier).append(
			$("<option/>",{
				"value":i
			}).text(lteBandData[band].bandwidths[i] + "MHz" + (lteBandData[band].widthEstimated === true ? "*" : "") + " (" + rb(i,lteBandData[band].bandwidths) + "rb)")
		);
	}
	$("#rowopt_width" + carrier)[0].selectedIndex = lteBandData[band].bandwidths.length-1;
	
	// Populate Modulation selector
	$("#rowopt_dlmod"+carrier).empty().append(
		$("<option/>",{"value":1}).text("16QAM"),
		$("<option/>",{"value":2,"selected":"selected"}).text("64QAM"),
		$("<option/>",{"value":3}).text("256QAM")
	);
	$("#rowopt_ulmod"+carrier).empty().append(
		$("<option/>",{"value":0}).text("QPSK"),
		$("<option/>",{"value":1,"selected":"selected"}).text("16QAM"),
		$("<option/>",{"value":2}).text("64QAM")
	);
	
	// Populate MiMo selector
	$("#rowopt_mimo"+carrier).empty().append(
		$("<option/>",{"value":0}).text("1x1 SiSo"),
		$("<option/>",{"value":1,"selected":"selected"}).text("2x2 MiMo"),
		$("<option/>",{"value":2}).text("4x4 MiMo")
	);
	
	tryCalculateSpeed();
};

var assignSelectorEvents = function(caid){
	$("#rowopt_band" + caid).on("change",bandSelect);
};

var addRow = function(){
	var row = $("<div/>",{
		"id":"carrier_id_n" + carriers,
		"class":"carrier_row",
		"data-caid":carriers
	});
	
	row.append(
		$("<div/>",{"class":"row_header","id":"rhead_id"+carriers,"data-caid":carriers}).append(
			$("<h2/>",{"class":"band_title","id":"band_title"+carriers}).text("Carrier #" + (carriers+1) + " - Select a band")
		),
		$("<div/>",{"class":"row_content","id":"rcont_id"+carriers}).append(
			$("<div/>",{"class":"rowsect"}).append($("<span/>",{"class":"rowsectheader"}).text("LTE Band")).append(generateBandSelector(carriers)),
			$("<div/>",{"class":"rowsect","id":"row_extra"+carriers}).append($("<span/>").text("No options for this band type")),
			generateBandWidthSelector(carriers),
			generateModulationSelector(carriers),
			generateMiMoSelector(carriers),
			generateRowOptions(carriers)
		)
	);
	
	$("#ca_body").append(row);
	
	// Assign selector events
	$("#carrier_id_n" + carriers + " select").on("change",tryCalculateSpeed);
	$("#carrier_id_n" + carriers + " .b_rmrow").on("click enter",removeRow);
	$("#carrier_id_n" + carriers + " .b_aggupl").on("click enter",uplinkca);
	$("#carrier_id_n" + carriers + " .b_primaryc").on("click enter",changePrimary);
	$("#rhead_id" + carriers).on("click enter",toggleRowView);
	
	assignSelectorEvents(carriers);
	
	carriers++;
	tryCalculateSpeed();
};

var toggleRowView = function(){
	var id = $(this).data("caid");
	if ($("#rcont_id"+id).is(":visible")){
		$("#rcont_id"+id).slideUp(250);
	} else {
		$("#rcont_id"+id).slideDown(250);
	}
};

var changePrimary = function(){
	alert("Feature not added yet");
};

var uplinkca = function(){
	var caid = $(this).data("carrier");
	if (uploadcarriers.indexOf(caid) !== -1){
		uploadcarriers.splice(uploadcarriers.indexOf(caid),1);
		$(this).text("Aggregate Uplink");
	} else {
		uploadcarriers.push(caid);
		$(this).text("Deaggregate Uplink");
	}
	tryCalculateSpeed();
};

var removeRow = function(){
	// Check if it's the first carrier
	if ($(this).data("carrier") === primary){
		alert("Can't remove the primary carrier");
		return;
	}
	
	// Remove the row
	$("#carrier_id_n" + $(this).data("carrier")).remove();
	
	// Re-calculate the speed
	tryCalculateSpeed();
};

$(document).ready(function(){
	$("#ca_body").empty();
	$("#add_carrier").on("click enter",addRow);
	addRow();
	
	/*if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').then(function(registration){
			console.log('ServiceWorker registration successful with scope: ',registration.scope);
		},function(err){
			console.log('ServiceWorker registration failed: ',err);
		});
	}*/
});