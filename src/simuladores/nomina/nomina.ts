import {
  calcularLocomocion,
  calcularNomina,
  type DatosNomina,
  type LineaCuota,
  type ResultadoNomina,
} from "../../motor/nomina";
import { parametros2026 } from "../../parametros/2026";
import type { GrupoCotizacion } from "../../parametros/tipos";

// Simulador de nomina (procedemento ordinario do Rexime Xeral).
// Modo alumnado: escribe as tuas cifras e comproba cales estan ben.
// Modo docente: recibo resolto completo e xerador de supostos.
// Todos os calculos saen do motor; aqui so hai pantalla.

const euros = new Intl.NumberFormat("gl-ES", { style: "currency", currency: "EUR" });

const TRADUCIONS: Record<string, string> = {
  "Contingencias comunes": "Continxencias comúns",
  "Accidentes de trabajo y enfermedades profesionales": "Accidentes de traballo e enfermidades profesionais",
  Desempleo: "Desemprego",
  "Formacion profesional": "Formación profesional",
  "Horas extraordinarias de fuerza mayor": "Horas extraordinarias de forza maior",
  "Horas extraordinarias (no fuerza mayor)": "Horas extraordinarias (non forza maior)",
  FOGASA: "Fondo de Garantía Salarial (Fogasa)",
  MEI: "Mecanismo de equidade interxeracional (MEI)",
};

// [id, etiqueta, valor inicial]
const CAMPOS: [string, string, number][] = [
  ["grupo", "Grupo de cotización (1-11)", 5],
  ["dias", "Días do mes (só inflúe nos grupos 8 a 11, de base diaria)", 30],
  ["horasParcial", "Horas traballadas no mes (só a tempo parcial; deixa 0 se a xornada é completa)", 0],
  ["salarioBase", "Salario base (€)", 1500],
  ["complementos", "Complementos salariais (€)", 0],
  ["heResto", "Importe das horas extraordinarias que non son de forza maior (€)", 0],
  ["heForza", "Importe das horas extraordinarias de forza maior (€)", 0],
  ["numPagas", "Número de pagas extraordinarias ao ano", 2],
  ["importePaga", "Importe de cada paga extraordinaria (€)", 1500],
  ["km", "Quilómetros con vehículo propio", 0],
  ["prezoKm", "Importe aboado por km (€)", 0],
  ["atep", "Tipo de AT e EP (%)", 1.5],
  ["irpf", "Tipo de retención do IRPF (%)", 10],
];

// [clave, etiqueta, como obter o valor correcto]
const RESPOSTAS: [string, string, (r: ResultadoNomina) => number][] = [
  ["devengado", "Total devindicado", (r) => r.devengos.total],
  ["baseCc", "Base de continxencias comúns", (r) => r.bases.contingenciasComunes],
  ["baseCp", "Base de continxencias profesionais", (r) => r.bases.contingenciasProfesionales],
  ["baseIrpf", "Base suxeita a retención do IRPF", (r) => r.bases.irpf],
  ["achegas", "Total achegas da persoa traballadora", (r) => r.totalAportacionesTrabajador],
  ["retencion", "Retención do IRPF", (r) => r.retencionIrpf.importe],
  ["liquido", "Líquido a percibir", (r) => r.liquido],
  ["empresa", "Total achega da empresa", (r) => r.totalAportacionEmpresa],
  ["custo", "Custo total para a empresa", (r) => r.costeTotal],
];

// Pista que se mostra cando unha resposta esta mal. Sen cifras: orienta, non resolve.
const PISTAS: Record<string, string> = {
  devengado: "Suma todas as percepcións do mes. As pagas extraordinarias só entran aquí se están rateadas.",
  baseCc:
    "Lembra engadir o rateo das pagas extraordinarias, deixar fóra as horas extraordinarias e a parte exenta dos conceptos non salariais, e comprobar a base mínima e máxima do grupo.",
  baseCp:
    "Parte da base de continxencias comúns sen límites, suma as horas extraordinarias e comproba os topes mínimo e máximo.",
  baseIrpf: "É o total devindicado menos a parte exenta dos gastos de locomoción.",
  achegas:
    "Revisa cada cota: continxencias comúns, MEI, desemprego (o tipo depende do contrato), formación profesional e horas extraordinarias.",
  retencion: "Aplícase sobre a base suxeita a retención, non sobre as bases de cotización.",
  liquido: "Total devindicado menos total a deducir (achegas máis retención do IRPF).",
  empresa: "Non esquezas AT e EP, o Fogasa e o MEI a cargo da empresa.",
  custo: "Total devindicado máis a achega da empresa.",
};

// Le un importe escrito a man: acepta «1492,23», «1.492,23», «1492.23» e «1.492».
// Devolve NaN se non e un numero.
function lerImporte(texto: string): number {
  let t = texto.replace(/[\s€]/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return t === "" ? NaN : Number(t);
}

export function montarSimuladorNomina(raiz: HTMLElement): void {
  raiz.innerHTML = `
    <p><a href="#">← Volver aos simuladores</a></p>
    <h2>Simulador de nómina</h2>
    <p class="nota">Réxime Xeral, mes completo, parámetros de ${parametros2026.ejercicio}
      (${parametros2026.contingenciasComunes.fuente.split(",")[0]!.replace("Orden", "Orde")}).</p>
    <fieldset class="modo">
      <legend>Modo de uso</legend>
      <label><input type="radio" name="modo" value="alumnado" checked /> Modo alumnado</label>
      <label><input type="radio" name="modo" value="docente" /> Modo docente (mostra a solución)</label>
    </fieldset>
    <form id="datos" class="formulario">
      <h3>Datos do suposto</h3>
      ${CAMPOS.map(
        ([id, etiqueta, valor]) =>
          `<label>${etiqueta}<input id="${id}" type="number" step="any" min="0" value="${valor}" /></label>`,
      ).join("")}
      <label>Contrato
        <select id="contrato">
          <option value="indefinido">Indefinido</option>
          <option value="duracion_determinada">Duración determinada</option>
        </select>
      </label>
      <label class="casa"><input id="prorrateadas" type="checkbox" /> Pagas extraordinarias rateadas</label>
      <label class="casa"><input id="fogasa" type="checkbox" checked /> Cotiza ao Fogasa</label>
    </form>
    <p id="aviso" class="mal" role="status"></p>
    <section id="zona"></section>`;

  const zona = raiz.querySelector<HTMLElement>("#zona")!;
  const campo = (id: string) => raiz.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
  const numero = (id: string) => Number(campo(id).value.replace(",", ".")) || 0;
  const marcado = (id: string) => (campo(id) as HTMLInputElement).checked;
  const modo = () => raiz.querySelector<HTMLInputElement>('input[name="modo"]:checked')!.value;

  function calcular(): ResultadoNomina {
    const salariales = [{ concepto: "Salario base", importe: numero("salarioBase") }];
    if (numero("complementos") > 0) {
      salariales.push({ concepto: "Complementos salariais", importe: numero("complementos") });
    }
    const locomocion = calcularLocomocion(numero("km"), numero("prezoKm"), parametros2026);
    const datos: DatosNomina = {
      grupo: Math.min(11, Math.max(1, Math.round(numero("grupo")))) as GrupoCotizacion,
      diasPeriodo: numero("dias") || 30,
      contrato: campo("contrato").value as DatosNomina["contrato"],
      horasMesTiempoParcial: numero("horasParcial") > 0 ? numero("horasParcial") : undefined,
      percepcionesSalariales: salariales,
      horasExtraResto: numero("heResto"),
      horasExtraFuerzaMayor: numero("heForza"),
      pagasExtra: {
        numero: numero("numPagas"),
        importe: numero("importePaga"),
        prorrateadas: marcado("prorrateadas"),
      },
      percepcionesNoSalariales:
        locomocion.abonado > 0
          ? [{ concepto: "Gastos de locomoción", importe: locomocion.abonado, exento: locomocion.exento }]
          : [],
      tipoAtEp: numero("atep"),
      tipoIrpf: numero("irpf"),
      cotizaFogasa: marcado("fogasa"),
    };
    return calcularNomina(datos, parametros2026);
  }

  // Aviso cando a retribucion supera o tope maximo: o motor non calcula a
  // cotizacion adicional de solidariedade, asi que o resultado non seria correcto.
  function actualizarAviso(): void {
    const r = calcular();
    const supera = r.bases.contingenciasComunesSinLimites + r.devengos.horasExtra > r.bases.topeMaximo;
    raiz.querySelector("#aviso")!.textContent = supera
      ? `Aviso: a retribución supera o tope máximo de cotización (${euros.format(r.bases.topeMaximo)}). ` +
        "Este simulador non calcula a cotización adicional de solidariedade (art. 17 da Orde de cotización), " +
        "polo que o líquido e o custo para a empresa non son correctos neste caso."
      : "";
  }

  let comprobado = false;

  function pintarAlumnado(): void {
    comprobado = false;
    zona.innerHTML = `
      <h3>As túas respostas</h3>
      <p class="nota">Calcula a nómina no teu caderno ou folla de cálculo, escribe os resultados e comproba.</p>
      <p><button type="button" id="xerar">Novo suposto</button></p>
      <form id="respostas" class="formulario">
        ${RESPOSTAS.map(
          ([clave, etiqueta]) =>
            `<label>${etiqueta} (€)<input id="r-${clave}" inputmode="decimal" autocomplete="off" aria-describedby="v-${clave}" /><span id="v-${clave}"></span></label>`,
        ).join("")}
        <button type="submit">Comprobar</button>
      </form>
      <p id="resumo" class="nota" role="status"></p>`;
    zona.querySelector("#xerar")!.addEventListener("click", xerarSuposto);
    zona.querySelector("form")!.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const r = calcular();
      let acertos = 0;
      let baseMal = false;
      for (const [clave, , correcto] of RESPOSTAS) {
        const texto = zona.querySelector<HTMLInputElement>(`#r-${clave}`)!.value.trim();
        const marca = zona.querySelector<HTMLElement>(`#v-${clave}`)!;
        const valor = lerImporte(texto);
        const ben = !Number.isNaN(valor) && Math.abs(valor - correcto(r)) <= 0.011;
        if (ben) acertos += 1;
        else if (texto !== "" && clave.startsWith("base")) baseMal = true;
        marca.textContent =
          texto === ""
            ? "Sen resposta"
            : Number.isNaN(valor)
              ? "Escribe só o importe, con coma para os decimais (por exemplo, 1492,23)."
              : ben
                ? "✓ Correcto"
                : `✗ Revisa este cálculo. ${PISTAS[clave] ?? ""}`;
        marca.className = ben ? "ben" : "mal";
      }
      zona.querySelector("#resumo")!.textContent =
        `${acertos} de ${RESPOSTAS.length} respostas correctas.` +
        (baseMal
          ? " Se unha base está mal, as cotas que dependen dela tamén o estarán: corrixe primeiro as bases."
          : "");
      comprobado = true;
    });
  }

  // Ao cambiar os datos do suposto, a correccion anterior xa non vale.
  function limparCorreccion(): void {
    if (!comprobado) return;
    comprobado = false;
    for (const [clave] of RESPOSTAS) {
      const marca = zona.querySelector<HTMLElement>(`#v-${clave}`)!;
      marca.textContent = "";
      marca.className = "";
    }
    zona.querySelector("#resumo")!.textContent =
      "Cambiaches os datos do suposto. Volve comprobar as túas respostas.";
  }

  const fila = (etiqueta: string, importe: number) =>
    `<tr><td>${etiqueta}</td><td class="num">${euros.format(importe)}</td></tr>`;
  const filasCuota = (lineas: LineaCuota[]) =>
    lineas
      .map(
        (l) =>
          `<tr><td>${TRADUCIONS[l.concepto] ?? l.concepto}</td><td class="num">${euros.format(l.base)}</td>` +
          `<td class="num">${l.tipo.toLocaleString("gl-ES")} %</td><td class="num">${euros.format(l.importe)}</td></tr>`,
      )
      .join("");
  const CABECEIRA = "<tr><th>Concepto</th><th>Base</th><th>Tipo</th><th>Importe</th></tr>";

  function pintarDocente(): void {
    const r = calcular();
    zona.innerHTML = `
      <p><button type="button" id="xerar">Xerar suposto aleatorio</button></p>
      <h3>Devindicacións</h3>
      <table>
        ${fila("Percepcións salariais", r.devengos.salariales)}
        ${fila("Horas extraordinarias", r.devengos.horasExtra)}
        ${fila("Rateo de pagas extraordinarias aboado", r.devengos.prorrataPagasAbonada)}
        ${fila("Percepcións non salariais", r.devengos.noSalariales)}
        ${fila("<strong>A. Total devindicado</strong>", r.devengos.total)}
      </table>
      <h3>Determinación das bases</h3>
      <table>
        ${fila("Remuneración mensual", r.bases.remuneracionMensual)}
        ${fila("Rateo de pagas extraordinarias", r.bases.prorrataPagas)}
        ${fila("Exceso non exento de conceptos non salariais", r.bases.excesoNoExento)}
        ${fila("Comprobación: base mínima", r.bases.baseMinima)}
        ${fila("Comprobación: base máxima", r.bases.baseMaxima)}
        ${fila("<strong>Base de continxencias comúns</strong>", r.bases.contingenciasComunes)}
        ${fila("<strong>Base de continxencias profesionais</strong>", r.bases.contingenciasProfesionales)}
        ${fila("Base adicional de horas extraordinarias (forza maior)", r.bases.horasExtraFuerzaMayor)}
        ${fila("Base adicional de horas extraordinarias (resto)", r.bases.horasExtraResto)}
        ${fila("<strong>Base suxeita a retención do IRPF</strong>", r.bases.irpf)}
      </table>
      <h3>Deducións</h3>
      <table>
        ${CABECEIRA}
        ${filasCuota(r.deduccionesTrabajador)}
        <tr><td colspan="3">Total achegas</td><td class="num">${euros.format(r.totalAportacionesTrabajador)}</td></tr>
        ${filasCuota([{ ...r.retencionIrpf, concepto: "Retención do IRPF" }])}
        <tr><td colspan="3"><strong>B. Total a deducir</strong></td><td class="num">${euros.format(r.totalDeducir)}</td></tr>
        <tr><td colspan="3"><strong>Líquido a percibir (A − B)</strong></td><td class="num"><strong>${euros.format(r.liquido)}</strong></td></tr>
      </table>
      <h3>Achega da empresa</h3>
      <table>
        ${CABECEIRA}
        ${filasCuota(r.aportacionEmpresa)}
        <tr><td colspan="3">Total achega da empresa</td><td class="num">${euros.format(r.totalAportacionEmpresa)}</td></tr>
        <tr><td colspan="3"><strong>Custo total para a empresa</strong></td><td class="num"><strong>${euros.format(r.costeTotal)}</strong></td></tr>
      </table>`;
    zona.querySelector("#xerar")!.addEventListener("click", xerarSuposto);
  }

  function xerarSuposto(): void {
    const entre = (minimo: number, maximo: number, paso: number) =>
      minimo + Math.floor(Math.random() * ((maximo - minimo) / paso + 1)) * paso;
    const escoller = <T>(opcions: T[]) => opcions[Math.floor(Math.random() * opcions.length)]!;
    const salario = entre(1300, 2400, 10);
    const horas = escoller([0, 0, 4, 6, 8]);
    const km = escoller([0, 0, 100, 200, 300]);
    const valores: Record<string, number> = {
      grupo: entre(1, 11, 1),
      dias: 30,
      horasParcial: 0,
      salarioBase: salario,
      complementos: escoller([0, 60, 150, 320]),
      heResto: horas * escoller([12, 14.5, 16]),
      heForza: 0,
      numPagas: 2,
      importePaga: salario,
      km,
      prezoKm: km > 0 ? escoller([parametros2026.locomocionExentaKm.valor, 0.3, 0.36]) : 0,
      atep: escoller([1.5, 1.9, 3.1]),
      irpf: escoller([2, 8, 9, 12, 15]),
    };
    for (const [id, valor] of Object.entries(valores)) campo(id).value = String(valor);
    campo("contrato").value = escoller(["indefinido", "duracion_determinada"]);
    (campo("prorrateadas") as HTMLInputElement).checked = escoller([false, false, true]);
    pintar();
  }

  function pintar(): void {
    actualizarAviso();
    if (modo() === "docente") pintarDocente();
    else pintarAlumnado();
  }

  raiz.querySelectorAll('input[name="modo"]').forEach((radio) => radio.addEventListener("change", pintar));
  raiz.querySelector("#datos")!.addEventListener("input", () => {
    actualizarAviso();
    if (modo() === "docente") pintarDocente();
    else limparCorreccion();
  });
  pintar();
}
