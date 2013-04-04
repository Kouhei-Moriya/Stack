function quicksort(data){
	if(data.length < 1) return;
	sortfunc(0, data.length-1);
	return data;	
	function sortfunc(left,right){
		if(right<=left) return;
		var pivot = data[Math.floor((left + right) / 2)];
		var l=left, r=right;
		for(; 1; swap(l,r),l++,r--){
			for(; l<=right; l++) if(data[l]>=pivot) break;
			for(; left<=r; r--) if(data[r]<=pivot) break;
			if(r<=l) break;
		}
		sortfunc(left, l-1);
		if(l != left) sortfunc(l, right);
		return;
	}
	function swap(i,j){
		var temp = data[i];
		data[i] = data[j],
		data[j] = temp;
		return;
	}
}

var A = [9,6,10,4,2,7,11,3,1,5];
A = quicksort(A);
console.log(A);
