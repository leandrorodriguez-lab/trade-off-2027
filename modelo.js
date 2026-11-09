// Modelo estilizado del dilema de política económica 2027 (Argentina). Versión 3.
// Fines didácticos: los parámetros de comportamiento son ilustrativos, no estimados.
// Datos de la brecha: CIFRA, Informe de coyuntura N° 50 (octubre de 2026).
// Tasas en % anual salvo el ritmo devaluatorio, que es mensual. Montos en millones de USD.
//
// Supuestos: sin acceso al mercado internacional de capitales; economía abierta; sin límites
// al atesoramiento de personas; superávit fiscal (el impulso de demanda no es fiscal).
// El gobierno reactiva con dos motores: salario real por encima de la inflación y crédito (tasa baja).

const PARAMS = {
  // Programa financiero 2027 (CIFRA N° 50)
  amortizaciones: 20700,    // capital: Nación 15.700 + Banco Central (bonos) 5.000
  intereses: 9400,          // Nación 9.200 + Banco Central 200 (ya incluidos en la cuenta corriente)
  fuentesProbables: 7400,   // organismos 4.100 + sector público 1.800 + privatizaciones 1.500

  // Precios (formación por costos)
  alfa: 0.4,          // peso de los transables en la canasta
  kappa: 0.25,        // traslado de la presión de demanda a precios
  piExt: 2.5,         // inflación internacional (%)
  pautaInercial: 18,  // inflación de referencia para paritarias no indexadas (%)

  // Demanda: crédito y salario
  tasaNeutral: 5,     // tasa real neutral (%)
  gamma: 0.3,         // sensibilidad de la demanda a la tasa real
  lambda: 0.3,        // impulso del salario real sobre la demanda
  brechaMin: -6, brechaMax: 5,
  actividadBase: 0.5, // crecimiento sin impulsos (%)

  // Cuenta corriente (total, con intereses)
  ccBase: 4533,       // 0,6% del PBI 2027 al tipo de cambio real actual
  efectoConsumo: 400, // importaciones: USD M por punto de consumo por encima del 1,5%

  // Dolarización del ahorro (formación de activos externos)
  dolarizacionBase: 24000,    // con tipo de cambio real actual, diferencial nulo y salario real constante
  efectoApreciacion: 1500,    // USD M por punto de apreciación real (relación directa)
  efectoDiferencial: 600,     // USD M por punto de diferencial pesos − dólares
  efectoIngreso: 400,         // USD M por punto de salario real
  saltoPorAtraso: 0.8,        // salto esperado post-electoral por punto de apreciación
  saltoPorBrecha: 0.2,        // salto esperado por cada USD 1.000 M de brecha

  primaMaxMercado: 9          // por encima de esta prima no hay emisión internacional
};

// Indicadores abiertos (se manipulan en la página)
const ABIERTOS = {
  beta: 1130,          // USD M de cuenta corriente por punto de tipo de cambio real (0,15% del PBI)
  ingresosFin: 0,      // ingresos financieros privados netos
  productividad: 1,    // crecimiento de la productividad (%)
  primaBase: 5         // riesgo país e incertidumbre (%)
};

const PUENTES = {
  caja:     { nombre: "Saldo de caja de 2026", monto: 3700 },
  locales:  { nombre: "Emisiones locales (Presupuesto)", monto: 1800 },
  repo:     { nombre: "Repo con bancos internacionales", monto: 2000 },
  swap:     { nombre: "Activación del swap con Estados Unidos", monto: 5000 },
  mercado:  { nombre: "Emisión en el mercado internacional", monto: 5000, condicional: true }
};

// pol = { salario, indexado, tasa (REAL, % anual), dev, puentes }   ab = indicadores abiertos
function simular(pol, ab = ABIERTOS, p = PARAMS) {
  const d = (Math.pow(1 + pol.dev / 100, 12) - 1) * 100;
  const q = ab.productividad;
  const r = pol.tasa;                                  // tasa real: instrumento del Banco Central
  let infl = p.pautaInercial, b = 0, sal = pol.salario, w = p.pautaInercial + pol.salario;
  for (let k = 0; k < 400; k++) {
    b = Math.min(p.brechaMax, Math.max(p.brechaMin, -p.gamma * (r - p.tasaNeutral) + p.lambda * sal));
    let nueva;
    if (pol.indexado) {
      // w = π + ŵ  ⇒  π = d + [(1−α)/α]·(ŵ − q) + (κ/α)·b
      nueva = d + ((1 - p.alfa) / p.alfa) * (pol.salario - q) + (p.kappa / p.alfa) * b;
    } else {
      nueva = p.alfa * d + (1 - p.alfa) * (w - q) + p.kappa * b;   // paritaria nominal fija
    }
    if (Math.abs(nueva - infl) < 1e-10) { infl = nueva; break; }
    infl = 0.5 * infl + 0.5 * nueva;
    if (!pol.indexado) sal = ((1 + w / 100) / (1 + infl / 100) - 1) * 100;
  }
  const tasaNominal = ((1 + r / 100) * (1 + infl / 100) - 1) * 100;
  const salarioReal = pol.indexado ? pol.salario : sal;
  const credito = -p.gamma * (r - p.tasaNeutral);
  const consumo = 1.5 + 0.6 * salarioReal + 0.6 * credito;
  const actividad = p.actividadBase + b;
  const tcr = ((1 + d / 100) * (1 + p.piExt / 100) / (1 + infl / 100) - 1) * 100;
  const rendDolares = ((1 + tasaNominal / 100) / (1 + d / 100) - 1) * 100;
  const cc = p.ccBase + ab.beta * tcr - p.efectoConsumo * (consumo - 1.5);
  const necesidadBruta = p.amortizaciones - p.fuentesProbables;     // 13.300

  let brecha = necesidadBruta - cc, salto = 0, prima = 0, dif = 0, dol = 0, puentes = 0, intl = true;
  for (let k = 0; k < 500; k++) {
    salto = Math.max(0, p.saltoPorAtraso * (-tcr) + p.saltoPorBrecha * Math.max(0, brecha) / 1000);
    prima = ab.primaBase + salto;
    dif = rendDolares - prima;
    dol = Math.max(0, p.dolarizacionBase + p.efectoApreciacion * (-tcr) - p.efectoDiferencial * dif + p.efectoIngreso * salarioReal);
    intl = prima <= p.primaMaxMercado;
    puentes = 0;
    for (const key of pol.puentes) { const x = PUENTES[key]; if (x.condicional && !intl) continue; puentes += x.monto; }
    const nueva = necesidadBruta - puentes - cc + dol - ab.ingresosFin;
    if (Math.abs(nueva - brecha) < 1e-6) { brecha = nueva; break; }
    brecha = 0.5 * brecha + 0.5 * nueva;
  }
  return { devAnual: d, infl, tasaReal: r, tasaNominal, demanda: b, credito, salarioReal, consumo, actividad, tcr,
           rendDolares, cuentaCorriente: cc, salto, prima, diferencial: dif, dolarizacion: dol,
           puentes, mercadoIntlDisponible: intl, necesidadBruta, brecha,
           brechaCifra: p.amortizaciones + p.intereses - p.fuentesProbables };
}

// Tasa real mínima que cierra la brecha (con los puentes elegidos). null si ninguna alcanza hasta 40%.
function tasaDeCierre(pol, ab = ABIERTOS, p = PARAMS) {
  const r0 = simular(pol, ab, p);
  if (r0.brecha <= 0) return { necesaria: false, tasa: pol.tasa, r: r0 };
  for (let i = Math.ceil(pol.tasa); i <= 40; i += 0.5) {
    const r = simular({ ...pol, tasa: i }, ab, p);
    if (r.brecha <= 0) return { necesaria: true, tasa: i, r };
  }
  return { necesaria: true, tasa: null, r: simular({ ...pol, tasa: 40 }, ab, p) };
}

const ESCENARIOS = {
  A: { nombre: "A. Dos motores con dólar planchado", salario: 3, indexado: true, tasa: 2, dev: 0.8, puentes: ["locales", "repo"] },
  B: { nombre: "B. Corrección cambiaria", salario: 0, indexado: false, tasa: 10, dev: 2.5, puentes: ["locales", "repo"] },
  C: { nombre: "C. Equilibrio precario", salario: 1, indexado: true, tasa: 14, dev: 1.2, puentes: ["caja", "locales", "repo", "swap", "mercado"] }
};

if (typeof module !== "undefined") module.exports = { simular, tasaDeCierre, PARAMS, ABIERTOS, PUENTES, ESCENARIOS };
