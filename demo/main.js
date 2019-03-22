import jsewts from "./src/jsewts.js" ;

console.log("module loaded",typeof jsewts.fromWylie)

window.buttonToWylie = () => {
   t2.value = jsewts.toWylie(t1.value)
}

window.buttonFromWylie = () => {
   var s = jsewts.fromWylie(t2.value)
   t3.value = s
}
