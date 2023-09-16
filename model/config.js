export const charProhibidosNombreCosa = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
export const charProhibidosTexto = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
export const validatorNombreCosa = {
    validator: function (n) {
        return !charProhibidosNombreCosa.test(n);
    },
    message: props => `${props.value} contiene caracteres ilegales!`
};
export const validatorTexto = {
    validator: function (n) {
        return !charProhibidosTexto.test(n);
    },
    message: props => `${props.value} contiene caracteres ilegales!`
};
