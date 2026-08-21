# Versiones del curso

El curso se mantiene en dos ediciones independientes para poder comparar, probar y volver a la experiencia anterior sin perder trabajo.

## Curso v1

- Ruta: `/curso`
- Estado de referencia en Git: etiqueta `curso-v1`
- Contenido: 17 módulos y 34 retos
- Progreso local: `entrena-udea-course-progress-v3`

La v1 se conserva sin migraciones automáticas. Abrir la v2 no modifica ni elimina su progreso.

## Curso v2

- Ruta: `/curso/v2`
- Contenido: 17 módulos, 34 ejemplos guiados y 85 actividades
- Método: punto de partida, explicación, ejemplos, práctica y cierre
- Progreso local: `entrena-udea-course-v2-progress-v1`

Los accesos nuevos desde la pasarela demostrativa y los resultados conducen a la v2. La cabecera de la v2 mantiene un enlace visible para abrir la v1.

## Recuperación

Para inspeccionar el código exacto de la primera edición sin modificar la rama actual:

```bash
git show curso-v1
```

Para crear una rama de recuperación desde esa edición:

```bash
git switch -c codex/recuperar-curso-v1 curso-v1
```

No se recomienda hacer `reset --hard` sobre trabajo en curso. Una rama separada permite revisar o recuperar archivos con seguridad.
