import { ModeloNodo as NodoConocimiento } from "./model/atlas/Nodo";
const anchoCeldas = 400;
// const nodoDeInteres = 'Que la casa de Maestra Vida esté en condiciones óptimas para habitarla y disfrutarla.';
const nodoDeInteres = null;
export async function ejecutarPosicionamientoNodosConocimientoByFuerzas(ciclos, timeCalled, force) {
    const maxCiclos = 1000;
    if (ciclos > maxCiclos)
        ciclos = maxCiclos;
    console.log(`Iniciando un posicionamiento de fuerzas de ${ciclos} ciclos`);
    try {
        var todosNodos = await NodoConocimiento.find({}).exec();
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }
    filtrarVinculosHuerfanos(todosNodos);
    setInformacionRelevante(todosNodos);
    //Iniciar coordenadas
    todosNodos.forEach(nodo => {
        if (!nodo.autoCoords.x)
            nodo.autoCoords.x = nodo.coords.x || Math.round(Math.random() * 700);
        if (!nodo.autoCoords.y)
            nodo.autoCoords.y = nodo.coords.y || Math.round(Math.random() * 700);
        // if(nodo.descripcion==="Sin descripcion" || nodo.descripcion==="Sin descripción")nodo.descripcion=null;
        // nodo.autoCoords.x=Math.round(Math.random()*100);
        // nodo.autoCoords.y=Math.round(Math.random()*100);
    });
    var celdas = setCeldas(todosNodos);
    for (var ciclo = 0; ciclo < ciclos; ciclo++) {
        posicionar(todosNodos, celdas);
    }
    console.log(`Uploading...`);
    await uploadNodos(todosNodos);
    // await sleep(10000);
}
function posicionar(todosNodos, celdas) {
    todosNodos = todosNodos.sort((a, b) => b.peso - a.peso);
    todosNodos.forEach(nodo => {
        if (nodo.nombre === nodoDeInteres || !nodoDeInteres) {
            setNivel(nodo, todosNodos);
            setFuerzaCentroMasa(nodo, todosNodos);
            setFuerzaColision(nodo, celdas, todosNodos);
            moverNodo(nodo, celdas);
        }
    });
}
function moverNodo(nodo, celdas) {
    const viejaCelda = {
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };
    desplazarNodo(nodo);
    const nuevaCelda = {
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };
    if (viejaCelda.x != nuevaCelda.x || viejaCelda.y != nuevaCelda.y) { //Hay cambio de celda
        //Retirar el nodo de la vieja celda
        const indexN = celdas[viejaCelda.x][viejaCelda.y].indexOf(nodo.id);
        if (indexN > -1) {
            celdas[viejaCelda.x][viejaCelda.y].splice(indexN, 1);
        }
        else {
            console.log(`Alerta!! El nodo no estaba en su celda`);
        }
        //Introducir el nodo a la nueva celda
        if (!celdas[nuevaCelda.x]) {
            celdas[nuevaCelda.x] = {};
        }
        if (!celdas[nuevaCelda.x][nuevaCelda.y]) {
            celdas[nuevaCelda.x][nuevaCelda.y] = [];
        }
        const indexM = celdas[nuevaCelda.x][nuevaCelda.y].indexOf(nodo.id);
        if (indexM === -1) {
            celdas[nuevaCelda.x][nuevaCelda.y].push(nodo.id);
        }
        else {
            console.log(`Alerta!!, el nodo estaba anotado en la nueva celda antes de entrar a ella`);
        }
    }
}
export function desplazarNodo(nodo) {
    const maxDesplazamiento = 50;
    if (nodo.nombre === nodoDeInteres) {
        console.log("con fuerza centro masa: " + JSON.stringify(nodo.fuerzaCentroMasa));
        console.log("con fuerza colision: " + JSON.stringify(nodo.fuerzaColision));
    }
    var movimiento = {
        x: (nodo.fuerzaCentroMasa.modulo * Math.cos(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.modulo * Math.cos(nodo.fuerzaColision.direccion)),
        y: (nodo.fuerzaCentroMasa.modulo * Math.sin(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.modulo * Math.sin(nodo.fuerzaColision.direccion))
    };
    if (movimiento.x > maxDesplazamiento)
        movimiento.x = maxDesplazamiento;
    if (movimiento.x < -maxDesplazamiento)
        movimiento.x = -maxDesplazamiento;
    if (movimiento.y > maxDesplazamiento)
        movimiento.y = maxDesplazamiento;
    if (movimiento.y < -maxDesplazamiento)
        movimiento.y = -maxDesplazamiento;
    nodo.autoCoords.x = Math.round(nodo.autoCoords.x + movimiento.x);
    nodo.autoCoords.y = Math.round(nodo.autoCoords.y + movimiento.y);
}
function setNivel(nodo, todosNodos) {
    nodo.nivel = 0;
    let vinculosActuales = nodo.vinculos;
    if (nodo.nombre === nodoDeInteres) {
        //Log in yellow        
        console.log(`\x1b[33m%s\x1b[0m`, `Tiene: ${vinculosActuales.length} vinculos`);
    }
    while (vinculosActuales.length > 0) {
        nodo.nivel++;
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Pasa a nivel ${nodo.nivel}`);
        }
        //prevent infinite loop
        if (nodo.nivel > 100)
            break;
        let vinculosRelevantes = vinculosActuales.filter(v => v.tipo == "continuacion" && v.rol == "target");
        console.log(`con ${vinculosRelevantes.length} vinculos relevantes con ids ${vinculosRelevantes.map(v => v.idRef).join(", ")}`);
        let idsSiguientesNodos = vinculosRelevantes.map(v => v.idRef);
        console.log(`Buscando ${idsSiguientesNodos.length} siguientes nodos en ${todosNodos.length} nodos`);
        let siguientesNodos = todosNodos.filter(nd => idsSiguientesNodos.includes(nd.id));
        if (nodo.nombre === nodoDeInteres) {
            console.log(`Siguientes nodos: ${siguientesNodos.map(n => n.nombre).join(", ")}`);
        }
        vinculosActuales = siguientesNodos.reduce((acc, n) => acc.concat(n.vinculos), []);
        console.log(`con ${vinculosActuales.length} vinculos`);
        //prevent repetition
        vinculosActuales = vinculosActuales.filter(v => !idsSiguientesNodos.includes(v.idRef));
        //purge repeated items
        vinculosActuales = vinculosActuales.filter((v, i) => vinculosActuales.findIndex(v2 => v2.idRef === v.idRef) === i);
        console.log(`Purgados quedan ${vinculosActuales.length} vinculos`);
    }
}
function setFuerzaColision(nodo, celdas, todosNodos) {
    const celdaX = getCeldaH(nodo.autoCoords);
    const celdaY = getCeldaV(nodo.autoCoords);
    var celdasRelevantes = [
        { x: celdaX - 1, y: celdaY - 1 }, { x: celdaX, y: celdaY - 1 }, { x: celdaX + 1, y: celdaY - 1 },
        { x: celdaX - 1, y: celdaY }, { x: celdaX, y: celdaY }, { x: celdaX + 1, y: celdaY },
        { x: celdaX - 1, y: celdaY + 1 }, { x: celdaX, y: celdaY + 1 }, { x: celdaX + 1, y: celdaY + 1 },
    ];
    var idsNodosRelevantes = [];
    celdasRelevantes.forEach(celda => {
        if (celdas[celda.x] && celdas[celda.x][celda.y]) {
            idsNodosRelevantes = idsNodosRelevantes.concat(celdas[celda.x][celda.y]);
        }
    });
    //Retirar el propio nodo de la lista.
    const indexN = idsNodosRelevantes.indexOf(nodo.id);
    if (indexN > -1) {
        idsNodosRelevantes.splice(indexN, 1);
    }
    var nodosRelevantes = todosNodos.filter(n => idsNodosRelevantes.includes(n.id));
    setFuerzaColisionNodo(nodo, nodosRelevantes);
}
export function setFuerzaColisionNodo(nodo, nodosRelevantes) {
    console.log("Calculando fuerza de colisión de " + nodo.nombre);
    const rangoColision = 600; //Rango de acción de colisión
    const colisionMaxima = 900; //Colision maxima generada en distancia 0
    const pendiente = -colisionMaxima / rangoColision;
    //FactorFuerza grows linearlly in such a way that doubles if nivel is 3
    var coordsFuerzaTotal = {
        x: 0,
        y: 0
    };
    if (nodoDeInteres === nodo.nombre) {
    }
    nodosRelevantes.forEach(nodoR => {
        let coordsDistancia = {
            x: nodo.autoCoords.x - nodoR.autoCoords.x,
            y: nodo.autoCoords.y - nodoR.autoCoords.y
        };
        if (nodoDeInteres === nodo.nombre) {
        }
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        if (nodoDeInteres === nodo.nombre) {
        }
        if (vectorDistancia.modulo > rangoColision)
            vectorDistancia.modulo = rangoColision;
        let fuerzaColision = pendiente * vectorDistancia.modulo + colisionMaxima;
        if (!nodo.vinculos.map(v => v.idRef).includes(nodoR.id)) { //Colisión con un nodo no conectado (Mayor colisión)
            fuerzaColision = fuerzaColision * 1.1;
            if (!nodo.vinculos.map(v => v.idRef).some(id => nodoR.vinculos.map(v => v.idRef).includes(id))) { //Colisión con un nodo que no comparte vínculo. También genera mayor colisión.
                fuerzaColision = fuerzaColision * 1.1;
            }
        }
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaColision;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaColision;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
    });
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    console.log("quedó : " + JSON.stringify(fuerzaPolar));
    nodo.fuerzaColision = fuerzaPolar;
}
function setFuerzaCentroMasa(nodo, todosNodos) {
    var nodosRelevantes = todosNodos.filter(n => nodo.idsNodosConectados.includes(n.id));
    setFuerzaCentroMasaNodo(nodo, nodosRelevantes);
}
export function setFuerzaCentroMasaNodo(nodo, nodosRelevantes) {
    console.log("setting fuerza centro masa de " + nodo.nombre);
    const umbralCercano = 600; //Zona demasiado cercana al nodo. Debería haber baja atracción.
    const puntoMil = 1000; //Distancia a la cual ya se tiene 1000N de atracción.
    const pendiente = puntoMil / (puntoMil - umbralCercano);
    const cruceEje = -pendiente * umbralCercano;
    var vectorCentro = cartesian2Polar(-nodo.autoCoords.x, -nodo.autoCoords.y);
    vectorCentro.modulo = 2;
    //Fuerza default hacia el centro del diagrama
    var coordsFuerzaTotal = {
        x: vectorCentro.modulo * Math.cos(vectorCentro.direccion),
        y: vectorCentro.modulo * Math.sin(vectorCentro.direccion),
    };
    nodosRelevantes.forEach(nodoR => {
        let coordsDistancia = {
            x: nodoR.autoCoords.x - nodo.autoCoords.x,
            y: nodoR.autoCoords.y - nodo.autoCoords.y
        };
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        if (vectorDistancia.modulo < 0)
            vectorDistancia.modulo = 0;
        let fuerzaCentroMasa = vectorDistancia.modulo * pendiente + cruceEje;
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaCentroMasa;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaCentroMasa;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
    });
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    nodo.fuerzaCentroMasa = fuerzaPolar;
    console.log("quedó: " + JSON.stringify(nodo.fuerzaCentroMasa));
}
function filtrarVinculosHuerfanos(todosNodos) {
    todosNodos.forEach(nodo => {
        let idsVinculos = nodo.vinculos.map(v => v.idRef);
        var indexHuerfanos = [];
        idsVinculos.forEach((idV, index) => {
            if (!todosNodos.some(n => n.id == idV)) { //Ningún nodo está apuntado por este idRef
                indexHuerfanos.push(index);
            }
        });
        if (indexHuerfanos.length > 0) {
            console.log(`Encontrados ${indexHuerfanos.length} nodos huerfanos en el nodo ${nodo.nombre}. Eliminando`);
            indexHuerfanos = indexHuerfanos.sort((a, b) => b - a);
            indexHuerfanos.forEach(i => {
                nodo.vinculos.splice(i, 1);
            });
        }
    });
}
function setCeldas(todosNodos) {
    var celdas = {};
    todosNodos.forEach(nodo => {
        nodo.celdaH = getCeldaH(nodo.autoCoords);
        nodo.celdaV = getCeldaV(nodo.autoCoords);
        if (!celdas[nodo.celdaH]) {
            celdas[nodo.celdaH] = {};
        }
        if (!celdas[nodo.celdaH][nodo.celdaV]) {
            celdas[nodo.celdaH][nodo.celdaV] = [];
        }
        celdas[nodo.celdaH][nodo.celdaV].push(nodo.id);
    });
    return celdas;
}
function getCeldaH(coords) {
    const celda = Math.floor(coords.x / anchoCeldas);
    return celda;
}
function getCeldaV(coords) {
    var celda = Math.floor(coords.y / anchoCeldas);
    return celda;
}
async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        if (nodo.nombre === nodoDeInteres || !nodoDeInteres) {
            try {
                nodo.fuerzaColision.modulo = Math.round(nodo.fuerzaColision.modulo);
                nodo.fuerzaCentroMasa.modulo = Math.round(nodo.fuerzaCentroMasa.modulo);
                nodo.posicionadoByFuerzas = true;
                console.log(`Guardando ${nodo.nombre} con nivel ${nodo.nivel}`);
                await nodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo ${nodo.nombre}. e: ` + error);
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function setInformacionRelevante(todosNodos) {
    todosNodos.forEach(nodo => {
        setNodosConectados(nodo, todosNodos);
    });
}
function setNodosConectados(nodo, todosNodos) {
    var idsRequeridos = nodo.vinculos.map(v => v.idRef);
    var idsRequirientes = todosNodos.filter(n => {
        var idsRequeridos = n.vinculos.map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);
    nodo.idsRequeridos = idsRequeridos;
    nodo.idsNodosConectados = idsRequeridos.concat(idsRequirientes);
}
function cartesian2Polar(x, y) {
    const distance = Math.sqrt(x * x + y * y);
    const radians = Math.atan2(y, x); //This takes y first
    const polarCoor = { modulo: distance, direccion: radians };
    return polarCoor;
}
