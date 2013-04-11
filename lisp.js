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
	this.tonumber = function(){
		if(this.type!="number")
			throw this.car + " を数値として解釈できません";
		this.car = parseInt(this.car);
	}
	this.toboolean = function(){
		this.type = "boolean";
		this.car = (this.car != "Nil");
	}
}

//変数
var variable = {};

//関数
var func = {};

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

	//評価を書く場所
	for(i=0; i<cons.length; i++) console.log(getvalue(cons[i]).car);

}


//構文解析用関数(引数がTokenの要素)
//構文木を作る関数
function createcons(pos){
	if(pos>=Token.length)
		throw "\"(\"に対応する\")\"がありません";
	if(Token[pos]==")") return null;
	if(Token[pos]=="(") return new Cons("object",createcons(pos+1),createcons(bracket(pos)+1));
	return new Cons(gettype(Token[pos]),Token[pos],createcons(pos+1));
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
//carに入れる値を引数とし、入れるべきtypeを返す
function gettype(value){
	switch(value){
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

//評価用の関数(引数が構文木)
//値の評価
function getvalue(node){
	if(node==null) return new Cons("boolean","Nil",null);
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
//car部分がnumberならそれを返す
function tonumber(node){
	if(node.type!="number")
		throw node.car + " を数値として解釈できません";
	return node.car;
}
//cdrで繋がっているノードの数を数える
function parameters(node){
	if(node==null) return 0;
	return 1+parameters(node.cdr);
}
//与えたリストのcarにリストが入っているならtrueを返す
function isnest(node){
	if(node==null) return false;
	if(node.type=="object") return true;
	return isnest(node.car);
}
//演算の実行
function evallist(node){
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
			return (greaterthan(node.cdr.cdr,tonumber(getvalue(node.cdr)))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case ">=":
			return (greaterthanorequal(node.cdr.cdr,tonumber(getvalue(node.cdr)))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "<":
			return (lessthan(node.cdr.cdr,tonumber(getvalue(node.cdr)))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "<=":
			return (lessthanorequal(node.cdr.cdr,tonumber(getvalue(node.cdr)))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "=":
			return (equal(node.cdr.cdr,tonumber(getvalue(node.cdr)))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "if":
			if(getvalue(node.cdr).car != "Nil") return getvalue(node.cdr.cdr);
			return getvalue(node.cdr.cdr.cdr);
		case "setq":
			if(node.cdr.type!="unknown")
				throw "その語は変数として用いることができません";
			variable[node.cdr.car] = getvalue(node.cdr.cdr);
			return variable[node.cdr.car];
		case "defun":
			if(node.cdr.type!="unknown")
				throw "その語は関数として用いることができません";
			if(node.cdr.cdr.type!="object")
				throw "関数の引数がリストになっていません";
			if(isnest(node.cdr.cdr.car))
				throw "関数の引数リストに別のリストが入っています";
			defun[node.cdr.car] = node.cdr.cdr.car;
			return node.cdr.car;
		default:
			throw node.car + " という関数・演算はありません";
			return;
	}
	//パラメータの数が正しいかを調べる
	function checkparam(node){
		switch(node.car){
			case "+":
			case "*":
				break;
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
}
//演算・比較の処理を行う関数群
function add(node){
	if(node==null) return 0;
	return tonumber(getvalue(node))+add(node.cdr);
}
function subtract(node){
	return tonumber(getvalue(node))-add(node.cdr);
}
function multiply(node){
	if(node==null) return 1;
	return tonumber(getvalue(node))*multiply(node.cdr);
}
function divide(node){
	return Math.floor(tonumber(getvalue(node))/multiply(node.cdr));
}
function greaterthan(node,value){
	var operand;
	if(node==null) return true;
	operand = tonumber(getvalue(node));
	if(greaterthan(node.cdr,operand)==false) return false;
	return value>operand;
}
function greaterthanorequal(node,value){
	var operand;
	if(node==null) return true;
	operand = tonumber(getvalue(node));
	if(greaterthanorequal(node.cdr,operand)==false) return false;
	return value>=operand;
}
function lessthan(node,value){
	var operand;
	if(node==null) return true;
	operand = tonumber(getvalue(node));
	if(lessthan(node.cdr,operand)==false) return false;
	return value<operand;
}
function lessthanorequal(node,value){
	var operand;
	if(node==null) return true;
	operand = tonumber(getvalue(node));
	if(lessthanorequal(node.cdr,operand)==false) return false;
	return value<=operand;
}
function equal(node,value){
	var operand;
	if(node==null) return true;
	operand = tonumber(getvalue(node));
	if(equal(node.cdr,operand)==false) return false;
	return value==operand;
}

