# Entrena UdeA

Simulador web para practicar la prueba de admisión de la Universidad de Antioquia. Cada intento incluye 40 preguntas de razonamiento lógico y 40 de comprensión lectora, seleccionadas de un banco de 160 preguntas, además de recursos gráficos, guardado local y dos modalidades de tiempo.

Al finalizar, el estudiante recibe una invitación a una vista previa educativa con 17 módulos originales —8 de razonamiento lógico y 9 de comprensión lectora—, ejemplos guiados, errores frecuentes y 34 retos interactivos. La ruta `/pago` muestra una maqueta explícita de los medios futuros, pero no solicita pagos, billeteras ni datos financieros y permite avanzar sin pagar.

## Modalidades

- **Entrenamiento flexible:** al terminar los 180 minutos, el examen permanece abierto y el reloj empieza a registrar el tiempo adicional.
- **Tiempo estricto:** el intento finaliza automáticamente al llegar a 00:00.

## Organización

- `app/`: entrada, ruta recuperable `/curso` y estilos globales.
- `components/`: interfaz, cronómetro y visualizaciones.
- `data/`: banco de preguntas y textos.
- `lib/`: cálculos de tiempo y resultados.
- `types/`: contratos de preguntas, gráficos y sesiones.
- `tests/`: regresiones de recomendación, persistencia y balance de opciones.

El banco está desacoplado de la interfaz y dividido por bloques dentro de `data/`. Para agregar contenido, se incorporan preguntas y estímulos respetando los tipos definidos en `types/exam.ts`. La selección conserva juntas las cuatro preguntas de cada lectura.

## Desarrollo

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
```

Validación completa:

```bash
npm test
```

Las respuestas y el intento en curso se guardan en el almacenamiento local del navegador; no se envían a un servidor.
