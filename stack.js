function Stack(){
	this.value = null,
	this.next = null;
}
function push(stk, data){
	console.log(stk);
	var temp = stk;
	var stk = new Stack();
	console.log(stk);
	stk.value = data
	stk.next = temp;
}
function pop(){
}

var A = null;
push(A, 1);
push(A, 2);
console.log(A);


