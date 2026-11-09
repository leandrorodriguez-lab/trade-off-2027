// Modelo estilizado del dilema de política económica 2027 (Argentina).
// Fines didácticos: los parámetros de comportamiento son ilustrativos, no estimados.
// Datos de base: CIFRA, Informe de coyuntura N° 50 (octubre de 2026).
// Tasas en % anual salvo el ritmo devaluatorio, que es mensual. Montos en millones de USD.

const PARAMS = {
  // Brecha del programa financiero 2027 (CIFRA N° 50)
  vencimientosNacion: 24900,  // gobierno nacional: capital 15.700 + intereses 9.200
  bopreal: 5200,              // Bonos para la Reconstrucción de una Argentina Libre (Banco Central)
  fuentesProbables: 7400,     // organismos 4.100 + renovación intra sector público 1.800 + privatizaciones 1.500

  // Precios y demanda
  inercia: 18,        // inflación inercial anual (%), cerca de la meta del Presupuesto 2027
  alfa: 0.4,          // peso de los transables en la canasta
  piExt: 2.5,         // inflación internacional (%)
  tasaNeutral: 5,     // tasa real neutral (%)
  gamma: 0.3,         // sensibilidad de la demanda a la tasa real
  brechaMin: -7, brechaMax: 4,
  kappa: 1.2,         // sensibilidad de la inflación de no transables a la demanda
  indexacion: 0.5,    // peso de la inflación corriente en los salarios
  thetaSalario: 0.8,  // efecto de la demanda sobre los salarios
  actividadBase: 0.5, // crecimiento sin impulsos (%), tras la contracción de 2026

  // Expectativa de salto cambiario después de las elecciones (puntos %)
  saltoPorAtraso: 0.8,     // por punto de apreciación real
  saltoPorFaltante: 0.3,   // por cada USD 1.000 M sin cubrir

  // Mercado de cambios (anual)
  cuentaCorrienteBase: 6000, // bienes − servicios − intereses privados − utilidades (2026 anualizado ≈ 6.300)
  efectoTCR: 500,            // por punto de tipo de cambio real
  efectoConsumo: 700,        // por punto de consumo por encima de 2%
  dolarizacionBase: 20000,   // formación de activos externos (2026: 18.700 en 8 meses)
  efectoDiferencial: 400,    // por punto de diferencial pesos − dólares
  efectoIngreso: 250,        // por punto de salario real
  ingresosFinBase: 12000,    // obligaciones negociables, cartera y préstamos privados
  efectoFinanciero: 250,     // por punto de diferencial

  primaMaxMercado: 9         // por encima de esta prima no hay emisión internacional
};

const PUENTES = {
  caja:     { nombre: "Saldo de caja de 2026", monto: 3700 },
  locales:  { nombre: "Emisiones locales (Presupuesto)", monto: 1800 },
  repo:     { nombre: "Repo con bancos internacionales", monto: 2000 },
  swap:     { nombre: "Activación del swap con Estados Unidos", monto: 5000 },
  mercado:  { nombre: "Emisión en el mercado internacional", monto: 5000, condicional: true }
};

function precios(tasa, devAnual, p) {
  let infl = p.inercia, brecha = 0, tasaReal = 0;
  for (let k = 0; k < 300; k++) {
    tasaReal = ((1 + tasa / 100) / (1 + infl / 100) - 1) * 100;
    brecha = Math.min(p.brechaMax, Math.max(p.brechaMin, -p.gamma * (tasaReal - p.tasaNeutral)));
    const piN = p.inercia + p.kappa * brecha;
    const nueva = p.alfa * devAnual + (1 - p.alfa) * piN;
    if (Math.abs(nueva - infl) < 1e-10) { infl = nueva; break; }
    infl = 0.5 * infl + 0.5 * nueva;
  }
  const salarioNominal = p.indexacion * infl + (1 - p.indexacion) * p.inercia + p.thetaSalario * brecha;
  const salarioReal = ((1 + salarioNominal / 100) / (1 + infl / 100) - 1) * 100;
  const consumo = 1.5 + 0.6 * salarioReal + 0.5 * brecha;
  const actividad = p.actividadBase + 1.0 * brecha + 0.3 * salarioReal;
  const tcr = ((1 + devAnual / 100) * (1 + p.piExt / 100) / (1 + infl / 100) - 1) * 100;
  return { infl, tasaReal, brecha, salarioReal, consumo, actividad, tcr };
}

function simular(tasa, devMensual, primaBase, puentesActivos, p = PARAMS) {
  const devAnual = (Math.pow(1 + devMensual / 100, 12) - 1) * 100;
  const pr = precios(tasa, devAnual, p);
  const necesidades = p.vencimientosNacion + p.bopreal;
  const brechaInicial = necesidades - p.fuentesProbables;          // 22.700
  const rendDolares = ((1 + tasa / 100) / (1 + devAnual / 100) - 1) * 100;

  let faltante = brechaInicial, salto = 0, prima = primaBase, dif = 0, dolarizacion = 0,
      ingresosFin = 0, cc = 0, mercado = 0, puentes = 0, mercadoIntlDisponible = true;
  for (let k = 0; k < 500; k++) {
    salto = Math.max(0, p.saltoPorAtraso * (-pr.tcr) + p.saltoPorFaltante * Math.max(0, faltante) / 1000);
    prima = primaBase + salto;
    dif = rendDolares - prima;
    dolarizacion = Math.max(0, p.dolarizacionBase - p.efectoDiferencial * dif + p.efectoIngreso * pr.salarioReal);
    ingresosFin = Math.max(0, p.ingresosFinBase + p.efectoFinanciero * dif);
    cc = p.cuentaCorrienteBase + p.efectoTCR * pr.tcr - p.efectoConsumo * (pr.consumo - 2);
    mercado = cc + ingresosFin - dolarizacion;
    mercadoIntlDisponible = prima <= p.primaMaxMercado;
    puentes = 0;
    for (const key of puentesActivos) {
      const b = PUENTES[key];
      if (b.condicional && !mercadoIntlDisponible) continue;
      puentes += b.monto;
    }
    const nuevo = brechaInicial - puentes - mercado;
    if (Math.abs(nuevo - faltante) < 1e-6) { faltante = nuevo; break; }
    faltante = 0.5 * faltante + 0.5 * nuevo;
  }
  return { devAnual, ...pr, rendDolares, salto, prima, diferencial: dif, dolarizacion, ingresosFin,
           cuentaCorriente: cc, dolaresMercado: mercado, puentes, mercadoIntlDisponible,
           necesidades, brechaInicial, faltante };
}

// Tasa mínima para "contener al dólar": que convenga quedarse en pesos (diferencial ≥ 0)
// y que el mercado de cambios deje de drenar reservas (dólares del mercado ≥ 0).
function contiene(r) { return r.diferencial >= 0 && r.dolaresMercado >= 0; }
function tasaDeDefensa(tasa, devMensual, primaBase, puentesActivos, p = PARAMS) {
  const r0 = simular(tasa, devMensual, primaBase, puentesActivos, p);
  if (contiene(r0)) return { necesaria: false, tasa, r: r0 };
  for (let i = Math.ceil(tasa); i <= 150; i++) {
    const r = simular(i, devMensual, primaBase, puentesActivos, p);
    if (contiene(r)) return { necesaria: true, tasa: i, r };
  }
  return { necesaria: true, tasa: null, r: simular(150, devMensual, primaBase, puentesActivos, p) };
}

const ESCENARIOS = {
  A: { nombre: "A. Expansión con apreciación", tasa: 20, dev: 0.8, puentes: ["locales", "repo"] },
  B: { nombre: "B. Corrección anticipada", tasa: 38, dev: 2.5, puentes: ["locales", "repo"] },
  C: { nombre: "C. Equilibrio precario", tasa: 30, dev: 1.4, puentes: ["caja", "locales", "repo", "swap", "mercado"] }
};

if (typeof module !== "undefined") module.exports = { simular, tasaDeDefensa, PARAMS, PUENTES, ESCENARIOS };
