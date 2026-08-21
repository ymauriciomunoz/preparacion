# Informe QA — Nueva implementación de examen y cursos

**Fecha de revisión:** 21 de agosto de 2026  
**Estado recomendado:** Aprobación condicionada  
**Dirigido a:** Agente desarrollador  
**Alcance:** Examen de admisión tipo UdeA, resultados, recomendación, checkout demostrativo y nuevos cursos de Razonamiento lógico y Comprensión lectora.

> Este documento es un diagnóstico funcional, técnico, de contenido y experiencia de usuario. Durante la revisión no se modificó la implementación.

## 1. Resumen ejecutivo

La nueva implementación es funcional como demostración y permite completar el flujo principal:

`Inicio → examen → resultados → recomendación → checkout → curso → módulos → retos → cambio de área`

La compilación, el análisis estático y la validación de tipos finalizan correctamente. Además, las preguntas nuevas revisadas tienen, en general, claves y explicaciones coherentes.

Sin embargo, no se recomienda aprobar la versión para producción todavía. Los principales bloqueos son:

1. El usuario no puede volver directamente al curso después de recargar o cerrar la aplicación.
2. La ruta que abre el curso puede contradecir la recomendación mostrada en los resultados.
3. Existe una escritura inválida y potencialmente riesgosa del progreso en `localStorage`.
4. Las respuestas correctas presentan patrones demasiado predecibles por letra y longitud.
5. La recomendación académica es engañosa cuando hay empate o muy pocas respuestas.
6. La navegación del examen en móvil es difícil de interpretar y usa objetivos táctiles pequeños.

## 2. Resultado general

| Área | Resultado | Observación |
|---|---|---|
| Flujo principal del examen | Aprobado con observaciones | Se puede iniciar, responder, finalizar y consultar resultados. |
| Resultados y recomendación | Requiere ajustes | La lógica no trata empates ni evidencia insuficiente. |
| Checkout demostrativo | Requiere ajustes | Mezcla mensajes de pago con acceso gratuito de demostración. |
| Acceso y continuidad del curso | No aprobado | La recarga devuelve al inicio y no existe acceso directo para continuar. |
| Módulos y retos | Aprobado con observaciones | Funcionan, pero la finalización no depende del desempeño. |
| Persistencia | No aprobado | Existe una escritura temporal con un formato incompatible. |
| Calidad matemática | Aprobado | Las preguntas nuevas revisadas tienen resultados y claves correctas. |
| Calidad de español | Aprobado con corrección puntual | Se encontró una inferencia formulada con mayor alcance que la evidencia. |
| Experiencia móvil | Requiere ajustes | El curso responde bien; el navegador del examen necesita rediseño. |
| Accesibilidad | Requiere ajustes | El diálogo mejoró, pero falta controlar completamente el foco. |
| Pruebas automatizadas | Insuficiente | Solo cubren lint, tipos y compilación; no cubren comportamiento. |

## 3. Evidencia técnica ejecutada

- El comando `npm test` finalizó correctamente.
- La validación ejecutada actualmente comprende:
  - ESLint.
  - TypeScript con `tsc --noEmit`.
  - Compilación de producción.
- No se observaron errores ni advertencias en la consola durante el recorrido manual.
- El banco contiene 160 preguntas con identificadores únicos:
  - 80 de Razonamiento lógico.
  - 80 de Comprensión lectora.
- Cada examen generado contiene:
  - 80 preguntas únicas.
  - 40 de Razonamiento lógico.
  - 40 de Comprensión lectora.
  - 10 bloques o estímulos de lectura.
- Se recorrieron los 17 módulos del curso:
  - 8 módulos de Razonamiento lógico.
  - 9 módulos de Comprensión lectora.
  - 34 retos en total.

## 4. Hallazgos prioritarios

### QA-001 — No es posible continuar el curso directamente después de recargar

**Severidad:** Crítica  
**Componente:** Navegación y persistencia de sesión  
**Referencia:** `components/ExamApp.tsx` — estado inicial de `screen` y renderizado de la pantalla `course`.

**Pasos para reproducir**

1. Iniciar y finalizar un examen.
2. Abrir la recomendación y entrar al curso.
3. Completar o avanzar en algún módulo.
4. Recargar la página mientras se está dentro del curso.

**Resultado actual**

La aplicación vuelve a la pantalla inicial. El progreso sigue almacenado, pero la portada no ofrece una acción “Continuar curso”. Para volver, el usuario tendría que realizar nuevamente el flujo del examen.

**Resultado esperado**

Una persona con progreso guardado debe poder regresar al curso desde una ruta estable o desde una acción visible en la pantalla inicial, sin presentar otro examen.

**Recomendación de implementación**

- Solución preferida: crear una ruta real y recuperable, por ejemplo `/curso` o `/curso/[area]/[modulo]`.
- Como mínimo, detectar progreso válido en la portada y mostrar “Continuar curso”.
- Mantener separado el acceso al curso de la finalización del examen.
- Restaurar el área, el módulo y el progreso al recargar.

**Criterios de aceptación**

- Recargar dentro del curso conserva o recupera la misma experiencia.
- Cerrar y abrir la aplicación muestra una acción para continuar.
- El usuario no necesita presentar un examen nuevo para regresar al curso.
- Una URL de curso válida puede abrirse directamente.

---

### QA-002 — La recomendación mostrada puede no coincidir con la ruta que se abre

**Severidad:** Alta  
**Componente:** Resultados, checkout y curso  
**Referencia:** `components/CourseExperience.tsx` — inicialización de `initialTrack` y restauración del progreso local.

**Pasos para reproducir**

1. Tener progreso previo en Comprensión lectora.
2. Presentar un examen cuyo resultado recomiende Razonamiento lógico.
3. Verificar que el checkout muestre “Ruta sugerida: Matemáticas”.
4. Seleccionar “Explorar el curso”.

**Resultado actual**

El curso puede abrir Comprensión lectora porque el progreso anterior sobrescribe la ruta recomendada.

**Resultado esperado**

La acción asociada a la recomendación debe abrir el área recomendada. La restauración del progreso anterior debe ser una decisión explícita del usuario.

**Recomendación de implementación**

Presentar dos acciones cuando exista progreso previo:

- “Empezar la ruta recomendada”.
- “Continuar donde iba”.

No sobrescribir silenciosamente `initialTrack` cuando el acceso provenga de una recomendación nueva.

**Criterios de aceptación**

- “Empezar la ruta recomendada” abre el área recomendada y su módulo inicial.
- “Continuar donde iba” restaura el área y módulo anteriores.
- El título, el área activa y el contenido siempre coinciden.

---

### QA-003 — Se guarda temporalmente un formato inválido de progreso

**Severidad:** Alta  
**Componente:** Persistencia local  
**Referencia:** `components/CourseExperience.tsx` — función `toggleComplete`.

**Descripción técnica**

Al marcar una lección como completada, `toggleComplete` escribe directamente en `localStorage` un arreglo serializado. El lector y validador del progreso esperan un objeto versionado con más propiedades. Posteriormente, un efecto vuelve a escribir el objeto completo, pero existe una ventana en la que cerrar o recargar podría dejar un valor inválido y provocar pérdida o limpieza del progreso.

**Resultado esperado**

Todas las escrituras deben usar un único esquema estable, validable y versionado.

**Recomendación de implementación**

- Eliminar la escritura directa del arreglo dentro de `toggleComplete`.
- Centralizar la persistencia en un único helper o efecto.
- Guardar siempre el objeto completo.
- Incorporar `try/catch` para errores de lectura, serialización o cuota.
- Considerar una migración cuando cambie la versión del esquema.

**Criterios de aceptación**

- Marcar una lección y recargar inmediatamente conserva el progreso.
- El valor almacenado siempre cumple el esquema esperado.
- Un valor corrupto no rompe la aplicación y se maneja de forma controlada.

---

### QA-004 — Las claves correctas y la longitud de opciones permiten adivinar patrones

**Severidad:** Alta  
**Componente:** Calidad psicométrica del examen y los retos  
**Referencia:** `data/question-bank.ts` y `data/course-content.ts`.

**Evidencia encontrada**

En el banco de 160 preguntas del examen:

| Letra correcta | Cantidad | Porcentaje aproximado |
|---|---:|---:|
| A | 18 | 11,3 % |
| B | 73 | 45,6 % |
| C | 60 | 37,5 % |
| D | 9 | 5,6 % |

- En 124 de 160 preguntas, la opción correcta es también la más larga.
- En muestras de exámenes de 80 preguntas, la letra D apareció solo entre 3 y 5 veces como correcta.
- En los 34 retos del curso, la distribución fue A=14, B=18 y C=2.
- En 26 de 34 retos, la respuesta correcta fue la más larga.
- Longitud promedio aproximada:
  - Opción correcta: 15,6 caracteres.
  - Distractores: 10,7 caracteres.

**Riesgo**

Un estudiante puede mejorar su puntuación usando patrones de forma en lugar de demostrar comprensión. Esto reduce la validez de la simulación de la prueba UdeA.

**Recomendación de implementación**

- Balancear las posiciones correctas alrededor del 25 % por letra.
- Aleatorizar el orden de opciones por pregunta conservando correctamente la clave.
- Persistir el orden aleatorio durante el intento para que no cambie al recargar.
- Igualar longitud, estructura gramatical, precisión y plausibilidad de los distractores.
- Evitar que la opción correcta sea sistemáticamente la más específica o extensa.
- Mantener agrupadas las preguntas que pertenecen al mismo estímulo de lectura.

**Criterios de aceptación**

- Cada examen conserva 80 preguntas únicas, con distribución 40/40 por competencia.
- Ninguna letra correcta aparece de manera extrema o casi ausente.
- Una prueba estadística automatizada sobre múltiples generaciones valida los rangos acordados.
- La opción correcta no es la más larga en una proporción claramente predecible.
- El cambio de orden no altera la corrección, explicación ni persistencia de respuestas.

---

### QA-005 — La recomendación académica es engañosa en empates o con pocas respuestas

**Severidad:** Alta  
**Componente:** Lógica de resultados  
**Referencia:** `components/ExamApp.tsx` — cálculo de tasas y `recommendedTrack`.

**Descripción técnica**

La comparación actual recomienda Razonamiento lógico cuando las tasas son iguales. El texto afirma que es “el área con mayor oportunidad de mejora”, incluso cuando existe empate, no se respondió ninguna pregunta o la muestra respondida es insuficiente.

**Casos problemáticos**

- 0 de 40 respondidas en ambas competencias.
- Igual tasa de aciertos en ambas áreas.
- Una sola respuesta por competencia.
- Gran diferencia en cantidad de respuestas entre las dos áreas.

**Recomendación de implementación**

- Definir un mínimo de respuestas por competencia antes de personalizar.
- Separar “preguntas no respondidas” de “respuestas incorrectas”.
- En empate, mostrar ambas rutas o dejar que el usuario elija.
- Explicar la recomendación con datos: aciertos, respondidas y porcentaje.
- Reservar “área con mayor oportunidad” para diferencias significativas.

**Criterios de aceptación**

- Con 0 respuestas no se declara un área más débil.
- En empate se informa el empate y se ofrecen ambas rutas.
- Cuando una competencia sí tiene menor desempeño válido, se recomienda esa ruta.
- El texto mostrado coincide con las cifras del intento.

## 5. Hallazgos de prioridad media

### QA-006 — Navegador de preguntas confuso y pequeño en móvil

**Severidad:** Media-Alta  
**Componente:** Examen móvil  
**Referencia:** `app/globals.css` — estilos responsivos del navegador de preguntas.

**Evidencia**

En un viewport de 390 × 844 px:

- El contenedor visible mide 390 px, pero el contenido navegable alcanza aproximadamente 1603 px.
- Se muestran dos filas paralelas: 1–40 y 41–80.
- Los botones miden cerca de 34 × 34 px.
- Al ocultarse las etiquetas de área, la relación entre ambas filas resulta difícil de interpretar.

**Recomendación de implementación**

- Usar pestañas o control segmentado: “Razonamiento lógico” y “Comprensión lectora”.
- Mostrar una cuadrícula o panel por área.
- Usar objetivos táctiles de al menos 44 × 44 px.
- Desplazar automáticamente hasta la pregunta actual.
- Mantener leyenda visible para actual, respondida, pendiente y marcada.

**Criterios de aceptación**

- No existen dos filas ambiguas sin etiqueta.
- Todos los controles táctiles principales cumplen el tamaño mínimo.
- La pregunta actual siempre queda visible.
- La página no genera desbordamiento horizontal global.

---

### QA-007 — Una lección puede marcarse completada sin resolver sus retos

**Severidad:** Media-Alta  
**Componente:** Progreso académico  
**Referencia:** `components/CourseExperience.tsx` — acción de completar módulo.

**Resultado actual**

La finalización de una lección es independiente de las respuestas de sus retos. Es posible marcarla como completa sin responder, o después de respuestas incorrectas.

**Riesgo**

El porcentaje de avance representa navegación, no aprendizaje ni dominio. Esto puede ser válido, pero actualmente la interfaz no explica esa diferencia.

**Recomendación de implementación**

Elegir y documentar una de estas reglas:

1. **Lección vista:** permitir completar libremente, pero no presentarlo como dominio.
2. **Lección aprobada:** exigir todos los retos respondidos y un umbral mínimo.
3. **Modelo mixto:** separar progreso de contenido y dominio académico.

**Criterios de aceptación**

- La regla de finalización es explícita en la interfaz.
- El porcentaje distingue avance de desempeño cuando corresponda.
- No se muestra una lección como aprobada si no cumple el umbral definido.

---

### QA-008 — El checkout mezcla pago futuro con acceso demostrativo

**Severidad:** Media  
**Componente:** Checkout  
**Referencia:** `components/CourseCheckout.tsx`.

**Resultado actual**

La pantalla muestra precio por definir, un método como Crypto/Binance y una acción “Explorar el curso”. Al mismo tiempo informa que no se realizará un cobro.

**Riesgo**

El usuario puede interpretar que el pago está activo, que debe usar Binance o que se está simulando una transacción real.

**Recomendación de implementación**

- Mientras no exista integración real, usar “Vista previa gratuita” o “Explorar demostración”.
- Ocultar selector de método de pago, precio incompleto y referencias a cobro.
- Activar el checkout solo cuando existan precio, proveedor, términos, estados de pago y manejo de errores.

**Criterios de aceptación**

- La demostración no da la impresión de procesar un pago.
- Un checkout productivo solo aparece cuando todos sus datos e integraciones están disponibles.

---

### QA-009 — Inferencia de lectura excede la evidencia del texto

**Severidad:** Media  
**Componente:** Contenido de Comprensión lectora  
**Referencia:** `data/course-content.ts` — explicación que usa “cambiar de dueño”.

**Resultado actual**

Ante la evidencia “Se arrienda”, la explicación indica que el taller podría “cerrar o cambiar de dueño”. Arrendar un inmueble permite inferir un posible cambio de ocupante o arrendatario, pero no necesariamente de propietario.

**Corrección sugerida**

Cambiar por una formulación como:

> Es probable que el taller esté próximo a cerrar, trasladarse o cambiar de ocupante.

**Criterio de aceptación**

La inferencia se limita a información sustentada por el texto y no confunde propiedad con ocupación.

---

### QA-010 — Terminología académica inconsistente entre pantallas

**Severidad:** Media  
**Componente:** Contenido y navegación  
**Referencia:** resultados, checkout y definición de rutas del curso.

**Resultado actual**

Se alternan estas denominaciones:

- “Razonamiento lógico” y “Comprensión lectora”.
- “Matemáticas” y “Español”.

**Recomendación de implementación**

Usar de forma principal y consistente los nombres de las competencias evaluadas:

- Razonamiento lógico.
- Comprensión lectora.

Si se considera útil, “Matemáticas” o “Español” pueden aparecer como aclaración secundaria, no como sustitutos cambiantes.

**Criterios de aceptación**

- Resultados, recomendación, checkout, curso y progreso muestran las mismas denominaciones.
- Los eventos analíticos y claves internas pueden conservar nombres técnicos, pero no deben filtrarse a la interfaz.

---

### QA-011 — Los módulos ofrecen poca práctica para afirmar dominio

**Severidad:** Media  
**Componente:** Diseño pedagógico  

**Resultado actual**

Cada módulo, estimado entre 22 y 32 minutos, contiene solo dos retos. Esto funciona para una demostración, pero es insuficiente para medir dominio, variabilidad o retención.

**Recomendación de implementación**

- Incorporar un banco de al menos 5–8 ejercicios variados por módulo, o generar una selección aleatoria por intento.
- Registrar cantidad de intentos, primer resultado, mejor resultado y respuesta final.
- Permitir reintentos con ejercicios equivalentes.
- Añadir un resumen final por ruta y un cierre general del curso.

**Criterios de aceptación**

- El dominio no depende de solo dos preguntas.
- El usuario recibe una síntesis clara al terminar una ruta y el curso.
- Los reintentos no borran silenciosamente el historial relevante.

---

### QA-012 — El diálogo de finalización no controla completamente el foco

**Severidad:** Media  
**Componente:** Accesibilidad del examen  

**Validaciones positivas**

- Al abrir, el foco llega a la acción principal.
- La tecla `Escape` cierra el diálogo.

**Pendientes**

- El foco no está confinado dentro del diálogo.
- Debe restaurarse al botón que abrió el diálogo al cerrar.
- El fondo debería quedar inerte o correctamente oculto para tecnologías de asistencia.

**Criterios de aceptación**

- `Tab` y `Shift+Tab` recorren únicamente los controles del diálogo mientras está abierto.
- Al cerrar, el foco vuelve a “Finalizar examen”.
- Lectores de pantalla reciben título, descripción y contexto adecuados.
- El contenido de fondo no es interactuable mientras el diálogo está activo.

## 6. Comportamientos validados correctamente

- El diálogo de finalización muestra el número de preguntas respondidas.
- El diálogo puede cancelarse con `Escape`.
- Las preguntas se seleccionan aleatoriamente entre intentos.
- No se repiten identificadores dentro de un mismo examen.
- Los estímulos de lectura mantienen agrupadas sus preguntas.
- Se revisaron las 40 preguntas matemáticas nuevas sin encontrar claves o cálculos incorrectos.
- Se revisaron los 10 estímulos y las 40 preguntas nuevas de lectura; las claves y explicaciones son coherentes, salvo el ajuste puntual de “dueño”.
- Los 17 módulos del curso renderizan correctamente.
- Cada módulo permite responder sus dos retos.
- La retroalimentación de respuesta correcta e incorrecta funciona.
- Cambiar una respuesta incorrecta por una correcta actualiza la retroalimentación.
- La navegación al siguiente módulo y el cambio a la otra ruta funcionan.
- El progreso persiste al volver a entrar por el flujo disponible.
- El checkout permite regresar a resultados y entrar a la demostración.
- En móvil, el contenido principal del curso no produce desbordamiento horizontal global.

## 7. Plan mínimo de pruebas de regresión

### 7.1 Acceso y continuidad del curso

- Entrar al curso, responder un reto, completar un módulo y recargar.
- Cerrar y volver a abrir la aplicación.
- Abrir directamente una URL de curso válida.
- Verificar progreso independiente para ambas rutas.
- Diferenciar “Continuar donde iba” de “Empezar ruta recomendada”.

### 7.2 Generación del examen

- Generar al menos 1.000 exámenes mediante una prueba automatizada.
- Validar siempre 80 identificadores únicos.
- Validar siempre 40 preguntas por competencia.
- Validar los 10 bloques de lectura y la integridad de sus preguntas.
- Medir la distribución de claves por posición.
- Confirmar que la aleatorización de opciones mantiene la clave correcta.

### 7.3 Resultados y recomendación

Probar explícitamente:

- 0 de 80 preguntas respondidas.
- Empate exacto entre competencias.
- Razonamiento lógico con menor rendimiento.
- Comprensión lectora con menor rendimiento.
- Muchas preguntas sin responder.
- Diferente cantidad de respuestas por competencia.

### 7.4 Persistencia del curso

- Marcar una lección y recargar inmediatamente.
- Guardar una respuesta incorrecta y recargar.
- Cambiarla a correcta y recargar.
- Cambiar de ruta y recargar.
- Inyectar un valor corrupto en `localStorage` y verificar recuperación controlada.

### 7.5 Responsive

Probar como mínimo:

- Móvil: 390 × 844 px.
- Tableta vertical y horizontal.
- Escritorio estándar.

Validar navegador de preguntas, diálogo, resultados, checkout, selector de ruta, retos y botones de avance.

### 7.6 Accesibilidad

- Recorrer examen y curso solo con teclado.
- Verificar foco visible en todos los controles.
- Verificar confinamiento y retorno del foco en diálogos.
- Confirmar anuncios de retroalimentación con `aria-live` o rol apropiado.
- Comprobar contraste y estados que no dependan únicamente del color.
- Respetar `prefers-reduced-motion`.

### 7.7 Contenido

- Validar automáticamente identificadores únicos.
- Validar que cada clave exista dentro de las opciones.
- Validar que cada pregunta tenga explicación.
- Revisar distractores por plausibilidad, longitud y paralelismo gramatical.
- Mantener una revisión humana matemática y editorial antes de publicar nuevos lotes.

## 8. Automatización recomendada

El comando actual `npm test` valida calidad estática, pero no los flujos que originan los principales hallazgos. Se recomienda añadir pruebas de componentes y pruebas de navegador, por ejemplo con Playwright o una alternativa compatible con el proyecto.

Cobertura mínima sugerida:

1. Iniciar examen y responder preguntas.
2. Finalizar con respuestas completas e incompletas.
3. Validar empates y recomendaciones.
4. Entrar al curso desde una recomendación.
5. Continuar progreso previo de forma explícita.
6. Recargar dentro del curso.
7. Completar un módulo según la regla pedagógica elegida.
8. Cambiar entre rutas.
9. Validar comportamiento móvil del navegador.
10. Ejecutar pruebas estadísticas sobre el generador de exámenes.

## 9. Orden recomendado de implementación

1. **Recuperación y ruta estable del curso:** QA-001.
2. **Persistencia segura del progreso:** QA-003.
3. **Separación entre recomendación nueva y continuación:** QA-002.
4. **Tratamiento de empates y evidencia insuficiente:** QA-005.
5. **Balance de claves y opciones:** QA-004.
6. **Rediseño móvil del navegador:** QA-006.
7. **Definición de avance frente a dominio:** QA-007 y QA-011.
8. **Coherencia de checkout, terminología y contenido:** QA-008, QA-009 y QA-010.
9. **Accesibilidad completa del diálogo:** QA-012.
10. **Pruebas automatizadas de regresión:** sección 8.

## 10. Criterio de salida para una nueva revisión QA

La implementación puede enviarse nuevamente a QA cuando:

- QA-001 a QA-005 estén resueltos y cubiertos por pruebas.
- El navegador móvil ya no presente ambigüedad ni objetivos táctiles pequeños.
- Se haya definido la semántica de “completar” una lección.
- El texto de checkout refleje con precisión si se trata de una demostración o de un pago real.
- Se haya corregido la inferencia sobre “cambiar de dueño”.
- Existan pruebas automatizadas de los flujos críticos de examen, recomendación, curso y persistencia.

## 11. Nota para el agente desarrollador

Antes de implementar, conviene separar el trabajo en tres capas:

1. **Estado y navegación:** rutas, recuperación, progreso y origen de entrada al curso.
2. **Reglas académicas:** recomendación, balance de respuestas, finalización y dominio.
3. **Presentación:** móvil, terminología, checkout y accesibilidad.

Evitar resolver estos hallazgos solo con cambios visuales. Los defectos principales dependen de reglas de estado, esquema de persistencia y calidad del banco de preguntas, por lo que deben acompañarse de pruebas automatizadas que prevengan regresiones.
