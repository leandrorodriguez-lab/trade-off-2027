# El dilema de la política económica en 2027

Simulador interactivo con fines didácticos (Política Económica, Facultad de Ciencias Económicas, Universidad Nacional de Entre Ríos).

Página: https://leandrorodriguez-lab.github.io/trade-off-2027/

## Enfoque (versión 4: variables nominales)

El gobierno elige tres variables nominales:

- **Aumento salarial nominal** (mueve el consumo)
- **Tipo de cambio** a diciembre de 2027
- **Tasa de interés nominal** (sostiene el dólar y regula el crédito)

Dos resultados son endógenos:

- **Inflación**: sube con los salarios y con el tipo de cambio, baja con la tasa.
- **Saldo en divisas del sector privado** (cuenta corriente − compras netas para atesoramiento): mejora con el tipo de cambio y con la tasa, empeora con los salarios.

La brecha a cubrir es `13.300 − saldo en divisas − ingresos financieros − puentes`, donde 13.300 = amortizaciones 2027 (20.700) − fuentes probables (7.400), según CIFRA (Informe de coyuntura N° 50).

## Punto de partida (niveles actuales, noviembre de 2026)

- Inflación esperada 2027: 22% anual; aumento salarial: 22%; tasa nominal: 24% (plazo fijo); dólar: $1.545 hoy y $1.620 a diciembre de 2027.
- Cuenta corriente 2027: +USD 4.533 M (0,6% del PBI). Compras para atesoramiento al ritmo de 2026: USD 28.000 M.
- Saldo en divisas: −USD 23.467 M. Brecha a cubrir: **USD 36.767 M**.

## Respuestas manipulables

- Inflación: puntos por punto de aumento salarial (0,5), de suba del tipo de cambio (0,3) y de suba de la tasa (−0,15).
- Saldo en divisas: USD M por punto de suba del tipo de cambio (+1.200), de aumento salarial (−500) y de suba de la tasa (+600).
- Empleo: cae 0,03 puntos por punto de tasa, más 0,0015 × (puntos de suba)² con subas fuertes. Salario efectivo: pauta − 4 puntos por punto de caída del empleo.
- Consumo: 0,7 por punto de masa salarial real (salario real + empleo) y −0,1 por punto de tasa (crédito).
- Ingresos financieros privados netos (0) y puentes de financiamiento.

La página muestra cuánto habría que mover cada instrumento por sí solo para cerrar la brecha y con qué costo, y las curvas de consumo contra brecha e inflación.

## Archivos

- `index.html`: la página.
- `modelo.js`: ecuaciones, niveles de base (`BASE`), respuestas (`RESPUESTAS`), puentes y escenarios.

Las respuestas iniciales son ilustrativas, no estimadas econométricamente.
