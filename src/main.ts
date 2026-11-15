// Portada: lista de simuladores. Cada simulador novo engádese a esta lista.
interface FichaSimulador {
  titulo: string;
  descricion: string;
  dispoñible: boolean;
}

const simuladores: FichaSimulador[] = [
  { titulo: "Nómina", descricion: "Calcula un recibo de salarios paso a paso.", dispoñible: false },
  { titulo: "IRPF", descricion: "Tipo de retención e cota.", dispoñible: false },
  { titulo: "Cotizacións", descricion: "Bases e cotas á Seguridade Social.", dispoñible: false },
  { titulo: "Asentos contables", descricion: "Constrúe asentos no libro diario.", dispoñible: false },
  { titulo: "Amortización", descricion: "Cadros de amortización.", dispoñible: false },
  { titulo: "Punto morto", descricion: "Limiar de rendibilidade.", dispoñible: false },
];

const app = document.querySelector<HTMLElement>("#app");

if (app) {
  const lista = document.createElement("ul");
  lista.className = "simuladores";
  for (const s of simuladores) {
    const item = document.createElement("li");
    const titulo = document.createElement("h2");
    titulo.textContent = s.titulo;
    const descricion = document.createElement("p");
    descricion.textContent = s.descricion;
    const estado = document.createElement("span");
    estado.textContent = s.dispoñible ? "Dispoñible" : "En preparación";
    item.append(titulo, descricion, estado);
    lista.append(item);
  }
  app.append(lista);
}
