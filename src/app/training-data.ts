export type Exercise = {
  slug: string;
  title: string;
  muscle: string;
  videoUrl: string;
  tips: string[];
  series?: string;
  reps?: string;
  description?: string;
};

export type TrainingDayDef = {
  id: number;
  title: string;
  overview?: string;
  groups: Array<{ exerciseA: string; exerciseB?: string; prescription: string }>;
  cardio?: { title: string; prescription: string };
};

export const exercises: Exercise[] = [
  {
    slug: "leg-press-maquina",
    title: "Leg Press • Máquina",
    muscle: "Quadríceps/Glúteos",
    videoUrl: "https://www.youtube.com/embed/1eG6wHf6c8E",
    tips: ["Ajuste a plataforma para amplitude confortável", "Mantenha joelhos alinhados aos pés"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "agachamento-livre",
    title: "Agachamento Livre",
    muscle: "Quadríceps/Glúteos",
    videoUrl: "https://www.youtube.com/embed/rD7XxQm7Z9c",
    tips: ["Pés na largura dos ombros", "Coluna neutra durante todo o movimento"],
    series: "3x",
    reps: "10–12",
  },
  {
    slug: "avanco",
    title: "Avanço",
    muscle: "Quadríceps/Glúteos",
    videoUrl: "https://www.youtube.com/embed/CqvJkQyH9e4",
    tips: ["Passada longa, joelho não ultrapassa a ponta do pé", "Tronco estável"],
    series: "3x",
    reps: "12–15",
  },
  {
    slug: "terra-romeno",
    title: "Levantamento Terra Romeno",
    muscle: "Posterior de coxa/Glúteos",
    videoUrl: "https://www.youtube.com/embed/9FMEQXoL1sI",
    tips: ["Quadril para trás, barra próxima às pernas", "Não arredondar a coluna"],
    series: "3x",
    reps: "10–12",
  },
  {
    slug: "barra-fixa-assistida",
    title: "Barra Fixa Assistida",
    muscle: "Dorsal/Bíceps",
    videoUrl: "https://www.youtube.com/embed/7YV9hIYpOew",
    tips: ["Ative escápulas antes de puxar", "Queixo acima da barra"],
    series: "3x",
    reps: "8–12",
  },
  {
    slug: "remada-baixa",
    title: "Remada Baixa",
    muscle: "Dorsal/Bíceps",
    videoUrl: "https://www.youtube.com/embed/DmWjzYV6V6o",
    tips: ["Cotovelos próximos ao corpo", "Evite balançar o tronco"],
    series: "3x",
    reps: "12–15",
  },
  {
    slug: "supino-inclinado-halteres",
    title: "Supino Inclinado com Halteres",
    muscle: "Peito/Tríceps",
    videoUrl: "https://www.youtube.com/embed/qN8O4t8jsLA",
    tips: ["Ângulo do banco ~30°", "Controle na descida, amplitude confortável"],
    series: "3x",
    reps: "10–12",
  },
  {
    slug: "elevacao-lateral",
    title: "Elevação Lateral",
    muscle: "Ombros",
    videoUrl: "https://www.youtube.com/embed/3AK0JzQmWLM",
    tips: ["Cotovelos levemente flexionados", "Suba até linha dos ombros"],
    series: "3x",
    reps: "12–15",
  },
  {
    slug: "prancha",
    title: "Prancha",
    muscle: "Abdômen/Core",
    videoUrl: "https://www.youtube.com/embed/HjQp98u3N2I",
    tips: ["Alinhe ombros e quadris", "Ative o core e respire controlando"],
    series: "3x",
    reps: "30–60s",
  },
  {
    slug: "agachamento-taca",
    title: "Agachamento Taça",
    muscle: "Quadríceps/Glúteos",
    videoUrl: "https://www.youtube.com/embed/cQd_3QvFVAw",
    tips: ["Segure o peso junto ao peito", "Desça mantendo coluna neutra"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "cadeira-extensora",
    title: "Cadeira Extensora",
    muscle: "Quadríceps",
    videoUrl: "https://www.youtube.com/embed/ENsXkbiAjPE",
    tips: ["Controle o retorno", "Evite travar os joelhos"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "afundo",
    title: "Afundo",
    muscle: "Quadríceps/Glúteos",
    videoUrl: "https://www.youtube.com/embed/ZKXq3wRc5bM",
    tips: ["Passo longo para ativar glúteos", "Joelho de trás próximo ao chão"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "mesa-flexora",
    title: "Mesa Flexora",
    muscle: "Isquiotibiais",
    videoUrl: "https://www.youtube.com/embed/5uYgKk7q3K0",
    tips: ["Ajuste para alinhar o eixo ao joelho", "Contraia bem na fase final"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "cadeira-flexora",
    title: "Cadeira Flexora",
    muscle: "Isquiotibiais",
    videoUrl: "https://www.youtube.com/embed/0fS6tGqHn8E",
    tips: ["Controle a descida", "Evite impulsos"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "puxada-frontal-maquina",
    title: "Puxada Frontal • Máquina",
    muscle: "Dorsal/Bíceps",
    videoUrl: "https://www.youtube.com/embed/iQ287rO4F3g",
    tips: ["Cotovelos apontando para baixo", "Não balance o tronco"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "remada-curvada-serrote",
    title: "Remada Curvada (Serrote)",
    muscle: "Dorsal/Bíceps",
    videoUrl: "https://www.youtube.com/embed/hzGqQq3bZ7A",
    tips: ["Estabilize o tronco", "Puxe com o cotovelo junto ao corpo"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "supino-maquina",
    title: "Supino • Máquina",
    muscle: "Peito/Tríceps",
    videoUrl: "https://www.youtube.com/embed/8pP8o_fTQ7w",
    tips: ["Ajuste o banco para a linha de peito", "Controle a descida"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "supino-reto-halteres",
    title: "Supino Reto com Halteres",
    muscle: "Peito/Tríceps",
    videoUrl: "https://www.youtube.com/embed/1pJt7lQZPss",
    tips: ["Punhos neutros", "Amplitude segura sem hiperextensão"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "desenvolvimento-maquina",
    title: "Desenvolvimento • Máquina",
    muscle: "Ombros/Tríceps",
    videoUrl: "https://www.youtube.com/embed/3pIYq8F5TzE",
    tips: ["Cotovelos levemente à frente", "Não trave os cotovelos no topo"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "desenvolvimento-halteres",
    title: "Desenvolvimento com Halteres",
    muscle: "Ombros/Tríceps",
    videoUrl: "https://www.youtube.com/embed/OmnH1kQ3q4w",
    tips: ["Postura firme", "Controle na subida e na descida"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "abdominal-maquina",
    title: "Abdominal • Máquina",
    muscle: "Abdômen",
    videoUrl: "https://www.youtube.com/embed/Hv1uVJx1qj8",
    tips: ["Respire soltando o ar na contração", "Evite puxar com o pescoço"],
    series: "3x",
    reps: "15–20",
  },
  {
    slug: "abdominal-solo",
    title: "Abdominal no Solo",
    muscle: "Abdômen",
    videoUrl: "https://www.youtube.com/embed/1B5Pj2u8kJQ",
    tips: ["Ative o core", "Movimento curto e controlado"],
    series: "3x",
    reps: "15–20",
  },
];

export const trainingDaysDef: TrainingDayDef[] = [
  {
    id: 1,
    title: "Dia 1 • Full Body",
    overview: "Alternar entre opções do mesmo músculo. Escolha uma por bloco.",
    groups: [
      { exerciseA: "leg-press-maquina", exerciseB: "agachamento-taca", prescription: "3x • 15–20" },
      { exerciseA: "cadeira-extensora", exerciseB: "afundo", prescription: "3x • 15–20" },
      { exerciseA: "mesa-flexora", exerciseB: "cadeira-flexora", prescription: "3x • 15–20" },
      { exerciseA: "puxada-frontal-maquina", exerciseB: "remada-curvada-serrote", prescription: "3x • 15–20" },
      { exerciseA: "supino-maquina", exerciseB: "supino-reto-halteres", prescription: "3x • 15–20" },
      { exerciseA: "desenvolvimento-maquina", exerciseB: "desenvolvimento-halteres", prescription: "3x • 15–20" },
      { exerciseA: "abdominal-maquina", exerciseB: "abdominal-solo", prescription: "3x • 15–20" },
    ],
    cardio: { title: "Cardio Leve", prescription: "15 minutos" },
  },
  {
    id: 2,
    title: "Dia 3 • Upper/Lower Alternado",
    overview: "Siga os pares; escolha uma opção por bloco.",
    groups: [
      { exerciseA: "agachamento-livre", exerciseB: "avanco", prescription: "3x • 10–15" },
      { exerciseA: "terra-romeno", exerciseB: "mesa-flexora", prescription: "3x • 10–15" },
      { exerciseA: "barra-fixa-assistida", exerciseB: "remada-baixa", prescription: "3x • 8–15" },
      { exerciseA: "supino-inclinado-halteres", exerciseB: "supino-maquina", prescription: "3x • 10–12" },
      { exerciseA: "elevacao-lateral", exerciseB: "desenvolvimento-halteres", prescription: "3x • 12–15" },
      { exerciseA: "prancha", exerciseB: "abdominal-solo", prescription: "3x • 30–60s" },
    ],
    cardio: { title: "Cardio Moderado", prescription: "20 minutos" },
  },
];

export const getExercise = (slug: string) => exercises.find(e => e.slug === slug);
export const getTrainingDay = (id: number) => trainingDaysDef.find(d => d.id === id);
