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


function mylisp(line){
	console.log(line);
	//字句解析
	var Token = new Array();
	var p = 0;
	for(i=0; i<line.length; i++){
		switch(line.charAt(i)){
			case "(":
			case ")":
				if(i>0) Token.push(line.substring(p,i));
				Token.push(line.charAt(i));
				p = i+1;
				break;
			case " ":
				if(i>0) Token.push(line.substring(p,i));
				p = i+1;
				break;
		}
	}
	if(p<line.length) Token.push(line.substring(p));
	for(i=0; i<Token.length; i++) console.log("Token[" + i + "]:" + Token[i]);

	//構文解析を書く場所
}


