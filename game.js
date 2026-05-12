/* ========================================
   MISIÓN GOL DE LETRAS - LÓGICA DEL JUEGO
   Juego de reconocimiento fonológico para dislexia
   
   INSTRUCCIONES PARA PAPÁ:
   - Cambia las SÍLABAS en la sección "CONFIGURACIÓN"
   - Puedes agregar más sílabas en el array
   - El juego las usa automáticamente
   ======================================== */

/* ========================================
   CONFIGURACIÓN (Cambia aquí las sílabas y palabras)
   ======================================== */

// Lista de sílabas a practicar (puedes agregar más)
const SILABAS = [
    'ma', 'me', 'mi', 'mo', 'mu',
    'pa', 'pe', 'pi', 'po', 'pu',
    'la', 'le', 'li', 'lo', 'lu'
];

// Palabras de ejemplo para cada sílaba (opcional, para futuras expansiones)
const PALABRAS_EJEMPLO = {
    'ma': 'manzana',
    'me': 'mesa',
    'mi': 'micrófono',
    'mo': 'mono',
    'mu': 'muñeca',
    'pa': 'papá',
    'pe': 'pelota',
    'pi': 'pina',
    'po': 'pollo',
    'pu': 'puerta',
    'la': 'lápiz',
    'le': 'lectura',
    'li': 'limón',
    'lo': 'loro',
    'lu': 'luna'
};

// Configuración del sistema de estrellas
const ESTRELLAS_POR_ACIERTO = 1;
const MAX_ESTRELLAS = 50; // Límite de estrellas guardadas

/* ========================================
   VARIABLES GLOBALES DEL JUEGO
   ======================================== */

let estadoJuego = {
    pantallaPrincipal: true,
    silabaActual: '',
    opciones: [],
    indiceCorrecto: 0,
    estrellas: 0,
    respuestaSeleccionada: false
};

/* ========================================
   ELEMENTOS DEL DOM
   ======================================== */

const pantallas = {
    inicio: document.getElementById('pantallaInicio'),
    juego: document.getElementById('pantallaJuego')
};

const botones = {
    jugar: document.getElementById('btnJugar'),
    volver: document.getElementById('btnVolver'),
    repetir: document.getElementById('btnRepetir')
};

const elementos = {
    contadorEstrellas: document.getElementById('contadorEstrellas'),
    estrellasGuardadas: document.getElementById('estrellasGuardadas'),
    instrucciones: document.getElementById('instrucciones'),
    feedback: document.getElementById('feedback'),
    opciones: [
        { elemento: document.getElementById('opcion1'), texto: document.getElementById('texto1') },
        { elemento: document.getElementById('opcion2'), texto: document.getElementById('texto2') },
        { elemento: document.getElementById('opcion3'), texto: document.getElementById('texto3') }
    ]
};

/* ========================================
   INICIALIZACIÓN
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
    inicializarJuego();
    cargarProgreso();
    configurarEventos();
});

function inicializarJuego() {
    // Cargar estrellas guardadas
    const estrellasGuardadas = localStorage.getItem('golDeLetrasEstrellas');
    if (estrellasGuardadas) {
        estadoJuego.estrellas = parseInt(estrellasGuardadas);
        elementos.estrellasGuardadas.textContent = estadoJuego.estrellas;
        elementos.contadorEstrellas.textContent = estadoJuego.estrellas;
    }
}

function configurarEventos() {
    // Botones principales
    botones.jugar.addEventListener('click', iniciarJuego);
    botones.volver.addEventListener('click', volverAlInicio);
    botones.repetir.addEventListener('click', repetirSilaba);

    // Tarjetas de opciones
    elementos.opciones.forEach((opcion, index) => {
        opcion.elemento.addEventListener('click', () => seleccionarOpcion(index));
    });
}

/* ========================================
   TRANSICIÓN DE PANTALLAS
   ======================================== */

function iniciarJuego() {
    // Cambiar a pantalla de juego
    pantallas.inicio.classList.remove('activa');
    pantallas.juego.classList.add('activa');
    estadoJuego.pantallaPrincipal = false;

    // Cargar primera sílaba
    generarNuevoJuego();
    repetirSilaba();
}

function volverAlInicio() {
    // Guardar progreso
    localStorage.setItem('golDeLetrasEstrellas', estadoJuego.estrellas);

    // Cambiar a pantalla de inicio
    pantallas.juego.classList.remove('activa');
    pantallas.inicio.classList.add('activa');
    estadoJuego.pantallaPrincipal = true;
    elementos.estrellasGuardadas.textContent = estadoJuego.estrellas;

    // Limpiar feedback
    elementos.feedback.textContent = '';
    limpiarTarjetas();
}

/* ========================================
   LÓGICA DEL MINIJUEGO
   ======================================== */

function generarNuevoJuego() {
    // Limpiar estado anterior
    limpiarTarjetas();
    elementos.feedback.textContent = '';
    estadoJuego.respuestaSeleccionada = false;

    // Seleccionar una sílaba aleatoria
    estadoJuego.silabaActual = SILABAS[Math.floor(Math.random() * SILABAS.length)];

    // Crear opciones: correcta + 2 incorrectas
    const silabasIncorrectas = SILABAS.filter(s => s !== estadoJuego.silabaActual);
    const opcionesDesorden = [estadoJuego.silabaActual];

    // Seleccionar 2 opciones incorrectas aleatorias
    for (let i = 0; i < 2; i++) {
        const indiceAleatorio = Math.floor(Math.random() * silabasIncorrectas.length);
        opcionesDesorden.push(silabasIncorrectas[indiceAleatorio]);
    }

    // Mezclar las opciones
    estadoJuego.opciones = opcionesDesorden.sort(() => Math.random() - 0.5);
    estadoJuego.indiceCorrecto = estadoJuego.opciones.indexOf(estadoJuego.silabaActual);

    // Mostrar opciones en las tarjetas
    elementos.opciones.forEach((opcion, index) => {
        opcion.texto.textContent = estadoJuego.opciones[index].toUpperCase();
        opcion.elemento.classList.remove('deshabilitada');
    });

    // Actualizar instrucción
    elementos.instrucciones.textContent = '¿Cuál es?';
}

function repetirSilaba() {
    // Reproducir la sílaba usando SpeechSynthesis
    // (API web nativa, sin dependencias externas)
    reproducirAudio(estadoJuego.silabaActual);
}

function reproducirAudio(texto) {
    // Detener audio anterior si está reproduciéndose
    window.speechSynthesis.cancel();

    // Crear instancia de SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(texto);

    // Configurar parámetros para una mejor experiencia infantil
    utterance.lang = 'es-ES'; // Español
    utterance.rate = 0.8; // Más lento para facilitar comprensión
    utterance.pitch = 1.2; // Tono ligeramente más alto (infantil)
    utterance.volume = 1; // Volumen máximo

    // Reproducir
    window.speechSynthesis.speak(utterance);
}

function seleccionarOpcion(indice) {
    // Evitar múltiples respuestas
    if (estadoJuego.respuestaSeleccionada) {
        return;
    }

    estadoJuego.respuestaSeleccionada = true;

    // Deshabilitar todas las tarjetas
    elementos.opciones.forEach(opcion => {
        opcion.elemento.classList.add('deshabilitada');
    });

    // Verificar si es correcto
    if (indice === estadoJuego.indiceCorrecto) {
        // ¡CORRECTO! 🎉
        elementos.opciones[indice].elemento.classList.add('correcta');
        elementos.feedback.textContent = '⚽ ¡GOL! ⚽';

        // Agregar estrella
        estadoJuego.estrellas += ESTRELLAS_POR_ACIERTO;
        elementos.contadorEstrellas.textContent = estadoJuego.estrellas;

        // Reproducir audio de éxito (opcional)
        reproducirAudio('¡Correcto!');

        // Pasar al siguiente después de un tiempo
        setTimeout(() => {
            generarNuevoJuego();
        }, 2000);
    } else {
        // Respuesta incorrecta - SIN MENSAJE NEGATIVO (solo desactivar)
        elementos.opciones[indice].elemento.classList.add('incorrecta');

        // Mostrar la opción correcta sin mensajes negativos
        setTimeout(() => {
            elementos.opciones[estadoJuego.indiceCorrecto].elemento.classList.add('correcta');
            elementos.feedback.textContent = '✓';

            // Agregar estrella de todos modos (refuerzo positivo)
            estadoJuego.estrellas += Math.floor(ESTRELLAS_POR_ACIERTO * 0.5); // Media estrella
            elementos.contadorEstrellas.textContent = estadoJuego.estrellas;

            // Pasar al siguiente después de un tiempo
            setTimeout(() => {
                generarNuevoJuego();
            }, 2500);
        }, 600);
    }
}

function limpiarTarjetas() {
    elementos.opciones.forEach(opcion => {
        opcion.elemento.classList.remove('correcta', 'incorrecta', 'deshabilitada');
    });
}

/* ========================================
   GUARDADO Y PROGRESO
   ======================================== */

function cargarProgreso() {
    // Esta función se puede expandir para cargar más datos
    const estrellas = localStorage.getItem('golDeLetrasEstrellas');
    if (estrellas) {
        estadoJuego.estrellas = parseInt(estrellas);
    }
}

// Guardar progreso cada vez que se vuelve al inicio
window.addEventListener('beforeunload', () => {
    localStorage.setItem('golDeLetrasEstrellas', estadoJuego.estrellas);
});

/* ========================================
   NOTAS PARA PAPÁ:
   
   1. CAMBIAR SÍLABAS:
      - Modifica el array SILABAS al inicio del archivo
      - Ejemplo: const SILABAS = ['sa', 'se', 'si', 'so', 'su'];
   
   2. AGREGAR PALABRAS:
      - Actualiza PALABRAS_EJEMPLO
      - Se usará en futuras versiones para mostrar ejemplos
   
   3. AJUSTAR DIFICULTAD:
      - Aumenta el número de opciones incorrectas en generarNuevoJuego()
      - Cambia ESTRELLAS_POR_ACIERTO para más/menos recompensa
   
   4. VELOCIDAD DE AUDIO:
      - utterance.rate: cambia de 0.5 (lento) a 2.0 (rápido)
   
   5. REINICIAR PROGRESO:
      - localStorage.clear() en la consola del navegador
   
   6. AGREGAR CRONÓMETRO O LÍMITES:
      - Busca la función generarNuevoJuego() y agrega setTimeout()
   
   ======================================== */
