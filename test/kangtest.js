fs = require('fs')
w = require('../src/jsewts')
w.setopt({fix_spacing: false})

function compare(R, a, b) {
//	var A = fs.readFileSync(a).toString().replace(/\r/g,'').split('\n')
//	var B = fs.readFileSync(b).toString().replace(/\r/g,'').split('\n')
	var A = a.split('\n')
	var B = b.split('\n')
	for (var i = 0; i < A.length; i++) {
		a = A[i].replace(/ /g, '')
		b = B[i].replace(/ /g, '')
		b = b.replace(/༎/g, '།།')
		if (a != b) R.push(a), R.push(b)
	}
}

var dir = '../'
try { fs.readFileSync(dir + 'LICENSE') } catch(e) {
	console.log('Kangyur LICENSE file not found, must be wrong directory, please fix the line 18.')
	return
}
var volumes = fs.readdirSync(dir).filter(function (x) { return parseInt(x) > 0 })
var files = []
for (v in volumes) {
	var f = fs.readdirSync(dir + volumes[v])
	for (var i = 0; i < f.length; i++)
		if (f[i].indexOf('.xml') > 0)
			files.push(dir + volumes[v] + '/' + f[i])
}

var R = [], err_sum = 0
for (var i = 0; i < files.length; i++) {
	process.stdout.write('('+(i + 1)+'/'+files.length+') ' + files[i] + ' ...')
	var orig = fs.readFileSync(files[i], 'utf-8').toString()
	orig = orig.replace(/<[^>]*>/g, '')
	var wylie = w.toWylie(orig)
	var re = w.fromWylie(wylie)
	R.push(files[i])
	var err = R.length
	compare(R, orig, re)
	err = (R.length - err) / 2
	err_sum += err
	if (err == 0) process.stdout.write(' CORRECT\n')
	else process.stdout.write(' ' + err + ' ERRORS\n')
}
console.log('FILES:', files.length, ', ERRORS:', err_sum)
if (err_sum > 0) {
	console.log('errors saved to errors.txt')
	fs.writeFileSync('errors.txt', R.join('\r\n'))
}
