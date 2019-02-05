/*--------------------------------------------------------------------------*/
/*--------------------- Object/constant Definitions ------------------------*/
/*--------------------------------------------------------------------------*/
const RECTW = 200;
const RECTH = 30;
const FONTSIZE = 15;
const NBDIGITSPIX = 3;
const NBDIGITS = 8;
const PLANLENGTH = 20;
function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Repere(context, xo, yo, scale = 20) {
    this.w = context.canvas.width;
    this.h = context.canvas.height;

    this.xo = xo;
    this.yo = yo;
    this.scale = Number(scale);
}
/**
 * converts plan coordinates to canvas pixel coordinates
 */
Repere.prototype.convertirPoint = function (x, y) {
    return new Point(this.xToPixel(x), this.yToPixel(y));
}
/**
 * convert a normal plan x to canvas pixel x
 */
Repere.prototype.xToPixel = function (x) {
    return customRound(this.xo + x * this.scale, NBDIGITSPIX);
}
/**
 * convert a normal plan y to canvas pixel y
 */
Repere.prototype.yToPixel = function (y) {
    return customRound(this.yo - y * this.scale, NBDIGITSPIX);
}
/**
 * convert canvas pixel x to normal plan x
 */
Repere.prototype.xFromPixel = function (xPix) {
    return customRound((xPix - this.xo) / this.scale, NBDIGITSPIX);
}
/**
 * convert canvas pixel y to normal plan y
 */
Repere.prototype.yFromPixel = function (yPix) {
    return customRound(((yPix - this.yo) / this.scale) * (-1), NBDIGITSPIX);
}

/*--------------------------------------------------------------------------*/
/*------------------------- Variables Initialization -----------------------*/
/*--------------------------------------------------------------------------*/
//elements HTML
var btDraw = document.getElementById("draw");
var btReset = document.getElementById("reset");
var btAdd = document.getElementById("add");
var btSave = document.getElementById("save");
var selTypeFunc = document.getElementById("type");
var form = document.getElementById("form");
var fonction = document.getElementById("fonction");
var buttons = document.getElementsByTagName("button");
var liste_fonctions = document.querySelector("#liste_fonctions");
var callback = function (e) {
    var checkedRadio = document.querySelectorAll("[type='radio']:checked");
    let f = JSON.parse(this.value);
    for (let j = 0; j < checkedRadio.length; j++) {
        if (JSON.parse(checkedRadio[j].value).fonction !== f.fonction) {
            checkedRadio[j].checked = false;
        } else {
            writeFuncName(f);
        }
    }
};
//canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var repere = new Repere(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / PLANLENGTH);

tracerRepere();

/*--------------------------------------------------------------------------*/
/*------------------------- Events Listeners -------------------------------*/
/*--------------------------------------------------------------------------*/
/**
 * draw selected function on button click
 */
btDraw.addEventListener("click", function (e) {
    var objFonction = serialiseForm(form);
    if (checkBracket(objFonction["fonction"]) == 0) {
        tracerFonction(objFonction);
        //remove check attribute on input radio
        let checked = document.querySelectorAll("input[type='radio']:checked");
        for (let i in checked) {
            checked[i].checked = false;
        }
        //add button radio in fonctions list
        let text = objFonction["nom"] + "(x)=" + objFonction["fonction"];
        let label = createDomElem({"tag": "label", "attributes": {"class": "custom-radio"},
            "style": {"color": objFonction["couleur"]}});
        let radio = createDomElem({"tag": "input", "attributes": {"type": "radio", "checked": "checked", "value": JSON.stringify(objFonction)},
            "event": {"type": "click", "callback": callback}});
        let span = createDomElem({"tag": "span", "attributes": {"class": "checkmark"},
            "text": text});
        label.appendChild(radio);
        label.appendChild(span);
        document.getElementById("liste_fonctions").appendChild(label);
    } else {
        alert("Attention, le nombre de parenthèses ouvrantes et de parenthèses fermantes ne correspondent pas.");
    }
});

/**
 * clear all
 */
btReset.addEventListener("click", function (e) {
    ctx.clearRect(0, 0, repere.w, repere.h);
    tracerRepere();
    form.reset();
    //remove input radio object function
    let labels=liste_fonctions.querySelectorAll("label");
    for(let i=labels.length-1; i>=0; i--){
        labels[i].remove();
    }
    //remove download link
    let a = btSave.nextSibling;
    if (a != null)
        a.remove();
}, false);

/**
 * clear the form
 */
btAdd.addEventListener("click", function (e) {
    form.reset();
}, false);

canvas.addEventListener("wheel", function (e) {
    let sign = Math.sign(e.deltaY);
    //change the scale according to the wheel move
    repere.scale = repere.w / ((repere.w / repere.scale) + 2 * sign);
    majRepere();
});
/**
 * diplay cursor coordinates (x, y) according to the selected function
 */
canvas.addEventListener("mousemove", function (e) {
    //get the selected function
    let checked = document.querySelector("input[type='radio']:checked");
    if (checked !== null) {
        let func = JSON.parse(checked.value);
        let x = repere.xFromPixel(getMousePos(canvas, e).x);
        let y = customRound(eval(withMath(func["fonction"])), NBDIGITS);
        ctx.font = "italic " + FONTSIZE + "px serif";
        let text = "x=" + x + ", y=" + y;
        fillTextRect(0, RECTH, func["couleur"], text);
    }
});


/**
 * build function string when click on button elem
 */
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (e) {
        let filter = filterFunction(fonction.value, this.value);
        fonction.value = (filter == null) ? fonction.value : filter;
    });
}

/**
 * save the canvas (create an anchor for downloading)
 */
btSave.addEventListener("click", function (e) {
    let data = canvas.toDataURL();
    let url = "fonctions.png";
    let a = createDomElem({"tag": "a", "attributes": {"href": data, "alt": "Télécharger l'image", "download": ""}, "text": "Cliquez pour télécharger."});
    let img = createDomElem({"tag": "img", "attributes": {"src": data}});
    a.appendChild(img);
    insertAfter(a, btSave);
});


/*--------------------------------------------------------------------------*/
/*------------------------- Functions declaration---------------------------*/
/*--------------------------------------------------------------------------*/

/**
 * init the canvas
 * @return Repere
 */
function majRepere() {
    ctx.clearRect(0, 0, repere.w, repere.h);
    tracerRepere();
    let fChecked = null;
    //get all functions
    let radios = document.querySelectorAll("[type='radio']");
    radios.forEach(function (r) {
        let f = JSON.parse(r.value);
        if (r.checked)
            fChecked = f;
        tracerFonction(f);
    });
    //write the name of checked input in the canvas
    writeFuncName(fChecked);
}

/**
 * return mouse position
 * @param canvas
 * @param evt
 * @return {x:int, y:int}
 */
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/**
 * write the name of the function in the top left corner
 * @param f : Object function {nom, fonction, couleur}
 */
function writeFuncName(f) {
    if (f !== null) {
        let text = f["nom"] + "(x)=" + f["fonction"];
        fillTextRect(0, 0, f["couleur"], text);
    }
}
/**
 * this function draws the X-axis and Y-axis with graduation
 * @param fonction Object
 * @param repere Repere
 * @return void
 */
function tracerRepere() {
    console.log(repere.scale);
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(255,0,0)';
    //tracer axe des abrepere.scaleisses
    ctx.moveTo(0, repere.yo);
    ctx.lineTo(repere.w, repere.yo);
    //tracer axe des ordonnées
    ctx.moveTo(repere.xo, 0);
    ctx.lineTo(repere.xo, repere.h);
    ctx.stroke();
    let tailleGradu = 10;
    let offset = tailleGradu / 2;
    //tracer des graduations sur axes
    let departX = repere.yo - offset;
    let departY = repere.xo - offset;
    let arriveeX = departX + tailleGradu;
    let arriveeY = departY + tailleGradu;
    ctx.font = "10px serif";
    ctx.fillStyle = 'black';
    for (let i = (repere.xo) % repere.scale; i < repere.w; i += repere.scale) {
        //tracer ligne quadrillage verticale
        ctx.strokeStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(repere.w, i);
        ctx.stroke();
        //tracer graduation
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(i, departX);
        ctx.lineTo(i, arriveeX);
        ctx.stroke();
        let p = repere.xFromPixel(i);
        ctx.fillText(p, i, arriveeX + tailleGradu);
    }
    for (let i = (repere.yo) % repere.scale; i < repere.h; i += repere.scale) {
        //tracer ligne quadrillage hirizontale
        ctx.strokeStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, repere.h);
        ctx.stroke();
        let p = repere.yFromPixel(i);
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(departY, i);
        ctx.lineTo(arriveeY, i);
        ctx.stroke();
        //tracer graduation
        if (p !== 0)
            ctx.fillText(p, arriveeY + offset, i);
    }
    ctx.closePath();
}



/**
 * this function draws the function on the plan
 * @param fonction Object {fonction:the function, nom:name, couleur:rgb color}
 * @param repere Repere
 * @return void
 */
function tracerFonction(fonction) {
    ctx.beginPath();
    ctx.strokeStyle = fonction["couleur"];
    //inspiré du script de Bernard Langellier http://bernard.langellier.pagesperso-orange.fr/tracer-courbe.htm
    let continuer = true;
    let x = repere.xFromPixel(0);
    let y = eval(withMath(fonction["fonction"]));
    y = repere.yToPixel(y);
    ctx.moveTo(0, y);
    let cpt = 0;
    for (i = 1; i <= repere.w; i++) {
        x = repere.xFromPixel(i)
        y = eval(withMath(fonction["fonction"]));
        if (y == Infinity) {
            continuer = false;
            ctx.stroke();
        } else {
            let p = repere.yToPixel(y);
            if (!continuer) {
                ctx.beginPath();
                ctx.moveTo(i, p);
                continuer = true;
            }
            ctx.lineTo(i, p);
        }
        cpt++;
    }
    ctx.stroke();
    writeFuncName(fonction);
    ctx.closePath();
}

/**
 * draw a rectangle with specified position, color and fill it with text
 * @param x int x of top left corner
 * @param y int y of top left corner
 * @param color string rgb color
 * @param text string to write in the rectangle
 */
function fillTextRect(x, y, color, text) {
    ctx.font = "italic " + FONTSIZE + "px serif";
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(x, y, RECTW, RECTH);
    ctx.strokeStyle = "rgb(60,60,60)";
    ctx.strokeRect(x, y, RECTW, RECTH);
    ctx.fillStyle = color;
    ctx.fillText(text, x + 10, y + FONTSIZE);
}

