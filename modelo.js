// Modelo estilizado del dilema de política económica 2027 (Argentina).
// Fines didácticos: los parámetros son ilustrativos, no estimados.
// Todas las tasas en % anual salvo el ritmo devaluatorio mensual.

const PARAMS = {
  inercia: 18,        // inflación inercial anual (%), cerca de la meta del Presupuesto 2027
  alfa: 0.4,          // peso de los transables en la canasta
  piExt: 2.5,         // inflación internacional (%)
  tasaNeutral: 5,     // tasa real neutral (%)
  gamma: 0.3,         // sensibilidad de la demanda a la tasa real
  kappa: 1.2,         // sensibilidad de la inflación de no transables a la demanda
  indexacion: 0.5,    // peso de la inflación corriente en los salarios
  thetaSalario: 0.8,  // efecto de la demanda sobre los salarios
  consumoBase: 1.5,   // crecimiento del consumo sin impulsos (%)
  // Sector externo (millones de USD)
  saldoComercialBase: 9000,  // bienes y servicios con tipo de cambio real estable y consumo +2%
  efectoTCR: 400,            // USD M por punto de variación del tipo de cambio real
  efectoConsumo: 500,        // USD M por punto de consumo por encima de 2%
  atesoramientoBase: 5000,   // compra de dólares para ahorro de personas
  efectoArbitraje: 300,      // USD M por punto de (prima de riesgo − rendimiento en dólares)
  efectoIngreso: 250,        // USD M por punto de salario real
  sensibAtraso: 1.2,         // suba de la prima de riesgo por punto de apreciación real
  ingresosFinancieros: 6000, // inversión directa y deuda corporativa (con tipo de cambio estable)
  efectoFinanciero: 150,     // USD M por punto de rendimiento en dólares por encima de la prima
  // Necesidades 2027 (millones de USD)
  vencimientosTesoro: 25400, // bonos, Fondo Monetario Internacional y otros organismos (LCG)
  bopreal: 4000,             // Bonos para la Reconstrucción de una Argentina Libre (Banco Central)
  fuentesSeguras: 7700       // desembolsos del Fondo, refinanciación de organismos y sector público
};

const PUENTES = {
  bonares:  { nombre: "Bonares en el mercado local", monto: 5000 },
  repo:     { nombre: "Repo con bancos internacionales", monto: 2000 },
  swap:     { nombre: "Uso de swaps (Estados Unidos, China)", monto: 3000 },
  privat:   { nombre: "Privatizaciones", monto: 1500 },
  mercado:  { nombre: "Emisión en el mercado internacional", monto: 5000 }
};

function simular(tasa, devMensual, primaBase, puentesActivos, p = PARAMS) {
  const devAnual = (Math.pow(1 + devMensual / 100, 12) - 1) * 100;
  let infl = p.inercia, brecha = 0, piN = p.inercia, tasaReal = 0;
  for (let k = 0; k < 200; k++) {
    tasaReal = ((1 + tasa / 100) / (1 + infl / 100) - 1) * 100;
    brecha = -p.gamma * (tasaReal - p.tasaNeutral);
    piN = p.inercia + p.kappa * brecha;
    const nueva = p.alfa * devAnual + (1 - p.alfa) * piN;
    if (Math.abs(nueva - infl) < 1e-9) { infl = nueva; break; }
    infl = 0.5 * infl + 0.5 * nueva;
  }
  const salarioNominal = p.indexacion * infl + (1 - p.indexacion) * p.inercia + p.thetaSalario * brecha;
  const salarioReal = ((1 + salarioNominal / 100) / (1 + infl / 100) - 1) * 100;
  const consumo = p.consumoBase + 0.6 * salarioReal + 0.5 * brecha;
  const tcr = ((1 + devAnual / 100) * (1 + p.piExt / 100) / (1 + infl / 100) - 1) * 100;

  const rendDolares = ((1 + tasa / 100) / (1 + devAnual / 100) - 1) * 100;
  const prima = Math.max(0, primaBase + p.sensibAtraso * (-tcr));
  const diferencial = rendDolares - prima;

  const saldoComercial = p.saldoComercialBase + p.efectoTCR * tcr - p.efectoConsumo * (consumo - 2);
  const atesoramiento = Math.max(0, p.atesoramientoBase - p.efectoArbitraje * diferencial + p.efectoIngreso * salarioReal);
  const ingresosFin = Math.max(0, p.ingresosFinancieros + p.efectoFinanciero * diferencial);
  const dolaresMercado = saldoComercial - atesoramiento + ingresosFin;

  let puentes = 0;
  for (const k of puentesActivos) puentes += PUENTES[k].monto;
  const necesidades = p.vencimientosTesoro + p.bopreal;
  const faltante = necesidades - p.fuentesSeguras - puentes - Math.max(0, dolaresMercado);

  return { devAnual, infl, tasaReal, brecha, salarioReal, consumo, tcr, rendDolares, prima,
           diferencial, saldoComercial, atesoramiento, ingresosFin, dolaresMercado, puentes,
           necesidades, faltante };
}

const ESCENARIOS = {
  A: { nombre: "A. Priorizar consumo", tasa: 15, dev: 0.5, puentes: ["repo", "swap"] },
  B: { nombre: "B. Frenar la dolarización", tasa: 38, dev: 2.5, puentes: [] },
  C: { nombre: "Intermedio", tasa: 26, dev: 1.4, puentes: ["repo"] }
};

if (typeof module !== "undefined") module.exports = { simular, PARAMS, PUENTES, ESCENARIOS };
