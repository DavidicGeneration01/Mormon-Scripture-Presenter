import { VerseData } from '../types';
import { searchVerse as searchVerseAI } from './geminiService';

// --- Abbreviation Mapping ---
const BOOK_MAP: Record<string, string> = {
  // Bible
  'gn': 'genesis', 'gen': 'genesis', 'genesis': 'genesis',
  'ex': 'exodus', 'exodus': 'exodus',
  'ps': 'psalms', 'psm': 'psalms', 'psalm': 'psalms', 'psalms': 'psalms',
  'matt': 'matthew', 'mt': 'matthew', 'matthew': 'matthew',
  'mk': 'mark', 'mark': 'mark',
  'lk': 'luke', 'luke': 'luke',
  'jh': 'john', 'jn': 'john', 'john': 'john',
  'rom': 'romans', 'romans': 'romans',
  '1cor': '1 corinthians', '1_cor': '1 corinthians', '1 cor': '1 corinthians',
  'jam': 'james', 'jas': 'james', 'james': 'james',
  
  // Book of Mormon
  '1ne': '1 nephi', '1_ne': '1 nephi', '1nephi': '1 nephi',
  '2ne': '2 nephi', '2_ne': '2 nephi', '2nephi': '2 nephi',
  'jac': 'jacob', 'jacob': 'jacob',
  'enos': 'enos',
  'mos': 'mosiah', 'mosiah': 'mosiah',
  'al': 'alma', 'alma': 'alma',
  'hel': 'helaman', 'helaman': 'helaman',
  '3ne': '3 nephi', '3_ne': '3 nephi', '3nephi': '3 nephi',
  '4ne': '4 nephi', '4_ne': '4 nephi', '4nephi': '4 nephi',
  'eth': 'ether', 'ether': 'ether',
  'moro': 'moroni', 'moroni': 'moroni',

  // D&C / PGP
  'dc': 'doctrine and covenants', 'd&c': 'doctrine and covenants', 'doc': 'doctrine and covenants',
  'moses': 'moses',
  'abr': 'abraham', 'abraham': 'abraham',
  'aof': 'articles of faith', 'art': 'articles of faith'
};

// --- In-Memory Cache for External LDS Data ---
let bomCache: any = null;
let dcCache: any = null;
let pgpCache: any = null;

// --- Local Offline Library (Instant Access) ---
const OFFLINE_LIBRARY: Record<string, VerseData> = {
  // --- Book of Mormon: 1 Nephi 3 (Verses 1-10 for Navigation Testing) ---
  "1_nephi_3_1": { reference: "1 Nephi 3:1", text: "And it came to pass that I, Nephi, returned from speaking with the Lord, to the tent of my father.", book: "1 Nephi", chapter: 3, verse: 1, version: "Book of Mormon" },
  "1_nephi_3_2": { reference: "1 Nephi 3:2", text: "And it came to pass that he spake unto me, saying: Behold I have dreamed a dream, in the which the Lord hath commanded me that thou and thy brethren shall return to Jerusalem.", book: "1 Nephi", chapter: 3, verse: 2, version: "Book of Mormon" },
  "1_nephi_3_3": { reference: "1 Nephi 3:3", text: "For behold, Laban hath the record of the Jews and also a genealogy of my forefathers, and they are engraven upon plates of brass.", book: "1 Nephi", chapter: 3, verse: 3, version: "Book of Mormon" },
  "1_nephi_3_4": { reference: "1 Nephi 3:4", text: "Wherefore, the Lord hath commanded me that thou and thy brothers should go unto the house of Laban, and seek the records, and bring them down hither into the wilderness.", book: "1 Nephi", chapter: 3, verse: 4, version: "Book of Mormon" },
  "1_nephi_3_5": { reference: "1 Nephi 3:5", text: "And now, behold thy brothers murmur, saying it is a hard thing which I have required of them; but behold I have not required it of them, but it is a commandment of the Lord.", book: "1 Nephi", chapter: 3, verse: 5, version: "Book of Mormon" },
  "1_nephi_3_6": { reference: "1 Nephi 3:6", text: "Therefore go, my son, and thou shalt be favored of the Lord, because thou hast not murmured.", book: "1 Nephi", chapter: 3, verse: 6, version: "Book of Mormon" },
  "1_nephi_3_7": { reference: "1 Nephi 3:7", text: "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.", book: "1 Nephi", chapter: 3, verse: 7, version: "Book of Mormon" },
  "1_nephi_3_8": { reference: "1 Nephi 3:8", text: "And it came to pass that when my father had heard these words he was exceedingly glad, for he knew that the Lord had been with me.", book: "1 Nephi", chapter: 3, verse: 8, version: "Book of Mormon" },
  "1_nephi_3_9": { reference: "1 Nephi 3:9", text: "And I, Nephi, and my brethren took our journey in the wilderness, with our tents, to go up to the land of Jerusalem.", book: "1 Nephi", chapter: 3, verse: 9, version: "Book of Mormon" },
  "1_nephi_3_10": { reference: "1 Nephi 3:10", text: "And it came to pass that when we had come up to the land of Jerusalem, I and my brethren did consult one with another.", book: "1 Nephi", chapter: 3, verse: 10, version: "Book of Mormon" },

  // --- Bible: John 5 (Verses 1-15) ---
  "john_5_1": { reference: "John 5:1", text: "After this there was a feast of the Jews; and Jesus went up to Jerusalem.", book: "John", chapter: 5, verse: 1, version: "KJV" },
  "john_5_2": { reference: "John 5:2", text: "Now there is at Jerusalem by the sheep market a pool, which is called in the Hebrew tongue Bethesda, having five porches.", book: "John", chapter: 5, verse: 2, version: "KJV" },
  "john_5_3": { reference: "John 5:3", text: "In these lay a great multitude of impotent folk, of blind, halt, withered, waiting for the moving of the water.", book: "John", chapter: 5, verse: 3, version: "KJV" },
  "john_5_4": { reference: "John 5:4", text: "For an angel went down at a certain season into the pool, and troubled the water: whosoever then first after the troubling of the water stepped in was made whole of whatsoever disease he had.", book: "John", chapter: 5, verse: 4, version: "KJV" },
  "john_5_5": { reference: "John 5:5", text: "And a certain man was there, which had an infirmity thirty and eight years.", book: "John", chapter: 5, verse: 5, version: "KJV" },
  "john_5_6": { reference: "John 5:6", text: "When Jesus saw him lie, and knew that he had been now a long time in that case, he saith unto him, Wilt thou be made whole?", book: "John", chapter: 5, verse: 6, version: "KJV" },
  "john_5_7": { reference: "John 5:7", text: "The impotent man answered him, Sir, I have no man, when the water is troubled, to put me into the pool: but while I am coming, another steppeth down before me.", book: "John", chapter: 5, verse: 7, version: "KJV" },
  "john_5_8": { reference: "John 5:8", text: "Jesus saith unto him, Rise, take up thy bed, and walk.", book: "John", chapter: 5, verse: 8, version: "KJV" },
  "john_5_9": { reference: "John 5:9", text: "And immediately the man was made whole, and took up his bed, and walked: and on the same day was the sabbath.", book: "John", chapter: 5, verse: 9, version: "KJV" },
  "john_5_10": { reference: "John 5:10", text: "The Jews therefore said unto him that was cured, It is the sabbath day: it is not lawful for thee to carry thy bed.", book: "John", chapter: 5, verse: 10, version: "KJV" },
  "john_5_39": { reference: "John 5:39", text: "Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me.", book: "John", chapter: 5, verse: 39, version: "KJV" },
};

/**
 * Advanced Parsing Logic
 */
const parseQuery = (query: string) => {
  const clean = query.trim().toLowerCase();
  // Regex to extract parts. Handles "1 ne 3:7", "1nephi 3 7", "jh5:5"
  const regex = /^(\d*)?\s*([a-z&]+)\s*(\d+)[:.\s]*(\d+)$/;
  const match = clean.match(regex);
  if (!match) return null;

  const leadingNum = match[1] || '';
  const bookText = match[2];
  const chapter = parseInt(match[3]);
  const verse = parseInt(match[4]);
  
  const rawBook = leadingNum + bookText; 
  const normalizedBook = BOOK_MAP[rawBook] || rawBook; // e.g. "1 nephi", "john"

  return { book: normalizedBook, chapter, verse };
};

const parseQueryToKey = (query: string): string | null => {
  const parsed = parseQuery(query);
  if(!parsed) return null;
  // Key format: "1_nephi_3_7" (matches offline keys)
  return `${parsed.book.replace(/ /g, '_')}_${parsed.chapter}_${parsed.verse}`;
};

/**
 * Public Bible API Fallback (KJV)
 */
const fetchFromBibleApi = async (book: string, chapter: number, verse: number): Promise<VerseData> => {
  // Convert "1 corinthians" -> "1corinthians" or standard api format
  const query = `${book} ${chapter}:${verse}`;
  const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);
  if (!response.ok) throw new Error("Not in Bible API");
  const data = await response.json();
  const v = data.verses[0];
  return {
    reference: data.reference,
    text: data.text.trim().replace(/\n/g, ' '),
    book: v.book_name,
    chapter: v.chapter,
    verse: v.verse,
    version: 'KJV'
  };
};

/**
 * Fetch LDS Scriptures from GitHub Public Data
 * This removes the need for an API Key for standard works.
 */
const fetchLdsScripture = async (book: string, chapter: number, verse: number): Promise<VerseData> => {
  let cache = null;
  let url = '';
  let volume = '';

  // Determine volume based on book name
  if (book.includes('nephi') || book.includes('mosiah') || book.includes('alma') || book.includes('helaman') || book.includes('ether') || book.includes('moroni') || book.includes('jacob') || book.includes('enos') || book.includes('jarom') || book.includes('omni') || book.includes('mormon')) {
    volume = 'Book of Mormon';
    url = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/book-of-mormon.json';
    cache = bomCache;
  } else if (book.includes('doctrine') || book.includes('d&c')) {
    volume = 'D&C';
    url = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/doctrine-and-covenants.json';
    cache = dcCache;
  } else if (book.includes('moses') || book.includes('abraham') || book.includes('articles')) {
    volume = 'Pearl of Great Price';
    url = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/pearl-of-great-price.json';
    cache = pgpCache;
  } else {
    throw new Error("Unknown book volume");
  }

  // Fetch if not cached
  if (!cache) {
    console.log(`Downloading ${volume} database...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${volume}`);
    cache = await response.json();
    
    // Set cache globally
    if (volume === 'Book of Mormon') bomCache = cache;
    if (volume === 'D&C') dcCache = cache;
    if (volume === 'Pearl of Great Price') pgpCache = cache;
  }

  // Traverse JSON structure (bcbooks format: books[].chapters[].verses[])
  // Need to normalize book name matching (e.g. "1 nephi" matches "1 Nephi")
  const bookData = cache.books.find((b: any) => b.book.toLowerCase() === book.toLowerCase());
  if (!bookData) throw new Error(`Book '${book}' not found in ${volume}`);

  const chapterData = bookData.chapters.find((c: any) => c.chapter == chapter);
  if (!chapterData) throw new Error(`Chapter ${chapter} not found`);

  const verseData = chapterData.verses.find((v: any) => v.verse == verse);
  if (!verseData) throw new Error(`Verse ${verse} not found`);

  return {
    reference: `${bookData.book} ${chapter}:${verse}`,
    text: verseData.text,
    book: bookData.book,
    chapter: chapter,
    verse: verse,
    version: volume
  };
};

/**
 * Main Search Function
 */
export const findScripture = async (query: string): Promise<VerseData> => {
  // 1. Parse Input
  const parsed = parseQuery(query);
  if (!parsed) throw new Error("Invalid format. Try '1 Nephi 3:7'");

  const offlineKey = `${parsed.book.replace(/ /g, '_')}_${parsed.chapter}_${parsed.verse}`;

  // 2. Check Local Library (Fastest)
  if (OFFLINE_LIBRARY[offlineKey]) {
    return OFFLINE_LIBRARY[offlineKey];
  }

  // 3. Check AI (If Key Exists) - We prefer this if available
  if (process.env.API_KEY && process.env.API_KEY.length > 5) {
      try {
        return await searchVerseAI(query);
      } catch (e) {
        console.warn("AI search failed, falling back to public sources.");
      }
  }

  // 4. Public Sources Fallback (No Key Needed)
  if (navigator.onLine) {
    try {
      // Is it Bible?
      if (['matthew','mark','luke','john','acts','romans','corinthians','galatians','ephesians','philippians','colossians','thessalonians','timothy','titus','philemon','hebrews','james','peter','jude','revelation','genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','samuel','kings','chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','solomon','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi'].some(b => parsed.book.includes(b))) {
         return await fetchFromBibleApi(parsed.book, parsed.chapter, parsed.verse);
      }
      
      // Is it LDS?
      return await fetchLdsScripture(parsed.book, parsed.chapter, parsed.verse);

    } catch (err: any) {
      throw new Error(err.message || "Verse not found in any database.");
    }
  }

  throw new Error("Offline: Verse not in local library.");
};