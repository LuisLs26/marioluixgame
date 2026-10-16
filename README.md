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


### Ajustes adicionales de fluidez

Se evitan reconstrucciones de sprites cuando sus clases no cambian, se reutilizan los patrones de clases, el mando se consulta como máximo aproximadamente 60 veces por segundo y se conserva la referencia del marcador educativo. El lienzo principal usa un contexto opaco. A unos 60 Hz se presenta cada fotograma para evitar perder un dibujo por pequeñas variaciones del reloj.

Al acertar una pregunta se reproduce el sonido original de moneda, respetando la opción de silencio. Una prueba verifica que la respuesta correcta lo activa.

En una prueba local de cinco segundos con movimiento y CPU del navegador ralentizada 4×, se observaron 60 FPS de media y 3,8 ms en el percentil 95 del trabajo por llamada del bucle. Hubo 13 intervalos de dibujo superiores a 25 ms entre 302 fotogramas: esta medición no demuestra ausencia total de tirones ni garantiza 60 FPS estables en todos los equipos.

### Revisión de robustez

Los temporizadores pertenecen a cada partida y se cancelan al cambiar de mapa o reiniciar; los temporizadores externos permanecen intactos. Las animaciones de bloques, hongos y tuberías respetan la pausa. Las preferencias y la puntuación usan memoria como respaldo cuando el almacenamiento está bloqueado o lleno; se evita volver a leer del almacenamiento en cada evento de puntuación.

Se preserva la posición de la cámara al cambiar el tamaño de ventana y se agrupan los eventos de redimensionado. Se cierran los cuestionarios antiguos al cambiar de mapa, se recupera el movimiento del mando al reaparecer y se tolera que el navegador deniegue acceso al mando. La selección por Tab coincide con la respuesta que confirma Enter.

Las listas de objetos ya no eliminan elementos ajenos al recibir un índice ausente ni duplican objetos al cambiar de contenedor. Se evitan listeners de audio repetidos y errores al terminar una música; la opción de silencio se conserva correctamente. La conversión del tiempo en puntos también entrega las vidas correspondientes al cruzar 10 000 puntos y conserva el récord.

Pruebas adicionales: `node tests/resilience.cjs`. Incluyen permisos de almacenamiento y mando denegados, temporizadores aislados, pausa, cámara, reaparición, cambio de mapa durante cuestionario, eliminación repetida, audio y navegación por teclado. Estas pruebas complementan la carga de los 32 niveles y el recorrido real de la bandera al nivel 1-2; no equivalen a completar todas las rutas y secretos manualmente.

### Movimiento de cámara suave

La cámara conserva las posiciones anteriores del escenario para interpolarlas junto con Mario entre pasos de física. Los sprites simples se dibujan directamente en su posición interpolada, sin dos transformaciones adicionales del contexto por objeto. El descarte fuera de pantalla usa la posición visible interpolada para evitar que un objeto desaparezca antes de salir del encuadre. Las pausas y los desplazamientos grandes conservan su posición exacta.

Regresión específica: `node tests/motion.cjs` comprueba posiciones intermedias del escenario, bordes visibles, teletransportes, pausa y ausencia de cambios en la posición física.
