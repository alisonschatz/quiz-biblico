import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questions = [
  {
    question: "Quem foi o primeiro homem criado por Deus?",
    options: ["Adão", "Noé", "Abraão", "Moisés"],
    correctAnswer: 0,
    category: "antigo_testamento",
    difficulty: "facil",
    explanation: "Adão foi o primeiro homem criado por Deus no Jardim do Éden.",
    verseReference: "Gênesis 2:7"
  },
  {
    question: "Quantos dias Deus levou para criar o mundo?",
    options: ["5 dias", "6 dias", "7 dias", "10 dias"],
    correctAnswer: 1,
    category: "antigo_testamento",
    difficulty: "facil",
    explanation: "Deus criou o mundo em 6 dias e descansou no sétimo dia.",
    verseReference: "Gênesis 1"
  },
  {
    question: "Quem construiu a arca que salvou os animais do dilúvio?",
    options: ["Abraão", "Noé", "Moisés", "Davi"],
    correctAnswer: 1,
    category: "antigo_testamento",
    difficulty: "facil",
    explanation: "Noé construiu a arca seguindo as instruções de Deus.",
    verseReference: "Gênesis 6-9"
  },
  {
    question: "Qual foi o primeiro milagre de Jesus?",
    options: ["Cura de um cego", "Andar sobre as águas", "Transformar água em vinho", "Multiplicação dos pães"],
    correctAnswer: 2,
    category: "milagres",
    difficulty: "medio",
    explanation: "O primeiro milagre de Jesus foi transformar água em vinho nas bodas de Caná.",
    verseReference: "João 2:1-11"
  },
  {
    question: "Quantos apóstolos Jesus escolheu?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "novo_testamento",
    difficulty: "facil",
    explanation: "Jesus escolheu 12 apóstolos para serem seus discípulos mais próximos.",
    verseReference: "Mateus 10:1-4"
  }
];

const achievements = [
  {
    title: "Primeiro Passo",
    description: "Responda sua primeira pergunta",
    rarity: "comum",
    xpReward: 50,
    condition: { type: "questions_answered", value: 1 }
  },
  {
    title: "Iniciante Dedicado",
    description: "Responda 10 perguntas",
    rarity: "comum",
    xpReward: 100,
    condition: { type: "questions_answered", value: 10 }
  },
  {
    title: "Estudante Bíblico",
    description: "Responda 50 perguntas",
    rarity: "rara",
    xpReward: 250,
    condition: { type: "questions_answered", value: 50 }
  },
  {
    title: "Conhecedor das Escrituras",
    description: "Alcance o nível 5",
    rarity: "rara",
    xpReward: 200,
    condition: { type: "level_reached", value: 5 }
  }
];

async function populateDatabase() {
  try {
    console.log('Iniciando população do banco de dados...');

    console.log('Adicionando perguntas...');
    for (const question of questions) {
      await addDoc(collection(db, 'questions'), question);
    }
    console.log(`✓ ${questions.length} perguntas adicionadas!`);

    console.log('Adicionando conquistas...');
    for (const achievement of achievements) {
      await addDoc(collection(db, 'achievements'), achievement);
    }
    console.log(`✓ ${achievements.length} conquistas adicionadas!`);

    console.log('✓ Banco de dados populado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
    process.exit(1);
  }
}

populateDatabase();
