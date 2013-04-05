//シェルのコード(資料より)
var readline = require("readline");

var repl = readline.createInterface(process.stdin, process.stdout);
//プロンプトの形を設定
repl.setPrompt(">>> ");

//プロンプトを出す
repl.prompt();

// mainループ
repl.on("line", function(line) {
	mylisp(line); //変数lineにシェルに入力した文字列が入るので、これを解析すれば良い。
	repl.prompt();
});

// 終了時に呼ぶ
repl.on("close", function() {
	console.log("bye!");
});

//抽象構文木
function Cons(type,car,cdr) {
	//this.type = type;
	this.car = car;
	this.cdr = cdr;
}

function mylisp(line){
	//字句解析
	var Token = new Array();
	var p = 0;
	for(i=0; i<line.length; i++){
		switch(line.charAt(i)){
			case "(":
			case ")":
				if(i>p) Token.push(line.substring(p,i));
				Token.push(line.charAt(i));
				p = i+1;
				break;
			case " ":
				if(i>p) Token.push(line.substring(p,i));
				p = i+1;
				break;
		}
	}
	if(p<line.length) Token.push(line.substring(p));
	for(i=0; i<Token.length; i++){
		console.log("Token[" + i + "]:" + Token[i]);
		if(Token[i]=="(") console.log(nest(i));
	}

	//構文解析を書く場所
	var cons;
	for(i=0; i<Token.length; i++) if(Token[i]=="(") {
		cons=createcons(i+1);
		break;
	}
	console.log(cons);

	function createcons(pos){
		switch(Token[pos]){
			case ")":
				return null;
			case "(":
				var temp = createcons(pos+1);
				return new Cons(null,temp,createcons(nest(pos)+1));
			default:
				return new Cons(null,Token[pos],createcons(pos+1));
		}
	}
	function nest(pos){
		var i;
		for(i=pos+1; i<Token.length; i++){
			if(Token[i]=="(") i=nest(i)+1;
			if(Token[i]==")") return i;
		}
		return i;
	}
}


