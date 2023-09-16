import { ModeloConfiguracionAtlas as ConfiguracionAtlas } from "./model/ConfiguracionAtlas";
import { ModeloNodo as NodoConocimiento } from "./model/atlas/Nodo";
const anchoCeldas = 400;
const nodoDeInteres = null;
//const nodoDeInteres = "Realizar una limpieza de los computadores de Maloka";
const soloCalcular = false;
export async function posicionAutomaticaConocimiento() {
    try {
        var todosNodos = await NodoConocimiento.find({}).exec();
        console.log(`Total: ${todosNodos.length} nodos`);
    }
    catch (error) {
        console.log(`error getting todos nodos. e: ` + error);
        return;
    }
    filtrarVinculosHuerfanos(todosNodos);
    //Iniciar coordenadas
    todosNodos.forEach(nodo => {
        if (!nodo.autoCoords.x)
            nodo.autoCoords.x = nodo.coords.x;
        if (!nodo.autoCoords.y)
            nodo.autoCoords.y = nodo.coords.y;
    });
    var celdas = setCeldas(todosNodos);
    // console.log(`Hay ${nodosCompletados.length} nodos completados`);
    while (true) {
        var configuracion = {
            posicionando: false,
        };
        try {
            configuracion = await ConfiguracionAtlas.findOne({ nombre: "conocimiento" }).exec();
        }
        catch (error) {
            console.log(`Error descargando configuración del atlas: ${error}`);
        }
        if (configuracion.posicionando) {
            await posicionar(todosNodos, celdas);
            console.log(`Posicionando nodos conocimiento...`);
            await uploadNodos(todosNodos);
        }
        await sleep(10000);
    }
}
function posicionar(todosNodos, celdas) {
    todosNodos.forEach(nodo => {
        setFuerzaCentroMasa(nodo, todosNodos);
        setFuerzaColision(nodo, celdas, todosNodos);
        moverNodo(nodo, celdas);
    });
}
function moverNodo(nodo, celdas) {
    const viejaCelda = {
        x: getCeldaH(nodo.autoCoords),
        y: getCeldaV(nodo.autoCoords),
    };
    const factorFuerzaCentroMasa = 0.5;
    const factorFuerzaColision = 0.2;
    if (!soloCalcular) {
        nodo.autoCoords.x = Math.round(nodo.autoCoords.x + (factorFuerzaCentroMasa * nodo.fuerzaCentroMasa.fuerza * Math.cos(nodo.fuerzaCentroMasa.direccion)) + (factorFuerzaColision * nodo.fuerzaColision.fuerza * Math.cos(nodo.fuerzaColision.direccion)));
        nodo.autoCoords.y = Math.round(nodo.autoCoords.y + (factorFuerzaCentroMasa * nodo.fuerzaCentroMasa.fuerza * Math.sin(nodo.fuerzaCentroMasa.direccion)) + (factorFuerzaColision * nodo.fuerzaColision.fuerza * Math.sin(nodo.fuerzaColision.direccion)));
        //Debil gravitacion hacia el centro del atlas
        if (nodo.autoCoords.x > 0) {
            nodo.autoCoords.x -= 1;
        }
        else {
            nodo.autoCoords.x += 1;
        }
        if (nodo.autoCoords.y > 0) {
            nodo.autoCoords.y -= 1;
        }
        else {
            nodo.autoCoords.y += 1;
        }
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
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Nodos en colisión: `);
    }
    const distanciaUmbral = 400; //Distancia en la cual la fuerza de colision se reduce a 0.
    const colisionMaxima = 50; //Colision generada al estar encima de otro nodo.
    const umbralColisionLineal = 120;
    const factorColision = umbralColisionLineal * umbralColisionLineal;
    // const pendiente=-colisionMaxima/distanciaUmbral
    var compX = 0;
    var compY = 0;
    if (nodosRelevantes.length > 0) {
        nodosRelevantes.forEach(nodoRelevante => {
            let fuerzaP = cartesian2Polar(nodo.autoCoords.x - nodoRelevante.autoCoords.x, nodo.autoCoords.y - nodoRelevante.autoCoords.y);
            let distancia = fuerzaP.fuerza;
            if (fuerzaP.fuerza > distanciaUmbral) {
                fuerzaP.fuerza = distanciaUmbral;
            }
            //fuerzaP.fuerza= colisionMaxima + (pendiente * fuerzaP.fuerza);
            if (fuerzaP.fuerza > 0) {
                fuerzaP.fuerza = factorColision / fuerzaP.fuerza;
            }
            if (nodoDeInteres === nodo.nombre) {
                console.log(`-${nodoRelevante.nombre}: `);
                console.log(`   ${JSON.stringify(nodo.autoCoords)}`);
                console.log(`   ${JSON.stringify(nodoRelevante.autoCoords)}, (${nodoRelevante.coords})`);
                console.log(`   (${distancia} => ${fuerzaP.fuerza})`);
            }
            let componenteX = Number(fuerzaP.fuerza * Math.cos(fuerzaP.direccion));
            let componenteY = Number(fuerzaP.fuerza * Math.sin(fuerzaP.direccion));
            compX += componenteX;
            compY += componenteY;
        });
    }
    const fuerzaTotal = cartesian2Polar(compX, compY);
    fuerzaTotal.fuerza = Math.round(fuerzaTotal.fuerza);
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Fuerza colision: ${fuerzaTotal.fuerza}`);
    }
    nodo.fuerzaColision = fuerzaTotal;
}
function setFuerzaCentroMasa(nodo, todosNodos) {
    var idsRequeridos = nodo.vinculos.map(v => v.idRef);
    var idsRequirientes = todosNodos.filter(n => {
        var idsRequeridos = n.vinculos.filter(v => v.tipo = "continuacion").map(v => v.idRef);
        return idsRequeridos.includes(nodo.id);
    }).map(n => n.id);
    var idsVinculos = idsRequeridos.concat(idsRequirientes);
    // var nodosVinculados = todosNodos.filter(n => idsVinculos.includes(n.id));
    // var compX=0;
    // var compY=0;
    // if (nodosVinculados.length > 0) {    
    //     nodosVinculados.forEach(nodoVinculado=>{            
    //         let fuerzaP=cartesian2Polar(nodoVinculado.autoCoords.x-nodo.autoCoords.x, nodoVinculado.autoCoords.y-nodo.autoCoords.y);                       
    //         if(nodoDeInteres===nodo.nombre){
    //             console.log(`${nodoVinculado.nombre} genera una fuerza de ${JSON.stringify(fuerzaP)}`);
    //         }
    //         if(nodoVinculado.vinculos.length>1){
    //             fuerzaP.fuerza= fuerzaP.fuerza/nodoVinculado.vinculos.length;
    //         }            
    //         fuerzaP.fuerza=fuerzaP.fuerza/(nodosVinculados.length+1);
    //         let componenteX=Number(fuerzaP.fuerza*Math.cos(fuerzaP.direccion));
    //         let componenteY=Number(fuerzaP.fuerza*Math.sin(fuerzaP.direccion));
    //         compX+=componenteX;
    //         compY+=componenteY;
    //     })        
    // }
    // var fuerzaCM=cartesian2Polar(compX, compY);
    // fuerzaCM.fuerza=Math.round(fuerzaCM.fuerza);
    if (idsVinculos.length > 0) {
        var nodosVinculados = todosNodos.filter(n => idsVinculos.includes(n.id));
        if (nodoDeInteres === nodo.nombre) {
            console.log(`Nodos vinculados:`);
            nodosVinculados.forEach(n => {
                console.log(`-${n.nombre}->${JSON.stringify(n.autoCoords)}`);
            });
        }
        var sumaX = nodosVinculados.reduce((sum, n) => sum + n.autoCoords.x, 0);
        var centroX = sumaX / nodosVinculados.length;
        var sumaY = nodosVinculados.reduce((sum, n) => sum + n.autoCoords.y, 0);
        if (nodoDeInteres === nodo.nombre) {
            console.log(`(Centro masa) sumaY: ${sumaY}`);
        }
        var centroY = sumaY / nodosVinculados.length;
        nodo.centroMasa.x = Math.round(centroX);
        nodo.centroMasa.y = Math.round(centroY);
    }
    else {
        nodo.centroMasa.x = nodo.autoCoords.x;
        nodo.centroMasa.y = nodo.autoCoords.y;
    }
    if (nodoDeInteres === nodo.nombre) {
        console.log(`Centro masa con ${idsVinculos.length} nodos vinculados: ${JSON.stringify(nodo.centroMasa)}`);
    }
    nodo.peso = idsVinculos.length;
    var coordsFuerza = {
        x: nodo.centroMasa.x - nodo.autoCoords.x,
        y: nodo.centroMasa.y - nodo.autoCoords.y
    };
    var fuerzaPolar = cartesian2Polar(coordsFuerza.x, coordsFuerza.y);
    fuerzaPolar.fuerza = Math.round(fuerzaPolar.fuerza * ((idsVinculos.length / 3) / (idsVinculos.length + 1)));
    nodo.fuerzaCentroMasa = fuerzaPolar;
    // nodo.fuerzaCentroMasa = fuerzaCM;
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
    const celda = Math.floor(coords.y / anchoCeldas);
    return celda;
}
async function uploadNodos(todosNodos) {
    todosNodos.forEach(async function (nodo) {
        if (!nodoDeInteres || nodoDeInteres === nodo.nombre) {
            try {
                await nodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo. e: ` + error);
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function cartesian2Polar(x, y) {
    const distance = Math.sqrt(x * x + y * y);
    const radians = Math.atan2(y, x); //This takes y first
    const polarCoor = { fuerza: distance, direccion: radians };
    return polarCoor;
}
