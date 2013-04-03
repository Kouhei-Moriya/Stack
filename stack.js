function Stack(){
	this.value = null,
	this.next = null;
}
function push(stk, data){
	var temp = new Stack();
	temp.value = data;
	temp.next = stk;
	stk = temp;
	console.log(stk);
	return stk;
}
function pop(){
}

var A = new Stack();
push(A, 1);
console.log(A);
push(A, 2);
console.log(A);

