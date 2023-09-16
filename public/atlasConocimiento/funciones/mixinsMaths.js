const defaultMinNumero = -250;
const operaciones = ["suma", "resta", "multiplicacion", "division", "potenciacion", "radicacion"];

const defaultMaxNumero = 250;

const minGradoRadicacion=2;
const maxGradoRadicacion=6;

const minGradoPotenciacion=2;
const maxGradoPotenciacion=6;

const minDenominadorEntero=2;
const maxDenominadorEntero=30;

function getDivisoresEnteros(num){
    
    let lista=[];
    for (var i=Math.floor(num/2);i>0;i--){
        if(num%i===0){
            lista.push(i);
        }
    }

    return lista;
}

function getSimboloOperacion(operacion) {
    if (!operaciones.includes(operacion)) {
        throw "Operación no conocida";
        return;
    }

    if (operacion === 'suma') {
        return '+';
    }
    if (operacion === 'resta') {
        return '-';
    }
    if (operacion === 'multiplicacion') {
        return ' \\times ';
    }
    if (operacion === 'division') {
        return ' \\over ';
    }
    if (operacion === 'potenciacion') {
        return '^';
    }
    if (operacion === 'radicacion') {
        return 'sqrt';
    }
}

function generarNumero(opciones) {
    let maxNumero = defaultMaxNumero;
    let minNumero = defaultMinNumero;
    if (opciones?.maxNumero) {
        maxNumero = opciones.maxNumero;
    }
    if (opciones?.minNumero) {
        minNumero = opciones.minNumero;
    }

    let rangoNumero = maxNumero - minNumero;
    return Math.round(Math.random() * rangoNumero) + minNumero;
}

function operarNumeros(expresion) {
    const { operacion, numero1, numero2 } = expresion;

    if (!operaciones.includes(operacion)) {
        throw "Operación faltante";
    }

    if (!numero1 || !numero2) {
        throw "Falta un número para ejecutar la operación";
    }

    if (operacion === 'suma') {
        return numero1 + numero2;
    }

    if (operacion === 'resta') {
        return numero1 - numero2;
    }

    if (operacion === 'multiplicacion') {
        return numero1 * numero2;
    }

    if (operacion === 'division') {
        return numero1 / numero2;
    }

    if (operacion === 'potenciacion') {
        return Math.pow(numero1, numero2);
    }

    if (operacion === 'radicacion') {
        return Math.pow(numero1, 1 / numero2);
    }
}

function setNumeroFaltante(expresion, opciones) {
    let { operacion, valor, numero1, numero2 } = expresion;

    if (!operacion) {
        throw "Falta la operación"
    }

    if (!numero1 && !numero2) {
        throw "Faltan ambos números"
    }

    if (numero1 && numero2) {
        throw "Ambos números ya están decididos";
    }

    if (expresion.operacion === 'suma') {
        if (!expresion.numero1) {
            expresion.numero1= expresion.valor - expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2= expresion.valor - expresion.numero1;
        }
    }

    if (expresion.operacion === 'multiplicacion') {
        if (!expresion.numero1) {
            expresion.numero1= expresion.valor / expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2= expresion.valor / expresion.numero1;
        }
    }

    if (expresion.operacion === 'division') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor * expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.numero1 / expresion.valor;
        }
    }

    if (expresion.operacion === 'resta') {
        if (!expresion.numero1) {
            expresion.numero1 = expresion.valor + expresion.numero2;
        }
        if (!expresion.numero2) {
            expresion.numero2 = expresion.numero1 - expresion.valor;
        }
    }

    if (expresion.operacion === 'potenciacion') {
        if (!expresion.numero1) {
            expresion.numero1 = Math.pow(expresion.valor, 1 / expresion.numero2);
        }
        if (!expresion.numero2) {
            throw "Aún no desarrollado"
        }
    }

    if (expresion.operacion === 'radicacion') {
        if (!expresion.numero1) {
            expresion.numero1 = Math.pow(expresion.valor, expresion.numero2);
        }
        if (!expresion.numero2) {
            throw "Aún no desarrollado"
            
        }
    }

    return expresion;
}

function generarExpresionNumerica(expresion, opciones) {
    let { valor, operacion, numero1, numero2 } = expresion;
    console.log("Generando expresión numérica a partir de")
    console.table({...expresion});
    if (operacion && !operaciones.includes(operacion)) {
        throw `La operación ${operacion} no es conocida`;
    }
    if (!operacion) {
        let indexOperacion = Math.floor(Math.random() * operaciones.length);
        operacion = operaciones[indexOperacion];
        expresion.operacion=operacion;
    }

    //Ya hay operación.

    if (!expresion.valor) {
        if (!expresion.numero1 && !expresion.numero2) {
            let num1 = generarNumero();
            let num2 = generarNumero();

            expresion.numero1 = num1;
            expresion.numero2 = num2;

            expresion.valor = operarNumeros(expresion);                        
        }

        if (!expresion.numero1) {
            expresion.numero1 = generarNumero();
            expresion.valor = operarNumeros(expresion);            
        }
        else if (!expresion.numero2) {
            expresion.numero2 = generarNumero();
            expresion.valor = operarNumeros(expresion);            
        }
    }

    //Generando expresión para un valor dado
    if (expresion.valor) {
        if (!expresion.numero1 && !expresion.numero2) { //Generando ámbos números base
            expresion.numero1 = generarNumero();
            if(expresion.operacion==='division' && opciones.keepInteger){
                let rangoDenominadorEntero=maxDenominadorEntero-minDenominadorEntero;
                let denominador=Math.round(Math.random()*rangoDenominadorEntero) + minDenominadorEntero;
                expresion.numero1=valor*denominador;
            }
            if(expresion.operacion==='multiplicacion' && opciones.keepInteger){
                
                let divisores=getDivisoresEnteros(expresion.valor);
                let cantDivisores=divisores.length;
                let indexDivisor=Math.round(Math.random()*cantDivisores);
                
                expresion.numero1=divisores[indexDivisor];
            }
        }        

        if(!expresion.numero1 || !expresion.numero2){
            expresion=setNumeroFaltante(expresion);
        }        
    }

    //Correcciones en caso de operaciones especiales
    if (expresion.operacion === 'division') { //Se debe dar valor distinto de cero al num2
        // expresion.numero2 = Math.abs(expresion.numero2);
        if(expresion.numero2===0)expresion.numero2++;
        expresion.valor=operarNumeros(expresion);
    }

    if(expresion.operacion==="radicacion" && !numero2){ //La operación era radicación y el num2 no había sido set.
        expresion.numero2=Math.round(Math.random()*maxGradoRadicacion) + minGradoRadicacion;
        expresion.numero1=Math.abs(expresion.numero1);
        expresion.valor=operarNumeros(expresion);
    }

    if(expresion.operacion==="potenciacion" && !numero2){
        expresion.numero2=Math.round(Math.random()*maxGradoPotenciacion) + minGradoPotenciacion;
        expresion.valor=operarNumeros(expresion);
    }

    console.log("Resultó: ");
    console.table({...expresion});
    return expresion
}

function toMathJax(expresion) {
    let res = "";
    console.log(`LLevando a string la expresión`)
    console.table(expresion);
    if (!expresion || !expresion.operacion || !expresion.valor || !expresion.numero1 || !expresion.numero2) {
        throw "Expresión incompleta";
    }
    if (expresion.operacion != 'radicacion') {
        res = expresion.numero1 + getSimboloOperacion(expresion.operacion) + expresion.numero2;
    }

    if(expresion.operacion==='radicacion'){
        res= `\\sqrt[${expresion.numero2}]{${expresion.numero1}}`;
        console.log(`Quedó: ${res}`);
    }


    return res;

}

const mixinExpresionesNumericas = {
    methods: {
        expresionNumericaGenerarExpresionNumerica(expresion, opciones) {
            return generarExpresionNumerica(expresion, opciones)
        },
        expresionNumericaGenerarNumero(opciones) {
            return generarNumero(opciones);
        },
        expresionNumericaToMathJax(expresion) {
            return toMathJax(expresion);
        },
        expresionNumericaSetNumeroFaltante(expresion) {
            return setNumeroFaltante(expresion);
        },
        expresionNumericaOperarNumeros(expresion) {
            return operarNumeros(expresion);
        },
        expresionNumericaGenerarNumero(opciones) {
            return generarNumero(opciones);
        },
        expresionNumericaGetSimboloOperacion(operacion) {
            return getSimboloOperacion(operacion);
        }
    }
}
