function Stacknode(){
	this.value = null,
	this.next = null;
}
function Stack(){
	this.first = new Stacknode();
}
function push(stk, data){
	var temp = new Stacknode();
	temp.value = data;
	temp.next = stk.first;
	stk.first = temp;
}
function pop(stk){
	var temp = stk.first.value;
	stk.first = stk.first.next;
	return temp;
}

var A = new Stack();
console.log(A);
push(A, 1);
console.log(A.first);
var P = pop(A);
console.log(P);
push(A, 7);
console.log(A.first);
var P = pop(A);
console.log(P);
push(A, 57);
console.log(A.first);
var P = pop(A);
console.log(P);
