const N = 4;
function Hmap(){
	this.key = new Array(N);
	this.value = new Array(N);
	this.addvalue = function(k,v){
		var p = hash(k);
		for(i=0; i<N; i++,p=(p+1)%N) if(this.key[p] === void 0) break;
		if(i==N) throw "配列が全て埋まっています";
		this.key[p] = k;
		this.value[p] = v;
	}
	this.getvalue = function(k,v){
		var p = hash(k);
		for(i=0; i<N; i++,p=(p+1)%N) if(this.key[p]==k) break;
		if(i==N) return undefined;
		return this.value[p];
	}
	function hash(k){
		var digit = 0;
		for(i=0; i<k.length; i++) digit = digit * 256 + k.charCodeAt(i);
		return digit % N;

	}
}

var Map = new Hmap();

Map.addvalue("apple", "りんご");
Map.addvalue("orange", "みかん");
Map.addvalue("grape", "ぶどう");
Map.addvalue("peach", "もも");
console.log(Map.getvalue("apple"));
console.log(Map.getvalue("orange"));
console.log(Map.getvalue("grape"));
console.log(Map.getvalue("peach"));
for(i=0; i<N; i++) console.log(i + " key:" + Map.key[i] + " value:" + Map.value[i]);
