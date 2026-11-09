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
  consumoTasa: 0.2,     // puntos de consumo que caen por punto de suba de la tasa (menos crédito)
  empleo: 0,            // variación del empleo (%), que suponemos estable
  empleoTasa: 0         // puntos de empleo que caen por punto de suba de la tasa (0 = empleo estable)
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
  const dw = pol.salario - b.salario;
  const devaluacion = variacionCambio(pol.tipoCambio, b);
  const de = devaluacion - variacionCambio(b.tipoCambio, b);
  const di = pol.tasa - b.tasa;

  const inflacion = b.inflacion + resp.inflSalario * dw + resp.inflCambio * de - resp.inflTasa * di;
  const salarioReal = ((1 + pol.salario / 100) / (1 + inflacion / 100) - 1) * 100;
  const tcr = ((1 + devaluacion / 100) * (1 + b.inflacionExt / 100) / (1 + inflacion / 100) - 1) * 100;
  const rendDolares = ((1 + pol.tasa / 100) / (1 + devaluacion / 100) - 1) * 100;
  // Consumo: función de la masa salarial real (salario real y empleo) y del crédito (baja con la tasa)
  const empleo = resp.empleo - resp.empleoTasa * di;
  const masaSalarial = ((1 + salarioReal / 100) * (1 + empleo / 100) - 1) * 100;
  const consumo = resp.consumoMasa * masaSalarial - resp.consumoTasa * di;

  const saldoBase = b.cuentaCorriente - b.atesoramiento;
  const saldo = saldoBase + resp.saldoCambio * de - resp.saldoSalario * dw + resp.saldoTasa * di;
  let puentes = 0;
  for (const k of pol.puentes) puentes += PUENTES[k].monto;
  const necesidad = b.amortizaciones - b.fuentesProbables;              // 13.300
  const brecha = necesidad - saldo - resp.ingresosFin - puentes;

  return { devaluacion, inflacion, salarioReal, empleo, masaSalarial, tcr, rendDolares, consumo, saldoBase, saldo,
           puentes, necesidad, brecha };
}

// Valor de un solo instrumento que cierra la brecha (los otros dos quedan fijos).
function cierreConUnInstrumento(pol, resp = RESPUESTAS, b = BASE) {
  const r0 = simular(pol, resp, b);
  const out = {};
  const B = r0.brecha;
  // salario: el saldo empeora con salarios ⇒ hay que bajar el aumento salarial
  out.salario = resp.saldoSalario > 0 ? pol.salario - B / resp.saldoSalario : null;
  // tipo de cambio: puntos de variación adicionales
  if (resp.saldoCambio > 0) {
    const nuevaVar = r0.devaluacion + B / resp.saldoCambio;
    out.tipoCambio = b.tipoCambioHoy * (1 + nuevaVar / 100);
  } else out.tipoCambio = null;
  out.tasa = resp.saldoTasa > 0 ? pol.tasa + B / resp.saldoTasa : null;
  const res = {};
  if (out.salario !== null) res.salario = { valor: out.salario, r: simular({ ...pol, salario: out.salario }, resp, b) };
  if (out.tipoCambio !== null) res.tipoCambio = { valor: out.tipoCambio, r: simular({ ...pol, tipoCambio: out.tipoCambio }, resp, b) };
  if (out.tasa !== null) res.tasa = { valor: out.tasa, r: simular({ ...pol, tasa: out.tasa }, resp, b) };
  return { brecha: B, res };
}

const ESCENARIOS = {
  H: { nombre: "Niveles actuales", salario: 22, tipoCambio: 1620, tasa: 24, puentes: [] },
  A: { nombre: "A. Consumo con dólar planchado", salario: 30, tipoCambio: 1600, tasa: 20, puentes: ["locales", "repo"] },
  B: { nombre: "B. Corrección cambiaria", salario: 22, tipoCambio: 2100, tasa: 30, puentes: ["locales", "repo"] },
  C: { nombre: "C. Ajuste con tasa", salario: 22, tipoCambio: 1700, tasa: 50, puentes: ["caja", "locales", "repo", "swap"] }
};

if (typeof module !== "undefined") module.exports = { simular, cierreConUnInstrumento, variacionCambio, BASE, RESPUESTAS, PUENTES, ESCENARIOS };
