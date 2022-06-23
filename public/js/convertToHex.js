inputArray = []
// function convertToHex(str) {
//     var hex = '';
//     for(var i=0;i<str.length;i++) {
//         hex += ''+str.charCodeAt(i).toString(16);
//     }
//     return hex;
// }

function dec2hex ( textString ) {
	return (textString+0).toString(16).toUpperCase();
	}

function  dec2hex2 ( textString ) {
	var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	return hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
	}

function  dec2hex4 ( textString ) {
	var hexequiv = new Array ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
	return hexequiv[(textString >> 12) & 0xF] + hexequiv[(textString >> 8) & 0xF] 
		+ hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
	}


function convertToHex ( str ) { 
	// Converts a string of characters to UTF-8 byte codes, separated by spaces
	// str: sequence of Unicode characters
	var highsurrogate = 0;
	var suppCP; // decimal code point value for a supp char
	var n = 0;
	var outputString = '';
	for (var i = 0; i < str.length; i++) {
		var cc = str.charCodeAt(i); 
		if (cc < 0 || cc > 0xFFFF) {
			outputString += '!Error in convertCharStr2UTF8: unexpected charCodeAt result, cc=' + cc + '!';
			}
		if (highsurrogate != 0) {  
			if (0xDC00 <= cc && cc <= 0xDFFF) {
				suppCP = 0x10000 + ((highsurrogate - 0xD800) << 10) + (cc - 0xDC00); 
				outputString += ''+dec2hex2(0xF0 | ((suppCP>>18) & 0x07)) + '' + dec2hex2(0x80 | ((suppCP>>12) & 0x3F)) + '' + dec2hex2(0x80 | ((suppCP>>6) & 0x3F)) + '' + dec2hex2(0x80 | (suppCP & 0x3F));
				highsurrogate = 0;
				continue;
				}
			else {
				outputString += 'Error in convertCharStr2UTF8: low surrogate expected, cc=' + cc + '!';
				highsurrogate = 0;
				}
			}
		if (0xD800 <= cc && cc <= 0xDBFF) { // high surrogate
			highsurrogate = cc;
			}
		else {
			if (cc <= 0x7F) { outputString += ''+dec2hex2(cc); }
			else if (cc <= 0x7FF) { outputString += ''+dec2hex2(0xC0 | ((cc>>6) & 0x1F)) + '' + dec2hex2(0x80 | (cc & 0x3F)); } 
			else if (cc <= 0xFFFF) { outputString += ''+dec2hex2(0xE0 | ((cc>>12) & 0x0F)) + '' + dec2hex2(0x80 | ((cc>>6) & 0x3F)) + '' + dec2hex2(0x80 | (cc & 0x3F)); } 
			}
		}
	return outputString.substring(0);
	}

document.getElementsByTagName("button")[0].addEventListener("click", function(){
    
    inputs = document.getElementsByTagName("textarea");
    
    for (i = 0 ; i < inputs.length ; i ++){
        inputArray.push(inputs[i]);
    }


    let from = inputArray[0].value;
    let to = inputArray[1].value.trim().split(",");
    // remove whitespace and falsy items
    to = to.map( item => item.split(" ").join("").split("\n").join(""));
    to = to.filter( item => item);
    let amount = (inputArray[2].value[0] === ".") ? `0${inputArray[2].value}` : inputArray[2].value;
    let memo = inputArray[3].value;
    

    memo = convertToHex(memo);

    output = document.getElementById("output");
    let outString = `zcash-cli z_sendmany "${from}" "[`;
    if (memo) {
      to.forEach(item => outString += `{\\"address\\": \\"${item}\\",\\"amount\\": ${amount}, \\"memo\\":\\"${memo}\\"},`);
    } else {
      to.forEach(item => outString += `{\\"address\\": \\"${item}\\",\\"amount\\": ${amount}},`);
    }
    outString = outString.substring(0, outString.length - 1);
    outString+= ']"'
    output.value = outString;
  }); 

  document.getElementsByTagName("button")[1].addEventListener("click", function(){
    
    inputs = document.getElementsByTagName("textarea");
    console.log(inputs);
    
    for (i = 0 ; i < inputs.length ; i ++){
        console.log(inputs[i].value);
        inputArray.push(inputs[i]);
    }
	
    let to = inputArray[1].value.trim().split(",");
    // remove whitespace and falsy items
    to = to.map( item => item.split(" ").join("").split("\n").join(""));
    to = to.filter( item => item);
    let amount = Math.round(Number(inputArray[2].value) * 100000000);
    let memo = inputArray[3].value;
    output = document.getElementById("output");
    let outString = `zecwallet-cli send "[`;
    if(memo) {
      to.forEach(item => outString += `{\\"address\\": \\"${item}\\",\\"amount\\": ${amount}, \\"memo\\":\\"${memo.split('"').join("'")}\\"},`);
    } else {
      to.forEach(item => outString += `{\\"address\\": \\"${item}\\",\\"amount\\": ${amount}},`);
    }
    
    outString = outString.substring(0, outString.length - 1);
    outString+= ']"'
    output.value = outString;
  }); 


  function myFunction() {
    var copyText = document.getElementById("output");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
  }





    