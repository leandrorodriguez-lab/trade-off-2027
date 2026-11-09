// Modelo estilizado del dilema de política económica 2027 (Argentina). Versión 4: variables nominales.
// Fines didácticos: las respuestas (coeficientes) son ilustrativas y se manipulan en la página.
//
// Instrumentos que elige el gobierno: aumento del salario nominal, tipo de cambio a diciembre de 2027
// y tasa de interés nominal. Endógenos: la inflación y el saldo en divisas del sector privado
// (cuenta corriente − compras netas para atesoramiento).
// Supuestos: sin acceso al mercado internacional de capitales; economía abierta; sin límites al
// atesoramiento de personas; superávit fiscal (el impulso de demanda no es fiscal).

const BASE = {
  // Niveles actuales (noviembre de 2026) proyectados a 2027
  salario: 22,          // aumento salarial nominal anual (%), en línea con la inflación esperada
  tipoCambioHoy: 1545,  // dólar mayorista ($ por USD), noviembre de 2026
  tipoCambio: 1620,     // dólar a diciembre de 2027 si sigue el ritmo de 2026 (+4,9%)
  tasa: 24,             // tasa nominal anual de plazo fijo (%)
  inflacion: 22,        // inflación anual esperada para 2027 (%), ≈1,7% mensual

  // Saldo en divisas con los niveles actuales (millones de USD)
  cuentaCorriente: 4533,   // 0,6% del PBI 2027, con los intereses ya descontados
  atesoramiento: 28000,    // compras netas para atesoramiento al ritmo de 2026 (18.700 en ocho meses)

  // Programa financiero 2027 (CIFRA N° 50)
  amortizaciones: 20700,   // Nación 15.700 + Banco Central (bonos) 5.000
  fuentesProbables: 7400,  // organismos 4.100 + sector público 1.800 + privatizaciones 1.500

  inflacionExt: 2.5        // inflación internacional (%), para el tipo de cambio real
};

// Respuestas manipulables en la página
const RESPUESTAS = {
  inflSalario: 0.5,     // puntos de inflación por punto de aumento salarial
  inflCambio: 0.3,      // puntos de inflación por punto de suba del tipo de cambio (traslado a precios)
  inflTasa: 0.15,       // puntos de inflación que baja por punto de suba de la tasa
  saldoCambio: 1200,    // USD M que mejora el saldo por punto de suba del tipo de cambio
  saldoSalario: 500,    // USD M que empeora el saldo por punto de aumento salarial
  saldoTasa: 600,       // USD M que mejora el saldo por punto de suba de la tasa
  ingresosFin: 0,       // ingresos financieros privados netos (USD M)
  consumoMasa: 0.7,     // puntos de consumo por punto de masa salarial real (salario real + empleo)
  consumoTasa: 0.1,     // puntos de consumo que caen por punto de suba de la tasa (menos crédito)
  empleo: 0,            // variación exógena del empleo (%)
  empleoTasa: 0.03,     // puntos de empleo que caen por punto de suba de la tasa
  empleoTasa2: 0.0015,  // caída adicional del empleo con subas fuertes: coeficiente × (puntos de suba)²
  salarioEmpleo: 4      // puntos de aumento salarial nominal que se pierden por punto de caída del empleo
};


const PUENTES = {
  caja:    { nombre: "Saldo de caja de 2026", monto: 3700 },
  locales: { nombre: "Emisiones locales (Presupuesto)", monto: 1800 },
  repo:    { nombre: "Repo con bancos internacionales", monto: 2000 },
  swap:    { nombre: "Activación del swap con Estados Unidos", monto: 5000 }
};

function variacionCambio(tc, b = BASE) { return (tc / b.tipoCambioHoy - 1) * 100; }

// pol = { salario, tipoCambio, tasa, puentes }   resp = respuestas
function simular(pol, resp = RESPUESTAS, b = BASE) {
  const di = pol.tasa - b.tasa;
  // Empleo: cae con la tasa (crédito), y más que proporcionalmente con subas fuertes
  const empleo = resp.empleo - resp.empleoTasa * di - resp.empleoTasa2 * Math.max(0, di) ** 2;
  // Salario efectivo: la pauta menos el efecto de un mercado de trabajo más débil
  const salarioEfectivo = pol.salario + resp.salarioEmpleo * Math.min(0, empleo - resp.empleo) + resp.salarioEmpleo * Math.max(0, empleo - resp.empleo) * 0.5;
  const dw = salarioEfectivo - b.salario;
  const devaluacion = variacionCambio(pol.tipoCambio, b);
  const de = devaluacion - variacionCambio(b.tipoCambio, b);

  const inflacion = b.inflacion + resp.inflSalario * dw + resp.inflCambio * de - resp.inflTasa * di;
  const salarioReal = ((1 + salarioEfectivo / 100) / (1 + inflacion / 100) - 1) * 100;
  const tcr = ((1 + devaluacion / 100) * (1 + b.inflacionExt / 100) / (1 + inflacion / 100) - 1) * 100;
  const rendDolares = ((1 + pol.tasa / 100) / (1 + devaluacion / 100) - 1) * 100;
  // Consumo: masa salarial real (salario real y empleo) y crédito (baja con la tasa)
  const masaSalarial = ((1 + salarioReal / 100) * (1 + empleo / 100) - 1) * 100;
  const consumo = resp.consumoMasa * masaSalarial - resp.consumoTasa * di;

  const saldoBase = b.cuentaCorriente - b.atesoramiento;
  const saldo = saldoBase + resp.saldoCambio * de - resp.saldoSalario * dw + resp.saldoTasa * di;
  let puentes = 0;
  for (const k of pol.puentes) puentes += PUENTES[k].monto;
  const necesidad = b.amortizaciones - b.fuentesProbables;              // 13.300
  const brecha = necesidad - saldo - resp.ingresosFin - puentes;

  return { devaluacion, inflacion, salarioEfectivo, salarioReal, empleo, masaSalarial, tcr, rendDolares, consumo, saldoBase, saldo,
           puentes, necesidad, brecha };
}

// Valor de un solo instrumento que cierra la brecha (los otros dos quedan fijos), por bisección.
function resolver(f, a, bmax) {           // f creciente o decreciente; busca f(x) = 0 en [a, bmax]
  let fa = f(a), fb = f(bmax);
  if (fa * fb > 0) return null;
  for (let k = 0; k < 80; k++) { const m = (a + bmax) / 2, fm = f(m); if (fa * fm <= 0) { bmax = m; fb = fm; } else { a = m; fa = fm; } }
  return (a + bmax) / 2;
}
function cierreConUnInstrumento(pol, resp = RESPUESTAS, b = BASE) {
  const r0 = simular(pol, resp, b);
  const res = {};
  const rangos = { salario: [-60, 60], tipoCambio: [800, 6000], tasa: [0, 200] };
  for (const [k, [a, z]] of Object.entries(rangos)) {
    const x = resolver(v => simular({ ...pol, [k]: v }, resp, b).brecha, a, z);
    if (x !== null) res[k] = { valor: x, r: simular({ ...pol, [k]: x }, resp, b) };
  }
  return { brecha: r0.brecha, res };
}

const ESCENARIOS = {
  H: { nombre: "Niveles actuales", salario: 22, tipoCambio: 1620, tasa: 24, puentes: [] },
  A: { nombre: "A. Consumo con dólar planchado", salario: 30, tipoCambio: 1600, tasa: 20, puentes: ["locales", "repo"] },
  B: { nombre: "B. Corrección cambiaria", salario: 22, tipoCambio: 2100, tasa: 30, puentes: ["locales", "repo"] },
  C: { nombre: "C. Ajuste con tasa", salario: 22, tipoCambio: 1700, tasa: 50, puentes: ["caja", "locales", "repo", "swap"] }
};

if (typeof module !== "undefined") module.exports = { simular, cierreConUnInstrumento, variacionCambio, BASE, RESPUESTAS, PUENTES, ESCENARIOS };
