requirejs.config({
	baseUrl: '',
	paths: {
		app: '../app'
	}
});
console.log('main')
console.log('main')
requirejs(['wylie'], function(wylie) {
	console.log('require?')
	console.log(typeof wylie.fromWylie)
	
	buttonToWylie = function() {
		t2.value = wylie.toWylie(t1.value)
	}

	buttonFromWylie = function() {
		var s = wylie.fromWylie(t2.value)
		t3.value = s
	}

});

