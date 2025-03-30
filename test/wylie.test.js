import w from '../src/jsewts.js'

﻿var out_x = 0
function out(s) {
	console.log(++out_x +'\t'+ s)
}

var A = require('fs').readFileSync(process.env.PWD+'/test/test.txt').toString().split('\n')
var Ai = 0

var opts1 = {
    check: true,
    check_strict: false,
    sloppy: true
};
var opts2 = {
    check: true,
    check_strict: true,
    sloppy: true
}

it("main tests",()=>{

	var l = ""
	var tests = 0
	var fails = 0
	while (Ai < A.length) {
		l = A[Ai++]
		if (l.charAt(0) == "#") continue;
		var a = l.split('\t');
		if (a.length < 6) {
			out("Line "+(Ai)+" does not have 6 fields: (" + l + ")");
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
		var s = w.fromWylie(wylie, opts1, e);
		var e2 = [];
		var s2 = w.fromWylie(wylie, opts2, e2);
		// re-encode into wylie
		var e3 = [];
		var rewylie = w.toWylie(s, true, e3);
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

	expect(fails).toEqual(0);

})

it("issue #1",()=>{
    expect(w.fromWylie("dad stobs/ phyag rgya/ chos: phyag/ mar me/ grong khyer/ sgra chen/ seng ge /sA lu/ rten 'brel/ sor phreng / rgyal po/ 'gyod bsal/ dpal sbas dang rnam dag la sogs theg pa chen po'i mdo/"))
    .toEqual("དད་སྟོབས། ཕྱག་རྒྱ། ཆོས༔ ཕྱག། མར་མེ། གྲོང་ཁྱེར། སྒྲ་ཆེན། སེང་གེ་།སཱ་ལུ། རྟེན་འབྲེལ། སོར་ཕྲེང་། རྒྱལ་པོ། འགྱོད་བསལ། དཔལ་སྦས་དང་རྣམ་དག་ལ་སོགས་ཐེག་པ་ཆེན་པོའི་མདོ།");
})
