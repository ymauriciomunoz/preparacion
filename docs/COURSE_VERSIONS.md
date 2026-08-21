# Versiones y rollback del curso

El sitio mantiene una sola edición activa en `/curso`. No existen selectores entre ediciones ni rutas públicas paralelas. Cada entrega estable se conserva mediante un tag de Git, que es la fuente de verdad para comparar o recuperar una versión anterior.

## Releases disponibles

- `curso-v1`: primera edición del curso, con 17 módulos y 34 retos.
- `curso-v2`: ampliación pedagógica, con 17 módulos, 34 ejemplos guiados y 85 actividades.
- `curso-v2.1`: corrección del modelo de publicación; una sola ruta activa y rollback únicamente con Git.

El sufijo `v2` que todavía aparece en algunos nombres internos identifica el esquema de contenido y la clave de progreso existentes. No representa una segunda ruta o edición simultánea y se conserva para no perder el progreso local de estudiantes que ya usaron el curso.

## Inspeccionar una versión anterior

Para revisar una release sin modificar la rama de trabajo actual:

```bash
git show curso-v1
```

Para abrirla en una rama aislada y probarla:

```bash
git switch -c codex/revisar-curso-v1 curso-v1
```

## Hacer rollback

El rollback de producción debe partir del tag estable elegido: se crea una rama desde ese tag, se valida y se publica esa revisión. No se usa `reset --hard` sobre la rama principal, porque podría borrar trabajo posterior.

```bash
git switch -c codex/rollback-curso-v1 curso-v1
npm test
```

Después de validar, se despliega esa rama mediante el flujo normal de Sites. Si se desea reincorporar la versión antigua a la línea principal, se hace mediante un commit o una reversión explícita y revisable.
