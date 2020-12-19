/*
 * 	4G Speed Calculator
 *	Developed by AbsoluteDouble
 * 	Special thanks to Peter Clarke for German Translations
 *	GitHub: https://github.com/jake-cryptic/4g-speed
 * 	Website: https://absolutedouble.co.uk/
*/

// Polyfill: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
if (!String.prototype.includes) {
	String.prototype.includes = function(search, start) {
		if (typeof start !== 'number') {
			start = 0;
		}

		if (start + search.length > this.length) {
			return false;
		} else {
			return this.indexOf(search, start) !== -1;
		}
	};
}

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
var followSpec = true;					// Choose if client follows LTE Specification
var base = .5;							// Base number for multipliers
var mod = [.5,1,1.5,1.958]; 			// Modulation Multiplier
var mimo = [1,2,4]; 					// MiMo Multiplier
var carriers = 0;						// Number of LTE Carriers (CA)
var primary = 0;						// Primary carrier ID
var uploadcarriers = [];				// Array of IDs of uplink carriers
var vBandwidths = [1.4,3,5,10,15,20];	// List of valid bandwidths

var strings = {
	"en":{
		"numeric.separators":[",","."],
		"alert.selband":"Please select a band",
		"alert.selfirst":"Select a band first",
		"alert.seltext":"Select a band",
		"alert.selconf":"Please enter TDD Configuration",
		"alert.laaband":"LAA Band is not supported yet",
		"alert.remprim":"Can't remove the primary carrier",
		"label.tddcpl":"Cyclic Prefix Length",
		"label.tddcnf":"TDD Configuration",
		"label.tddssf":"Special Subframe Configuration",
		"label.band":"Band",
		"label.config":"Config",
		"label.mimo":"MiMo",
		"label.options":"Options",
		"label.earfcn":"EARFCN",
		"label.resblocks":"Resource Blocks",
		"label.bandwidth":"Bandwidth",
		"label.mod":"Modulation",
		"label.dlmod":"Downlink Modulation",
		"label.ulmod":"Uplink Modulation",
		"label.aggupl":"Aggregate Uplink",
		"label.deaggupl":"Deaggregate Uplink",
		"label.remca":"Remove Carrier",
		"label.setprim":"Set as Primary",
		"label.sdl":"Downlink (SDL)",
		"label.sul":"Uplink (SUL)",
		"msg.nofddopts":"No extra options for FDD bands",
		"msg.nobandopts":"No options for this band type",
		"ux.title":"4G Theoretical Throughput Calculator",
		"ux.exitsetting":"Close Settings",
		"ux.settings":"Settings",
		"ux.reloadwarn":"Page will reload after setting change.",
		"ux.language":"Update Language",
		"ux.adherespec":"Adhere to 3gpp specification for LTE",
		"ux.addca":"Add Carrier"
	},
	"fr":{
		"numeric.separators":[".",","],
		"alert.selband":"Merci de choisir une bande",
		"alert.selfirst":"Sélectionnez d’abord une bande",
		"alert.seltext":"Sélectionnez une bande",
		"alert.selconf":"Merci d’entrer le type de configuration TDD",
		"alert.laaband":"La bande de fréquence LAA (??) n’est pas encore supportée",
		"alert.remprim":"Vous ne pouvez pas supprimer la porteuse principal (pas sur)",
		"label.tddcpl":"Cyclic préfix Length",
		"label.tddcnf":"Configuration TDD",
		"label.tddssf":"Special Subframe Configuration",
		"label.band":"Bande",
		"label.config":"Config",
		"label.mimo":"MiMo",
		"label.options":"Options",
		"label.earfcn":"EARFCN",
		"label.bandwidth":"Bande passante",
		"label.resblocks":"Blocs de ressources",
		"label.mod":"Modulation de Fréquence",
		"label.dlmod":"Télécharger la modulation",
		"label.ulmod":"Modulation de téléchargement",
		"label.aggupl":"Agrégat téléverser",
		"label.deaggupl":"Désagréger téléverser",
		"label.remca":"Retirer la porteuse",
		"label.setprim":"Définir comme porteuse principale",
		"label.sdl":"Télécharger (SDL)",
		"label.sul":"Téléverser (SUL)",
		"msg.nofddopts":"Aucune option disponible en FDD",
		"msg.nobandopts":"Aucune option pour ce type de porteuse",
		"ux.title":"Calculateur de débit théorique 4G",
		"ux.exitsetting":"Fermer préférences",
		"ux.settings":"Préférences",
		"ux.reloadwarn":"Page will reload after setting change.",
		"ux.language":"Choisir langue",
		"ux.adherespec":"Adhérer aux spécifications 3GPP pour LTE",
		"ux.addca":"Ajouter une porteuse"
	},
	"de":{
		"numeric.separators":[".",","],
		"alert.selband":"Bitte wählen Sie ein Frequenzband",
		"alert.selfirst":"Bitte wählen Sie zuerst ein Frequenzband",
		"alert.seltext":"Bitte wählen Sie ein Frequenzband",
		"alert.selconf":"Bitte wählen Sie eine Konfiguration TDD",
		"alert.laaband":"LAA wird noch nicht unterstützt ",
		"alert.remprim":"Der primäre Träger kann nicht entfernt werden",
		"label.tddcpl":"Zyklische Präfixlänge",
		"label.tddcnf":"Konfiguration TDD ",
		"label.tddssf":"Spezielle Subframe-Konfiguration",
		"label.band":"Frequenzband",
		"label.config":"Config",
		"label.mimo":"MiMo",
		"label.options":"Optionen",
		"label.earfcn":"EARFCN",
		"label.bandwidth":"Bandbreite",
		"label.resblocks":"Ressourcenblöcke",
		"label.mod":"Modulation",
		"label.dlmod":"Downlink Modulation",
		"label.ulmod":"Uplink Modulation",
		"label.aggupl":"Aggregat Uplink",
		"label.deaggupl":"Disaggregieren Uplink",
		"label.remca":"Träger entfernen" ,
		"label.setprim":"Als primär festlegen",
		"label.sdl":"Downlink (SDL)",
		"label.sul":"Uplink (SUL)",
		"msg.nofddopts":"Keine anderen Optionen zur Auswahl für FDD",
		"msg.nobandopts":"Keine Optionen für den ausgewählten Bandtyp",
		"ux.title":"4G Theoretische Throughput-Rechner",
		"ux.exitsetting":"Close Settings",
		"ux.settings":"Settings",
		"ux.reloadwarn":"Page will reload after setting change.",
		"ux.language":"Sprache wählen",
		"ux.adherespec":"Adhere to 3gpp specification for LTE",
		"ux.addca":"Träger hinzufügen"
	}
};
var loadSettings = function(){
	// Set default values
	window._l = strings["en"];
	window.strict3gpp = true;
	
	// Check for cookies library
	if (typeof Cookies !== "function") return;
	
	// Get setting information from cookies
	var l = Cookies.get("language");
	var s = Cookies.get("strict3gpp");
	
	// If no setting cookie set, set one
	if (l === undefined){
		Cookies.set("language","en");
	}
	if (s === undefined){
		Cookies.set("strict3gpp","true");
	}
	
	// If language is valid then use it
	if (strings[l] !== undefined){
		window._l = strings[l];
	}
	
	window.strict3gpp = (s === "false" ? false : true);
	
	console.log("\n",l,s,"\n");
};

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
 earfcn 		= Low and high values of center frequency, used to determine band
*/
var lteBandData = {
	1:{"type":"FDD","frequency":"2100","range":["1920-1980","2110-2170"],"bandwidths":[5,10,15,20],"earfcn":[0,599],"rel":8},
	2:{"type":"FDD","frequency":"1900","range":["1850-1910","1930-1990"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[600,1199],"rel":8},
	3:{"type":"FDD","frequency":"1800","range":["1710-1785","1805-1880"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[1200,1949],"rel":8},
	4:{"type":"FDD","frequency":"1700","range":["1710-1755","2110-2155"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[1950,2399],"rel":8},
	5:{"type":"FDD","frequency":"850","range":["824-849","869-894"],"bandwidths":[1.4,3,5,10],"earfcn":[2400,2649],"rel":8},
	//6:{"type":"FDD","frequency":"850","range":["830-840","875-885"],"bandwidths":[5,10],"rel":8},	// UMTS Only Band
	7:{"type":"FDD","frequency":"2600","range":["2500-2570","2620-2690"],"bandwidths":[5,10,15,20],"earfcn":[2750,3449],"rel":8},
	8:{"type":"FDD","frequency":"900","range":["880-915","925-960"],"bandwidths":[1.4,3,5,10],"earfcn":[3450,3799],"rel":8},
	9:{"type":"FDD","frequency":"1800","range":["1749.9-1784.9","1844.9-1879.9"],"bandwidths":[5,10,15,20],"earfcn":[3800,4149],"rel":8},
	10:{"type":"FDD","frequency":"1700","range":["1710-1770","2110-2170"],"bandwidths":[5,10,15,20],"earfcn":[4150,4749],"rel":8},
	11:{"type":"FDD","frequency":"1500","range":["1427.9-1447.9","1475.9-1495.9"],"bandwidths":[5,10],"earfcn":[4750,4949],"rel":8},
	12:{"type":"FDD","frequency":"700","range":["699-716","729-746"],"bandwidths":[1.4,3,5,10],"earfcn":[5010,5179],"rel":8.4},
	13:{"type":"FDD","frequency":"700","range":["777-787","746-756"],"bandwidths":[5,10],"earfcn":[5180,5279],"rel":8},
	14:{"type":"FDD","frequency":"700","range":["788-798","758-768"],"bandwidths":[5,10],"earfcn":[5280,5370],"rel":8},
	17:{"type":"FDD","frequency":"700","range":["704-716","734-746"],"bandwidths":[5,10],"earfcn":[5730,5849],"rel":8.3},
	18:{"type":"FDD","frequency":"850","range":["815-830","860-875"],"bandwidths":[5,10,15],"earfcn":[5850,5999],"rel":9},
	19:{"type":"FDD","frequency":"850","range":["830-845","875-890"],"bandwidths":[5,10,15],"earfcn":[6000,6149],"rel":9},
	20:{"type":"FDD","frequency":"800","range":["832-862","791-821"],"bandwidths":[5,10,15,20],"earfcn":[6150,6449],"rel":9},
	21:{"type":"FDD","frequency":"1500","range":["1447.9-1462.9","1495.9-1510.9"],"bandwidths":[5,10,15],"earfcn":[6450,6559],"rel":9},
	22:{"type":"FDD","frequency":"3500","range":["3410-3490","3510-3590"],"bandwidths":[5,10,15,20],"earfcn":[6600,7399],"rel":10.4},
	23:{"type":"FDD","frequency":"2000","range":["2000-2020","2180-2200"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[7500,7699],"rel":10.3},
	24:{"type":"FDD","frequency":"1600","range":["1626.5-1660.5","1525-1559"],"bandwidths":[5,10],"earfcn":[7700,8039],"rel":10.1},
	25:{"type":"FDD","frequency":"1900","range":["1850-1915","1930-1995"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[8040,8689],"rel":10.0},
	26:{"type":"FDD","frequency":"850","range":["814-849","859-894"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[8690,9039],"rel":11.0},
	27:{"type":"FDD","frequency":"800","range":["807-824","852-869"],"bandwidths":[1.4,3,5,10],"earfcn":[9040,9209],"rel":11.1},
	28:{"type":"FDD","frequency":"700","range":["703-748","758-803"],"bandwidths":[3,5,10,15,20],"earfcn":[9210,9659],"rel":11.1},
	29:{"type":"SDL","frequency":"700","range":["717-728"],"bandwidths":[3,5,10],"earfcn":[9660,9790],"rel":11.3},
	30:{"type":"FDD","frequency":"2300","range":["2305-2315","2350-2360"],"bandwidths":[5,10],"earfcn":[9770,9869],"rel":12.0},
	31:{"type":"FDD","frequency":"450","range":["452.5-457.5","462.5-467.5"],"bandwidths":[1.4,3,5],"earfcn":[9870,9919],"rel":12.0},
	32:{"type":"SDL","frequency":"1500","range":["1452-1496"],"bandwidths":[5,10,15,20],"earfcn":[9920,10359],"rel":12.4},
	33:{"type":"TDD","frequency":"2100","range":["1900-1920"],"bandwidths":[5,10,15,20],"earfcn":[36000,36199],"rel":8},
	34:{"type":"TDD","frequency":"2100","range":["2010-2025"],"bandwidths":[5,10,15],"earfcn":[36200,36349],"rel":8},
	35:{"type":"TDD","frequency":"1900","range":["1850-1910"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[36350,36949],"rel":8},
	36:{"type":"TDD","frequency":"1900","range":["1930-1990"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[36950,37549],"rel":8},
	37:{"type":"TDD","frequency":"1900","range":["1910-1930"],"bandwidths":[5,10,15,20],"earfcn":[37550,37749],"rel":8},
	38:{"type":"TDD","frequency":"2600","range":["2570-2620"],"bandwidths":[5,10,15,20],"earfcn":[37750,38249],"rel":8},
	39:{"type":"TDD","frequency":"1900","range":["1880-1920"],"bandwidths":[5,10,15,20],"earfcn":[38250,38649],"rel":8},
	40:{"type":"TDD","frequency":"2300","range":["2300-2400"],"bandwidths":[5,10,15,20],"earfcn":[38650,39649],"rel":8},
	41:{"type":"TDD","frequency":"2500","range":["2496-2690"],"bandwidths":[5,10,15,20],"earfcn":[39650,41589],"rel":10.0},
	42:{"type":"TDD","frequency":"3400","range":["3400-3600","2110-2170"],"bandwidths":[5,10,15,20],"earfcn":[41590,43589],"rel":10.0},
	43:{"type":"TDD","frequency":"3700","range":["3600-3800"],"bandwidths":[5,10,15,20],"earfcn":[43590,45589],"rel":10.0},
	44:{"type":"TDD","frequency":"700","range":["703-803"],"bandwidths":[3,5,10,15,20],"earfcn":[45590,46589],"rel":11.1},
	45:{"type":"TDD","frequency":"1500","range":["1447-1467"],"bandwidths":[5,10,15,20],"earfcn":[46590,46789],"rel":13.2},
	46:{"type":"LAA","frequency":"5200","range":["5150-5925"],"bandwidths":[10,20],"earfcn":[46790,54539],"rel":13.2},
	47:{"type":"TDD","frequency":"5900","range":["5855-5925"],"bandwidths":[10,20],"earfcn":[54540,55239],"rel":14.1},
	48:{"type":"TDD","frequency":"3600","range":["3550-3700"],"bandwidths":[5,10,15,20],"earfcn":[55240,56739],"rel":14.2},
	49:{"type":"TDD","frequency":"3600","range":["3550-3700"],"bandwidths":[10,20],"earfcn":[56740,58239],"rel":15.1},
	50:{"type":"TDD","frequency":"1500","range":["1432-1517"],"bandwidths":[3,5,10,15,20],"earfcn":[58240,59089],"rel":15.0},
	51:{"type":"TDD","frequency":"1500","range":["1427-1432"],"bandwidths":[3,5],"earfcn":[59090,59139],"rel":15.0},
	52:{"type":"TDD","frequency":"3300","range":["3300-3400"],"bandwidths":[5,10,15,20],"earfcn":[59140,60139],"rel":15.2},
	53:{"type":"TDD","frequency":"2500","range":["2483.35-2494.85"],"bandwidths":[1.4,3,5,10],"earfcn":[60140,60254],"rel":16.0},
	65:{"type":"FDD","frequency":"2100","range":["1920-2010","2110-2200"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[65536,66425],"rel":13.2},
	66:{"type":"FDD","frequency":"1700","range":["1710-1780","2110-2200"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[66436,67335],"rel":13.2},
	67:{"type":"SDL","frequency":"700","range":["738-758"],"bandwidths":[5,10,15,20],"earfcn":[67336,67535],"rel":13.2},
	68:{"type":"FDD","frequency":"700","range":["698-728","753-783"],"bandwidths":[5,10,15],"earfcn":[67536,67835],"rel":13.3},
	69:{"type":"SDL","frequency":"2600","range":["2570-2620"],"bandwidths":[5,10,15,20],"earfcn":[67836,68335],"rel":14.0},
	70:{"type":"FDD","frequency":"2000","range":["1695-1710","1995-2020"],"bandwidths":[5,10,15,20],"earfcn":[68336,68535],"rel":14.0},
	71:{"type":"FDD","frequency":"600","range":["663-698","617-652"],"bandwidths":[5,10,15,20],"earfcn":[68586,68935],"rel":15.0},
	72:{"type":"FDD","frequency":"450","range":["451-456","461-466"],"bandwidths":[1.4,3,5],"earfcn":[68936,68985],"rel":15.0},
	73:{"type":"FDD","frequency":"450","range":["450-455","460-465"],"bandwidths":[1.4,3,5],"earfcn":[68986,69035],"rel":15.0},
	74:{"type":"FDD","frequency":"1500","range":["1427-1470","1475-1518"],"bandwidths":[1.4,3,5,10,15,20],"earfcn":[69036,69465],"rel":15.0},
	75:{"type":"SDL","frequency":"1500","range":["1432-1517"],"bandwidths":[5,10,15,20],"earfcn":[69466,70315],"rel":15.0},
	76:{"type":"SDL","frequency":"1500","range":["1427-1432"],"bandwidths":[5],"earfcn":[70316,70365],"rel":15.0},
	85:{"type":"FDD","frequency":"700","range":["698-716","728-746"],"bandwidths":[5,10],"earfcn":[70366,70545],"rel":15.2},
	87:{"type":"FDD","frequency":"450","range":["410-415","420-425"],"bandwidths":[1.4,3,5],"earfcn":[70546,70595],"rel":16.2},
	88:{"type":"FDD","frequency":"450","range":["412-417","422-427"],"bandwidths":[1.4,3,5],"earfcn":[70596,70645],"rel":16.2},
	252:{"type":"SDL","frequency":"5200","range":["5150-5250"],"bandwidths":[20],"earfcn":[255144,256143],"rel":null},
	255:{"type":"SDL","frequency":"5800","range":["5725-5850"],"bandwidths":[20],"earfcn":[260894,262143],"rel":null}
};

// A nice function for rounding to 2 dp
var sensibleRound = function(n){
	return Math.round(n*100)/100;
};

var languageNumerics = function(a){
	//a = a.toString().replace(/,/g, "{c}");
	//a = a.toString().replace(/\./g, "{d}");
	return a;
};

// Thanks to: https://stackoverflow.com/a/6786040
var commafy = function(num) {
	var str = num.toString().split('.');
	if (str[0].length >= 4) {
		str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	}
	if (str[1] && str[1].length >= 5) {
		str[1] = str[1].replace(/(\d{3})/g, '$1 ');
	}
	return str.join('.');
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

var getRbsForCarrier = function(carrier){
	return $("#rowopt_resblocks"+carrier).val();
};

var tdd = function(selWidth,bandWidths,selModulation,selMimo,selTddCnf,selTddCpl,selTddFrm,link,tddBase,carrier){
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
	var tpea = getRbsForCarrier(carrier)*scprb;
	
	// MiMo multipliers
	var atm = tpea * mimo[selMimo];
	
	// Take off 25% to account for RBs used in control channel
	var ctrl = atm * .25;
	var fin = atm-ctrl;
	
	return fin;
};

var fdd = function(bw,sw,sm,si,ca){
	//console.log(rb(sw,bw));
	return base * getRbsForCarrier(ca) * mod[sm] * mimo[si];
};

var doCalc = function(carrier){
	// Get the band
	var caDivID = "#carrier_id_n" + carrier;
	var selBand = $(caDivID + " .rowopt_band").val();
	
	// Check that the band was set
	if (selBand === "0"){
		return _l["alert.selband"];
	}
	
	// Get the bandwidth
	var selWidth = $(caDivID + " .rowopt_width").val();
	var selDlModulation = $(caDivID + " .rowopt_dlmod").val();
	var selUlModulation = $(caDivID + " .rowopt_ulmod").val();
	var selMimo = $(caDivID + " .rowopt_mimo").val();
	
	// Determine calculation type
	var bandType = lteBandData[selBand].type;
	var bandWidths = lteBandData[selBand].bandwidths;
	
	// Initialise result containers
	var uplink = 0;
	var downlink = 0;
	
	// Calculate result
	if (bandType === "TDD"){
		
		// Get TDD options
		var selTddCpl = $(caDivID + " .rowopt_tddcpl").val();
		var selTddCnf = $(caDivID + " .rowopt_tddcnf").val();
		var selTddFrm = $(caDivID + " .rowopt_tddssf").val();
		
		if (selTddCpl === undefined || selTddCnf === undefined || selTddFrm === undefined){
			return _l["alert.selconf"];
		}
		
		// Get results
		downlink = tdd(selWidth,bandWidths,selDlModulation,selMimo,selTddCnf,selTddCpl,selTddFrm,"D",defaultTddBase,carrier);
		uplink = tdd(selWidth,bandWidths,selUlModulation,0,selTddCnf,selTddCpl,selTddFrm,"U",defaultTddBase,carrier);
		
	} else if (bandType === "LAA") {
		
		// LAA Band is not supported yet
		return _l["alert.laaband"];
		
	} else if (bandType === "FDD"){
		
		// Get results
		downlink = fdd(bandWidths,selWidth,selDlModulation,selMimo,carrier);
		uplink = fdd(bandWidths,selWidth,selUlModulation,0,carrier);
		
	} else if (bandType === "SDL"){
		
		// Get L-Band direction
		var selLBDir = $(caDivID + " .rowopt_lbdir").val();
		if (selLBDir === "0"){
			downlink = fdd(bandWidths,selWidth,selDlModulation,selMimo,carrier);
		} else {
			uplink = fdd(bandWidths,selWidth,selUlModulation,0,carrier);
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
	
	var dlTxt = languageNumerics(commafy(sensibleRound(totalDownlink)));
	var ulTxt = languageNumerics(commafy(sensibleRound(totalUplink)));
	
	if (!errMsg) $("#speeds").html(dlTxt + "Mbps &#8595; &amp; " + ulTxt + "Mbps &#8593;");
};

var generateResourceBlockSelector = function(caid){
	var sel = $("<input/>",{
		"type":"number",
		"class":"rowopt_resblocks",
		"placeholder":_l["label.resblocks"],
		"id":"rowopt_resblocks"+caid,
		"data-carrier":caid,
		"min":"1"
	}).on("input paste",doCustomResourceBlock);
	
	return sel;
};

var generateWidthSelector = function(caid){
	var sel = $("<select/>",{
		"title":"Select LTE Bandwidth",
		"class":"rowopt_width",
		"id":"rowopt_width" + caid,
		"data-carrier":caid
	}).append(
		$("<option/>",{"value":"0"}).text(_l["alert.selfirst"])
	).on("change",function(){
		$("#rowopt_resblocks"+$(this).data("carrier")).val(
			$(this).find(":selected").data("rbcount")
		);
		$(this).css("opacity",1);
	});
	
	return sel;
};

var generateCenterFreqSelector = function(caid){
	var sel = $("<input/>",{
		"type":"number",
		"class":"rowopt_earfcn",
		"placeholder":_l["label.earfcn"],
		"id":"rowopt_earfcn"+caid,
		"data-carrier":caid
	}).on("input paste",doCenterFreqSearch);
	
	return sel;
};

var generateBandSelector = function(caid){
	var sel = $("<select/>",{
		"title":"Select LTE Band",
		"class":"rowopt_band",
		"id":"rowopt_band"+caid,
		"data-carrier":caid
	});
	
	sel.append($("<option/>",{"value":0}).text(_l["alert.seltext"]))
	
	var dKeys = Object.keys(lteBandData);
	for (var i = 0, l = dKeys.length;i<l;i++){
		if (lteBandData[dKeys[i]].frequency !== ""){
			txt = _l["label.band"] + " " + dKeys[i];
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

var generateBandSection = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text(_l["label.band"]));
	
	opts.append(
		$("<label/>",{"for":"rowopt_earfcn" + caid,"id":"rowlabel_earfcn"+caid}).text(_l["label.earfcn"]),
		generateCenterFreqSelector(caid),
		$("<label/>",{"for":"rowopt_band" + caid,"id":"rowlabel_band"+caid}).text(_l["label.band"]),
		generateBandSelector(caid)
	);
	
	return opts;
};

var generateTddOptSelector = function(caid){
	var opts = $("<div/>",{
		"data-carrier":caid
	});
	
	// Cyclic Prefix Selector
	opts.append(
		$("<label/>",{"for":"tddconf_cpl" + caid}).text(_l["label.tddcpl"]),
		$("<select/>",{"class":"rowopt_tddcpl","id":"tddconf_cpl" + caid,"title":"Select TDD Cyclic Prefix"}).append(
			$("<option/>",{"value":"normal"}).text("Normal CP [6]"),
			$("<option/>",{"value":"extended"}).text("Extended CP [7]")
		)
	);
	
	// TDD Config Selector
	opts.append(
		$("<label/>",{"for":"tddconf_cnf" + caid}).text(_l["label.tddcnf"]),
		$("<select/>",{"class":"rowopt_tddcnf","id":"tddconf_cnf" + caid,"title":"Select TDD Config"}).append(
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
		$("<label/>",{"for":"tddconf_ssf" + caid}).text(_l["label.tddssf"]),
		$("<select/>",{"class":"rowopt_tddssf","id":"tddconf_ssf" + caid,"title":"Select TDD Special Subframe Config"}).append(
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
			$("<option/>",{"value":"0"}).text(_l["label.sdl"]),
			$("<option/>",{"value":"1"}).text(_l["label.sul"])
		)
	);
	
	return opts;
};

var generateBandWidthSelector = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text(_l["label.bandwidth"]));;
	
	opts.append(
		$("<label/>",{"for":"rowopt_resblocks" + caid,"id":"rowlabel_resblocks"+caid}).text(_l["label.resblocks"]),
		generateResourceBlockSelector(caid),
		$("<label/>",{"for":"rowopt_width" + caid,"id":"rowlabel_width"+caid}).text(_l["label.bandwidth"]),
		generateWidthSelector(caid)
	);
	
	return opts;
};

var generateModulationSelector = function(caid){
	var opts = $("<div/>",{
		"class":"rowsect",
		"data-carrier":caid
	}).append($("<span/>",{"class":"rowsectheader"}).text(_l["label.mod"]));
	
	opts.append(
		$("<label/>",{"for":"rowopt_dlmod" + caid,"id":"rowlabel_dlmod"+caid}).text(_l["label.dlmod"]),
		$("<select/>",{
			"title":"Select downlink modulation scheme",
			"class":"rowopt_dlmod",
			"id":"rowopt_dlmod" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":"0"}).text(_l["alert.selfirst"])
		),
		$("<label/>",{"for":"rowopt_ulmod" + caid,"id":"rowlabel_ulmod"+caid}).text(_l["label.ulmod"]),
		$("<select/>",{
			"title":"Select uplink modulation scheme",
			"class":"rowopt_ulmod",
			"id":"rowopt_ulmod" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":"0"}).text(_l["alert.selfirst"])
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
			"title":"Select carrier MIMO",
			"class":"rowopt_mimo",
			"id":"rowopt_mimo" + caid,
			"data-carrier":caid
		}).append(
			$("<option/>",{"value":0}).text(_l["alert.selfirst"])
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
		}).text(_l["label.remca"])
	);
	
	// Options for carriers that aren't the primary
	if (caid !== primary){
		opts.append(
			$("<button/>",{
				"class":"b_aggupl",
				"id":"rowbt_aggupl"+caid,
				"data-carrier":caid
			}).text(_l["label.aggupl"]),
			$("<button/>",{
				"class":"b_primaryc",
				"data-carrier":caid,
				"style":"display:none"
			}).text(_l["label.setprim"])
		);
	}
	
	return opts;
};

var doCenterFreqSearch = function(){
	var earfcn = $(this).val();
	var keys = Object.keys(lteBandData);
	var band = 0;
	
	if (earfcn.length !== 0){
		for (var i = 0;i < keys.length;i++){
			var bounds = lteBandData[keys[i]].earfcn;
			if (earfcn >= bounds[0] && earfcn <= bounds[1]){
				band = keys[i];
				console.log(band);
				break;
			}
		}
	}
	
	$("#rowopt_band"+$(this).data("carrier")).val(band).change();
};

var doCustomResourceBlock = function(){
	if ($(this).val() === "") return;
	
	if (window.strict3gpp === true){
		if ($(this).val() > 100){
			alert("Invalid number of resource blocks.\nIf you wish to override this, disable '"+_l["ux.adherespec"]+"' in settings.");
			return;
		}
	}
	
	$("#rowopt_width" + $(this).data("carrier")).css("opacity",0.5);
	tryCalculateSpeed();
};

var bandSelect = function(){
	var band = $(this).val();
	var carrier = $(this).data("carrier");
	
	if (band === "0"){
		$("#rowopt_width"+carrier).empty().append($("<option/>",{"value":"0"}).text(_l["alert.seltext"]));
		$("#rowopt_dlmod"+carrier).empty().append($("<option/>",{"value":"0"}).text(_l["alert.seltext"]));
		$("#rowopt_ulmod"+carrier).empty().append($("<option/>",{"value":"0"}).text(_l["alert.seltext"]));
		$("#rowopt_mimo"+carrier).empty().append($("<option/>",{"value":"0"}).text(_l["alert.seltext"]));
		$("#band_title"+carrier).html("Carrier #"+(carrier+1) + " - Select a band");
	} else {
		setCarrierTitle(band,carrier,"");
		populateSelectors(band,carrier);
		bandOptions(band,carrier);
	}
};

var bandOptions = function(band,carrier){
	// Reset some stuff
	$("	#rowopt_dlmod"+carrier+",\
		#rowlabel_dlmod"+carrier+",\
		#rowopt_ulmod"+carrier+",\
		#rowlabel_ulmod"+carrier+",\
		#rowopt_mimo"+carrier+",\
		#rowbt_aggupl"+carrier).show();
	
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
		$("#row_extra"+carrier).empty().append($("<span/>").text(_l["msg.nofddopts"]));
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
		freqInf = _l["label.band"] + ": " + lteBandData[band].frequency + "MHz, Uplink: " + lteBandData[band].range[0] + "MHz, ";
		freqInf += "Downlink: " + lteBandData[band].range[1] + "MHz";
	} else {
		freqInf = _l["label.band"] + ": " + lteBandData[band].frequency + "MHz, Range: " + lteBandData[band].range[0] + "MHz";
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
	
	var bandwidthVals = (window.strict3gpp === true ? lteBandData[band].bandwidths : vBandwidths);
	for (var i = 0, l = bandwidthVals.length;i<l;i++){
		var iterRbs = rb(i,bandwidthVals);
		$("#rowopt_width"+carrier).append(
			$("<option/>",{
				"value":i,
				"data-rbcount":iterRbs
			}).text(bandwidthVals[i] + "MHz" + " (" + iterRbs + "RBs)")
		);
	}
	$("#rowopt_width" + carrier)[0].selectedIndex = bandwidthVals.length-1;
	
	// Populate Modulation selector
	$("#rowopt_dlmod"+carrier).empty().append(
		$("<option/>",{"value":0}).text("QPSK"),
		$("<option/>",{"value":1}).text("16QAM"),
		$("<option/>",{"value":2,"selected":"selected"}).text("64QAM"),
		$("<option/>",{"value":3}).text("256QAM")
	);
	$("#rowopt_ulmod"+carrier).empty().append(
		$("<option/>",{"value":0}).text("QPSK"),
		$("<option/>",{"value":1,"selected":"selected"}).text("16QAM"),
		$("<option/>",{"value":2}).text("64QAM"),
		$("<option/>",{"value":3}).text("256QAM")
	);
	
	// Populate MiMo selector
	$("#rowopt_mimo"+carrier).empty().append(
		$("<option/>",{"value":0}).text("1x1 SiSo"),
		$("<option/>",{"value":1,"selected":"selected"}).text("2x2 MiMo"),
		$("<option/>",{"value":2}).text("4x4 MiMo")
	);
	
	// Populate rb count
	$("#rowopt_resblocks"+$("#rowopt_width"+carrier).data("carrier")).val(
		$("#rowopt_width"+carrier).find(":selected").data("rbcount")
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
			$("<h2/>",{"class":"band_title","id":"band_title"+carriers}).text("Carrier #" + (carriers+1) + " - " + _l["alert.seltext"])
		),
		$("<div/>",{"class":"row_content","id":"rcont_id"+carriers}).append(
			generateBandSection(carriers),
			$("<div/>",{"class":"rowsect","id":"row_extra"+carriers}).append($("<span/>").text(_l["msg.nobandopts"])),
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
		$(this).text(_l["label.aggupl"]);
	} else {
		uploadcarriers.push(caid);
		$(this).text(_l["label.deaggupl"]);
	}
	tryCalculateSpeed();
};

var removeRow = function(){
	// Check if it's the first carrier
	if ($(this).data("carrier") === primary){
		alert(_l["alert.remprim"]);
		return;
	}
	
	// Remove the row
	$("#carrier_id_n" + $(this).data("carrier")).remove();
	
	// Re-calculate the speed
	tryCalculateSpeed();
};

var modifySetting = function(){
	var s = $(this).data("setting");
	
	if (s === "language"){
		var langs = Object.keys(strings);
		var str = "Enter a language code below.\nValid Codes: " + langs.join(", ");
		var user = prompt(str,"en");
		if (langs.indexOf(user) !== -1) {
			Cookies.set("language",user);
			window.location.reload();
		}
	} else {
		if (window.strict3gpp === true){
			Cookies.set("strict3gpp","false");
		} else {
			Cookies.set("strict3gpp","true");
		}
		window.location.reload();
	}
};

var openSettings = function(){
	// Check for cookies library
	if (typeof Cookies !== "function") {
		alert("Cannot change settings due to library error.");
	}
	
	$("#settings").slideDown(500).empty().append(
		$("<br/>"),
		$("<h1/>").text(_l["ux.settings"]),
		$("<h2/>").text(_l["ux.reloadwarn"]),
		$("<br/>"),
		$("<label/>",{
			"for":"follow_spec"
		}).text(_l["ux.adherespec"]),
		$("<input/>",{
			"type":"checkbox",
			"name":"follow_spec",
			"id":"follow_spec",
			"checked":true,
			"data-setting":"3gppspec"
		}).on("click enter",modifySetting),
		$("<br/>"),$("<br/>"),
		$("<button/>",{
			"data-setting":"language"
		}).on("click enter",modifySetting).text(_l["ux.language"]),
		$("<span/>").text(" "),
		$("<button/>").on("click enter",function(){
			window.location.href = "https://github.com/jake-cryptic/4g-speed";
		}).text("GitHub"),
		$("<span/>").text(" "),
		$("<button/>").on("click enter",closeSettings).text(_l["ux.exitsetting"])
	);
	
	// Get settings
	loadSettings();
	
	if (window.strict3gpp === false){
		$("#follow_spec").prop("checked",false);
	}
};
var closeSettings = function(){
	$("#settings").fadeOut(500);
};

var readyUx = function(){
	document.title = _l["ux.title"];
	$("#page_title").text(_l["ux.title"]);
	$("#add_carrier").text(_l["ux.addca"]);
	$("#ca_body").empty();
	$("#add_carrier").on("click enter",addRow);
	$("#open_settings").on("click enter",openSettings);
	
	updateLangExistingUi();
};
var updateLangExistingUi = function(){
	$("#ca_headers").empty().append(
		$("<div/>",{"class":"ca_header"}).text(_l["label.band"]),
		$("<div/>",{"class":"ca_header"}).text(_l["label.config"]),
		$("<div/>",{"class":"ca_header"}).text(_l["label.bandwidth"]),
		$("<div/>",{"class":"ca_header"}).text("Modulation"),
		$("<div/>",{"class":"ca_header"}).text(_l["label.mimo"]),
		$("<div/>",{"class":"ca_header"}).text(_l["label.options"])
	);
};

var startPwaFunc = function(){
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('sw.js').then(function(registration){
			console.log('ServiceWorker registration successful with scope: ',registration.scope);
		},function(err){
			console.log('ServiceWorker registration failed: ',err);
		});
	}
};

$(document).ready(function(){
	loadSettings();
	readyUx();
	addRow();
	startPwaFunc();
});