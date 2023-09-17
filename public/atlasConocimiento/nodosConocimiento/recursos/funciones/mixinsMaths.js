class ExpresionNumerica {
    static operaciones = ["suma", "resta", "multiplicacion", "division", "potenciacion", "radicacion"];
    static maxNumero = 250;
    static minNumero = -250;

    valor;
    explicita; //Quiere decir que no debe entenderse como una expresión sino explícitamente como un número. El único campo que tiene relevancia aquí es "valor".
    numero1;
    numero2;
    operacion;
    letra;

    set valor(arg){
        if(this.numero1 && this.numero1.valor && this.numero1.valor != 0 && this.numero2 && this.numero2.valor && this.numero2.valor != 0){
            throw "No se puede fijar valor en una expresión que ya tiene sus operandos fijados"
        }
        this.valor=arg;
    }

    maxNumero = 250;
    minNumero = -250;

    operacion;
    simboloOperacion;

    minResultadoRadicacion = 2;
    maxResultadoRadicacion = 50;

    minGradoRadicacion = 2;
    maxGradoRadicacion = 6;

    minGradoPotenciacion = 2;
    maxGradoPotenciacion = 6;

    minDenominadorEntero = 2;
    maxDenominadorEntero = 30;

    minBasePotencia = 2;
    maxBasePotencia = 15;

    minExponentePotencia = 2;
    maxExponentePotencia = 6;


    constructor(args = {}) {
        if (args.valor) this.valor = args.valor;

        if (args.numero1) {
            if (args.numero1 instanceof ExpresionNumerica) {
                this.numero1 = args.numero1;
            }
            else {
                throw "Se intentaba asignar un dato de tipo distinto a Expresion numérica dentro de numero1"
            }
        }
        if (args.numero2) {
            if (args.numero2 instanceof ExpresionNumerica) {
                this.numero2 = args.numero2;
            }
            else {
                throw "Se intentaba asignar un dato de tipo distinto a Expresion numérica dentro de numero2"
            }
        }
        if (args.operacion) {
            if (ExpresionNumerica.operaciones.includes(args.operacion)){
                this.operacion = args.operacion;
            }
            else {
                throw "La operación " + args.operacion + " no es conocida";
            }
        }
        if (args.letra){
            if(typeof args.letra ==='string'){
                this.letra = args.letra;
            }
        }
    }

    fillExpresion(opciones) {

        //        datosExpresion={
        //            valor: number,
        //            operacion: string,
        //            numero1: number,
        //            numero2: number,
        //            letra: string,
        //        }

        console.log("Filling expresión numérica");

        if (this.valor) {
            console.log("Para el valor " + this.valor);
        }

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

        if (opciones.maxExponentePotencia) this.maxExponentePotencia = opciones.maxExponentePotencia;
        if (opciones.minExponentePotencia) this.minExponentePotencia = opciones.minExponentePotencia;
        this.rangoExponente = this.maxExponentePotencia - this.minExponentePotencia;

        if (opciones.maxBasePotencia) this.maxBasePotencia = opciones.maxBasePotencia;
        if (opciones.minBasePotencia) this.minBasePotencia = opciones.minBasePotencia;
        this.rangoBasePotencia = this.maxBasePotencia - this.minBasePotencia;

        if (opciones.maxResultadoRadicacion) this.maxResultadoRadicacion = opciones.maxResultadoRadicacion;
        if (opciones.minResultadoRadicacion) this.minResultadoRadicacion = opciones.minResultadoRadicacion;
        this.rangoResultadoRadicacion = this.maxResultadoRadicacion - this.minResultadoRadicacion;

        if (opciones.maxGradoRadicacion) this.maxGradoRadicacion = opciones.maxGradoRadicacion;
        if (opciones.minGradoRadicacion) this.minGradoRadicacion = opciones.minGradoRadicacion;
        this.rangoGradoRadicacion = this.maxGradoRadicacion - this.minGradoRadicacion;

        if (opciones.maxDenominadorEntero) this.maxDenominadorEntero = opciones.maxDenominadorEntero;
        if (opciones.minDenominadorEntero) this.minDenominadorEntero = opciones.minDenominadorEntero;
        this.rangoDenominadorEntero = this.maxDenominadorEntero - this.minDenominadorEntero;

        let operaciones = opciones.operaciones ? ExpresionNumerica.operaciones.filter(opD => opciones.operaciones.includes(opD)) : ExpresionNumerica.operaciones;

        if (this.operacion && !ExpresionNumerica.operaciones.includes(this.operacion)) {
            throw `La operación ${this.operacion} no es conocida`;
        }
        if (!this.operacion) {
            let indexOperacion = Math.floor(Math.random() * operaciones.length);
            this.operacion = operaciones[indexOperacion];
        }

        //A partir de aquí ya hay operación
        console.log("Operación: " + this.operacion);

        //Se crean los dos números vacíos.
        if (!this.numero1) this.numero1 = new ExpresionNumerica();
        if (!this.numero2) this.numero2 = new ExpresionNumerica();

        if (!this.valor) {//NO se ha fijado valor de la expresión.

            //Faltan ámbos números.
            if (!this.numero1.valor && !this.numero2.valor) {

                this.numero1.valor = generarNumero(opciones);

                if (this.operacion === 'potenciacion') {
                    this.numero1.valor = Math.round(Math.random() * this.rangoBasePotencia) + this.minBasePotencia;
                    this.numero2.valor = Math.round(Math.random() * this.rangoExponente) + this.minExponentePotencia;
                }

                if (this.operacion === 'radicacion') {
                    this.numero2.valor = Math.round(Math.random() * this.rangoGradoRadicacion) + this.minGradoRadicacion;
                    this.numero1.valor = Math.pow(Math.round(Math.random() * this.rangoResultadoRadicacion + this.minResultadoRadicacion), this.numero2);
                }
                if (this.operacion === 'division') {
                    if (opciones.keepInteger) {
                        let divisores = getDivisoresEnteros(this.numero1);
                        this.numero2.valor = divisores[Math.floor(Math.random() * divisores.length)];
                    }
                    else {
                        while (!this.numero2.valor) {
                            this.numero2.valor = generarNumero(opciones);
                        }
                    }
                }

                //Por si no se ha generado aún los números
                if (!this.numero1.valor) {
                    this.numero1.valor = generarNumero(opciones);

                }
                if (!this.numero2.valor) {
                    this.numero2.valor = generarNumero(opciones);
                }

                this.valor = this.operarNumeros();
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

                //Si no se generó en el bloque keepInteger, se genera al azar.
                if (!this.numero1.valor) {
                    this.numero1.valor = generarNumero();
                }
                this.valor = this.operarNumeros();
            }
            else if (!this.numero2.valor) {
                if (opciones.keepInteger) {
                    if (this.operacion === "division") {
                        let divisores = getDivisoresEnteros(this.numero1.valor);
                        this.numero2.valor = divisores[Math.floor(Math.random() * divisores.length)];
                    }
                }
                if (this.operacion === "potenciacion") {
                    this.numero2.valor = Math.round(Math.random() * this.rangoExponente + this.minExponentePotencia);
                }
                if (this.operacion === "radicacion") {
                    this.numero2.valor = Math.round(Math.random() * this.rangoGradoRadicacion + this.minGradoRadicacion)
                }

                //Si no se generó en el bloque keepInteger, se genera al azar.
                if (!this.numero2.valor) {
                    this.numero2.valor = generarNumero();
                }
                this.valor = this.operarNumeros();
            }
        }

        //Generando números para un valor dado
        if (this.valor) {
            if (!this.numero1.valor && !this.numero2.valor) { //Generando ámbos números base

                //Empezando por el número 1.
                this.numero1.valor = generarNumero();
                if (this.operacion === 'potenciacion' && opciones.keepInteger) {
                    throw "Error para potenciacion. No es posible generar expresión: No se puede prever que un valor dado tendrá raiz entera de grado n"
                }
                if (this.operacion === 'radicacion') {
                    let exponente = Math.floor(Math.random() * this.rangoGradoRadicacion) + this.minGradoRadicacion;
                    this.numero1.valor = Math.pow(this.valor, exponente);
                }
                if (this.operacion === 'division' && opciones.keepInteger) {
                    let denominador = Math.round(Math.random() * this.rangoDenominadorEntero) + this.minDenominadorEntero;
                    this.numero1.valor = this.valor * denominador;
                }
                if (this.operacion === 'multiplicacion' && opciones.keepInteger) {
                    let divisores = getDivisoresEnteros(this.valor);
                    let cantDivisores = divisores.length;
                    let indexDivisor = Math.floor(Math.random() * cantDivisores);

                    this.numero1.valor = divisores[indexDivisor];
                }
            }

            if (!this.numero1.valor || !this.numero2.valor) {
                this.setNumeroFaltante();
            }
        }

    }


    static getDivisoresEnterosNumero(num) {
        let lista = [];
        for (var i = Math.floor(num / 2); i > 0; i--) {
            if (num % i === 0) {
                lista.push(i);
            }
        }
        if (num % 1 === 0) {
            lista = [num, ...lista];
        }
        return lista;
    }

    static getBaseLogNum(num) {
        return Math.log(num) / Math.log(base);
    }

    get explicita() {
        if (this.numero1 && this.numero2 && this.operacion) {
            return false;
        }
        else if (this.valor) {
            return true;
        }
        throw "Operación no usable"

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

    static generarNumero(opciones) {
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
            console.log("operando " + this.numero1.valor + " y 1/" + this.numero2.valor);
            console.log(Math.pow(this.numero1.valor, 1 / this.numero2.valor));
            let res = Math.pow(this.numero1.valor, 1 / this.numero2.valor);
            if (Math.abs(res - Math.round(res)) < 0.0001) {
                res = Math.round(res);
            }
            return res;
        }
    }

    setNumeroFaltante(opciones) {
        if (!this.operacion) {
            throw "Falta la operación"
        }

        if (!typeof this.numero1?.valor === 'number' && !typeof this.numero2?.valor === 'number') {
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
                this.numero2.valor = ExpresionNumerica.getBaseLog(this.numero1.valor, this.valor);

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
                let potencia = getBaseLog(this.numero1.valor, this.valor);
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

        if (!reexpresiones || (typeof reexpresiones) != "number") {
            throw "No se especificó el número de reexpresiones";
        }
        console.log(`Reexpresionando ${reexpresiones} veces la expresión`);

        for (var i = 0; i < reexpresiones; i++) {
            //Encontrar el lugar donde se hará reexpresión.

            let guarda = 0;
            let lugarActual = this;
            while (guarda++ < 100) {

                let direccion = Math.ceil(Math.random() * 2);
                console.log("Entrando en dirección " + direccion);
                numeroActual = direccion === 1 ? lugarActual.numero1 : lugarActual.numero2;

                if (!numeroActual.operacion || !numeroActual.numero1 || !numeroActual.numero2) { //Una expresión que no tiene datos suficientes para ser una expresión será considerada un número explícito.
                    //Esto es un número explícito porque no tiene datos completos para ser una expresión numérica.
                    if (!numeroActual.valor) {
                        throw "Expresión no tenía datos completos";
                    }
                    console.log("Se reexpresionará el " + numeroActual.valor);
                    if (direccion === 1) {
                        lugarActual.numero1.fillExpresion();
                    }
                    else {
                        lugarActual.numero2.fillExpresion();
                    }

                    break;
                }

                lugarActual = direccion === 1 ? lugarActual.numero1 : lugarActual.numero2
            }
        }
    }

    toMathJax(opciones) {
        let res = "";
        let operacionesAditivas = ["suma", "resta"];
        let operacionesExplicitas = ["division"]

        console.log("Generando string para mathJax");
        if (!this.operacion || !this.numero1 || !this.numero2) {
            //Esto debe ser un número explícito porque no tiene datos suficientes para ser una expresión numérica.
            if (!this.valor && this.valor != 0) {
                throw "Expresión incompleta";
            }
            //Es un número explícito.
            return this.letra || this.valor

        }

        textoLado1 = "{" + textoLado1 + "}";

        let esNumNegativo = typeof lado1 === 'number' && lado1 < 0;
        let esAditiva = lado1.operacion && operacionesAditivas.includes(lado1.operacion);
        let esAditivaParentesable = (esAditiva && !operacionesAditivas.includes(this.operacion));
        let parentesable = esAditivaParentesable || esNumNegativo;
        let enOperacionExplicita = operacionesExplicitas.includes(this.operacion) || this.operacion === 'radicacion'; //Para el número 1 la radicación es una operación que explicita la expresión
        let lado1NecesitaParentesis = parentesable && !enOperacionExplicita;

        let enCasoEspecial = this.operacion === 'potencia' && lado1.operacion === 'division';

        if (enCasoEspecial) {
            lado1NecesitaParentesis = true;
        }

        if (lado1NecesitaParentesis) {
            console.log("Parentesing la expresion");
            console.table(lado1);
            textoLado1 = "{(" + textoLado1 + ")}";
        }


        textoLado2 = "{" + textoLado2 + "}";

        esNumNegativo = lado2.explicita && lado2.valor < 0;
        esAditiva = lado2.operacion && operacionesAditivas.includes(lado2.operacion);
        esAditivaParentesable = (esAditiva && this.operacion != 'suma');
        parentesable = esAditivaParentesable || esNumNegativo;
        enOperacionExplicita = operacionesExplicitas.includes(this.operacion);
        lado2NecesitaParentesis = parentesable && !enOperacionExplicita;

        enCasoEspecial = !lado2.explicita && (this.operacion === 'potenciacion' || this.operacion === 'radicacion');
        if (enCasoEspecial) {
            lado2NecesitaParentesis = true;
        }

        if (lado2NecesitaParentesis) {
            console.log("Parentesing la expresion");
            console.table(lado2);
            textoLado2 = "{(" + textoLado2 + ")}";
        }


        if (this.operacion != 'radicacion') {

            res = textoLado1 + this.getSimboloOperacion() + textoLado2;
        }

        if (this.operacion === 'radicacion') {

            res = `\\sqrt[${textoLado2}]{${textoLado1}}`;
        }
        return res;
    }

    getNumsAndAdress() {
        //Retorna un array con infoNumero.
        //Info numero es un objeto con num y direccion.
        //direccion es un array que indica como encontrarlo recorriendo el árbol de la expresión.

        if (this.explicita) {
            return [{ num: this.valor, direccion: [] }];
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
        let nums = this.getNumsAndAdress();
        //Cada num es un objeto infoNumero.

        let numEscogido = nums[Math.floor(Math.random() * nums.length)];

        console.log("se incognitará el " + numEscogido.num + " en la dirección " + numEscogido.direccion);

        let numeroActual = this;
        for (let dir in numEscogido.direccion) {
            if (dir === 0) {
                numeroActual = this.numero1;
                continue;
            }
            numeroActual = this.numero2;
        }
        numeroActual.letra = ExpresionNumerica.generarRandomLetra();
    }

    static generarRandomLetra() {
        let letras = "abcdefghijklmnpqrstuvwxyz";
        return letras.charAt(Math.floor(Math.random() * letras.length));
    }
}

/////////////////////
