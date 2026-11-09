# El dilema de la política económica en 2027

Simulador interactivo con fines didácticos (Política Económica, Facultad de Ciencias Económicas, Universidad Nacional de Entre Ríos).

Página: https://leandrorodriguez-lab.github.io/trade-off-2027/

## La idea

El gobierno quiere reactivar con dos motores: **salarios por encima de la inflación** y **expansión del crédito**. Los dos empujan la inflación por costos y por demanda; para que no se espiralice hay que mantener bajo el tipo de cambio. El dólar barato estimula la dolarización del ahorro y achica el superávit de cuenta corriente, y sin crédito externo se hace difícil cubrir la brecha de 2027. Para cerrarla hay que subir la tasa y frenar el consumo: los motores se apagan. El equilibrio posible es precario.

## Supuestos

- Sin acceso al mercado internacional de capitales; economía abierta; sin límites al atesoramiento de personas.
- Superávit fiscal: el impulso de demanda no es fiscal.
- Brecha de CIFRA (Informe de coyuntura N° 50): vencimientos de la Nación y del Banco Central por USD 30.100 M (capital 20.700 + intereses 9.400) menos fuentes probables por USD 7.400 M = USD 22.700 M.
- Cuenta corriente 2027 con el tipo de cambio real actual: +0,6% del PBI (USD 4.533 M), con los intereses ya descontados. Por eso la brecha se mide con la balanza de pagos: `13.300 − cuenta corriente + dolarización − ingresos financieros − puentes`.

## Ecuaciones principales

- Precios por costos: `π = α·d + (1 − α)·(w − q) + κ·b`
- Con salarios indexados a una meta real: `π = d + [(1 − α)/α]·(ŵ − q) + (κ/α)·b` (la devaluación pasa entera a precios)
- Tipo de cambio real: `ΔTCR ≈ π* − 1,5·(ŵ − q) − (κ/α)·b`
- Cuenta corriente: `CC = 4.533 + β·ΔTCR − importaciones por consumo`
- Dolarización: crece con la apreciación, con el salario real y con el salto esperado después de las elecciones; baja con el rendimiento de los pesos.

## Qué se puede manipular

- Motores: salario real (con o sin indexación) y tasa de interés real; ritmo devaluatorio.
- Indicadores abiertos: sensibilidad de la cuenta corriente al tipo de cambio real (β), ingresos financieros privados netos, productividad y prima de riesgo.
- Puentes: saldo de caja de 2026, emisiones locales, repo, swap con Estados Unidos y emisión internacional (solo con prima baja).
- La página calcula la tasa real que cierra la brecha y su efecto en la actividad, y ordena combinaciones de salario y tasa de más a menos sostenible.

## Archivos

- `index.html`: la página.
- `modelo.js`: ecuaciones y parámetros (`PARAMS`, `ABIERTOS`, `PUENTES`, `ESCENARIOS`).

Los parámetros de comportamiento son ilustrativos, no estimados econométricamente.
