const N = 4;
function hash(key){
	var digit = 0;
	for(i=0; i<key.length; i++) digit = digit * 256 + key.charCodeAt(i);
	return digit % N;
}
/*function Mapl(N){
	this.key = new Array(N);
	this.value = new Array(N);
	this.addvalue = addvalue;
	this.getvalue = getvalue;
	function addvalue(k,v){
		this.key[hash(k)] = k;
		this.value[hash(k)] = v;
	}
	function getvalue(k,v){
		return this.value[hash(k)];
	}
	function hash(k){
	}
}*/


var Map = new Array(N);
Map.addvalue = function(key, value){
	this[hash(key)] = value;
}
Map.getvalue = function(key){
	return this[hash(key)];
}





Map.addvalue("apple", "りんご");
Map.addvalue("orange", "みかん");
Map.addvalue("grape", "ぶどう");
Map.addvalue("peach", "もも");
console.log(Map.getvalue("apple"));
console.log(Map.getvalue("orange"));
console.log(Map.getvalue("grape"));
console.log(Map.getvalue("peach"));

