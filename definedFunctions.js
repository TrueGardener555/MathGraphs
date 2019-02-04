/**
* function rangeValues creates a range
* @param start int start value
* @param end int stop value
* @param step int
* @return array
*/
function rangeValues(start, end, step){
	var toReturn=[];
	if(start<end){
		for(var i=start; i<=end; i+=step){
			toReturn.push(i);
		}	
	}else{
		for(var i=start; i>=end; i-=step){
			toReturn.push(i);
		}	
	}

	return toReturn;

}

/**
* function returns an object from a DOM form. The object's keys contain 
* the value of tag 'name' from inputs form and their value keyed in in the form.
* @param form DOM element
* @return object fonction
*/
function serialiseForm(form){
	let inputs=form.children;
	let fonction={};
	let l=inputs.length;
	for (let i=0; i<l; i++){
		if(inputs[i].tagName!==form.tagName){
			let key=inputs[i].getAttribute("name");
			if(!isNaN(inputs[i].value))
				fonction[key]=Number(inputs[i].value);
			else
				fonction[key]=inputs[i].value;
		}
		
	}
	return fonction;
}

/**
* return random number between min included and max excluded
* @param min int
* @param max int
* @return int
*/
function randFunction(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}

/**
* creates a DOM element regarding to the array attributes in parameter
* @param spec Object {tag, attributes{attr:value}, style:{s:value}, event:{type, callback},text}
* @return DOM Element
*/
function createDomElem(spec){
	var elem=document.createElement(spec.tag);
	for(let attr in spec.attributes){
		if(spec.attributes.hasOwnProperty(attr)){
			elem.setAttribute(attr, spec.attributes[attr]);
		}
	}
	for(let s in spec.style){
		if(spec.style.hasOwnProperty(s)){
			switch(s){
				case "color":
				elem.style.color=spec.style[s];
				break;
			}
		}
	}
	if(spec.event!==undefined){
		elem.addEventListener(spec.event.type, spec.event.callback);
	}
	if(spec.text!==undefined){
		elem.appendChild(document.createTextNode(spec.text));
	}
	return elem;
}

/**
* function from OpenClassroom
*/
function insertAfter(newElement, afterElement) {
	var parent = afterElement.parentNode;
	if (parent.lastChild === afterElement) { // Si le dernier élément est le même que l'élément après lequel on veut insérer, il suffit de faire appendChild()
		parent.appendChild(newElement);
	} else { // Dans le cas contraire, on fait un insertBefore() sur l'élément suivant
		parent.insertBefore(newElement, afterElement.nextSibling);
	}
}

/**
* return rounded number n 
* @param int n, the number to round
* @param int exp, number of digits before or after the point 
* @return float rounded number
*/
function customRound(n, exp){
	return Math.round(n*Math.pow(10, exp))/Math.pow(10, exp);
}

/**
* check the expression to add to the function
* @param theFunction string, start of the function
* @param nextExp string, expression to add to theFunction string
* @return string correct function expression
*/
function filterFunction(theFunction, nextExp){
	let completeFunc=theFunction;
	let algebricFunc=["pow", "sqrt", "log", "log1p", "log2", "log10", "cos", "sin", "tan", "exp"];
	let operators=["+", "-", "/", "*"];
	let lastChar=completeFunc.charAt(completeFunc.length-1);
	//check first char
	if(theFunction.length==0 && nextExp.match(/\)|\+|\*|\//)!=null){
		alert("L'opérateur '"+nextExp+"' ne peut pas être en début de fonction.");
		return null;
	}else{
		//display error message if something went wrong
		if((theFunction.match(/x$|\)$/)!=null )&&(algebricFunc.includes(nextExp)||nextExp.match(/x|\(|[0-9]+/)!=null)
			||((theFunction.match(/[0-9]$/)!=null )&&(algebricFunc.includes(nextExp)||nextExp.match(/x|\(/)!=null))){
			let addOp=confirm("Il manque un opérateur entre "+lastChar+" et "+nextExp
				+". Ajouter automatiquement le signe '*' (multiplication) ?");
		if(addOp)
			completeFunc=completeFunc+"*"+nextExp;
		else
			return null;
	}else if((operators.includes(lastChar)&&operators.includes(nextExp))
		||(theFunction.match(/\($/)!=null && nextExp.match(/\*|\+|\//)!=null)){
		alert("Impossible de saisir un '"+nextExp+"' devant un '"+lastChar+"'");
		return null;
	}else{
			//check number of ')'
			if(nextExp===')'){
				//number of ')'>number of '('
				if(checkBracket(theFunction+nextExp)==-1){
					alert("Attention, il y a plus de parenthèses fermantes ')' que de parenthèses ouvrantes '('.");
					return null;
				}
			}
			completeFunc=completeFunc+nextExp;
		}
		//complete algebric function with (x) or (x, n) if function pow is selected
		if(algebricFunc.includes(nextExp)){
			completeFunc=completeFunc+"(x";
			if(nextExp==="pow"){
				let n=0;
				while(isNaN(n=prompt("Saisissez un entier :")));
				completeFunc=completeFunc+", "+n;
			}
			completeFunc=completeFunc+")";
		}
	}
	return completeFunc;
}

/**
* count open and close brackets in str string and compare them
* @param str string to check
* @return int :1 if openBracket greater than closeBracket, -1 if 
* closeBracket greater than openBracket, 0 if equal 
*/
function checkBracket(str){
	let openBracket=str.split('(').length-1;
	let closeBracket=str.split(')').length-1;
	if(openBracket>closeBracket)
		return 1;
	else if(openBracket<closeBracket)
		return -1;
	else
		return 0;
}

/**
 * filter for Math object, add "Math." before the expression if it is a math function
 * @param fun string the expression to filter 
 * @return string
 */
function withMath(fun){
    let defFun=["pow", "exp", "log", "log", "log10", "log2", "log1p", "sqrt", "tan", "cos", "sin"];
    let search=fun.split("(")[0];
    let i=0, nb=defFun.length, toReturn=fun;
    while(i<nb && defFun[i]!==search){
        i++;
    }
    console.log(nb+" "+i);
    if(i<nb){
        toReturn="Math."+fun;
    }
    return toReturn;
}