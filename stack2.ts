class Stack {
	firstNode: StackNode = null;
	push(data: any): void {
		this.firstNode = new StackNode(data, this.firstNode);
	}
	pop(): any {
		var temp: any = this.firstNode.value;
		this.firstNode = this.firstNode.next;
		return temp;
	}
}
class StackNode {
	constructor(public value: any, public next: StackNode) {
	}
}

var A: Stack = new Stack();
A.push(2);
console.log(A.firstNode);
A.push(4);
console.log(A.firstNode);
var P = A.pop();
console.log(P);


A.push(3);
console.log(A.firstNode);
A.push(7);
console.log(A.firstNode);
A.push(9);
console.log(A.firstNode);
P = A.pop();
console.log(P);
P = A.pop();
console.log(P);
P = A.pop();
console.log(P);
P = A.pop();
console.log(P);
