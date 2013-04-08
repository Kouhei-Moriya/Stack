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
	this.type = type;
	this.car = car;
	this.cdr = cdr;
}

//ここから作成箇所
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
	if(p<line.length)
		throw "\"()\"に入っていない字句があります";
	/* for(i=0; i<Token.length; i++){
		console.log("Token[" + i + "]:" + Token[i]);
		if(Token[i]=="(") console.log(nest(i));
	} */

	//構文解析を書く場所
	var cons = new Array();
	for(i=0; i<Token.length; i++){
		if(Token[i]==")")
			throw "\")\"に対応する\"(\"がありません";
		if(Token[i]!="(")
			throw "\"()\"に入っていない字句があります";
		cons.push(createcons(i+1)); //"("の次の要素から開始
		i=bracket(i);
	}
	//構文木を作る関数
	function createcons(pos){
		if(pos>=Token.length)
			throw "\"(\"に対応する\")\"がありません";
		switch(Token[pos]){
			case ")":
				return null;
			case "(":
				return new Cons("object",createcons(pos+1),createcons(bracket(pos)+1));
			default:
				return new Cons(typeof(Token[pos]),Token[pos],createcons(pos+1));
		}
	}
	//"("の入っている要素を指定、対応する")"のある要素を返す
	function bracket(pos){
		var i;
		for(i=pos+1; i<Token.length; i++){
			if(Token[i]==")") return i;
			if(Token[i]=="(") i=bracket(i);
		}
		return;
	}

	//評価を書く場所
	for(i=0; i<cons.length; i++) console.log(evallisp(cons[i]));

	//評価の関数
	function evallisp(node){
		switch(node.car){
			case "+":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return add(node.cdr);
			case "-":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return subtract(node.cdr);
			case "*":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return multiply(node.cdr);
			case "/":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return divide(node.cdr);
			default:
				return "???";
		}

		function add(node){
			if(node==null) return 0;
			if(node.type=="object") return evallisp(node.car)+add(node.cdr);
			return parseInt(node.car)+add(node.cdr);
		}
		function subtract(node){
			if(node.type=="object") return evallisp(node.car)-add(node.cdr);
			return node.car-add(node.cdr);
		}
		function multiply(node){
			if(node==null) return 1;
			if(node.type=="object") return evallisp(node.car)*multiply(node.cdr);
			return node.car*multiply(node.cdr);
		}
		function divide(node){
			if(node.type=="object") return Math.floor(evallisp(node.car)/multiply(node.cdr));
			return Math.floor(node.car/multiply(node.cdr));
		}
	}
}


