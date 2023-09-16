export const errorApi = function (error, tipo, msjDev, msjUsuario) {
    console.log(msjDev + ". Error: " + error);
    const respuesta = {
        tipo,
        msjUsuario,
        msjDev,
    };
    return respuesta;
};
