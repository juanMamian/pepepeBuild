"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorApi = void 0;
const errorApi = function (error, tipo, msjDev, msjUsuario) {
    console.log(msjDev + ". Error: " + error);
    const respuesta = {
        tipo,
        msjUsuario,
        msjDev,
    };
    return respuesta;
};
exports.errorApi = errorApi;
