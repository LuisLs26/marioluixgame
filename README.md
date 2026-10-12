# Mario · Aula Aventura

Juego HTML5/Canvas basado en el motor clásico Full Screen Mario. Incluye los 32 niveles y preguntas educativas en español.

## Jugar

Abre `index.html` en Chrome o Edge. También puedes servir esta carpeta con `python -m http.server 8080` y entrar a http://localhost:8080. Para alojarlo, publica los archivos estáticos conservando sus carpetas.

## Aprender jugando

- Solo recoger monedas (incluidas las de bloques) y consumir hongos activa una pregunta. Derrotar enemigos ya no interrumpe el juego.
- El juego y su reloj se detienen mientras respondes. Los eventos simultáneos se atienden en orden.
- Hay 24 preguntas originales basadas en **Propuesta de.pdf**, sobre evaluación educativa, competencias, criterios, evidencias y contextualización. Cada pregunta indica página y sección.
- Las preguntas y respuestas se mezclan; el banco completo se recorre antes de repetir.
- Cada acierto suma 250 puntos. Una respuesta incorrecta muestra la solución y una explicación sin quitar vidas.
- El marcador educativo muestra aciertos, respuestas y racha de la sesión.
- El PDF original no se publica en este repositorio.

## Controles

| Acción | Teclado | Mando estándar / PlayStation |
| --- | --- | --- |
| Mover | A/D o izquierda/derecha | Stick izquierdo o cruceta |
| Saltar | W, arriba, espacio | A / ✕ |
| Agacharse o tubería | S o abajo | Stick abajo / cruceta abajo |
| Correr / disparar | Shift, Z o X | X / □ |
| Pausa | P, Escape o Enter | Start / Options |
| Sonido | M | Select / Share |
| Elegir respuesta | 1–4, arriba/abajo y Enter | Stick/cruceta arriba/abajo, A / ✕ |

En **Controles / mando** puedes elegir el perfil genérico USB o cambiar los números de los botones de salto, correr y pausa. Se conservan localmente. La detección depende del navegador, del controlador de Windows y del modo del dispositivo. Pulsa un botón después de conectarlo. No se ha validado un mando físico durante estas pruebas; sí se verificaron entradas simuladas estándar y la desconexión.

## Rendimiento y correcciones

Objetivo: 60 FPS, sin garantizarlo en todos los equipos. Modo de rendimiento predeterminado: buffer de 240 píxeles de altura, ancho máximo de 480; procesa un 75 % menos de píxeles que el modo de más resolución (480 píxeles de altura). Se cambia en Controles / mando sin reiniciar la partida. Sprites y patrones en caché y descarte de dibujos fuera de pantalla. Física a 60 pasos por segundo mediante acumulador, con recuperación limitada después de una interrupción para evitar bloqueos. El reloj y movimiento no se aceleran en pantallas de 120/144 Hz. El dibujado tiene su propio calendario de 60 FPS e interpolación entre posiciones físicas para evitar saltos; un identificador del bucle impide que sobrevivan ciclos de animación antiguos al pausar.

Se corrigieron la pausa al soltar teclas, direcciones simultáneas, controles retenidos al perder foco o desconectar el mando, entidades saltadas al borrar durante la iteración, puntuación máxima inválida y entrega de vidas al superar múltiplos de 10 000 puntos. El constructor de mapas ya no sobrescribe `Map` nativo del navegador.

## Validación

Con Node y Playwright instalado: `node tests/browser.cjs` y `node tests/end-level.cjs`. Puedes especificar `PLAYWRIGHT_MODULE` y `CHROME_PATH` si están en otra ubicación.

Pruebas automatizadas: recogida de monedas y hongos, derrota de enemigos sin preguntas, acierto/error y continuación, congelación del reloj durante preguntas, pausa, direcciones opuestas, carga de los 32 niveles, 60 pasos por segundo a 30/60/120/144 Hz, mando estándar simulado, navegación en las cuatro direcciones, repetición al mantener la cruceta, confirmación, bloqueo del salto retenido y desconexión. Se revisó el cuadro a 1280×720 y 390×844. También se prueba el recorrido completo bandera → castillo → nivel 1-2 con audio bloqueado, y 60 dibujos con tiempos de fotogramas alternados. La medición local no equivale a una certificación de hardware de gama baja ni a completar los 32 niveles.

## Recursos originales

Los personajes, música y gráficos originales pertenecen a sus respectivos titulares. El proyecto conserva el motor y los recursos que venían en la carpeta proporcionada; esta edición no concede derechos sobre ellos.

El cuestionario utiliza bloques de interrogación, moneda, borde de ladrillos, colores y tipografía de píxeles inspirados en Mario. La selección del mando se indica con una flecha visible. La transición de nivel ya no depende del evento de audio `ended`; se recuperó la función de avance 1-1 → 1-2, 1-4 → 2-1 hasta completar los ocho mundos.

