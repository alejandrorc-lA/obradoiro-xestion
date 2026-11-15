import { montarSimuladorNomina } from "./simuladores/nomina/nomina";

// Portada e navegacion. Cada simulador novo engadese a esta lista; os que
// tenen "montar" abrense en #ruta.
interface FichaSimulador {
  ruta: string;
  titulo: string;
  descricion: string;
  montar?: (raiz: HTMLElement) => void;
}

const simuladores: FichaSimulador[] = [
  { ruta: "nomina", titulo: "Nómina", descricion: "Calcula un recibo de salarios paso a paso.", montar: montarSimuladorNomina },
  { ruta: "irpf", titulo: "IRPF", descricion: "Tipo de retención e cota." },
  { ruta: "cotizacions", titulo: "Cotizacións", descricion: "Bases e cotas á Seguridade Social." },
  { ruta: "asentos", titulo: "Asentos contables", descricion: "Constrúe asentos no libro diario." },
  { ruta: "amortizacion", titulo: "Amortización", descricion: "Cadros de amortización." },
  { ruta: "punto-morto", titulo: "Punto morto", descricion: "Limiar de rendibilidade." },
];

const app = document.querySelector<HTMLElement>("#app")!;

function pintarPortada(): void {
  app.textContent = "";
  const lista = document.createElement("ul");
  lista.className = "simuladores";
  for (const s of simuladores) {
    const item = document.createElement("li");
    const titulo = document.createElement("h2");
    titulo.textContent = s.titulo;
    const descricion = document.createElement("p");
    descricion.textContent = s.descricion;
    item.append(titulo, descricion);
    if (s.montar) {
      const ligazon = document.createElement("a");
      ligazon.href = `#${s.ruta}`;
      ligazon.textContent = "Abrir simulador";
      item.append(ligazon);
    } else {
      const estado = document.createElement("span");
      estado.textContent = "En preparación";
      item.append(estado);
    }
    lista.append(item);
  }
  app.append(lista);
}

function navegar(): void {
  const ruta = location.hash.slice(1);
  const simulador = simuladores.find((s) => s.ruta === ruta && s.montar);
  if (simulador?.montar) simulador.montar(app);
  else pintarPortada();
}

window.addEventListener("hashchange", navegar);
navegar();
