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
	var Token = new Array();
	while(line.length > 0){
		loop1:
		for(i=0; i<line.length; i++){
			switch(line.charAt(i)){
				//line.substr(0,i)
				case "(":
				case ")":
					if(i>0) Token.push(line.substring(0,i));
					Token.push(line.charAt(i));
					line = line.substring(i+1);
					break loop1;
				case " ":
					if(i>0) Token.push(line.substring(0,i));
					line = line.substring(i+1);
					break loop1;
			}
		}
	}
	Token.push(line);
	for(i=0; i<Token.length; i++) console.log(Token[i]);
}


