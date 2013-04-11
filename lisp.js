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

//変数
var variable = {};

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
	if(p<line.length) Token.push(line.substring(p));
	/* for(i=0; i<Token.length; i++){
		console.log("Token[" + i + "]:" + Token[i]);
		if(Token[i]=="(") console.log(nest(i));
	} */

	//文字列扱いの数字をparseIntする
	for(i=0; i<Token.length; i++) if(isNaN(Token[i])==false) Token[i]=parseInt(Token[i]);

	//構文解析を書く場所
	var cons = new Array();
	for(i=0; i<Token.length; i++){
		if(Token[i]==")")
			throw "\")\"に対応する\"(\"がありません";
		if(Token[i]=="("){
			cons.push(new Cons("object",createcons(i+1),null));
			i=bracket(i);
		}else{		
			cons.push(new Cons(gettype(Token[i]),Token[i],null));
		}
	}
	//構文木を作る関数
	function createcons(pos){
		if(pos>=Token.length)
			throw "\"(\"に対応する\")\"がありません";
		if(Token[pos]==")") return null;
		var type = gettype(Token[pos]);
		switch(type){
			case "object":
				return new Cons("object",createcons(pos+1),createcons(bracket(pos)+1));
			default:
				return new Cons(type,Token[pos],createcons(pos+1));
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
	//typeを取得する
	function gettype(value){
		switch(value){
			case "(":
				return "object";
			case "T":
			case "Nil":
				return "boolean";
			case "+":
			case "-":
			case "*":
			case "/":
			case ">":
			case ">=":
			case "<":
			case "<=":
			case "=":
			case "if":
			case "setq":
			case "defun":
				return "reserved";
			default:
				if(typeof value == "number") return "number";
				if(value.charAt(0)=="\"" && value.charAt(value.length-1)=="\"") return "string";
		}
		return "unknown";
	}

	//評価を書く場所
	for(i=0; i<cons.length; i++) console.log(disp(cons[i]).car);

	//値の表示
	function disp(node){
		switch(node.type){
			case "object":
				return evallist(node.car);
			case "number":
			case "string":
			case "boolean":
				return new Cons(node.type,node.car,null);
			case "unknown":
				if(node.car in variable) return variable[node.car];
			default:
				throw node.car + " は値ではありません";
			}
	}

	//評価の関数
	function evallist(node){
		var value;
		if(node==null) return new Cons("boolean","Nil",null);
		if(checkparam(node)==false)
			throw "パラメータの数が正しくありません";
		switch(node.car){
			case "+":
				return new Cons("number",add(node.cdr),null);
			case "-":
				return new Cons("number",subtract(node.cdr),null);
			case "*":
				return new Cons("number",multiply(node.cdr),null);
			case "/":
				return new Cons("number",divide(node.cdr),null);
			case ">":
				return (greaterthan(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case ">=":
				return (greaterthanorequal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "<":
				return (lessthan(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "<=":
				return (lessthanorequal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "=":
				return (equal(node.cdr.cdr,getnumber(node.cdr))
					? new Cons("boolean","T",null)
					: new Cons("boolean","Nil",null));
			case "if":
				if(getboolean(node.cdr)){
					//真値
					value = node.cdr.cdr;
				}else{
					//偽値
					value = node.cdr.cdr.cdr;
					if(value==null) return new Cons("boolean","Nil",null);
				}
				if(value.type=="object") return evallist(value.car);
				return new Cons(value.type, value.car, null);
			case "setq":
				if(node.cdr.type!="unknown")
					throw "その語は変数として用いることができません";
				if(node.cdr.cdr.type=="object") variable[node.cdr.car] = evallist(node.cdr.cdr.car);
				else variable[node.cdr.car] = new Cons(node.cdr.cdr.type, node.cdr.cdr.car, null);
				return variable[node.cdr.car];
			default:
				throw node.car + " という関数・演算はありません";
				return;
		}

		//パラメータの数が正しいかを調べる
		function checkparam(node){
			switch(node.car){
				case "-":
				case "/":
				case ">":
				case ">=":
				case "<":
				case "<=":
				case "=":
					if(parameters(node)<2) return false;
					break;
				case "if":
				case "defun":
					//ifは(if x y)か(if x y z)の形である必要がある
					//defunは(defun a (x))か(defun a (x) (y))の形である必要がある
					switch(parameters(node)){
						case 3:
						case 4:
							break;
						default:
							return false;
					}
					break;
				case "setq":
					if(parameters(node)!=3) return false;
					break;
			}
			return true;
	
		}
		//cdrで繋がっているノードの数を数える
		function parameters(node){
			if(node==null) return 0;
			return 1+parameters(node.cdr);
		}
		//演算・比較
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
			return value>=operand;
		}
		function lessthan(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(lessthan(node.cdr,operand)==false) return false;
			return value<operand;
		}
		function lessthanorequal(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(lessthanorequal(node.cdr,operand)==false) return false;
			return value<=operand;
		}
		function equal(node,value){
			var operand;
			if(node==null) return true;
			operand = getnumber(node);
			if(equal(node.cdr,operand)==false) return false;
			return value==operand;
		}
		//car部分をnumberに処理して返す
		function getnumber(node){
			switch(node.type){
				case "object":
					return getnumber(evallist(node.car));
				case "number":
					return node.car;
				case "unknown":
					if(node.car in variable) return getnumber(variable[node.car]);
				default:
					throw node.car + " を数値として解釈できません";
			}
			return;
		}
		//car部分をbooleanに処理して返す
		function getboolean(node){
			switch(node.type){
				case "object":
					return getboolean(evallist(node.car));
				case "boolean":
					return node.car!="Nil";
				case "unknown":
					if(node.car in variable) return getboolean(variable[node.car]);
				default:
					return true;
			}
			return;
		}
	}
}


