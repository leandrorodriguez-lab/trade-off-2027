# El dilema de la política económica en 2027

Simulador interactivo con fines didácticos (Política Económica, Facultad de Ciencias Económicas, Universidad Nacional de Entre Ríos).

Página: https://leandrorodriguez-lab.github.io/trade-off-2027/

## La idea

Con superávit fiscal como ancla, apertura externa y casi sin crédito externo, el gobierno busca bajar la inflación y recuperar el consumo con un dólar apreciado antes de las elecciones de 2027. Pero el programa financiero tiene una **brecha de USD 22.700 millones** sin cubrir (CIFRA, Informe de coyuntura N° 50). El simulador muestra el circuito:

1. Expansión con apreciación cambiaria.
2. Expectativa de devaluación después de octubre, alimentada por el atraso y por la brecha sin cubrir.
3. Dolarización previa a las elecciones, que agranda la brecha.
4. Suba de la tasa para contener al dólar, que vuelve a llevar a la recesión.

El equilibrio que puede lograr el gobierno es precario: la brecha solo cierra con todos los puentes de financiamiento, con la actividad estancada y mientras la prima de riesgo no suba.

## Qué se puede hacer

- Elegir un escenario: **A. Expansión con apreciación**, **B. Corrección anticipada** o **C. Equilibrio precario**.
- Mover la tasa de interés, el ritmo devaluatorio mensual y la prima de riesgo.
- Activar puentes: saldo de caja de 2026, emisiones locales, repo, swap con Estados Unidos y emisión internacional (esta última solo si la prima de riesgo lo permite).
- Ver la tasa necesaria para contener al dólar y la recesión que provoca, y aplicarla con un botón.

## Archivos

- `index.html`: la página.
- `modelo.js`: las ecuaciones y los parámetros. Para cambiar supuestos, editar el objeto `PARAMS`.

## Datos (CIFRA N° 50, octubre de 2026)

- Vencimientos 2027 del gobierno nacional: USD 24.900 M; Bonos para la Reconstrucción de una Argentina Libre del Banco Central: USD 5.200 M. Total: USD 30.100 M.
- Fuentes probables: USD 7.400 M (organismos 4.100, renovación dentro del sector público 1.800, privatizaciones 1.500).
- Brecha: USD 22.700 M. Con provincias (2.400) y obligaciones negociables de empresas (8.200), los vencimientos totales suman USD 40.700 M.
- Dolarización (formación de activos externos) en 2026: USD 18.700 M en ocho meses.

Los parámetros de comportamiento son ilustrativos, no estimados econométricamente.
