"use strict";
const anchoCeldas = 400;
// const nodoDeInteres = 'Que la casa de Maestra Vida esté en condiciones óptimas para habitarla y disfrutarla.';
const nodoDeInteres = null;
function posicionar(todosNodos, celdas) {
    todosNodos = todosNodos.sort((a, b) => b.peso - a.peso);
    todosNodos.forEach(nodo => {
        if (nodo.nombre === nodoDeInteres || !nodoDeInteres) {
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
    if (nodo.nombre === nodoDeInteres) {
        console.log(`Moviendo ${nodo.nombre} desde ${nodo.autoCoords}`);
        console.log(`Fuerza colision: ${nodo.fuerzaColision.fuerza} en dirección ${nodo.fuerzaColision.direccion}`);
        console.log(`Fuerza Centro masa: ${nodo.fuerzaCentroMasa.fuerza} en dirección ${nodo.fuerzaCentroMasa.direccion}`);
    }
    const maxDesplazamiento = 50;
    var movimiento = {
        x: (nodo.fuerzaCentroMasa.fuerza * Math.cos(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza * Math.cos(nodo.fuerzaColision.direccion)),
        y: (nodo.fuerzaCentroMasa.fuerza * Math.sin(nodo.fuerzaCentroMasa.direccion)) + (nodo.fuerzaColision.fuerza * Math.sin(nodo.fuerzaColision.direccion))
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
    if (nodo.nombre === nodoDeInteres) {
        console.log(`Queda en ${nodo.autoCoords}`);
    }
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
function setFuerzaColisionNodo(nodo, nodosRelevantes) {
    const rangoColision = 600; //Rango de acción de colisión
    const colisionMaxima = 500; //Colision maxima generada en distancia 0
    const factorFuerza = colisionMaxima / Math.pow(rangoColision, 2);
    var coordsFuerzaTotal = {
        x: 0,
        y: 0
    };
    // console.log(`---FuerzaTotal: ${JSON.stringify(coordsFuerzaTotal)}`);
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Calculando fuerza colisión en ${JSON.stringify(nodo.autoCoords)} con ${nodosRelevantes.length} nodos relevantes: `);
    }
    nodosRelevantes.forEach(nodoR => {
        if (nodoDeInteres === nodo.nombre) {
            console.log(`-${nodoR.nombre}, ${JSON.stringify(nodoR.autoCoords)}:`);
        }
        let coordsDistancia = {
            x: nodo.autoCoords.x - nodoR.autoCoords.x,
            y: nodo.autoCoords.y - nodoR.autoCoords.y
        };
        if (nodoDeInteres === nodo.nombre) {
            console.log(`CoordsDistancia: ${JSON.stringify(coordsDistancia)}`);
        }
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        if (nodoDeInteres === nodo.nombre) {
            console.log(`vectorDistancia: ${JSON.stringify(vectorDistancia)}`);
        }
        if (vectorDistancia.fuerza > rangoColision)
            vectorDistancia.fuerza = rangoColision;
        // console.log(`Se suma ${JSON.stringify(vectorDistancia)}`);
        let fuerzaColision = factorFuerza * Math.pow(rangoColision - vectorDistancia.fuerza, 2);
        if (!nodo.idsNodosConectados.includes(nodoR.id)) { //Colisión con un nodo no conectado (Mayor colisión)
            fuerzaColision = fuerzaColision * 1.3;
            if (nodo.vinculos.map(v => v.idRef).some(id => nodoR.vinculos.map(v => v.idRef).includes(id))) { //Tampoco tienen un vínculo en común.
                fuerzaColision = fuerzaColision * 1.3;
            }
        }
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaColision;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaColision;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
        if (nodoDeInteres === nodo.nombre) {
            console.log(`=(${compx}, ${compy}), ${vectorDistancia.direccion} *${factorFuerza}`);
        }
    });
    // console.log(`FuerzaTotal queda en: ${JSON.stringify(coordsFuerzaTotal)}`);
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    nodo.fuerzaColision = fuerzaPolar;
}
function setFuerzaCentroMasa(nodo, todosNodos) {
    if (nodoDeInteres === nodo.nombre) {
        console.log('\x1b[33m%s\x1b[0m', `Calculando fuerza centro masa con ${nodo.idsNodosConectados.length} nodos relevantes:`);
        console.log(`Nodo autoCoords: ${nodo.autoCoords}`);
    }
    var nodosRelevantes = todosNodos.filter(n => nodo.idsNodosConectados.includes(n.id));
    setFuerzaCentroMasaNodo(nodo, nodosRelevantes);
}
function setFuerzaCentroMasaNodo(nodo, nodosRelevantes) {
    const distanciaUmbral = 400;
    const factorFuerza = 100 / Math.pow(distanciaUmbral, 2);
    var coordsFuerzaTotal = {
        x: 0,
        y: 0
    };
    nodosRelevantes.forEach(nodoR => {
        if (nodoDeInteres === nodo.nombre) {
            console.log(`-${nodoR.nombre}, ${JSON.stringify(nodoR.autoCoords)}:`);
        }
        let coordsDistancia = {
            x: nodoR.autoCoords.x - nodo.autoCoords.x,
            y: nodoR.autoCoords.y - nodo.autoCoords.y
        };
        if (nodoDeInteres === nodo.nombre) {
            console.log(`CoordsDistancia: ${JSON.stringify(coordsDistancia)}`);
        }
        let vectorDistancia = cartesian2Polar(coordsDistancia.x, coordsDistancia.y);
        if (nodoDeInteres === nodo.nombre) {
            console.log(`vectorDistancia: ${JSON.stringify(vectorDistancia)}`);
        }
        // console.log(`Se suma ${JSON.stringify(vectorDistancia)}`);
        let fuerzaCentroMasa = factorFuerza * Math.pow(vectorDistancia.fuerza, 2);
        if (nodo.idsRequeridos.includes(nodoR.id)) { //Fuerza de atracción de nodos requeridos
            if (nodoR.nodoParent === nodo.id) { //Fuerza de atracción de nodos chidlren.
                fuerzaCentroMasa = fuerzaCentroMasa * 0.9;
            }
            else { //Fuerza de atracción de requeridos pero no children
                fuerzaCentroMasa = fuerzaCentroMasa * 0.7;
            }
        }
        else { //Fuerza de atracción de requirientes
            if (nodoR.id === nodo.nodoParent) { //Fuerza de atracción del parent
                fuerzaCentroMasa = fuerzaCentroMasa * 1.1;
            }
            else { //Fuerza de atracción de requiriente no-parent
                fuerzaCentroMasa = fuerzaCentroMasa * 0.9;
            }
        }
        let compx = Math.cos(vectorDistancia.direccion) * fuerzaCentroMasa;
        let compy = Math.sin(vectorDistancia.direccion) * fuerzaCentroMasa;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
        if (nodoDeInteres === nodo.nombre) {
            console.log(`=(${compx}, ${compy}), ${vectorDistancia.direccion} *${factorFuerza}`);
        }
    });
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Fuerza centro masa total: ${JSON.stringify(coordsFuerzaTotal)}`);
    }
    //Los nodos root derivan hacia el centro del diagrama.
    if (!nodo.nodoParent) {
        let coordsDistanciaCentro = {
            x: -nodo.autoCoords.x,
            y: -nodo.autoCoords.y
        };
        let vectorDistanciaCentro = cartesian2Polar(coordsDistanciaCentro.x, coordsDistanciaCentro.y);
        let fuerzaCentro = factorFuerza * Math.pow(vectorDistanciaCentro.fuerza, 2) * 0.5; //Fuerza leve
        let compx = Math.cos(vectorDistanciaCentro.direccion) * fuerzaCentro;
        let compy = Math.sin(vectorDistanciaCentro.direccion) * fuerzaCentro;
        coordsFuerzaTotal.x += compx;
        coordsFuerzaTotal.y += compy;
    }
    var fuerzaPolar = cartesian2Polar(coordsFuerzaTotal.x, coordsFuerzaTotal.y);
    nodo.fuerzaCentroMasa = fuerzaPolar;
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Fuerza centro masa queda: ${JSON.stringify(nodo.fuerzaCentroMasa)}`);
    }
}
;
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
                nodo.fuerzaColision.fuerza = Math.round(nodo.fuerzaColision.fuerza);
                nodo.fuerzaCentroMasa.fuerza = Math.round(nodo.fuerzaCentroMasa.fuerza);
                nodo.posicionadoByFuerzas = true;
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
        var idsRequeridos = n.vinculos.filter(v => v.tipo = "requiere").map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);
    nodo.idsRequeridos = idsRequeridos;
    nodo.idsNodosConectados = idsRequeridos.concat(idsRequirientes);
}
function cartesian2Polar(x, y) {
    const distance = Math.sqrt(x * x + y * y);
    const radians = Math.atan2(y, x); //This takes y first
    const polarCoor = { fuerza: distance, direccion: radians };
    return polarCoor;
}
