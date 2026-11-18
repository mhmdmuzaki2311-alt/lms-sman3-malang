// Profanity & Inappropriate Word Filter Service for SMAN 3 Kota Malang LMS Forum
// Digunakan baik di sisi Frontend maupun validasi Service/Backend

const INAPPROPRIATE_WORDS = [
  // Kata kasar / makian umum Indonesia
  'anjing', 'anjir', 'anjay', 'asu', 'bajingan', 'bangsat', 'babi',
  'bego', 'goblok', 'tolol', 'idiot', 'bodoh', 'kampret', 'brengsek',
  'kontol', 'memek', 'jembut', 'pepek', 'pantek', 'puki', 'itil',
  'jancuk', 'jancok', 'dancok', 'cuk', 'taik', 'tai', 'beol',
  'ngentot', 'entot', 'bokep', 'porno', 'sange', 'lonte', 'perek',
  'pelacur', 'sialan', 'setan', 'iblis', 'keparat', 'modar',
  // Bahasa Inggris umum
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy'
];

/**
 * Memeriksa apakah teks mengandung kata yang tidak diperbolehkan
 * @param {string} text - Teks pesan yang ingin diperiksa
 * @returns {{ isClean: boolean, detectedWords: string[], errorMessage: string | null }}
 */
export function checkProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { isClean: true, detectedWords: [], errorMessage: null };
  }

  // Normalisasi teks: lowercase, ganti leetspeak sederhana
  let normalized = text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's');

  const detectedWords = [];

  for (const word of INAPPROPRIATE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(word)) {
      detectedWords.push(word);
    }
  }

  const isClean = detectedWords.length === 0;

  return {
    isClean,
    detectedWords,
    errorMessage: isClean
      ? null
      : 'Pesan tidak dapat dikirim karena mengandung kata yang tidak diperbolehkan. Silakan gunakan bahasa yang sopan.'
  };
}

export default {
  checkProfanity,
  INAPPROPRIATE_WORDS
};
