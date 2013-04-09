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
			case "T":
			case "Nil":
				return new Cons("boolean",Token[pos],createcons(pos+1));
			default:
				if(isNaN(Token[pos])) return new Cons("string",Token[pos],createcons(pos+1));
				return new Cons("number",parseInt(Token[pos]),createcons(pos+1));

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
	for(i=0; i<cons.length; i++) console.log(evallisp(cons[i]).car);

	//評価の関数
	function evallisp(node){
		if(node==null) return new Cons("boolean","Nil",null);
		switch(node.car){
			case "+":
				return new Cons("number",add(node.cdr),null);
			case "-":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return new Cons("number",subtract(node.cdr),null);
			case "*":
				return new Cons("number",multiply(node.cdr),null);
			case "/":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return new Cons("number",divide(node.cdr),null);
			case ">":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return (greaterthan(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case ">=":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return (greaterthanorequal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "<":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return (lessthan(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "<=":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return (lessthanorequal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "=":
				if(node.cdr==null)
					throw "演算子のオペランドがありません";
				return (equal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			default:
				return;
		}

		function add(node){
			if(node==null) return 0;
			return getnumber(node)+add(node.cdr);
		}
		function subtract(node){
			return getnumber(node)-add(node.cdr);
		}
		function multiply(node){
			if(node==null) return 1;
			return getnumber(node)*multiply(node.cdr);
		}
		function divide(node){
			return Math.floor(getnumber(node)/multiply(node.cdr));
		}
		function greaterthan(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(greaterthan(node.cdr,operand)==false) return false;
			return value>operand;
		}
		function greaterthanorequal(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(greaterthanorequal(node.cdr,operand)==false) return false;
			return value>operand;
		}
		function lessthan(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(lessthan(node.cdr,operand)==false) return false;
			return value>operand;
		}
		function lessthanorequal(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(lessthanorequal(node.cdr,operand)==false) return false;
			return value>operand;
		}
		function equal(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(equal(node.cdr,operand)==false) return false;
			return value>operand;
		}
		//car部分をnumberに処理して返す
		function getnumber(node){
			switch(node.type){
				case "object":
					return getnumber(evallisp(node.car));
				case "number":
					return node.car;
				default:
					throw "\"" + node.car + "\"を数値として解釈できません";
			}
			return;
		}
	}
}


