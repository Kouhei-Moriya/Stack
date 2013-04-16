//全体で使う領域群
//変数
var variable = {};
//関数
var func = {};
//引数スタック
var argument = new Array();

//パラメータ読み込み
var args = process.argv;
switch(args.length){
	case 2:
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
		break;
	case 3:
		var fs = require('fs');
		fs.readFile(args[2], 'utf8', function(err, str){
			if(err){
				console.log(err);
			}else{
				var filestr = str.replace(/[\r\n\t ]+/g, " ");
				console.log(">>> " +filestr);
				mylisp(filestr);
			}
		});
		break;
	default:
		throw "コマンドラインに与えた引数の数が異常です";
		break;
}

//抽象構文木
function Cons(type,car,cdr) {
	this.type = type;
	this.car = car;
	this.cdr = cdr;
}

//ここから作成箇所
function mylisp(word){
	var consroot = parsecons(tokenize(word)), i;

	//評価
	for(i=0; i<consroot.length; i++) console.log(getvalue(consroot[i]).car);
	return;
}
//字句を()と空白で区切った配列に分割する
function tokenize(word){
	var Token = new Array(), p = 0, i;
	for(i=0; i<word.length; i++){
		switch(word.charAt(i)){
			case "(":
			case ")":
				if(i>p) Token.push(word.substring(p,i));
				Token.push(word.charAt(i));
				p = i+1;
				break;
			case " ":
				if(i>p) Token.push(word.substring(p,i));
				p = i+1;
				break;
		}
	}
	if(p<word.length) Token.push(word.substring(p));
	return Token;
}
//配列となっている字句を構文木にする
function parsecons(Token){
	var consroot = new Array(), i;
	//括弧の関係チェック
	if(bracket(-1) != null)
		throw "\")\"に対応する\"(\"がありません";

	for(i=0; i<Token.length; i++){
		if(Token[i]=="("){
			consroot.push(new Cons("object",createobj(i+1),null));
			i=bracket(i);
		}else consroot.push(new Cons(gettype(Token[i]),Token[i],null));
	}
	return consroot;

	function createobj(pos){
		if(pos>=Token.length)
			throw "\"(\"に対応する\")\"がありません";
		if(Token[pos]==")") return null;
		if(Token[pos]=="(") return new Cons("object",createobj(pos+1),createobj(bracket(pos)+1));
		return new Cons(gettype(Token[pos]),Token[pos],createobj(pos+1));
	}
	//"("の入っている要素を指定、対応する")"のある要素を返す
	function bracket(pos){
		var i;
		for(i=pos+1; i<Token.length; i++){
			if(Token[i]==")") return i;
			if(Token[i]=="("){
				i=bracket(i);
				if(i==null)
					throw "\"(\"に対応する\")\"がありません";
			}
		}
		return null;
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
				if(isNaN(value)==false) return "number";
				if(value.charAt(0)=="\"" && value.charAt(value.length-1)=="\"") return "string";
		}
		return "unknown";
	}
}

//評価用の関数(引数が構文木)
//cdrで繋がっているノードの数を数える
function parameters(node){
	if(node==null) return 0;
	return 1+parameters(node.cdr);
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
		default:
			if(node.type=="unknown" && node.car in func && parameters(func[node.car].car)!=parameters(node.cdr)) return false;
			break;
	}
	return true;
}
//値の評価(typeで型を指定)
function getvalue(node, type){
	var value = new Cons("boolean","Nil",null);
	if(node!=null){
		 //typecase:
		 switch(node.type){
			case "object":
				value = evallist(node.car);
				break;
			case "number":
				value = new Cons(node.type,parseFloat(node.car),null);
				break;
			case "string":
			case "boolean":
				value = new Cons(node.type,node.car,null);
				break;
			case "unknown":
				if(argument.length > 0 && node.car in argument[0]){
					value = argument[0][node.car];
					break;
				}
				/*	for(i=0; i<argument.length; i++) if(node.car in argument[i]){
						value = argument[i][node.car];
						break typecase;
					} */
				if(node.car in variable){
					value = variable[node.car];
					break;
				}
			default:
				throw node.car + " は値ではありません";
		}
	}
	switch(type){
		case "number":
			if(value.type!="number")
				throw value.car + " を数値として解釈できません";
			return value.car;
		case "boolean":
			return value.car != "Nil";
		case "object":
		default:
			return value;
	}
}
//演算の実行
function evallist(node){
	var temp;
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
			return (greaterthan(node.cdr.cdr,getvalue(node.cdr,"number"))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case ">=":
			return (greaterthanorequal(node.cdr.cdr,getvalue(node.cdr,"number"))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "<":
			return (lessthan(node.cdr.cdr,getvalue(node.cdr,"number"))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "<=":
			return (lessthanorequal(node.cdr.cdr,getvalue(node.cdr,"number"))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "=":
			return (equal(node.cdr.cdr,getvalue(node.cdr,"number"))
				? new Cons("boolean","T",null)
				: new Cons("boolean","Nil",null));
		case "if":
			if(getvalue(node.cdr, "boolean")) return getvalue(node.cdr.cdr);
			return getvalue(node.cdr.cdr.cdr);
		case "setq":
			if(node.cdr.type!="unknown")
				throw "その語は変数として用いることができません";
			//node.cdr.carは変数名,node.cdr.cdrは値
			variable[node.cdr.car] = getvalue(node.cdr.cdr);
			return variable[node.cdr.car];
		case "defun":
			if(node.cdr.type!="unknown")
				throw "その語は関数として用いることができません";
			//node.cdr.carは関数名,node.cdr.cdr.carは引数のリスト,node.cdr.cdr.cdrは関数の式
			if(node.cdr.cdr.type!="object")
				throw "関数の引数がリストになっていません";
			checkarg(node.cdr.cdr.car);
			func[node.cdr.car] = node.cdr.cdr;
			return new Cons("function",node.cdr.car,null);
		default:
			//func[xxx].carは引数の形式,func[xxx].cdrは関数の式,node.cdrは引数の値
			if(node.type=="unknown" && node.car in func){
				argument.unshift(setarg(func[node.car].car,node.cdr));
				temp = getvalue(func[node.car].cdr);
				argument.shift();
				return temp;
			}
			if(node.type=="object")
				throw "関数・演算名にリストを用いることはできません"
			throw node.car + " という関数・演算はありません";
			return;
	}
}
//演算・比較の処理を行う関数群
function add(node){
	if(node==null) return 0;
	return getvalue(node,"number")+add(node.cdr);
}
function subtract(node){
	return getvalue(node,"number")-add(node.cdr);
}
function multiply(node){
	if(node==null) return 1;
	return getvalue(node,"number")*multiply(node.cdr);
}
function divide(node){
	return getvalue(node,"number")/multiply(node.cdr);
}
function greaterthan(node,value){
	var operand;
	if(node==null) return true;
	operand = getvalue(node,"number");
	if(greaterthan(node.cdr,operand)==false) return false;
	return value>operand;
}
function greaterthanorequal(node,value){
	var operand;
	if(node==null) return true;
	operand = getvalue(node,"number");
	if(greaterthanorequal(node.cdr,operand)==false) return false;
	return value>=operand;
}
function lessthan(node,value){
	var operand;
	if(node==null) return true;
	operand = getvalue(node,"number");
	if(lessthan(node.cdr,operand)==false) return false;
	return value<operand;
}
function lessthanorequal(node,value){
	var operand;
	if(node==null) return true;
	operand = getvalue(node,"number");
	if(lessthanorequal(node.cdr,operand)==false) return false;
	return value<=operand;
}
function equal(node,value){
	var operand;
	if(node==null) return true;
	operand = getvalue(node,"number");
	if(equal(node.cdr,operand)==false) return false;
	return value==operand;
}
/*	//分数になっている文字列を渡すことで約分する
	function reduction(value){
		var fraction = value.split("/");
		var numerator = parseInt(fraction[0]), denominator = parseInt(fraction[1]), factor;		
		if(numerator < denominator) factor = euclid(denominator, numerator);
		else factor = euclid(numerator, denominator);
		if(factor==denominator) return numerator.toString(10);
		return (numerator / factor) + "/" + (denominator / factor);
	}
	//最大公約数を求める(m>=nの状態で呼ぶこと)
	function euclid(m, n){
		if(n==0) return m;
		return euclid(n, m%n);
	} */
//関数定義前の引数形式のチェック
function checkarg(form){
	if(form==null) return;
	if(form.type=="object")
		throw "引数リストの中にリストが含まれています";
	if(form.type!="unknown")
		throw "その語は引数として用いることができません";
	checkarg(form.cdr);
	return;
}
//formはdefunで記憶した引数の形式、valueはそれと一致した形の引数の構文木、引数を連想配列へ代入する
function setarg(form, value){
	var arglist = {};
	setargvalue(form, value);
	return arglist;

	function setargvalue(form, value){
		if(value==null) return;
		arglist[form.car] = getvalue(value);
		setargvalue(form.cdr, value.cdr);
		return;
	}
}

