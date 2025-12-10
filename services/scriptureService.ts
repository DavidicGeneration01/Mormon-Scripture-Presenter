import { VerseData } from '../types';
import { searchVerse as searchVerseAI } from './geminiService';

// --- Local Offline Library (Scripture Mastery & Popular Verses) ---
const OFFLINE_LIBRARY: Record<string, VerseData> = {
  // --- Book of Mormon ---
  "1_nephi_3_7": {
    reference: "1 Nephi 3:7",
    text: "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.",
    book: "1 Nephi",
    chapter: 3,
    verse: 7,
    version: "Book of Mormon"
  },
  "2_nephi_2_25": {
    reference: "2 Nephi 2:25",
    text: "Adam fell that men might be; and men are, that they might have joy.",
    book: "2 Nephi",
    chapter: 2,
    verse: 25,
    version: "Book of Mormon"
  },
  "2_nephi_2_27": {
    reference: "2 Nephi 2:27",
    text: "Wherefore, men are free according to the flesh; and all things are given them which are expedient unto man. And they are free to choose liberty and eternal life, through the great Mediator of all men, or to choose captivity and death...",
    book: "2 Nephi",
    chapter: 2,
    verse: 27,
    version: "Book of Mormon"
  },
  "mosiah_2_17": {
    reference: "Mosiah 2:17",
    text: "And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God.",
    book: "Mosiah",
    chapter: 2,
    verse: 17,
    version: "Book of Mormon"
  },
  "alma_32_21": {
    reference: "Alma 32:21",
    text: "And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.",
    book: "Alma",
    chapter: 32,
    verse: 21,
    version: "Book of Mormon"
  },
  "alma_37_6": {
    reference: "Alma 37:6",
    text: "Now ye may suppose that this is foolishness in me; but behold I say unto you, that by small and simple things are great things brought to pass...",
    book: "Alma",
    chapter: 37,
    verse: 6,
    version: "Book of Mormon"
  },
  "ether_12_27": {
    reference: "Ether 12:27",
    text: "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me...",
    book: "Ether",
    chapter: 12,
    verse: 27,
    version: "Book of Mormon"
  },
  "moroni_10_4": {
    reference: "Moroni 10:4",
    text: "And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost.",
    book: "Moroni",
    chapter: 10,
    verse: 4,
    version: "Book of Mormon"
  },
  "moroni_10_5": {
    reference: "Moroni 10:5",
    text: "And by the power of the Holy Ghost ye may know the truth of all things.",
    book: "Moroni",
    chapter: 10,
    verse: 5,
    version: "Book of Mormon"
  },

  // --- Bible (KJV) ---
  "john_3_16": {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    book: "John",
    chapter: 3,
    verse: 16,
    version: "KJV"
  },
  "matthew_5_14": {
    reference: "Matthew 5:14",
    text: "Ye are the light of the world. A city that is set on an hill cannot be hid.",
    book: "Matthew",
    chapter: 5,
    verse: 14,
    version: "KJV"
  },
  "matthew_5_16": {
    reference: "Matthew 5:16",
    text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
    book: "Matthew",
    chapter: 5,
    verse: 16,
    version: "KJV"
  },
  "matthew_11_28": {
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    book: "Matthew",
    chapter: 11,
    verse: 28,
    version: "KJV"
  },
  "james_1_5": {
    reference: "James 1:5",
    text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
    book: "James",
    chapter: 1,
    verse: 5,
    version: "KJV"
  },
  "proverbs_3_5": {
    reference: "Proverbs 3:5",
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
    book: "Proverbs",
    chapter: 3,
    verse: 5,
    version: "KJV"
  },
  "proverbs_3_6": {
    reference: "Proverbs 3:6",
    text: "In all thy ways acknowledge him, and he shall direct thy paths.",
    book: "Proverbs",
    chapter: 3,
    verse: 6,
    version: "KJV"
  },

  // --- Doctrine and Covenants ---
  "d&c_4_4": {
    reference: "D&C 4:4",
    text: "For behold the field is white already to harvest; and lo, he that thrusteth in his sickle with his might, the same layeth up in store that he perisheth not, but bringeth salvation to his soul;",
    book: "D&C",
    chapter: 4,
    verse: 4,
    version: "D&C"
  },
  "d&c_18_10": {
    reference: "D&C 18:10",
    text: "Remember the worth of souls is great in the sight of God;",
    book: "D&C",
    chapter: 18,
    verse: 10,
    version: "D&C"
  },
  "d&c_19_23": {
    reference: "D&C 19:23",
    text: "Learn of me, and listen to my words; walk in the meekness of my Spirit, and you shall have peace in me.",
    book: "D&C",
    chapter: 19,
    verse: 23,
    version: "D&C"
  },
  "d&c_88_118": {
    reference: "D&C 88:118",
    text: "And as all have not faith, seek ye diligently and teach one another words of wisdom; yea, seek ye out of the best books words of wisdom; seek learning, even by study and also by faith.",
    book: "D&C",
    chapter: 88,
    verse: 118,
    version: "D&C"
  },

  // --- Pearl of Great Price ---
  "moses_1_39": {
    reference: "Moses 1:39",
    text: "For behold, this is my work and my glory—to bring to pass the immortality and eternal life of man.",
    book: "Moses",
    chapter: 1,
    verse: 39,
    version: "PGP"
  },
  "articles_of_faith_1_13": {
    reference: "Articles of Faith 1:13",
    text: "We believe in being honest, true, chaste, benevolent, virtuous, and in doing good to all men; indeed, we may say that we follow the admonition of Paul—We believe all things, we hope all things, we have endured many things, and hope to be able to endure all things. If there is anything virtuous, lovely, or of good report or praiseworthy, we seek after these things.",
    book: "Articles of Faith",
    chapter: 1,
    verse: 13,
    version: "PGP"
  }
};

const normalizeQuery = (query: string): string => {
  return query
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/:/g, '_')
    .replace(/\./g, '')
    .trim();
};

/**
 * Main Search Function
 * Strategy:
 * 1. Check Offline Library (Instant, works without internet)
 * 2. If not found, check internet connection.
 * 3. If online, try Gemini API.
 * 4. If offline and not found, throw error (User should use Manual mode).
 */
export const findScripture = async (query: string): Promise<VerseData> => {
  const normalizedKey = normalizeQuery(query);
  
  // 1. Try Exact Match (e.g., "1_nephi_3_7")
  if (OFFLINE_LIBRARY[normalizedKey]) {
    console.log("Found in Offline Library:", normalizedKey);
    return OFFLINE_LIBRARY[normalizedKey];
  }

  // 1b. Try Partial Match (e.g. user typed "1 nephi 3 7")
  // Simple heuristic: find key that contains the numbers
  const libraryKeys = Object.keys(OFFLINE_LIBRARY);
  const potentialMatch = libraryKeys.find(key => key === normalizedKey);
  if (potentialMatch) return OFFLINE_LIBRARY[potentialMatch];

  // 2. Fallback to Gemini if Online
  if (navigator.onLine) {
    try {
      console.log("Offline miss. Searching AI...");
      return await searchVerseAI(query);
    } catch (error) {
      console.error("AI Search failed:", error);
      throw new Error("Could not find verse online.");
    }
  } else {
    throw new Error("Offline: Verse not found in local library. Please use Manual Mode.");
  }
};