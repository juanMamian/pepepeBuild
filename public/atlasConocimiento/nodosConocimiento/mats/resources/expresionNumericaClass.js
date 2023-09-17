"use strict";
class EcInEcuacion {
    miembro1;
    miembro2;
    _comparador;
    constructor(args) {
        if (args.miembro1) {
            this.miembro1 = args.miembro1;
        }
        if (args.miembro2) {
            this.miembro2 = args.miembro2;
        }
        if (args.comparador) {
            this.comparador = args.comparador;
        }
    }
    get comparador() {
        if (this._comparador) {
            return this._comparador;
        }
        if (this.miembro1.valor == null || this.miembro2.valor == null) {
            throw "Imposible decidir comparador: Los miembros de la ecuación están rotos";
        }
        if (this.miembro1.valor === this.miembro2.valor) {
            return "=";
        }
        else if (this.miembro1.valor < this.miembro2.valor) {
            return "<";
        }
        return ">";
    }
    set comparador(comp) {
        this._comparador = comp;
    }
    toMathJax() {
        if (!this.comparador) {
            throw "No se puede generar string de EcInecuacion pues no hay comparador";
        }
        if (!this.miembro1 || !this.miembro2) {
            throw "No se puede generar string de EcInecuacion pues no hay miembros";
        }
        return "\\({" + this.miembro1.toMathJax() + "}" + this.comparador + "{" + this.miembro2.toMathJax() + "}\\)";
    }
}
class ExpresionNumerica {
    static operaciones = ["suma", "resta", "multiplicacion", "division", "potenciacion", "radicacion"];
    static getOperacionOpuesta(operacion) {
        const indexOp = this.operaciones.indexOf(operacion);
        if (indexOp < 0) {
            throw "Operación " + operacion + " no conocida";
        }
        if (indexOp % 2 === 0) {
            return this.operaciones[indexOp + 1];
        }
        return this.operaciones[indexOp - 1];
    }
    static maxNumero = 250;
    static minNumero = -250;
    numero1;
    numero2;
    operacion;
    letra;
    _valor;
    set valor(arg) {
        if (this.numero1 && typeof this.numero1.valor === 'number' && this.numero2 && typeof this.numero2.valor === 'number') {
            throw "No se puede fijar valor en una expresión que ya tiene sus operandos fijados";
        }
        this._valor = arg;
    }
    get valor() {
        if (this.explicita) {
            return this._valor;
        }
        let res = this.operarNumeros();
        if (typeof res === 'number') {
            return res;
        }
        throw "Error calculando valor de expresión";
    }
    get fullExpresion() {
        if (this.numero1 instanceof ExpresionNumerica && this.numero2 instanceof ExpresionNumerica && this.operacion != null) {
            return true;
        }
        return false;
    }
    calcularValor() {
        let res = this.operarNumeros();
        if (typeof res === 'number') {
            this._valor = res;
            return;
        }
    }
    logToConsole() {
        console.log({
            valor: this.valor,
            numero1: this.numero1?.valor,
            operacion: this.operacion,
            numero2: this.numero2?.valor,
            letra: this.letra,
        });
    }
    maxNumero = 250;
    minNumero = -250;
    rangoNumero = this.maxNumero - this.minNumero;
    minResultadoRadicacion = 2;
    maxResultadoRadicacion = 50;
    rangoResultadoRadicacion = this.maxResultadoRadicacion - this.minResultadoRadicacion;
    minGradoRadicacion = 2;
    maxGradoRadicacion = 6;
    rangoGradoRadicacion = this.maxGradoRadicacion - this.minGradoRadicacion;
    minGradoPotenciacion = 2;
    maxGradoPotenciacion = 6;
    rangoGradoPotenciacion = this.maxGradoPotenciacion - this.minGradoPotenciacion;
    minDenominadorEntero = 2;
    maxDenominadorEntero = 30;
    rangoDenominadorEntero = this.maxDenominadorEntero - this.minDenominadorEntero;
    minBasePotencia = 2;
    maxBasePotencia = 15;
    rangoBasePotencia = this.maxBasePotencia - this.minBasePotencia;
    minExponentePotencia = 2;
    maxExponentePotencia = 6;
    rangoExponentePotencia = this.maxExponentePotencia - this.minExponentePotencia;
    constructor(args = {}) {
        if (args.valor != null)
            this.valor = Number(args.valor);
        if (args.numero1) {
            if (args.numero1 instanceof ExpresionNumerica) {
                this.numero1 = args.numero1;
            }
            else {
                throw "Se intentaba asignar un dato de tipo distinto a Expresion numérica dentro de numero1";
            }
        }
        if (args.numero2) {
            if (args.numero2 instanceof ExpresionNumerica) {
                this.numero2 = args.numero2;
            }
            else {
                throw "Se intentaba asignar un dato de tipo distinto a Expresion numérica dentro de numero2";
            }
        }
        if (args.operacion) {
            if (ExpresionNumerica.operaciones.includes(args.operacion)) {
                this.operacion = args.operacion;
            }
            else {
                throw "La operación " + args.operacion + " no es conocida";
            }
        }
        if (args.letra) {
            if (typeof args.letra === 'string') {
                this.letra = args.letra;
            }
        }
    }
    fillExpresion(opciones = {}) {
        //        datosExpresion={
        //            valor: number,
        //            operacion: string,
        //            numero1: number,
        //            numero2: number,
        //            letra: string,
        //        }
        if (opciones.keepInteger) {
            console.log("keeping integer");
        }
        //    opciones={
        //        keepInteger: "Que el valor de la expresión sea entero",
        //        operaciones: "array de operaciones permitidas para el caso en que no se haya específicado una.",
        //        maxBasePotencia: "",
        //        minBasePotencia:"",
        //        minExponentePotencia: "",
        //        maxExponentePotencia: "",
        //        minGradoRadicacion: "",
        //        maxGradoRadicacion: "",
        //        maxDenominadorEntero: "",
        //        minDenominadorEntero: "",
        //    }
        if (opciones.maxExponentePotencia)
            this.maxExponentePotencia = opciones.maxExponentePotencia;
        if (opciones.minExponentePotencia)
            this.minExponentePotencia = opciones.minExponentePotencia;
        this.rangoExponentePotencia = this.maxExponentePotencia - this.minExponentePotencia;
        if (opciones.maxBasePotencia)
            this.maxBasePotencia = opciones.maxBasePotencia;
        if (opciones.minBasePotencia)
            this.minBasePotencia = opciones.minBasePotencia;
        this.rangoBasePotencia = this.maxBasePotencia - this.minBasePotencia;
        if (opciones.maxResultadoRadicacion)
            this.maxResultadoRadicacion = opciones.maxResultadoRadicacion;
        if (opciones.minResultadoRadicacion)
            this.minResultadoRadicacion = opciones.minResultadoRadicacion;
        this.rangoResultadoRadicacion = this.maxResultadoRadicacion - this.minResultadoRadicacion;
        if (opciones.maxGradoRadicacion)
            this.maxGradoRadicacion = opciones.maxGradoRadicacion;
        if (opciones.minGradoRadicacion)
            this.minGradoRadicacion = opciones.minGradoRadicacion;
        this.rangoGradoRadicacion = this.maxGradoRadicacion - this.minGradoRadicacion;
        if (opciones.maxDenominadorEntero)
            this.maxDenominadorEntero = opciones.maxDenominadorEntero;
        if (opciones.minDenominadorEntero)
            this.minDenominadorEntero = opciones.minDenominadorEntero;
        this.rangoDenominadorEntero = this.maxDenominadorEntero - this.minDenominadorEntero;
        let operaciones = opciones.operaciones ? ExpresionNumerica.operaciones.filter(opD => opciones.operaciones.includes(opD)) : ExpresionNumerica.operaciones;
        if (this.valor && this.valor < 0) {
            operaciones = operaciones.filter(op => op != "radicacion");
        }
        if (opciones.keepInteger && this.valor != null && !isNaN(this.valor)) { // Si hay valor fijado no se puede garantizar que se podrá generar una potencia entera.
            operaciones = operaciones.filter(op => op != 'potenciacion');
        }
        if (this.operacion && !ExpresionNumerica.operaciones.includes(this.operacion)) {
            throw `La operación ${this.operacion} no es conocida`;
        }
        if (!this.operacion) {
            let indexOperacion = Math.floor(Math.random() * operaciones.length);
            this.operacion = operaciones[indexOperacion];
        }
        //A partir de aquí ya hay operación
        //Se crean los dos números vacíos.
        if (!this.numero1)
            this.numero1 = new ExpresionNumerica();
        if (!this.numero2)
            this.numero2 = new ExpresionNumerica();
        if (this.valor == null || isNaN(this.valor)) { //NO se ha fijado valor de la expresión.
            //Faltan ámbos números.
            if (!this.numero1.valor && !this.numero2.valor) {
                this.numero1.valor = ExpresionNumerica.generarNumero();
                if (this.operacion === 'potenciacion') {
                    this.numero1.valor = Math.round(Math.random() * this.rangoBasePotencia) + this.minBasePotencia;
                    this.numero2.valor = Math.round(Math.random() * this.rangoExponentePotencia) + this.minExponentePotencia;
                }
                if (this.operacion === 'radicacion') {
                    this.numero2.valor = Math.round(Math.random() * this.rangoGradoRadicacion) + this.minGradoRadicacion;
                    this.numero1.valor = Math.pow(Math.round(Math.random() * this.rangoResultadoRadicacion + this.minResultadoRadicacion), this.numero2.valor);
                }
                if (this.operacion === 'division') {
                    if (opciones.keepInteger) {
                        let divisores = getDivisoresEnterosNumero(this.numero1.valor);
                        this.numero2.valor = divisores[Math.floor(Math.random() * divisores.length)];
                    }
                    else {
                        while (!this.numero2.valor) {
                            this.numero2.valor = ExpresionNumerica.generarNumero();
                        }
                    }
                }
                //Por si no se ha generado aún los números
                if (!this.numero1.valor) {
                    this.numero1.valor = ExpresionNumerica.generarNumero();
                }
                if (!this.numero2.valor) {
                    this.numero2.valor = ExpresionNumerica.generarNumero();
                }
            }
            //Sólo falta uno de los dos números.
            if (!this.numero1.valor) {
                if (opciones.keepInteger) {
                    if (this.operacion === "division") {
                        let minFactor = 2;
                        let maxFactor = 20;
                        let rangoFactor = maxFactor - minFactor;
                        this.numero1.valor = Math.round(Math.random() * rangoFactor + minFactor);
                    }
                }
                if (this.operacion === 'radicacion') {
                    this.numero1.valor = ExpresionNumerica.generarNumero();
                    if (this.numero2.valor % 2 != 0) {
                        this.numero1.valor = Math.abs(this.numero1.valor);
                    }
                }
                //Si no se generó en los bloques de arriba, se genera al azar.
                if (!this.numero1.valor) {
                    this.numero1.valor = ExpresionNumerica.generarNumero();
                }
            }
            else if (!this.numero2.valor) {
                if (opciones.keepInteger) {
                    if (this.operacion === "division") {
                        let divisores = getDivisoresEnterosNumero(this.numero1.valor);
                        this.numero2.valor = divisores[Math.floor(Math.random() * divisores.length)];
                    }
                }
                if (this.operacion === "potenciacion") {
                    this.numero2.valor = Math.round(Math.random() * this.rangoExponentePotencia + this.minExponentePotencia);
                }
                if (this.operacion === "radicacion") {
                    this.numero2.valor = Math.round(Math.random() * this.rangoGradoRadicacion + this.minGradoRadicacion);
                }
                //Si no se generó en el bloque keepInteger, se genera al azar.
                if (!this.numero2.valor) {
                    this.numero2.valor = ExpresionNumerica.generarNumero();
                }
            }
        }
        //Generando números para un valor dado
        if (this.valor) {
            if (!this.numero1.valor && !this.numero2.valor) { //Generando ámbos números base
                this.numero1 = new ExpresionNumerica();
                this.numero2 = new ExpresionNumerica();
                //Empezando por el número 1.
                if (this.operacion === 'potenciacion' && opciones.keepInteger) {
                    throw "Error para potenciacion. No es posible generar expresión: No se puede prever que un valor dado tendrá raiz entera de grado n";
                }
                else if (this.operacion === 'radicacion') {
                    let exponente = Math.floor(Math.random() * this.rangoGradoRadicacion) + this.minGradoRadicacion;
                    this.numero1.valor = Math.pow(this.valor, exponente);
                }
                else if (this.operacion === 'division' && opciones.keepInteger) {
                    let denominador = Math.round(Math.random() * this.rangoDenominadorEntero) + this.minDenominadorEntero;
                    this.numero1.valor = this.valor * denominador;
                }
                else if (this.operacion === 'multiplicacion' && opciones.keepInteger) {
                    let divisores = getDivisoresEnterosNumero(this.valor);
                    let cantDivisores = divisores.length;
                    let indexDivisor = Math.floor(Math.random() * cantDivisores);
                    this.numero1.valor = divisores[indexDivisor];
                }
                else {
                    this.numero1.valor = ExpresionNumerica.generarNumero();
                }
            }
            if (!this.numero1.valor || !this.numero2.valor) {
                this.setNumeroFaltante({});
            }
        }
    }
    get explicita() {
        if (this.numero1?.valor && this.numero2?.valor && this.operacion) {
            return false;
        }
        return true;
    }
    get simboloOperacion() {
        if (!this.operacion) {
            throw "Operación no fijada";
        }
        if (this.operacion === 'suma') {
            return '+';
        }
        if (this.operacion === 'resta') {
            return '-';
        }
        if (this.operacion === 'multiplicacion') {
            return ' \\times ';
        }
        if (this.operacion === 'division') {
            return ' \\over ';
        }
        if (this.operacion === 'potenciacion') {
            return '^';
        }
        if (this.operacion === 'radicacion') {
            return 'sqrt';
        }
    }
    static generarNumero(opciones = {}) {
        let maxNumero = this.maxNumero;
        let minNumero = this.minNumero;
        if (opciones?.maxNumero) {
            maxNumero = opciones.maxNumero;
        }
        if (opciones?.minNumero) {
            minNumero = opciones.minNumero;
        }
        let rangoNumero = maxNumero - minNumero;
        return Math.round(Math.random() * rangoNumero) + minNumero;
    }
    operarNumeros() {
        if (!this.operacion) {
            throw "Operación faltante";
        }
        if (!this.numero1 || !this.numero2) {
            throw "Falta un número para ejecutar la operación";
        }
        if (this.operacion === 'suma') {
            return this.numero1.valor + this.numero2.valor;
        }
        if (this.operacion === 'resta') {
            return this.numero1.valor - this.numero2.valor;
        }
        if (this.operacion === 'multiplicacion') {
            return this.numero1.valor * this.numero2.valor;
        }
        if (this.operacion === 'division') {
            return this.numero1.valor / this.numero2.valor;
        }
        if (this.operacion === 'potenciacion') {
            return Math.pow(this.numero1.valor, this.numero2.valor);
        }
        if (this.operacion === 'radicacion') {
            let res = Math.pow(this.numero1.valor, 1 / this.numero2.valor);
            if (Math.abs(res - Math.round(res)) < 0.0001) {
                res = Math.round(res);
            }
            return res;
        }
        throw "Operación no conocida";
    }
    setNumeroFaltante(opciones = {}) {
        //Si hay operacion, valor y alguno de los dos numerandos, calcula el númerando que falta.
        if (!this.operacion) {
            throw "Falta la operación";
        }
        if ((!this.numero1 || typeof this.numero1.valor !== 'number') && (!this.numero2 || typeof this.numero2.valor !== 'number')) {
            throw "Ambos números faltaban";
        }
        if (!this.numero1) {
            this.numero1 = new ExpresionNumerica();
        }
        if (!this.numero2) {
            this.numero2 = new ExpresionNumerica();
        }
        if (typeof this.numero1.valor === 'number' && typeof this.numero2.valor === 'number') {
            throw "Ambos números ya están decididos";
        }
        if (this.operacion === 'suma') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = this.valor - this.numero2.valor;
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                this.numero2.valor = this.valor - this.numero1.valor;
            }
        }
        if (this.operacion === 'multiplicacion') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = this.valor / this.numero2.valor;
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                this.numero2.valor = this.valor / this.numero1.valor;
            }
        }
        if (this.operacion === 'division') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = this.valor * this.numero2.valor;
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                this.numero2.valor = this.numero1.valor / this.valor;
            }
        }
        if (this.operacion === 'resta') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = this.valor + this.numero2.valor;
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                this.numero2.valor = this.numero1.valor - this.valor;
            }
        }
        if (this.operacion === 'potenciacion') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = Math.pow(this.valor, 1 / this.numero2.valor);
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                this.numero2.valor = getBaseLogNum(this.numero1.valor, this.valor);
                let num2Rounded = Math.round(this.numero2.valor);
                if (Math.abs(this.numero2.valor - num2Rounded) < 0.00001) {
                    this.numero2.valor = num2Rounded;
                }
            }
        }
        if (this.operacion === 'radicacion') {
            if (!this.numero1.valor && this.numero1.valor != 0) {
                this.numero1.valor = Math.pow(this.valor, this.numero2.valor);
            }
            if (!this.numero2.valor && this.numero2.valor != 0) {
                let potencia = getBaseLogNum(this.numero1.valor, this.valor);
                this.numero2.valor = 1 / potencia;
                // throw "Aún no desarrollado"
                let num2Rounded = Math.round(this.numero2.valor);
                if (Math.abs(this.numero2.valor - num2Rounded) < 0.00001) {
                    this.numero2.valor = num2Rounded;
                }
            }
        }
    }
    reexpresionar(reexpresiones, opcionesGenerarExpresion) {
        //Esta función recorre la expresión numérica buscando un número escrito de manera explícita para convertirlo en expresión numérica. Repite esa acción 
        //{{reexpresiones}} veces.
        console.log("iniciando reexpresion");
        if (reexpresiones == null || (typeof reexpresiones) != "number") {
            throw "No se especificó el número de reexpresiones";
        }
        if (reexpresiones < 0)
            reexpresiones = 0;
        for (var i = 0; i < reexpresiones; i++) {
            //Encontrar el lugar donde se hará reexpresión.
            let guarda = 0;
            let lugarActual = this;
            while (guarda++ < 100) {
                if (lugarActual.explicita) {
                    lugarActual.fillExpresion(opcionesGenerarExpresion);
                    break;
                }
                if (!lugarActual.numero1 || !lugarActual.numero2) {
                    throw "Expresión rota. No se puede reexpresionar";
                }
                let direccion = Math.ceil(Math.random() * 2);
                lugarActual = direccion === 1 ? lugarActual.numero1 : lugarActual.numero2;
                if (!lugarActual) {
                    throw "Error recorriendo árbol: se accedió a una rama vacía";
                }
            }
        }
    }
    toMathJax(opciones = {}) {
        let res = "";
        let operacionesAditivas = ["suma", "resta"];
        let operacionesExplicitas = ["division"];
        if (this.explicita) {
            return this.letra || this.valor;
        }
        if (!this.numero1 || !this.numero2) {
            throw "Expresión rota";
        }
        let textoLado1 = this.numero1.toMathJax();
        let textoLado2 = this.numero2.toMathJax();
        textoLado1 = "{" + textoLado1 + "}";
        //Decidiendo si add paréntesis en el lado1.
        let esNumNegativo = this.numero1.explicita && this.numero1.valor < 0;
        let esIncognita1 = this.numero1.explicita && this.numero1.letra;
        let esAditiva = !this.numero1.explicita && operacionesAditivas.includes(this.numero1.operacion);
        let esAditivaParentesable = (esAditiva && !operacionesAditivas.includes(this.operacion));
        let parentesable = esAditivaParentesable || (esNumNegativo && !esIncognita1);
        let enOperacionExplicita = operacionesExplicitas.includes(this.operacion) || this.operacion === 'radicacion'; //Para el número 1 la radicación es una operación que explicita la expresión
        let lado1NecesitaParentesis = parentesable && !enOperacionExplicita;
        let enCasoEspecial = this.operacion === 'potenciacion' && !this.numero1.explicita && this.numero1.operacion === 'division';
        if (enCasoEspecial) {
            lado1NecesitaParentesis = true;
        }
        if (lado1NecesitaParentesis) {
            textoLado1 = "{(" + textoLado1 + ")}";
        }
        textoLado2 = "{" + textoLado2 + "}";
        //Decidiendo si add paréntesis en el lado2.
        esNumNegativo = this.numero2.explicita && this.numero2.valor < 0;
        let esIncognita2 = this.numero2.explicita && this.numero2.letra;
        esAditiva = !this.numero2.explicita && operacionesAditivas.includes(this.numero2.operacion);
        esAditivaParentesable = (esAditiva && this.operacion != 'suma');
        parentesable = esAditivaParentesable || (esNumNegativo && !esIncognita2);
        enOperacionExplicita = operacionesExplicitas.includes(this.operacion);
        let lado2NecesitaParentesis = parentesable && !enOperacionExplicita;
        enCasoEspecial = !this.numero2.explicita && (this.operacion === 'potenciacion' || this.operacion === 'radicacion');
        if (enCasoEspecial) {
            lado2NecesitaParentesis = true;
        }
        if (lado2NecesitaParentesis) {
            textoLado2 = "{(" + textoLado2 + ")}";
        }
        //Listos los dos textos de la expresión. Ahora se deben unir mediante el texto de la operación
        if (this.operacion === 'radicacion') {
            return `\\sqrt[${textoLado2}]{${textoLado1}}`;
        }
        let textoOperacion = this.simboloOperacion;
        if (this.operacion === 'multiplicacion' && (esIncognita2 || lado2NecesitaParentesis || this.numero2.operacion === 'potenciacion')) {
            textoOperacion = "";
        }
        return textoLado1 + textoOperacion + textoLado2;
    }
    getNumsAndAdress() {
        //Retorna un array con infoNumero.
        //Info numero es un objeto con num y direccion.
        //direccion es un array que indica como encontrarlo recorriendo el árbol de la expresión.
        if (this.explicita) {
            let infoEste = {
                num: this.valor,
                direccion: []
            };
            return [infoEste];
        }
        if (!this.numero1 || !this.numero2) {
            throw "Expresion rota";
        }
        let arr1 = this.numero1.getNumsAndAdress();
        let arr2 = this.numero2.getNumsAndAdress();
        arr1.forEach(infoNum => {
            infoNum.direccion.unshift(0);
        });
        arr2.forEach(infoNum => {
            infoNum.direccion.unshift(0);
        });
        return [...arr1, ...arr2];
    }
    incognitarRandomNumero() {
        if (!this.numero1 || !this.numero2 || !this.operacion) {
            throw "La expresión no está terminada";
        }
        let nums = this.getNumsAndAdress();
        //Cada num es un objeto infoNumero.
        let numEscogido = nums[Math.floor(Math.random() * nums.length)];
        let numeroActual = this;
        for (let dir of numEscogido.direccion) {
            if (dir === 0) {
                numeroActual = this.numero1;
                continue;
            }
            numeroActual = this.numero2;
        }
        numeroActual.letra = ExpresionNumerica.generarRandomLetra();
        return numeroActual;
    }
    static generarRandomLetra() {
        let letras = "abcdefghijklmnpqrstuvwxyz";
        return letras.charAt(Math.floor(Math.random() * letras.length));
    }
}
/////////////////////
//
function getDivisoresEnterosNumero(num) {
    let lista = [];
    let mitadNum = num / 2;
    let factor = 2;
    while (factor * factor <= num) {
        if (num % factor === 0) {
            //factor es divisor de num.
            let multiplicador = 1;
            //add también todos los múltiplos de este factor antes de la mitad de num;
            let multiplo = factor * multiplicador;
            while (multiplo < mitadNum) {
                if (num % multiplo === 0) {
                    if (!lista.includes(multiplo))
                        lista.push(multiplo);
                    let contraparte = num / multiplo;
                    if (contraparte != multiplo) {
                        if (!lista.includes(contraparte))
                            lista.push(contraparte);
                    }
                }
                multiplicador++;
                multiplo = factor * multiplicador;
            }
        }
        factor = factor === 2 ? 3 : factor + 2;
    }
    return [1, ...lista, num];
}
function getBaseLogNum(base, num) {
    return Math.log(num) / Math.log(base);
}
class ExpresionNumericaBuilder {
    static generarExpresionNumericaRecursiva(datosExpresion, recursiones, opciones) {
        let laExpresion = new ExpresionNumerica(datosExpresion);
        laExpresion.fillExpresion();
        if (recursiones && recursiones > 0) {
            laExpresion.reexpresionar(recursiones, opciones);
        }
        return laExpresion;
    }
}
