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
};

// [id, etiqueta, valor inicial]
const CAMPOS: [string, string, number][] = [
  ["grupo", "Grupo de cotización (1-11)", 5],
  ["dias", "Días do período", 30],
  ["horasParcial", "Horas do mes (só tempo parcial; 0 = xornada completa)", 0],
  ["salarioBase", "Salario base (€)", 1500],
  ["complementos", "Complementos salariais (€)", 0],
  ["heResto", "Horas extra, non forza maior (€)", 0],
  ["heForza", "Horas extra de forza maior (€)", 0],
  ["numPagas", "Número de pagas extra ao ano", 2],
  ["importePaga", "Importe de cada paga extra (€)", 1500],
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
  ["baseIrpf", "Base suxeita a IRPF", (r) => r.bases.irpf],
  ["achegas", "Total achegas da persoa traballadora", (r) => r.totalAportacionesTrabajador],
  ["retencion", "Retención do IRPF", (r) => r.retencionIrpf.importe],
  ["liquido", "Líquido a percibir", (r) => r.liquido],
  ["empresa", "Total achega da empresa", (r) => r.totalAportacionEmpresa],
  ["custo", "Custo total para a empresa", (r) => r.costeTotal],
];

export function montarSimuladorNomina(raiz: HTMLElement): void {
  raiz.innerHTML = `
    <p><a href="#">← Volver aos simuladores</a></p>
    <h2>Simulador de nómina</h2>
    <p class="nota">Réxime Xeral, mes completo, parámetros de ${parametros2026.ejercicio}
      (${parametros2026.contingenciasComunes.fuente.split(",")[0]}).</p>
    <fieldset class="modo">
      <label><input type="radio" name="modo" value="alumnado" checked /> Modo alumnado</label>
      <label><input type="radio" name="modo" value="docente" /> Modo docente</label>
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
      <label class="casa"><input id="prorrateadas" type="checkbox" /> Pagas extra rateadas</label>
      <label class="casa"><input id="fogasa" type="checkbox" checked /> Cotiza a FOGASA</label>
    </form>
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
          ? [{ concepto: "Axudas de locomoción", importe: locomocion.abonado, exento: locomocion.exento }]
          : [],
      tipoAtEp: numero("atep"),
      tipoIrpf: numero("irpf"),
      cotizaFogasa: marcado("fogasa"),
    };
    return calcularNomina(datos, parametros2026);
  }

  function pintarAlumnado(): void {
    zona.innerHTML = `
      <h3>As túas respostas</h3>
      <p class="nota">Calcula a nómina no teu caderno ou folla de cálculo, escribe os resultados e comproba.</p>
      <form id="respostas" class="formulario">
        ${RESPOSTAS.map(
          ([clave, etiqueta]) =>
            `<label>${etiqueta} (€)<input id="r-${clave}" inputmode="decimal" autocomplete="off" /><span id="v-${clave}"></span></label>`,
        ).join("")}
        <button type="submit">Comprobar</button>
      </form>
      <p id="resumo" class="nota"></p>`;
    zona.querySelector("form")!.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const r = calcular();
      let acertos = 0;
      for (const [clave, , correcto] of RESPOSTAS) {
        const texto = zona.querySelector<HTMLInputElement>(`#r-${clave}`)!.value.trim().replace(",", ".");
        const marca = zona.querySelector<HTMLElement>(`#v-${clave}`)!;
        const ben = texto !== "" && Math.abs(Number(texto) - correcto(r)) <= 0.011;
        if (ben) acertos += 1;
        marca.textContent = texto === "" ? "Sen resposta" : ben ? "✓ Correcto" : "✗ Revisa este cálculo";
        marca.className = ben ? "ben" : "mal";
      }
      zona.querySelector("#resumo")!.textContent = `${acertos} de ${RESPOSTAS.length} respostas correctas.`;
    });
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
        ${fila("Rateo de pagas extra aboado", r.devengos.prorrataPagasAbonada)}
        ${fila("Percepcións non salariais", r.devengos.noSalariales)}
        ${fila("<strong>A. Total devindicado</strong>", r.devengos.total)}
      </table>
      <h3>Determinación das bases</h3>
      <table>
        ${fila("Remuneración mensual", r.bases.remuneracionMensual)}
        ${fila("Rateo de pagas extra", r.bases.prorrataPagas)}
        ${fila("Exceso non exento de conceptos non salariais", r.bases.excesoNoExento)}
        ${fila("Comprobación: base mínima", r.bases.baseMinima)}
        ${fila("Comprobación: base máxima", r.bases.baseMaxima)}
        ${fila("<strong>Base de continxencias comúns</strong>", r.bases.contingenciasComunes)}
        ${fila("<strong>Base de continxencias profesionais</strong>", r.bases.contingenciasProfesionales)}
        ${fila("Base adicional de horas extra (forza maior)", r.bases.horasExtraFuerzaMayor)}
        ${fila("Base adicional de horas extra (resto)", r.bases.horasExtraResto)}
        ${fila("<strong>Base suxeita a IRPF</strong>", r.bases.irpf)}
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
        <tr><td colspan="3">Total achega empresarial</td><td class="num">${euros.format(r.totalAportacionEmpresa)}</td></tr>
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
      prezoKm: km > 0 ? escoller([0.26, 0.3, 0.36]) : 0,
      atep: escoller([1.5, 1.9, 3.1]),
      irpf: escoller([2, 8, 9, 12, 15]),
    };
    for (const [id, valor] of Object.entries(valores)) campo(id).value = String(valor);
    campo("contrato").value = escoller(["indefinido", "duracion_determinada"]);
    (campo("prorrateadas") as HTMLInputElement).checked = escoller([false, false, true]);
    pintar();
  }

  function pintar(): void {
    if (modo() === "docente") pintarDocente();
    else pintarAlumnado();
  }

  raiz.querySelectorAll('input[name="modo"]').forEach((radio) => radio.addEventListener("change", pintar));
  raiz.querySelector("#datos")!.addEventListener("input", () => {
    if (modo() === "docente") pintarDocente();
  });
  pintar();
}
