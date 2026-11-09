# El dilema de la política económica en 2027

Simulador interactivo con fines didácticos (Política Económica, Facultad de Ciencias Económicas, Universidad Nacional de Entre Ríos).

Con superávit fiscal como ancla, apertura externa y casi sin crédito externo, el gobierno busca bajar la inflación y subir el consumo con un dólar apreciado. Pero tiene dos instrumentos (tasa de interés y ritmo devaluatorio) para tres objetivos: inflación, consumo y los dólares para pagar los vencimientos de 2027.

## Qué se puede hacer

- Elegir un escenario: **A. Priorizar consumo**, **B. Frenar la dolarización** o **Intermedio**.
- Mover la tasa de interés, el ritmo devaluatorio mensual y la prima de riesgo.
- Activar o desactivar puentes de financiamiento: Bonares, repo, swaps, privatizaciones y emisión internacional.
- Ver el efecto sobre inflación, salario real, consumo, tipo de cambio real, atesoramiento y dólares que faltan, y las curvas de intercambio entre objetivos.

## Archivos

- `index.html`: la página.
- `modelo.js`: las ecuaciones y los parámetros. Para cambiar supuestos, editar el objeto `PARAMS`.

## Publicar con GitHub Pages

1. Crear un repositorio público (por ejemplo, `trade-off-2027`).
2. Subir `index.html`, `modelo.js` y este `README.md` (Add file → Upload files → Commit changes).
3. Ir a Settings → Pages → Branch: `main`, carpeta `/ (root)` → Save.
4. En un par de minutos queda en `https://leandrorodriguez-lab.github.io/trade-off-2027/`.

## Supuestos

- Vencimientos del Tesoro en moneda extranjera en 2027: USD 25.400 millones (LCG).
- Bonos para la Reconstrucción de una Argentina Libre del Banco Central: USD 4.000 millones (1816).
- Fuentes seguras: USD 7.700 millones (desembolsos del Fondo Monetario Internacional, refinanciación con organismos y con el sector público, LCG).
- Inflación inercial: 18%, en línea con el Presupuesto 2027.

Los parámetros de comportamiento son ilustrativos, no estimados econométricamente.
