const mixinMensajesUsuario = {
    data() {
        return {
            mensajesUsuario: [],
            mostrandoMensajeUsuarioActual: false,
            timeOutOcultarMensajeUsuario:null,
        }
    },
    methods: {

    },
    computed: {
        mensajeUsuarioActual() {
            if (!this.mensajesUsuario || this.mensajesUsuario.length < 1) {
                return null;
            }

            console.log("Setting mensaje usuario actual: " + JSON.stringify(this.mensajesUsuario[this.mensajesUsuario.length - 1]));
            return this.mensajesUsuario[this.mensajesUsuario.length - 1];

        },
    },
    watch: {
        mensajeUsuarioActual(obj) {
            if (obj) {
                this.mostrandoMensajeUsuarioActual = true;
                clearTimeout(this.timeOutOcultarMensajeUsuario);
                this.timeOutOcultarMensajeUsuario = setTimeout(() => {
                    this.mostrandoMensajeUsuarioActual = false;
                }, 2000);
            }
        },
    }

}
