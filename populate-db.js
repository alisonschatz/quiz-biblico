import 'dotenv/config';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 🔑 Inicializa com credencial de administrador
const serviceAccount = JSON.parse(
  await readFile(resolve('serviceAccountKey.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 🗂️ Configurações
const CATEGORIES = ['antigo_testamento', 'novo_testamento', 'milagres', 'profetas', 'salmos'];
const DIFFICULTY_MAP = { 'easy.json': 'facil', 'medium.json': 'medio', 'hard.json': 'dificil' };

// 📥 Carrega JSON
async function loadJsonFile(filePath) {
  const data = await readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// ➕ Adiciona docs
async function addDocuments(collectionName, items, itemName) {
  console.log(`\n📥 Adicionando ${items.length} ${itemName}(s)...`);
  let success = 0;
  const coll = db.collection(collectionName);

  for (const item of items) {
    try {
      await coll.add(item);
      success++;
    } catch (err) {
      console.error(`   ✖ Erro ao adicionar ${itemName}:`, err.message);
    }
  }

  console.log(`✅ ${success}/${items.length} adicionado(s).`);
  return success;
}

// 🚀 População
async function populate() {
  console.log('====================================');
  console.log('🚀 Populando com Firebase Admin SDK...');
  console.log('====================================\n');

  let totalQ = 0;

  for (const cat of CATEGORIES) {
    console.log(`📂 ${cat}`);

    for (const file of ['easy.json', 'medium.json', 'hard.json']) {
      const path = resolve('src', 'data', 'questions', cat, file);
      const diff = DIFFICULTY_MAP[file];

      console.log(`  → ${file} (${diff})`);

      const questions = await loadJsonFile(path);

      const norm = questions.map(q => ({
        ...q,
        category: q.category || cat,
        difficulty: q.difficulty || diff
      }));

      totalQ += await addDocuments('questions', norm, 'pergunta');
    }
  }

  // 🏆 Conquistas
  const achFiles = ['easy.json', 'medium.json', 'hard.json'];
  let allAch = [];

  for (const file of achFiles) {
    try {
      const path = resolve('src', 'data', 'achievements', file);
      const ach = await loadJsonFile(path);
      const diff = DIFFICULTY_MAP[file];
      const norm = ach.map(a => ({ ...a, difficulty: a.difficulty || diff }));
      allAch.push(...norm);
    } catch {
      console.warn(`⚠️ Arquivo não encontrado: achievements/${file}`);
    }
  }

  let totalA = 0;
  if (allAch.length > 0) {
    totalA += await addDocuments('achievements', allAch, 'conquista');
  }

  console.log('\n====================================');
  console.log('✅ SUCESSO!');
  console.log(`📊 Perguntas: ${totalQ}`);
  console.log(`🎯 Conquistas: ${totalA}`);
  console.log('====================================');
}

populate().catch(err => {
  console.error('\n❌ FALHA:', err);
  process.exit(1);
});
