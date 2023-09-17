const controlesAnimacion = {
    props: {
        estadoInicialAnimacion: {
           type: String, // playing, paused, stopped.
            default: "stopped"
        }
    },
    data() {
        return {
            estadoAnimacion: this.estadoInicialAnimacion,
            tiempoAnimacion: 0,
        }
    },
    methods: {
        setEstadoAnimacion(nuevoEstado) {
            if (nuevoEstado != "playing" && nuevoEstado != "paused" && nuevoEstado != "stopped") {
                console.log("estado de animación desconocido");
            }
            if (nuevoEstado === "stopped") {
                this.tiempoAnimacion = 0;
            }
            this.estadoAnimacion = nuevoEstado;
        },
        darPlay() {
            this.setEstadoAnimacion("playing");
        },
        darPause() {
            this.setEstadoAnimacion("paused");
        },
        darStop() {
            this.setEstadoAnimacion("stopped");
        },

    },
    computed: {
        playing() {
            return this.estadoAnimacion === 'playing';
        },
        paused() {
            return this.estadoAnimacion === 'paused';
        },
        stopped() {
            return this.estadoAnimacion === 'stopped';
        }
    },
    watch: {
        estadoAnimacion() {
            console.log("Emitiendo nuevo estado de animación: " + this.estadoAnimacion);
            this.$emit("estado-animacion", this.estadoAnimacion);
        }

    },
    template: '<div class="controlesAnimacion"> <button class="boton botonControl" @click="darPlay" :class="{deshabilitado: playing}"> <img src="https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/recursos/iconos/play.svg" /> </button> <button class="boton botonControl" @click="darPause" :class="{deshabilitado: paused || stopped}"> <img src="https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/recursos/iconos/pause.svg" /> </button> <button class="boton botonControl" @click="darStop" :class="{deshabilitado:stopped}"> <img src="https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/recursos/iconos/stop.svg" /> </button> </div>',

}


