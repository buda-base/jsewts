

import wylie from "./src/wylie.js" ;

console.log("module loaded",typeof wylie.fromWylie)

window.buttonToWylie = () => {
   t2.value = wylie.toWylie(t1.value)
}

window.buttonFromWylie = () => {
   var s = wylie.fromWylie(t2.value)
   t3.value = s
}
