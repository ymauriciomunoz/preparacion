# Entrena UdeA

Simulador web para practicar la prueba de admisión de la Universidad de Antioquia. Incluye 40 preguntas de razonamiento lógico, 40 de comprensión lectora, recursos gráficos, guardado local y dos modalidades de tiempo.

## Modalidades

- **Entrenamiento flexible:** al terminar los 180 minutos, el examen permanece abierto y el reloj empieza a registrar el tiempo adicional.
- **Tiempo estricto:** el intento finaliza automáticamente al llegar a 00:00.

## Organización

- `app/`: entrada y estilos globales.
- `components/`: interfaz, cronómetro y visualizaciones.
- `data/`: banco de preguntas y textos.
- `lib/`: cálculos de tiempo y resultados.
- `types/`: contratos de preguntas, gráficos y sesiones.

El banco está desacoplado de la interfaz. Para agregar contenido, se incorporan nuevos registros en `data/question-bank.ts` respetando los tipos definidos en `types/exam.ts`.

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
