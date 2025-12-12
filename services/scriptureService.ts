import { VerseData } from '../types';
import { searchVerse as searchVerseAI } from './geminiService';

// --- Abbreviation Mapping ---
// Comprehensive list ensuring at least 2 abbreviations for every book in the Standard Works
const BOOK_MAP: Record<string, string> = {
  // --- OLD TESTAMENT ---
  'gn': 'genesis', 'gen': 'genesis', 'genesis': 'genesis',
  'ex': 'exodus', 'exo': 'exodus', 'exodus': 'exodus',
  'lev': 'leviticus', 'lv': 'leviticus', 'leviticus': 'leviticus',
  'num': 'numbers', 'nm': 'numbers', 'numb': 'numbers', 'numbers': 'numbers',
  'deut': 'deuteronomy', 'dt': 'deuteronomy', 'deuteronomy': 'deuteronomy',
  'josh': 'joshua', 'jos': 'joshua', 'joshua': 'joshua',
  'judg': 'judges', 'jdg': 'judges', 'judges': 'judges',
  'ruth': 'ruth', 'ru': 'ruth', 'rut': 'ruth',
  '1sam': '1 samuel', '1sm': '1 samuel', '1sa': '1 samuel', '1 samuel': '1 samuel',
  '2sam': '2 samuel', '2sm': '2 samuel', '2sa': '2 samuel', '2 samuel': '2 samuel',
  '1kgs': '1 kings', '1kg': '1 kings', '1ki': '1 kings', '1 kings': '1 kings',
  '2kgs': '2 kings', '2kg': '2 kings', '2ki': '2 kings', '2 kings': '2 kings',
  '1chr': '1 chronicles', '1ch': '1 chronicles', '1 chronicles': '1 chronicles',
  '2chr': '2 chronicles', '2ch': '2 chronicles', '2 chronicles': '2 chronicles',
  'ezra': 'ezra', 'ezr': 'ezra',
  'neh': 'nehemiah', 'ne': 'nehemiah', 'nehemiah': 'nehemiah',
  'esth': 'esther', 'es': 'esther', 'est': 'esther', 'esther': 'esther',
  'job': 'job', 'jb': 'job',
  'ps': 'psalms', 'psm': 'psalms', 'psalm': 'psalms', 'psalms': 'psalms',
  'prov': 'proverbs', 'pr': 'proverbs', 'pro': 'proverbs', 'proverbs': 'proverbs',
  'eccl': 'ecclesiastes', 'ec': 'ecclesiastes', 'qoh': 'ecclesiastes', 'ecclesiastes': 'ecclesiastes',
  'song': 'song of solomon', 'sos': 'song of solomon', 'canticles': 'song of solomon', 'song of solomon': 'song of solomon',
  'isa': 'isaiah', 'is': 'isaiah', 'isaiah': 'isaiah',
  'jer': 'jeremiah', 'jr': 'jeremiah', 'jeremiah': 'jeremiah',
  'lam': 'lamentations', 'lm': 'lamentations', 'lamentations': 'lamentations',
  'ezek': 'ezekiel', 'ez': 'ezekiel', 'ezekiel': 'ezekiel',
  'dan': 'daniel', 'dn': 'daniel', 'daniel': 'daniel',
  'hos': 'hosea', 'ho': 'hosea', 'hosea': 'hosea',
  'joel': 'joel', 'jl': 'joel',
  'amos': 'amos', 'am': 'amos',
  'obad': 'obadiah', 'ob': 'obadiah', 'obadiah': 'obadiah',
  'jonah': 'jonah', 'jnh': 'jonah', 'jon': 'jonah',
  'mic': 'micah', 'mc': 'micah', 'micah': 'micah',
  'nah': 'nahum', 'na': 'nahum', 'nahum': 'nahum',
  'hab': 'habakkuk', 'hb': 'habakkuk', 'habakkuk': 'habakkuk',
  'zeph': 'zephaniah', 'zp': 'zephaniah', 'zephaniah': 'zephaniah',
  'hag': 'haggai', 'hg': 'haggai', 'haggai': 'haggai',
  'zech': 'zechariah', 'zc': 'zechariah', 'zechariah': 'zechariah',
  'mal': 'malachi', 'ml': 'malachi', 'malachi': 'malachi',

  // --- NEW TESTAMENT ---
  'matt': 'matthew', 'mt': 'matthew', 'mat': 'matthew', 'matthew': 'matthew',
  'mk': 'mark', 'mrk': 'mark', 'mar': 'mark', 'mark': 'mark',
  'lk': 'luke', 'luk': 'luke', 'lu': 'luke', 'luke': 'luke',
  'jh': 'john', 'jn': 'john', 'jhn': 'john', 'joh': 'john', 'john': 'john',
  'acts': 'acts', 'ac': 'acts', 'act': 'acts',
  'rom': 'romans', 'rm': 'romans', 'romans': 'romans',
  '1cor': '1 corinthians', '1co': '1 corinthians', '1 cor': '1 corinthians', '1 corinthians': '1 corinthians',
  '2cor': '2 corinthians', '2co': '2 corinthians', '2 cor': '2 corinthians', '2 corinthians': '2 corinthians',
  'gal': 'galatians', 'ga': 'galatians', 'galatians': 'galatians',
  'eph': 'ephesians', 'ep': 'ephesians', 'ephesians': 'ephesians',
  'phil': 'philippians', 'php': 'philippians', 'philippians': 'philippians',
  'col': 'colossians', 'cl': 'colossians', 'colossians': 'colossians',
  '1thess': '1 thessalonians', '1th': '1 thessalonians', '1 thess': '1 thessalonians', '1 thessalonians': '1 thessalonians',
  '2thess': '2 thessalonians', '2th': '2 thessalonians', '2 thess': '2 thessalonians', '2 thessalonians': '2 thessalonians',
  '1tim': '1 timothy', '1ti': '1 timothy', '1 tim': '1 timothy', '1 timothy': '1 timothy',
  '2tim': '2 timothy', '2ti': '2 timothy', '2 tim': '2 timothy', '2 timothy': '2 timothy',
  'tit': 'titus', 'ti': 'titus', 'titus': 'titus',
  'phlm': 'philemon', 'phm': 'philemon', 'philemon': 'philemon',
  'heb': 'hebrews', 'hebr': 'hebrews', 'hebrews': 'hebrews',
  'jam': 'james', 'jas': 'james', 'james': 'james',
  '1pet': '1 peter', '1pe': '1 peter', '1 peter': '1 peter',
  '2pet': '2 peter', '2pe': '2 peter', '2 peter': '2 peter',
  '1jn': '1 john', '1jo': '1 john', '1 john': '1 john',
  '2jn': '2 john', '2jo': '2 john', '2 john': '2 john',
  '3jn': '3 john', '3jo': '3 john', '3 john': '3 john',
  'jude': 'jude', 'jd': 'jude', 'jud': 'jude',
  'rev': 'revelation', 'rv': 'revelation', 'revelation': 'revelation',
  
  // --- BOOK OF MORMON ---
  '1ne': '1 nephi', '1_ne': '1 nephi', '1nephi': '1 nephi', '1 nephi': '1 nephi',
  '2ne': '2 nephi', '2_ne': '2 nephi', '2nephi': '2 nephi', '2 nephi': '2 nephi',
  'jac': 'jacob', 'jacob': 'jacob', 'jc': 'jacob',
  'enos': 'enos', 'en': 'enos',
  'jarom': 'jarom', 'jar': 'jarom',
  'omni': 'omni', 'om': 'omni',
  'wom': 'words of mormon', 'wofm': 'words of mormon', 'words': 'words of mormon', 'words of mormon': 'words of mormon',
  'mos': 'mosiah', 'mosiah': 'mosiah',
  'al': 'alma', 'alma': 'alma',
  'hel': 'helaman', 'helaman': 'helaman', 'he': 'helaman',
  '3ne': '3 nephi', '3_ne': '3 nephi', '3nephi': '3 nephi', '3 nephi': '3 nephi',
  '4ne': '4 nephi', '4_ne': '4 nephi', '4nephi': '4 nephi', '4 nephi': '4 nephi',
  'morm': 'mormon', 'mormon': 'mormon', 'mrm': 'mormon',
  'eth': 'ether', 'ether': 'ether',
  'moro': 'moroni', 'moroni': 'moroni',

  // --- DOCTRINE AND COVENANTS ---
  'dc': 'doctrine and covenants', 
  'd&c': 'doctrine and covenants', 
  'doc': 'doctrine and covenants',
  'doctrine and covenants': 'doctrine and covenants',

  // --- PEARL OF GREAT PRICE ---
  'moses': 'moses', 'mse': 'moses',
  'abr': 'abraham', 'abraham': 'abraham', 'ab': 'abraham',
  'jsm': 'joseph smith-matthew', 'js-m': 'joseph smith-matthew', 'joseph smith-matthew': 'joseph smith-matthew', 'joseph smith-mathew': 'joseph smith-matthew',
  'jsh': 'joseph smith-history', 'js-h': 'joseph smith-history', 'joseph smith-history': 'joseph smith-history',
  'aof': 'articles of faith', 'art': 'articles of faith', 'articles': 'articles of faith', 'articles of faith': 'articles of faith'
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
  // Pre-sanitize: lower case, replace em-dashes/en-dashes with hyphen, collapse spaces around dashes
  // This allows "Joseph Smith - Matthew" or "Joseph Smith—Matthew" to become "joseph smith-matthew"
  const clean = query.trim().toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/&/g, 'and'); // Handle ampersands

  // Regex Update: 
  // 1. Optional leading digits (e.g. "1" in "1 Nephi")
  // 2. Book text including chars, &, spaces, and hyphens (Lazy match)
  // 3. Optional Space
  // 4. Chapter number
  // 5. Verse number
  // Changed \s+ to \s* between group 2 and 3 to handle "Mat4:5"
  const regex = /^(\d*)?\s*([a-z&\s-]+?)\s*(\d+)[:.\s]*(\d+)$/;
  const match = clean.match(regex);
  if (!match) return null;

  const leadingNum = match[1] || '';
  const bookText = match[2];
  const chapter = parseInt(match[3]);
  const verse = parseInt(match[4]);
  
  const rawBook = (leadingNum + bookText).trim().replace(/\s+/g, ' '); 
  const normalizedBook = BOOK_MAP[rawBook] || rawBook; 

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
  if (book.includes('nephi') || book.includes('mosiah') || book.includes('alma') || book.includes('helaman') || book.includes('ether') || book.includes('moroni') || book.includes('jacob') || book.includes('enos') || book.includes('jarom') || book.includes('omni') || book.includes('words of mormon') || book.includes('mormon')) {
    volume = 'Book of Mormon';
    url = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/book-of-mormon.json';
    cache = bomCache;
  } else if (book.includes('doctrine') || book.includes('d&c')) {
    volume = 'D&C';
    url = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/doctrine-and-covenants.json';
    cache = dcCache;
  } else if (book.includes('moses') || book.includes('abraham') || book.includes('articles') || book.includes('joseph smith')) {
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

  // --- TRAVERSAL LOGIC (ROBUST) ---
  
  let chapters: any[] | undefined;
  let bookTitle = book; // Default title

  // Helper to handle Em-dash vs Hyphen vs En-dash AND spaces around them
  // This matches the cleanup done in parseQuery, ensuring database keys match search keys
  const normalizeTitle = (t: string) => t.toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/&/g, 'and')
    .trim();

  // 1. Try finding within "books" array (Standard format)
  if (cache.books && Array.isArray(cache.books)) {
    // Robust find: ignore case, ignore dash type, check for inclusion (e.g. "Joseph Smith-Matthew" vs "Joseph Smith—Matthew")
    const bookData = cache.books.find((b: any) => {
        const dbBook = normalizeTitle(b.book);
        const searchBook = normalizeTitle(book);
        return dbBook === searchBook || dbBook.includes(searchBook) || searchBook.includes(dbBook);
    });
    
    if (bookData) {
        // Exact book match found
        chapters = bookData.chapters;
        bookTitle = bookData.book;
    } else if (volume === 'D&C') {
        // Fallback: If we couldn't match name (e.g. "Doctrine and Covenants" vs "D&C"), but volume is D&C.
        // D&C JSON often contains "Doctrine and Covenants", "OD1", "OD2". 
        // We default to the first book if available, as it is invariably D&C.
        if (cache.books.length > 0) {
             chapters = cache.books[0].chapters;
             bookTitle = cache.books[0].book;
        }
    }
  }

  // 2. Try "sections" array (Alternative D&C format found in some JSON versions)
  if (!chapters && volume === 'D&C' && cache.sections && Array.isArray(cache.sections)) {
      chapters = cache.sections;
      bookTitle = "Doctrine and Covenants";
  }

  // 3. Try root "chapters" (Single-book JSON format)
  if (!chapters && cache.chapters && Array.isArray(cache.chapters)) {
      chapters = cache.chapters;
      // If we inferred volume earlier, use it as title
      if (volume === 'D&C') bookTitle = "Doctrine and Covenants";
      if (volume === 'Book of Mormon') bookTitle = book; 
  }

  // Final validation before access
  if (!chapters) {
      throw new Error(`Data structure mismatch: Could not locate chapters or sections for ${book}.`);
  }

  // Find Chapter/Section
  // Note: D&C chapters are sometimes keyed as 'section', sometimes 'chapter'
  const chapterData = chapters.find((c: any) => (c.chapter || c.section) == chapter);
  
  if (!chapterData) {
      throw new Error(`${volume === 'D&C' ? 'Section' : 'Chapter'} ${chapter} not found.`);
  }

  // Find Verse
  if (!chapterData.verses || !Array.isArray(chapterData.verses)) {
      throw new Error("Verses data missing or invalid in chapter.");
  }

  const verseData = chapterData.verses.find((v: any) => v.verse == verse);
  
  if (!verseData) {
      throw new Error(`Verse ${verse} not found.`);
  }

  return {
    reference: `${bookTitle} ${chapter}:${verse}`,
    text: verseData.text,
    book: bookTitle,
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
      const bibleBooks = ['matthew','mark','luke','john','acts','romans','corinthians','galatians','ephesians','philippians','colossians','thessalonians','timothy','titus','philemon','hebrews','james','peter','jude','revelation','genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','samuel','kings','chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','solomon','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi'];
      
      // Is it Bible? (Explicitly exclude Joseph Smith translations which might contain 'matthew' or 'history' to avoid conflict)
      // Check if book is standard bible AND doesn't start with 'joseph smith'
      if (bibleBooks.some(b => parsed.book.includes(b)) && !parsed.book.includes('joseph smith')) {
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