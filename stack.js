function Stack(){
	this.value = null,
	this.next = null;
}
function push(stk, data){
	console.log(stk);
	var temp = stk;
	console.log(temp);
	stk.value = data;
	stk.next = temp;
	stk.next = new Stack();
}
function pop(){
}

var A = new Stack();
push(A, 1);
push(A, 2);
console.log(A);


