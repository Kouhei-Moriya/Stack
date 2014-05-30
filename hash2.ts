var N: number = 10;
class HMap<T> {
	key: string[] = new Array(N);
	value: T[] = new Array(N);
	addvalue(k: string, v: T): void {
		var h: number = HMap.hash(k);
		var i: number = h;
		do {
			if(typeof this.key[i] === "undefined") {
				this.key[i] = k;
				this.value[i] = v;
				return;
			}
			i = (i + 1) % N;
		} while(i == h);
		throw "配列が全て埋まっています";
		return;
	}
	getvalue(k: string): T {
		var h: number = HMap.hash(k);
		var i: number = h;
		do {
			if(this.key[i] == k) return this.value[i];
			i = (i + 1) % N;
		} while(i == h);
		return undefined;
	}
	private static hash(k: string): number {
		var digit: number = 0;
		for(var i: number = 0; i < k.length; i++) {
			digit = digit * 256 + k.charCodeAt(i);
		}
		return digit % N;
	}
}

var Map = new HMap<string>();

Map.addvalue("apple", "りんご");
Map.addvalue("orange", "みかん");
Map.addvalue("grape", "ぶどう");
Map.addvalue("peach", "もも");
console.log(Map.getvalue("apple"));
console.log(Map.getvalue("orange"));
console.log(Map.getvalue("grape"));
console.log(Map.getvalue("peach"));
for(var i: number = 0; i < N; i++) console.log(i + " key:" + Map.key[i] + " value:" + Map.value[i]);
