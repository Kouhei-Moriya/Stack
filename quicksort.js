function quicksort(data){
	sortfunc(0, data.length-1);
	return data;	
	function sortfunc(left,right){
		if(left >= right) return;
		var temp,
		var i = left,
		var j = right,
		var p = (left + right)/2,
		var pivot = data[p];
		while(1){
			while(i<=right){
				if(data[i]>=pivot) break;
				i++;
			}
			while(j>=left){
				if(data[j]<=pivot) break;
				j--;
			}
			if(i<j){
				temp = data[i];
				data[i] = data[j];
				data[j] = temp;
			}
			i++;
			j--;
		}
	}
}


var A = [9,6,10,4,2,7,11,3,1,5];
console.log(A);
