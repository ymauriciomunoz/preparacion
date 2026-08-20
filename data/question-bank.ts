import type { Question, ReadingStimulus } from "@/types/exam";
import { additionalLogicalQuestions } from "./additional-logical-questions";
import { additionalReadingQuestions, additionalReadingStimuli } from "./additional-reading-bank";

const baseReadingStimuli: ReadingStimulus[] = [
  {
    id: "texto-ciudad-sombra",
    kicker: "Texto 1 · Divulgación urbana",
    title: "La sombra también es infraestructura",
    body: [
      "Durante décadas, muchas ciudades midieron la calidad de sus calles por la velocidad con que circulaban los vehículos. Hoy, frente al aumento de la temperatura, algunos urbanistas proponen otra medida: la cantidad de trayectos que una persona puede recorrer protegida del sol.",
      "Los árboles no reemplazan las redes de transporte ni los servicios públicos, pero cumplen una función semejante a la infraestructura: hacen posible permanecer en el espacio público. Una calle sombreada no solo se siente más fresca; también invita a caminar, esperar el bus y conversar. Por eso, sembrar árboles sin estudiar sus especies, raíces y necesidad de agua puede producir una solución frágil. La sombra útil no nace de una campaña aislada, sino de un cuidado sostenido.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-error-ciencia",
    kicker: "Texto 2 · Ensayo breve",
    title: "El valor del error",
    body: [
      "En la ciencia, un resultado inesperado no siempre es un fracaso. Puede indicar que el instrumento fue usado de manera incorrecta, pero también que la explicación inicial era insuficiente. La diferencia entre ambos casos no se descubre ocultando el error, sino describiéndolo con precisión.",
      "Esta actitud exige algo difícil: separar la autoestima de la hipótesis. Si una idea se vuelve parte de la identidad de quien investiga, cualquier evidencia contraria parece un ataque personal. En cambio, cuando la hipótesis se entiende como una herramienta provisional, corregirla no disminuye a su autor; mejora el conocimiento disponible.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-biblioteca",
    kicker: "Texto 3 · Crónica",
    title: "La biblioteca de las seis",
    body: [
      "A las seis de la tarde la biblioteca cambia de público. Se van algunos estudiantes y llegan comerciantes del barrio, jóvenes que buscan conexión a internet y adultos mayores que hojean la prensa. El edificio es el mismo, pero sus usos se multiplican.",
      "Clara, la bibliotecaria, dice que su trabajo empieza cuando alguien entra sin saber qué libro busca. No le entrega de inmediato un título: primero pregunta qué problema intenta resolver o qué curiosidad lo llevó hasta allí. Para ella, recomendar no consiste en adivinar gustos, sino en escuchar hasta que la pregunta escondida consigue formularse.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-memoria",
    kicker: "Texto 4 · Divulgación científica",
    title: "Recordar no es reproducir",
    body: [
      "La memoria no funciona como una grabación que se reproduce sin cambios. Cada recuerdo es una reconstrucción: combina rastros del hecho original con conocimientos posteriores, emociones y expectativas presentes.",
      "Esto no significa que todos los recuerdos sean falsos. Significa que recordar es una actividad. Dos personas pueden ofrecer relatos sinceros y distintos del mismo acontecimiento porque atendieron a elementos diferentes y porque, al evocarlo, lo organizaron desde perspectivas propias. Reconocer ese carácter reconstructivo aconseja prudencia, no desconfianza absoluta.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-polinizadores",
    kicker: "Texto 5 · Informe ambiental",
    title: "Un jardín pequeño, una red extensa",
    body: [
      "En un seguimiento de doce semanas, un grupo escolar registró las visitas de insectos a tres jardines del barrio. El jardín con más especies de flores recibió la mayor variedad de polinizadores, aunque no tenía la mayor superficie.",
      "El resultado sugiere que el tamaño no es el único factor relevante. La presencia de flores en distintas épocas y la ausencia de ciertos pesticidas también pueden convertir un espacio reducido en una estación útil dentro de una red ecológica mayor. Los datos, sin embargo, no permiten afirmar que la diversidad floral sea la única causa: los jardines también diferían en sombra, humedad y cercanía a zonas verdes.",
    ],
    source: "Texto y datos originales para este simulador.",
    visual: {
      type: "table",
      title: "Registro de jardines",
      headers: ["Jardín", "Área", "Especies de flores", "Tipos de polinizador"],
      rows: [
        ["A", "90 m²", "4", "6"],
        ["B", "55 m²", "9", "13"],
        ["C", "120 m²", "6", "9"],
      ],
    },
  },
  {
    id: "texto-mapa",
    kicker: "Texto 6 · Columna de opinión",
    title: "El mapa y el camino",
    body: [
      "Un mapa selecciona. Si mostrara cada piedra, cada ventana y cada conversación, dejaría de orientarnos. Su utilidad depende tanto de lo que incluye como de lo que omite.",
      "Con las estadísticas ocurre algo parecido. Resumir miles de experiencias en un promedio permite reconocer tendencias, pero puede ocultar diferencias decisivas. El problema no está en usar mapas o promedios, sino en confundirlos con el territorio completo. Una cifra bien calculada todavía necesita una pregunta bien formulada.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-silencio",
    kicker: "Texto 7 · Relato breve",
    title: "La radio apagada",
    body: [
      "Durante treinta años, don Julián abrió el taller y encendió la radio antes de levantar la persiana. Aquella mañana hizo lo contrario: dejó entrar la luz, ordenó las herramientas y mantuvo el aparato en silencio.",
      "A media mañana llegó su hija. No preguntó por la radio. Puso sobre la mesa dos vasos de café y comenzó a etiquetar las cajas. Trabajaron hasta el mediodía sin mencionar el letrero de «Se arrienda» que esperaba, enrollado, junto a la puerta.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-algoritmo",
    kicker: "Texto 8 · Tecnología y sociedad",
    title: "Recomendaciones que también enseñan",
    body: [
      "Cuando una plataforma recomienda una canción, no solo intenta predecir lo que una persona disfrutará. También modifica lo que esa persona tendrá oportunidad de conocer. La recomendación describe un gusto pasado y, al mismo tiempo, participa en la formación del gusto futuro.",
      "Por eso, evaluar estos sistemas únicamente por el número de clics es insuficiente. Un algoritmo que repite opciones muy parecidas puede acertar con frecuencia y, sin embargo, reducir la diversidad de la experiencia. Incluir hallazgos inesperados quizá disminuya algunos clics inmediatos, pero puede ampliar el repertorio del usuario a largo plazo.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-agua",
    kicker: "Texto 9 · Comunicado comunitario",
    title: "Medir antes de regar",
    body: [
      "La huerta comunitaria instaló un medidor sencillo de humedad. Antes, cada voluntario regaba según la apariencia de la superficie. Ahora se revisa el suelo a diez centímetros de profundidad y se registra el consumo semanal.",
      "En el primer mes se usó menos agua y ninguna planta mostró señales de marchitez. El comité decidió mantener el sistema durante la temporada seca antes de adoptar una conclusión definitiva. La reducción observada es prometedora, pero un mes lluvioso no representa todas las condiciones del año.",
    ],
    source: "Texto original para este simulador.",
  },
  {
    id: "texto-velocidad",
    kicker: "Texto 10 · Reflexión",
    title: "La prisa y la precisión",
    body: [
      "Resolver rápido y resolver bien no son capacidades opuestas. La práctica puede volver ágiles operaciones que antes exigían mucha atención. Sin embargo, la velocidad deja de ser una ventaja cuando impide reconocer qué problema se está resolviendo.",
      "En una prueba con tiempo limitado conviene distinguir dos pausas. La pausa que nace de no saber cómo continuar consume tiempo sin orientar. La pausa deliberada, en cambio, verifica datos, descarta una interpretación precipitada y puede evitar varios minutos de corrección. Aprender a pausar también es aprender a avanzar.",
    ],
    source: "Texto original para este simulador.",
  },
];

export const readingStimuli: ReadingStimulus[] = [
  ...baseReadingStimuli,
  ...additionalReadingStimuli,
];

const logicalQuestions: Question[] = [
  {
    id: "rl-001", competency: "Razonamiento lógico", category: "Aritmética", skill: "Porcentajes", difficulty: "Básica",
    stem: "Una guía cuesta $80.000 y tiene un descuento del 15 %. ¿Cuál es el precio final?",
    options: ["$12.000", "$65.000", "$68.000", "$72.000"], correctOption: 2,
    explanation: "El 15 % de $80.000 es $12.000. Al restarlo, el precio final es $68.000.",
  },
  {
    id: "rl-002", competency: "Razonamiento lógico", category: "Aritmética", skill: "Razones", difficulty: "Básica",
    stem: "En un grupo, la razón entre estudiantes que eligieron matemáticas y quienes eligieron lectura es 3:5. Si 24 eligieron matemáticas, ¿cuántos eligieron lectura?",
    options: ["32", "36", "40", "45"], correctOption: 2,
    explanation: "Si 3 partes equivalen a 24, cada parte vale 8. Entonces 5 partes equivalen a 40.",
  },
  {
    id: "rl-003", competency: "Razonamiento lógico", category: "Aritmética", skill: "Fracciones", difficulty: "Básica",
    stem: "De un tanque lleno se consume primero 1/4 de su contenido y luego 1/3 de lo que quedaba. ¿Qué fracción del contenido inicial permanece?",
    options: ["1/4", "1/3", "1/2", "2/3"], correctOption: 2,
    explanation: "Tras consumir 1/4 queda 3/4. Se conserva 2/3 de ese resto: (3/4)(2/3) = 1/2.",
  },
  {
    id: "rl-004", competency: "Razonamiento lógico", category: "Estadística", skill: "Promedio", difficulty: "Básica",
    stem: "Las duraciones, en minutos, de cuatro ejercicios fueron 12, 18, 15 y 19. ¿Cuál fue la duración promedio?",
    options: ["15", "16", "16,5", "17"], correctOption: 1,
    explanation: "La suma es 64 y se divide entre 4: 64 ÷ 4 = 16.",
  },
  {
    id: "rl-005", competency: "Razonamiento lógico", category: "Álgebra", skill: "Ecuaciones", difficulty: "Básica",
    stem: "Si 3x − 7 = 20, el valor de x es:",
    options: ["7", "8", "9", "11"], correctOption: 2,
    explanation: "Al sumar 7 a ambos lados resulta 3x = 27; por tanto, x = 9.",
  },
  {
    id: "rl-006", competency: "Razonamiento lógico", category: "Álgebra", skill: "Sistemas", difficulty: "Media",
    stem: "En una cafetería, dos jugos y un sándwich cuestan $19.000. Un jugo y un sándwich cuestan $12.000. ¿Cuánto cuesta un jugo?",
    options: ["$5.000", "$6.000", "$7.000", "$8.000"], correctOption: 2,
    explanation: "Al restar la segunda compra de la primera queda exactamente el precio de un jugo: $7.000.",
  },
  {
    id: "rl-007", competency: "Razonamiento lógico", category: "Patrones", skill: "Secuencias numéricas", difficulty: "Básica",
    stem: "¿Qué número continúa la secuencia 3, 7, 15, 31, ___?",
    options: ["47", "55", "62", "63"], correctOption: 3,
    explanation: "Cada término es el anterior multiplicado por 2 y aumentado en 1. Así, 31 × 2 + 1 = 63.",
    visual: { type: "sequence", items: ["3", "7", "15", "31", "?"], missingAt: 4 },
  },
  {
    id: "rl-008", competency: "Razonamiento lógico", category: "Proporcionalidad", skill: "Tasas", difficulty: "Media",
    stem: "Una impresora produce 45 páginas en 3 minutos a ritmo constante. ¿Cuántas producirá en 8 minutos?",
    options: ["90", "105", "120", "135"], correctOption: 2,
    explanation: "Produce 15 páginas por minuto. En 8 minutos produce 15 × 8 = 120.",
  },
  {
    id: "rl-009", competency: "Razonamiento lógico", category: "Probabilidad", skill: "Eventos simples", difficulty: "Básica",
    stem: "Se lanza un dado equilibrado. ¿Cuál es la probabilidad de obtener un número par mayor que 2?",
    options: ["1/6", "1/3", "1/2", "2/3"], correctOption: 1,
    explanation: "Los resultados favorables son 4 y 6: dos de seis posibilidades, es decir, 1/3.",
  },
  {
    id: "rl-010", competency: "Razonamiento lógico", category: "Combinatoria", skill: "Principio multiplicativo", difficulty: "Media",
    stem: "Una contraseña se forma con una letra entre A, B y C, seguida de dos dígitos diferentes elegidos entre 1, 2, 3 y 4. ¿Cuántas contraseñas pueden formarse?",
    options: ["12", "24", "36", "48"], correctOption: 2,
    explanation: "Hay 3 opciones para la letra, 4 para el primer dígito y 3 para el segundo: 3 × 4 × 3 = 36.",
  },
  {
    id: "rl-011", competency: "Razonamiento lógico", category: "Geometría", skill: "Área", difficulty: "Básica",
    stem: "Una zona rectangular mide 8 m de largo y 5 m de ancho. ¿Cuál es su área?",
    options: ["13 m²", "26 m²", "40 m²", "80 m²"], correctOption: 2,
    explanation: "El área del rectángulo es largo por ancho: 8 × 5 = 40 m².",
    visual: { type: "rectangle", width: "8 m", height: "5 m" },
  },
  {
    id: "rl-012", competency: "Razonamiento lógico", category: "Geometría", skill: "Perímetro", difficulty: "Básica",
    stem: "Un cuadrado tiene un área de 81 cm². ¿Cuál es su perímetro?",
    options: ["18 cm", "27 cm", "32 cm", "36 cm"], correctOption: 3,
    explanation: "Cada lado mide √81 = 9 cm. El perímetro es 4 × 9 = 36 cm.",
  },
  {
    id: "rl-013", competency: "Razonamiento lógico", category: "Geometría", skill: "Teorema de Pitágoras", difficulty: "Media",
    stem: "Una escalera forma un triángulo rectángulo con el piso y la pared. Si su base está a 6 m de la pared y alcanza 8 m de altura, ¿cuánto mide la escalera?",
    options: ["9 m", "10 m", "12 m", "14 m"], correctOption: 1,
    explanation: "La escalera es la hipotenusa: √(6² + 8²) = √100 = 10 m.",
    visual: { type: "triangle", base: "6 m", height: "8 m", hypotenuse: "?" },
  },
  {
    id: "rl-014", competency: "Razonamiento lógico", category: "Geometría", skill: "Circunferencia", difficulty: "Media",
    stem: "Una rueda de radio 5 cm completa una vuelta. Usando π ≈ 3,14, ¿qué distancia recorre un punto de su borde?",
    options: ["15,7 cm", "25 cm", "31,4 cm", "78,5 cm"], correctOption: 2,
    explanation: "La longitud de la circunferencia es 2πr = 2 × 3,14 × 5 = 31,4 cm.",
  },
  {
    id: "rl-015", competency: "Razonamiento lógico", category: "Geometría", skill: "Volumen", difficulty: "Básica",
    stem: "Una caja cúbica tiene aristas de 4 cm. ¿Cuál es su volumen?",
    options: ["16 cm³", "32 cm³", "48 cm³", "64 cm³"], correctOption: 3,
    explanation: "El volumen de un cubo es lado³: 4³ = 64 cm³.",
  },
  {
    id: "rl-016", competency: "Razonamiento lógico", category: "Geometría analítica", skill: "Pendiente", difficulty: "Media",
    stem: "¿Cuál es la pendiente de la recta que pasa por los puntos (1, 2) y (5, 10)?",
    options: ["1/2", "2", "4", "8"], correctOption: 1,
    explanation: "La pendiente es (10 − 2)/(5 − 1) = 8/4 = 2.",
    visual: { type: "coordinate", points: [{ label: "A", x: 1, y: 2 }, { label: "B", x: 5, y: 10 }] },
  },
  {
    id: "rl-017", competency: "Razonamiento lógico", category: "Álgebra", skill: "Funciones", difficulty: "Básica",
    stem: "Si f(x) = 2x² − 3, ¿cuál es el valor de f(−2)?",
    options: ["−11", "1", "5", "11"], correctOption: 2,
    explanation: "f(−2) = 2(−2)² − 3 = 2(4) − 3 = 5.",
  },
  {
    id: "rl-018", competency: "Razonamiento lógico", category: "Álgebra", skill: "Desigualdades", difficulty: "Media",
    stem: "¿Qué valores satisfacen 2x + 5 < 17?",
    options: ["x < 6", "x > 6", "x < 11", "x > 11"], correctOption: 0,
    explanation: "Restando 5: 2x < 12. Al dividir por 2: x < 6.",
  },
  {
    id: "rl-019", competency: "Razonamiento lógico", category: "Conjuntos", skill: "Inclusión y exclusión", difficulty: "Media",
    stem: "En un curso, 18 personas estudian inglés, 12 estudian francés y 5 estudian ambos idiomas. ¿Cuántas estudian por lo menos uno de los dos?",
    options: ["25", "30", "35", "41"], correctOption: 0,
    explanation: "Se suman ambos grupos y se resta la intersección contada dos veces: 18 + 12 − 5 = 25.",
    visual: { type: "venn", left: "18", right: "12", intersection: "5" },
  },
  {
    id: "rl-020", competency: "Razonamiento lógico", category: "Lógica", skill: "Deducción", difficulty: "Media",
    stem: "Todos los robles del parque son árboles nativos. Algunos árboles nativos pierden sus hojas. ¿Cuál conclusión es necesariamente verdadera?",
    options: ["Todos los árboles nativos son robles", "Algunos robles pierden sus hojas", "Ningún roble pierde sus hojas", "Todos los robles son árboles nativos"], correctOption: 3,
    explanation: "La última afirmación repite directamente la primera premisa. Las demás no se siguen necesariamente.",
  },
  {
    id: "rl-021", competency: "Razonamiento lógico", category: "Lógica", skill: "Condicionales", difficulty: "Alta",
    stem: "Si el laboratorio está abierto, entonces hay personal de turno. Hoy no hay personal de turno. ¿Qué puede concluirse válidamente?",
    options: ["El laboratorio no está abierto", "El laboratorio está abierto", "El personal está en descanso", "No puede concluirse nada"], correctOption: 0,
    explanation: "Por contraposición: si no hay personal de turno, el laboratorio no puede estar abierto.",
  },
  {
    id: "rl-022", competency: "Razonamiento lógico", category: "Combinatoria", skill: "Ordenamientos", difficulty: "Alta",
    stem: "Ana, Bruno y Camila se sientan en una fila de tres puestos. Si Ana no puede ocupar el centro, ¿cuántos ordenamientos son posibles?",
    options: ["2", "3", "4", "6"], correctOption: 2,
    explanation: "Hay 6 ordenamientos totales. En 2 de ellos Ana ocupa el centro, por lo que quedan 4.",
  },
  {
    id: "rl-023", competency: "Razonamiento lógico", category: "Análisis de datos", skill: "Lectura de tablas", difficulty: "Básica",
    stem: "Según la tabla, ¿qué día tuvo la mayor cantidad de respuestas correctas?",
    options: ["Lunes", "Martes", "Miércoles", "Jueves"], correctOption: 2,
    explanation: "El valor más alto de la tabla es 31, correspondiente al miércoles.",
    visual: { type: "table", title: "Práctica semanal", headers: ["Día", "Correctas"], rows: [["Lunes", "24"], ["Martes", "27"], ["Miércoles", "31"], ["Jueves", "29"]] },
  },
  {
    id: "rl-024", competency: "Razonamiento lógico", category: "Análisis de datos", skill: "Gráficas", difficulty: "Media",
    stem: "¿Entre cuáles dos sesiones consecutivas se presentó el mayor aumento?",
    options: ["1 y 2", "2 y 3", "3 y 4", "4 y 5"], correctOption: 1,
    explanation: "Los aumentos son 4, 9, 2 y 4. El mayor, 9, ocurre entre las sesiones 2 y 3.",
    visual: { type: "bars", title: "Aciertos por sesión", labels: ["1", "2", "3", "4", "5"], values: [18, 22, 31, 33, 37] },
  },
  {
    id: "rl-025", competency: "Razonamiento lógico", category: "Estadística", skill: "Promedio ponderado", difficulty: "Media",
    stem: "Una actividad vale el 40 % de la nota y un examen el 60 %. Si las calificaciones son 4,0 y 3,5 respectivamente, ¿cuál es la nota final?",
    options: ["3,6", "3,7", "3,75", "3,8"], correctOption: 1,
    explanation: "4,0 × 0,40 + 3,5 × 0,60 = 1,6 + 2,1 = 3,7.",
  },
  {
    id: "rl-026", competency: "Razonamiento lógico", category: "Estadística", skill: "Mediana", difficulty: "Básica",
    stem: "¿Cuál es la mediana de los datos 4, 9, 7, 12 y 6?",
    options: ["6", "7", "7,6", "9"], correctOption: 1,
    explanation: "Ordenados quedan 4, 6, 7, 9, 12. El valor central es 7.",
  },
  {
    id: "rl-027", competency: "Razonamiento lógico", category: "Aritmética", skill: "Interés simple", difficulty: "Media",
    stem: "Se prestan $500.000 al 2 % mensual de interés simple durante 3 meses. ¿Cuál es el interés total?",
    options: ["$10.000", "$20.000", "$30.000", "$60.000"], correctOption: 2,
    explanation: "El interés mensual es $10.000. Durante tres meses suma $30.000.",
  },
  {
    id: "rl-028", competency: "Razonamiento lógico", category: "Proporcionalidad", skill: "Escalas", difficulty: "Media",
    stem: "En un mapa a escala 1:50.000, dos lugares están separados 6 cm. ¿Cuál es la distancia real?",
    options: ["300 m", "1,2 km", "3 km", "30 km"], correctOption: 2,
    explanation: "6 × 50.000 = 300.000 cm, equivalentes a 3.000 m o 3 km.",
  },
  {
    id: "rl-029", competency: "Razonamiento lógico", category: "Proporcionalidad", skill: "Trabajo conjunto", difficulty: "Alta",
    stem: "Una llave llena un tanque en 6 horas y otra en 3 horas. Si trabajan juntas a ritmo constante, ¿en cuánto tiempo lo llenan?",
    options: ["1,5 horas", "2 horas", "3 horas", "4,5 horas"], correctOption: 1,
    explanation: "Sus tasas suman 1/6 + 1/3 = 1/2 del tanque por hora. Necesitan 2 horas.",
  },
  {
    id: "rl-030", competency: "Razonamiento lógico", category: "Álgebra", skill: "Problemas de edades", difficulty: "Media",
    stem: "Marta tiene el doble de la edad de Luis. Dentro de 6 años, la suma de sus edades será 42. ¿Qué edad tiene Luis hoy?",
    options: ["8", "10", "12", "14"], correctOption: 1,
    explanation: "Si Luis tiene x, Marta tiene 2x. En seis años: (x+6)+(2x+6)=42; 3x=30 y x=10.",
  },
  {
    id: "rl-031", competency: "Razonamiento lógico", category: "Aritmética", skill: "Ciclos", difficulty: "Media",
    stem: "Una alarma suena cada 18 minutos y otra cada 24 minutos. Si suenan juntas a las 8:00, ¿a qué hora volverán a coincidir?",
    options: ["8:42", "8:48", "9:12", "9:24"], correctOption: 2,
    explanation: "El mínimo común múltiplo de 18 y 24 es 72 minutos. Coinciden de nuevo a las 9:12.",
  },
  {
    id: "rl-032", competency: "Razonamiento lógico", category: "Patrones", skill: "Secuencias", difficulty: "Media",
    stem: "En la secuencia, cada símbolo se repite una vez más que en el grupo anterior: ●, ▲▲, ●●●, ▲▲▲▲. ¿Cuál grupo sigue?",
    options: ["●●●●", "●●●●●", "▲▲▲▲▲", "●▲●▲●"], correctOption: 1,
    explanation: "Alternan círculo y triángulo, y la cantidad aumenta de uno en uno. Siguen cinco círculos.",
    visual: { type: "sequence", items: ["●", "▲▲", "●●●", "▲▲▲▲", "?"], missingAt: 4 },
  },
  {
    id: "rl-033", competency: "Razonamiento lógico", category: "Álgebra", skill: "Modelación visual", difficulty: "Media",
    stem: "La balanza está equilibrada. Si cada círculo pesa 2 kg y todos los cuadrados pesan lo mismo, ¿cuánto pesa cada cuadrado?",
    options: ["1 kg", "2 kg", "3 kg", "4 kg"], correctOption: 2,
    explanation: "A la izquierda hay 2 cuadrados y 2 círculos; a la derecha, 5 círculos. Entonces 2x + 4 = 10, de donde x = 3 kg.",
    visual: { type: "balance", left: ["■", "■", "●", "●"], right: ["●", "●", "●", "●", "●"] },
  },
  {
    id: "rl-034", competency: "Razonamiento lógico", category: "Geometría analítica", skill: "Distancia", difficulty: "Media",
    stem: "¿Cuál es la distancia entre los puntos (−1, 2) y (−1, 9)?",
    options: ["6", "7", "8", "11"], correctOption: 1,
    explanation: "Tienen la misma coordenada x, así que la distancia vertical es |9 − 2| = 7.",
  },
  {
    id: "rl-035", competency: "Razonamiento lógico", category: "Probabilidad", skill: "Sin reemplazo", difficulty: "Alta",
    stem: "Una bolsa contiene 3 fichas rojas y 2 azules. Se extraen dos sin reemplazo. ¿Cuál es la probabilidad de que ambas sean azules?",
    options: ["1/10", "1/5", "2/5", "1/2"], correctOption: 0,
    explanation: "La probabilidad es (2/5)(1/4) = 2/20 = 1/10.",
  },
  {
    id: "rl-036", competency: "Razonamiento lógico", category: "Aritmética", skill: "Cambios porcentuales", difficulty: "Alta",
    stem: "Un precio aumenta 20 % y luego disminuye 20 %. En comparación con el precio inicial, el precio final es:",
    options: ["Igual", "4 % menor", "4 % mayor", "8 % menor"], correctOption: 1,
    explanation: "Tomando 100 como base: aumenta a 120 y luego baja 20 % de 120, es decir 24. Queda en 96, un 4 % menos.",
  },
  {
    id: "rl-037", competency: "Razonamiento lógico", category: "Proporcionalidad", skill: "Razones", difficulty: "Básica",
    stem: "Una receta para 4 personas usa 300 g de arroz. ¿Cuánto se requiere para 10 personas manteniendo la proporción?",
    options: ["600 g", "650 g", "700 g", "750 g"], correctOption: 3,
    explanation: "Cada persona requiere 75 g. Para 10 personas: 75 × 10 = 750 g.",
  },
  {
    id: "rl-038", competency: "Razonamiento lógico", category: "Lógica", skill: "Ordenamiento", difficulty: "Alta",
    stem: "Cuatro talleres —A, B, C y D— se realizan uno por día de lunes a jueves. A ocurre antes que C; B ocurre el jueves; D ocurre después de C. ¿Qué taller ocurre el martes?",
    options: ["A", "B", "C", "D"], correctOption: 2,
    explanation: "B ocupa el jueves. Para cumplir A antes de C y C antes de D, el único orden es A, C, D, B. El martes ocurre C.",
  },
  {
    id: "rl-039", competency: "Razonamiento lógico", category: "Álgebra", skill: "Ecuaciones cuadráticas", difficulty: "Media",
    stem: "¿Cuáles son las soluciones de x² − 5x + 6 = 0?",
    options: ["1 y 6", "−2 y −3", "2 y 3", "3 y 5"], correctOption: 2,
    explanation: "El polinomio factoriza como (x − 2)(x − 3), por lo que x = 2 o x = 3.",
  },
  {
    id: "rl-040", competency: "Razonamiento lógico", category: "Análisis de datos", skill: "Inferencias", difficulty: "Alta",
    stem: "Una encuesta voluntaria publicada en una aplicación recibió respuestas de 800 usuarios. El 72 % dijo preferir estudiar de noche. ¿Qué conclusión es la más prudente?",
    options: ["El 72 % de todos los aspirantes estudia de noche", "La mayoría de los habitantes de Medellín estudia de noche", "Entre quienes respondieron, predominó la preferencia por estudiar de noche", "La aplicación hace que las personas estudien de noche"], correctOption: 2,
    explanation: "La muestra es voluntaria y solo representa directamente a quienes respondieron; no permite generalizar a toda la población ni establecer causas.",
  },
];

const readingQuestions: Question[] = [
  {
    id: "cl-001", competency: "Comprensión lectora", category: "Lectura global", skill: "Idea principal", difficulty: "Media", stimulusId: "texto-ciudad-sombra",
    stem: "¿Cuál enunciado sintetiza mejor la idea principal del texto?",
    options: ["Las calles deben eliminar el tránsito de vehículos", "La sombra urbana es útil cuando hace parte de una planificación y un cuidado continuos", "Los árboles pueden reemplazar todas las obras de infraestructura", "Caminar es siempre más rápido que usar transporte público"], correctOption: 1,
    explanation: "El texto presenta la sombra como infraestructura útil, pero insiste en que requiere selección adecuada y cuidado sostenido.",
  },
  {
    id: "cl-002", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Relaciones", difficulty: "Media", stimulusId: "texto-ciudad-sombra",
    stem: "¿Por qué el autor compara los árboles con la infraestructura?",
    options: ["Porque ambos se construyen exclusivamente con concreto", "Porque los árboles aumentan la velocidad de los vehículos", "Porque ambos pueden crear condiciones para usar y habitar el espacio público", "Porque toda infraestructura necesita agua"], correctOption: 2,
    explanation: "La comparación se basa en la función: la sombra permite caminar, esperar y permanecer en la calle.",
  },
  {
    id: "cl-003", competency: "Comprensión lectora", category: "Lectura local", skill: "Vocabulario en contexto", difficulty: "Básica", stimulusId: "texto-ciudad-sombra",
    stem: "En el texto, la expresión «solución frágil» se refiere a una solución que:",
    options: ["Puede fallar o no sostenerse con el tiempo", "Está hecha con materiales transparentes", "Solo beneficia a los peatones jóvenes", "Tiene un costo demasiado elevado"], correctOption: 0,
    explanation: "El contexto relaciona la fragilidad con sembrar sin prever especies, raíces, agua y mantenimiento.",
  },
  {
    id: "cl-004", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Implicaciones", difficulty: "Alta", stimulusId: "texto-ciudad-sombra",
    stem: "¿Cuál acción sería más coherente con la postura del texto?",
    options: ["Sembrar el mayor número posible de árboles en un solo día", "Medir únicamente la velocidad de los automóviles", "Diseñar corredores de sombra y asegurar su mantenimiento", "Reemplazar los buses por senderos peatonales"], correctOption: 2,
    explanation: "La propuesta integra planificación del trayecto, elección de especies y cuidado sostenido.",
  },
  {
    id: "cl-005", competency: "Comprensión lectora", category: "Lectura global", skill: "Tesis", difficulty: "Media", stimulusId: "texto-error-ciencia",
    stem: "La tesis central del texto sostiene que:",
    options: ["Todo resultado inesperado demuestra un descubrimiento", "Describir y examinar el error permite distinguir fallas de hallazgos y mejorar el conocimiento", "Los instrumentos científicos suelen utilizarse mal", "Las hipótesis correctas nunca deben modificarse"], correctOption: 1,
    explanation: "El texto valora el examen preciso del error como vía para corregir procedimientos o explicaciones.",
  },
  {
    id: "cl-006", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Inferencias", difficulty: "Media", stimulusId: "texto-error-ciencia",
    stem: "Separar la autoestima de la hipótesis permite que una persona investigadora:",
    options: ["Evite registrar resultados inesperados", "Defienda siempre su primera explicación", "Revise sus ideas sin interpretar la evidencia contraria como una ofensa", "Trabaje sin utilizar instrumentos"], correctOption: 2,
    explanation: "El segundo párrafo afirma que identificar la hipótesis con la identidad convierte la evidencia contraria en un ataque personal.",
  },
  {
    id: "cl-007", competency: "Comprensión lectora", category: "Lectura local", skill: "Conectores", difficulty: "Básica", stimulusId: "texto-error-ciencia",
    stem: "En el primer párrafo, la expresión «pero también» introduce:",
    options: ["Una causa idéntica a la anterior", "Una segunda explicación posible", "Una conclusión definitiva", "Un ejemplo sin relación"], correctOption: 1,
    explanation: "El resultado inesperado puede deberse al instrumento, pero también a una explicación inicial insuficiente.",
  },
  {
    id: "cl-008", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Aplicación", difficulty: "Alta", stimulusId: "texto-error-ciencia",
    stem: "¿Qué conducta contradice más claramente la postura del autor?",
    options: ["Registrar las condiciones de un experimento fallido", "Modificar una hipótesis ante nueva evidencia", "Ocultar datos para proteger la reputación del equipo", "Revisar el uso de un instrumento"], correctOption: 2,
    explanation: "El texto defiende describir el error con precisión y evitar que la identidad personal impida corregir ideas.",
  },
  {
    id: "cl-009", competency: "Comprensión lectora", category: "Lectura literal", skill: "Información explícita", difficulty: "Básica", stimulusId: "texto-biblioteca",
    stem: "Según el texto, ¿qué hace Clara antes de recomendar un libro?",
    options: ["Consulta una lista de títulos populares", "Pregunta por el problema o la curiosidad de la persona", "Entrega el periódico del día", "Pide que la persona regrese a las seis"], correctOption: 1,
    explanation: "El segundo párrafo indica expresamente que primero pregunta qué problema o curiosidad llevó a la persona allí.",
  },
  {
    id: "cl-010", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Interpretación", difficulty: "Media", stimulusId: "texto-biblioteca",
    stem: "La frase «la pregunta escondida consigue formularse» sugiere que:",
    options: ["Toda persona oculta deliberadamente sus preguntas", "La conversación ayuda a precisar una necesidad que al principio era confusa", "Los libros contienen preguntas secretas", "Clara prefiere no responder"], correctOption: 1,
    explanation: "Escuchar y preguntar permite convertir una inquietud todavía imprecisa en una pregunta clara.",
  },
  {
    id: "cl-011", competency: "Comprensión lectora", category: "Lectura global", skill: "Propósito", difficulty: "Media", stimulusId: "texto-biblioteca",
    stem: "El primer párrafo cumple principalmente la función de:",
    options: ["Mostrar que la biblioteca adquiere usos diversos según quienes llegan", "Criticar a los estudiantes que se van temprano", "Explicar cómo se construyó el edificio", "Demostrar que la prensa es el material más consultado"], correctOption: 0,
    explanation: "El cambio de público permite presentar la biblioteca como un mismo espacio con usos múltiples.",
  },
  {
    id: "cl-012", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Caracterización", difficulty: "Media", stimulusId: "texto-biblioteca",
    stem: "A partir de sus acciones, Clara puede caracterizarse como una bibliotecaria que:",
    options: ["Impone sus gustos personales", "Valora la escucha como parte de la orientación", "Solo atiende a lectores expertos", "Evita hablar con quienes no conocen un título"], correctOption: 1,
    explanation: "Su método consiste precisamente en escuchar antes de recomendar.",
  },
  {
    id: "cl-013", competency: "Comprensión lectora", category: "Lectura global", skill: "Idea principal", difficulty: "Media", stimulusId: "texto-memoria",
    stem: "¿Cuál es la idea principal del texto?",
    options: ["Los recuerdos son grabaciones exactas", "Toda diferencia entre recuerdos implica que alguien miente", "Recordar reconstruye una experiencia y puede producir relatos sinceros diferentes", "Las emociones impiden conservar cualquier recuerdo"], correctOption: 2,
    explanation: "Los dos párrafos desarrollan el carácter reconstructivo de la memoria sin concluir que todo recuerdo sea falso.",
  },
  {
    id: "cl-014", competency: "Comprensión lectora", category: "Lectura local", skill: "Referencia", difficulty: "Básica", stimulusId: "texto-memoria",
    stem: "En «al evocarlo, lo organizaron», el pronombre «lo» se refiere a:",
    options: ["El mismo acontecimiento", "Un relato falso", "El conocimiento posterior", "El carácter reconstructivo"], correctOption: 0,
    explanation: "El antecedente más directo y coherente es «el mismo acontecimiento».",
  },
  {
    id: "cl-015", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Matices", difficulty: "Alta", stimulusId: "texto-memoria",
    stem: "¿Por qué el autor aclara que el carácter reconstructivo aconseja prudencia y no desconfianza absoluta?",
    options: ["Porque quiere negar que existan errores de memoria", "Porque la variación de los recuerdos no los vuelve automáticamente falsos", "Porque solo una persona puede recordar un hecho", "Porque las expectativas no afectan la memoria"], correctOption: 1,
    explanation: "El texto evita el extremo de equiparar reconstrucción con falsedad total.",
  },
  {
    id: "cl-016", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Conclusiones", difficulty: "Alta", stimulusId: "texto-memoria",
    stem: "¿Cuál conclusión es compatible con el texto?",
    options: ["Dos testimonios distintos pueden ser sinceros", "El recuerdo más detallado es siempre el verdadero", "Las emociones solo mejoran la memoria", "Recordar y grabar son procesos idénticos"], correctOption: 0,
    explanation: "El texto afirma de manera explícita que dos personas pueden ofrecer relatos sinceros y diferentes.",
  },
  {
    id: "cl-017", competency: "Comprensión lectora", category: "Lectura de datos", skill: "Información explícita", difficulty: "Básica", stimulusId: "texto-polinizadores",
    stem: "Según la tabla, ¿qué jardín recibió la mayor variedad de polinizadores?",
    options: ["A", "B", "C", "A y C por igual"], correctOption: 1,
    explanation: "El jardín B registró 13 tipos de polinizador, la cifra más alta.",
  },
  {
    id: "cl-018", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Relación texto-datos", difficulty: "Media", stimulusId: "texto-polinizadores",
    stem: "¿Qué dato respalda directamente la afirmación de que el tamaño no es el único factor relevante?",
    options: ["El jardín C tiene 120 m²", "El jardín B, siendo el más pequeño, tuvo más tipos de polinizador", "Todos los jardines fueron observados doce semanas", "El jardín A tiene cuatro especies de flores"], correctOption: 1,
    explanation: "B tiene la menor área y, aun así, la mayor diversidad de polinizadores.",
  },
  {
    id: "cl-019", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Alcance de la evidencia", difficulty: "Alta", stimulusId: "texto-polinizadores",
    stem: "¿Por qué el texto evita afirmar que la diversidad floral sea la única causa?",
    options: ["Porque no se contó el número de flores", "Porque los jardines también diferían en otras condiciones", "Porque todos los jardines tenían igual tamaño", "Porque no hubo visitas de insectos"], correctOption: 1,
    explanation: "Sombra, humedad y cercanía a zonas verdes son variables alternativas que también pudieron influir.",
  },
  {
    id: "cl-020", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Diseño de investigación", difficulty: "Alta", stimulusId: "texto-polinizadores",
    stem: "¿Qué estudio permitiría evaluar mejor el efecto de la diversidad floral?",
    options: ["Comparar jardines similares en las demás condiciones y con distinta diversidad de flores", "Observar únicamente el jardín B durante un día", "Aumentar el tamaño de todos los jardines sin registrar insectos", "Preguntar a los vecinos cuál jardín prefieren"], correctOption: 0,
    explanation: "Controlar otras variables permite aislar mejor la relación entre diversidad floral y polinizadores.",
  },
  {
    id: "cl-021", competency: "Comprensión lectora", category: "Lectura global", skill: "Analogía", difficulty: "Media", stimulusId: "texto-mapa",
    stem: "La relación que establece el texto entre un mapa y una estadística se basa en que ambos:",
    options: ["Son representaciones completas de la realidad", "Seleccionan y resumen información para orientar", "Eliminan la necesidad de formular preguntas", "Solo son útiles si contienen todos los detalles"], correctOption: 1,
    explanation: "Tanto el mapa como el promedio simplifican información; su utilidad proviene de esa selección.",
  },
  {
    id: "cl-022", competency: "Comprensión lectora", category: "Lectura local", skill: "Paradoja aparente", difficulty: "Media", stimulusId: "texto-mapa",
    stem: "¿Por qué un mapa que mostrara cada detalle dejaría de orientar?",
    options: ["Porque sería ilegal", "Porque perdería la selección que permite identificar lo relevante", "Porque los caminos cambian cada día", "Porque solo las estadísticas pueden orientar"], correctOption: 1,
    explanation: "La acumulación total de detalles impediría que el mapa cumpliera su función de simplificar y guiar.",
  },
  {
    id: "cl-023", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Implicaciones", difficulty: "Alta", stimulusId: "texto-mapa",
    stem: "La afirmación «una cifra bien calculada todavía necesita una pregunta bien formulada» implica que:",
    options: ["La exactitud matemática garantiza una interpretación adecuada", "Los cálculos correctos pueden ser poco útiles si no responden a una pregunta pertinente", "Las preguntas deben evitar cualquier cifra", "Los promedios siempre son engañosos"], correctOption: 1,
    explanation: "El autor distingue entre exactitud del cálculo y pertinencia de lo que se pregunta e interpreta.",
  },
  {
    id: "cl-024", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Aplicación", difficulty: "Alta", stimulusId: "texto-mapa",
    stem: "¿Cuál situación ejemplifica mejor la advertencia del texto?",
    options: ["Calcular el promedio de ingresos y revisar también cómo se distribuyen", "Usar un mapa para encontrar una dirección", "Concluir que todas las familias viven igual porque el ingreso promedio aumentó", "Corregir un error en una tabla"], correctOption: 2,
    explanation: "La conclusión confunde el promedio con el panorama completo y oculta posibles diferencias de distribución.",
  },
  {
    id: "cl-025", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Atmósfera", difficulty: "Media", stimulusId: "texto-silencio",
    stem: "El silencio de la radio contribuye principalmente a crear una atmósfera de:",
    options: ["Celebración ruidosa", "Cambio contenido y despedida", "Confusión cómica", "Peligro inmediato"], correctOption: 1,
    explanation: "La ruptura de una rutina de treinta años y el letrero de arriendo sugieren una despedida tratada en silencio.",
  },
  {
    id: "cl-026", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Información implícita", difficulty: "Media", stimulusId: "texto-silencio",
    stem: "¿Qué puede inferirse sobre el taller?",
    options: ["Será trasladado esa misma tarde", "Probablemente está próximo a cerrar o cambiar de ocupante", "Nunca había tenido clientes", "La hija acaba de comprarlo"], correctOption: 1,
    explanation: "El letrero de «Se arrienda» y la organización de cajas indican un cierre o transición próxima.",
  },
  {
    id: "cl-027", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Recursos narrativos", difficulty: "Alta", stimulusId: "texto-silencio",
    stem: "¿Qué efecto produce que los personajes no mencionen el letrero?",
    options: ["Elimina toda posibilidad de comprender la escena", "Subraya que ambos conocen el cambio aunque eviten nombrarlo", "Demuestra que ninguno vio el letrero", "Convierte el relato en una noticia"], correctOption: 1,
    explanation: "La omisión compartida refuerza la tensión emocional y el conocimiento tácito de la despedida.",
  },
  {
    id: "cl-028", competency: "Comprensión lectora", category: "Lectura local", skill: "Contraste", difficulty: "Básica", stimulusId: "texto-silencio",
    stem: "¿Qué rutina altera don Julián aquella mañana?",
    options: ["Toma café antes de trabajar", "Ordena las herramientas", "Enciende la radio antes de levantar la persiana", "Recibe a su hija al mediodía"], correctOption: 2,
    explanation: "Durante treinta años encendía primero la radio; esa mañana dejó entrar la luz y mantuvo el aparato apagado.",
  },
  {
    id: "cl-029", competency: "Comprensión lectora", category: "Lectura global", skill: "Tesis", difficulty: "Media", stimulusId: "texto-algoritmo",
    stem: "¿Cuál es la tesis principal del texto?",
    options: ["Las plataformas deben eliminar toda recomendación", "Las recomendaciones no solo predicen gustos: también influyen en su desarrollo", "Los usuarios siempre prefieren música desconocida", "El número de clics mide completamente la calidad de un algoritmo"], correctOption: 1,
    explanation: "El texto insiste en la doble función de la recomendación: describir preferencias pasadas y formar experiencias futuras.",
  },
  {
    id: "cl-030", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Criterios de evaluación", difficulty: "Alta", stimulusId: "texto-algoritmo",
    stem: "¿Por qué el número de clics resulta un criterio insuficiente?",
    options: ["Porque ningún usuario hace clic", "Porque puede premiar repeticiones acertadas que reducen la diversidad", "Porque solo mide el costo de las canciones", "Porque los clics no pueden contarse"], correctOption: 1,
    explanation: "Un sistema puede lograr clics inmediatos y, a la vez, encerrar al usuario en opciones muy parecidas.",
  },
  {
    id: "cl-031", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Concesión", difficulty: "Media", stimulusId: "texto-algoritmo",
    stem: "El autor admite que incluir hallazgos inesperados podría:",
    options: ["Disminuir algunos clics en el corto plazo", "Eliminar el gusto pasado", "Impedir toda recomendación futura", "Reducir necesariamente el repertorio"], correctOption: 0,
    explanation: "El cierre contrasta una posible disminución de clics inmediatos con la ampliación del repertorio a largo plazo.",
  },
  {
    id: "cl-032", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Aplicación", difficulty: "Alta", stimulusId: "texto-algoritmo",
    stem: "¿Qué diseño refleja mejor la propuesta del texto?",
    options: ["Mostrar siempre la misma canción popular", "Combinar recomendaciones afines con algunas opciones novedosas", "Ordenar canciones únicamente por duración", "Ocultar al usuario todas sus preferencias"], correctOption: 1,
    explanation: "La combinación conserva pertinencia y abre oportunidades de descubrimiento.",
  },
  {
    id: "cl-033", competency: "Comprensión lectora", category: "Lectura literal", skill: "Información explícita", difficulty: "Básica", stimulusId: "texto-agua",
    stem: "¿A qué profundidad se revisa ahora la humedad del suelo?",
    options: ["En la superficie", "A cinco centímetros", "A diez centímetros", "A veinte centímetros"], correctOption: 2,
    explanation: "El primer párrafo indica que el suelo se revisa a diez centímetros de profundidad.",
  },
  {
    id: "cl-034", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Contraste", difficulty: "Media", stimulusId: "texto-agua",
    stem: "¿Qué diferencia principal hay entre el método anterior y el nuevo?",
    options: ["Antes se medía el consumo y ahora no", "Antes se decidía por la apariencia; ahora se usan medición y registro", "Antes no había plantas", "Ahora cada voluntario riega sin consultar"], correctOption: 1,
    explanation: "El nuevo método reemplaza una impresión superficial por datos de humedad y consumo.",
  },
  {
    id: "cl-035", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Prudencia científica", difficulty: "Alta", stimulusId: "texto-agua",
    stem: "¿Por qué el comité espera hasta la temporada seca?",
    options: ["Porque el medidor no funciona con lluvia", "Porque necesita observar el sistema bajo condiciones diferentes antes de generalizar", "Porque quiere aumentar el consumo", "Porque las plantas solo crecen en sequía"], correctOption: 1,
    explanation: "Un mes lluvioso es una condición limitada; probar en sequía fortalece la conclusión sobre el ahorro.",
  },
  {
    id: "cl-036", competency: "Comprensión lectora", category: "Lectura local", skill: "Valoración", difficulty: "Media", stimulusId: "texto-agua",
    stem: "La palabra «prometedora» indica que la reducción de agua:",
    options: ["Ya demuestra una verdad definitiva", "Ofrece una señal favorable que aún debe confirmarse", "Fue demasiado pequeña para registrarse", "Se produjo por la marchitez"], correctOption: 1,
    explanation: "El término expresa valoración positiva sin eliminar la necesidad de más observación.",
  },
  {
    id: "cl-037", competency: "Comprensión lectora", category: "Lectura global", skill: "Idea principal", difficulty: "Media", stimulusId: "texto-velocidad",
    stem: "¿Cuál idea articula el texto?",
    options: ["Toda pausa perjudica el desempeño", "La velocidad siempre es más importante que la precisión", "Una pausa deliberada puede mejorar la eficacia al evitar errores", "Practicar vuelve innecesario comprender el problema"], correctOption: 2,
    explanation: "El texto distingue las pausas improductivas de las pausas breves que verifican y previenen correcciones costosas.",
  },
  {
    id: "cl-038", competency: "Comprensión lectora", category: "Lectura inferencial", skill: "Paradoja", difficulty: "Media", stimulusId: "texto-velocidad",
    stem: "¿Cómo puede una pausa ayudar a avanzar?",
    options: ["Aumentando el tiempo disponible", "Evitando que una interpretación apresurada produzca trabajo adicional", "Eliminando preguntas difíciles", "Haciendo que el cronómetro se detenga"], correctOption: 1,
    explanation: "Verificar a tiempo puede ahorrar los minutos que exigiría corregir una solución basada en una lectura equivocada.",
  },
  {
    id: "cl-039", competency: "Comprensión lectora", category: "Lectura local", skill: "Contraste", difficulty: "Básica", stimulusId: "texto-velocidad",
    stem: "La pausa que nace de no saber se diferencia de la pausa deliberada porque la primera:",
    options: ["Verifica los datos", "Descarta interpretaciones", "Consume tiempo sin ofrecer dirección", "Mejora la precisión"], correctOption: 2,
    explanation: "Esa caracterización aparece de manera explícita en el segundo párrafo.",
  },
  {
    id: "cl-040", competency: "Comprensión lectora", category: "Lectura crítica", skill: "Aplicación", difficulty: "Alta", stimulusId: "texto-velocidad",
    stem: "¿Qué estrategia de examen coincide mejor con el texto?",
    options: ["Responder antes de terminar de leer", "Detenerse brevemente para identificar datos y propósito antes de calcular", "Dedicar el mismo tiempo a todas las preguntas sin considerar dificultad", "Evitar revisar cualquier respuesta"], correctOption: 1,
    explanation: "La estrategia usa una pausa deliberada para comprender el problema y prevenir errores posteriores.",
  },
];

export const questionBank: Question[] = [
  ...logicalQuestions,
  ...additionalLogicalQuestions,
  ...readingQuestions,
  ...additionalReadingQuestions,
];

export const questionsById = Object.fromEntries(
  questionBank.map((question) => [question.id, question]),
) as Record<string, Question>;

export const stimuliById = Object.fromEntries(
  readingStimuli.map((stimulus) => [stimulus.id, stimulus]),
) as Record<string, ReadingStimulus>;

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function createExamQuestionSet(): Question[] {
  const selectedLogical = shuffled(
    questionBank.filter((question) => question.competency === "Razonamiento lógico"),
  ).slice(0, 40);

  const selectedStimulusIds = shuffled(readingStimuli)
    .slice(0, 10)
    .map((stimulus) => stimulus.id);

  const selectedReading = selectedStimulusIds.flatMap((stimulusId) =>
    questionBank.filter((question) => question.stimulusId === stimulusId),
  );

  return [...selectedLogical, ...selectedReading];
}
