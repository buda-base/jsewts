fs=require('fs')
w = require('../src/wylie')
opts = { sloppy: false }
s = fs.readFileSync('kang.txt', 'utf-8').toString()
s = w.toWylie(s, opts);
fs.writeFileSync('wkang.txt', s, 'utf-8')
fs.writeFileSync('rekang.txt', w.fromWylie(s), 'utf-8')
