import w from '../src/wylie.js'
import w2 from '../src/wylie.js'

﻿var out_x = 0
function out(s) {
	console.log(++out_x +'\t'+ s)
}

var A = require('fs').readFileSync(process.env.PWD+'/test/test.txt').toString().split('\n')
var Ai = 0

w.setopt({check: true, check_strict: false, print_warnings: false, fix_spacing: true})
//delete require.cache[require.resolve('../src/wylie.js')]
w2.setopt({check: true, check_strict: true, print_warnings: false, fix_spacing: true})

it("main tests",()=>{

	var l = ""
	var tests = 0
	var fails = 0
	while (Ai < A.length) {
		l = A[Ai++]
		if (l.charAt(0) == "#") continue;
		var a = l.split('\t');
		if (a.length < 6) {
			out("Line does not have 6 fields: (" + l + ")");
			break;
		}
		var wylie = a[0];
		var uni = a[1];
		var warns = parseInt(a[2]);
		var wylie2 = a[3];
		var wylie_warns = parseInt(a[4]);
		var uni_diff = parseInt(a[5]);
		tests++;
		var fail = false;
		var e = [];
		var s = w.fromWylie(wylie, e);
		var e2 = [];
		var s2 = w2.fromWylie(wylie, e2);
		// re-encode into wylie
		var e3 = [];
		var rewylie = w.toWylie(s, e3, true);
		// and again back into unicode
		var reuni = w.fromWylie(rewylie);
		// the two first unicodes must be same
		if (s != s2) {
			out("Wylie (" + wylie + "): got diff unicode w/ and w/o strict checking.");
			fail = true;
		}
		// expected unicode?
		if (s != uni) {
			out("Wylie (" + wylie + "): wrong unicode, expected (" + uni + ") got (" + s + ")");
			fail = true;
		}
		// expected warnings?
		if (e.length != 0 && e2.length == 0) {
			out("Wylie (" + wylie + "): Got warnings in easy mode but not in strict!");
			fail = true;
		}
		if (warns == 0) {
				if (e.length > 0 || e2.length > 0) {
					out("Wylie (" + wylie + "): No warnings expected.");
					fail = true;
				}
		} else if (warns == 1) {
				if (e.length != 0) {
					out("Wylie (" + wylie + "): No non-strict warnings expected.");
					fail = true;
				}
				if (e2.length == 0) {
					out("Wylie (" + wylie + "): Expected strict warnings.");
					fail = true;
				}
		} else if (warns == 2) {
				if (e.length == 0) {
					out("Wylie (" + wylie + "): Expected non-strict warnings.");
					fail = true;
				}
		}
		// expected re-encoded wylie?
		if (wylie2 != rewylie) {
			out("Wylie (" + wylie + "): to_wylie expected (" + wylie2 + "), got (" + rewylie + ").");
			fail = true;
		}
		// expected warnings in re-encoded wylie?
		if (wylie_warns == 0) {
			if (e3.length != 0) {
				out("Wylie (" + wylie + "): unexpected to_wylie warnings.");
				fail = true;
			}
		} else {
			if (e3.length == 0) {
				out("Wylie (" + wylie + "): missing expected to_wylie warnings.");
				fail = true;
			}
		}
		// expected re-encoded unicode (unless it's supposed to be different)
		if (uni_diff > 0) {
			if (reuni == s) {
				out("Wylie (" + wylie + "): should not round-trip to Unicode.");
				fail = true;
			}
		} else {
			if (reuni != s) {
				out("Wylie (" + wylie + "): should round-trip to Unicode.");
				fail = true;
			}
		}
		if (fail) fails++;
	}
	out("Finished running " + tests + " tests, " + fails + " failures.");

	assert(fails).toEqual(0);

})
