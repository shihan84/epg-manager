export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  script: string;
  rtl: boolean;
}

export const INDIAN_LANGUAGES: Language[] = [
  // Official Languages
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'IN',
    script: 'Latin',
    rtl: false,
  },

  // Scheduled Languages
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    region: 'IN',
    script: 'Assamese',
    rtl: false,
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'IN',
    script: 'Bengali',
    rtl: false,
  },
  {
    code: 'bo',
    name: 'Bodo',
    nativeName: 'बड़ो',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'IN',
    script: 'Gujarati',
    rtl: false,
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'IN',
    script: 'Kannada',
    rtl: false,
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कॉशुर',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'gom',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'IN',
    script: 'Malayalam',
    rtl: false,
  },
  {
    code: 'mni',
    name: 'Manipuri',
    nativeName: 'মৈতৈলোন্',
    region: 'IN',
    script: 'Meitei',
    rtl: false,
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    region: 'IN',
    script: 'Odia',
    rtl: false,
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'IN',
    script: 'Gurmukhi',
    rtl: false,
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    region: 'IN',
    script: 'Ol Chiki',
    rtl: false,
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    region: 'IN',
    script: 'Arabic',
    rtl: true,
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'IN',
    script: 'Tamil',
    rtl: false,
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'IN',
    script: 'Telugu',
    rtl: false,
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'IN',
    script: 'Arabic',
    rtl: true,
  },
];

export const COMMON_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'US',
    script: 'Latin',
    rtl: false,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'IN',
    script: 'Tamil',
    rtl: false,
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'IN',
    script: 'Telugu',
    rtl: false,
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'IN',
    script: 'Bengali',
    rtl: false,
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'IN',
    script: 'Gujarati',
    rtl: false,
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'IN',
    script: 'Kannada',
    rtl: false,
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'IN',
    script: 'Malayalam',
    rtl: false,
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'IN',
    script: 'Devanagari',
    rtl: false,
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'IN',
    script: 'Gurmukhi',
    rtl: false,
  },
];

export const ALL_LANGUAGES = [
  ...COMMON_LANGUAGES,
  ...INDIAN_LANGUAGES.filter(
    lang => !COMMON_LANGUAGES.find(common => common.code === lang.code)
  ),
];

export function getLanguageByCode(code: string): Language | undefined {
  return ALL_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguagesByRegion(region: string): Language[] {
  return ALL_LANGUAGES.filter(lang => lang.region === region);
}

export function getIndianLanguages(): Language[] {
  return INDIAN_LANGUAGES;
}

export function getCommonLanguages(): Language[] {
  return COMMON_LANGUAGES;
}

// Language-specific category translations
export const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    News: 'समाचार',
    Movies: 'फिल्में',
    Sports: 'खेल',
    Entertainment: 'मनोरंजन',
    Kids: 'बच्चे',
    Music: 'संगीत',
    Religious: 'धार्मिक',
    Educational: 'शैक्षिक',
    Documentary: 'वृत्तचित्र',
    Comedy: 'कॉमेडी',
    Drama: 'नाटक',
    Reality: 'रियलिटी',
    'Talk Show': 'टॉक शो',
    'Game Show': 'गेम शो',
    Cartoon: 'कार्टून',
    Animation: 'एनिमेशन',
  },
  ta: {
    News: 'செய்திகள்',
    Movies: 'திரைப்படங்கள்',
    Sports: 'விளையாட்டு',
    Entertainment: 'பொழுதுபோக்கு',
    Kids: 'குழந்தைகள்',
    Music: 'இசை',
    Religious: 'மத',
    Educational: 'கல்வி',
    Documentary: 'ஆவணப்படம்',
    Comedy: 'காமெடி',
    Drama: 'நாடகம்',
    Reality: 'ரியாலிட்டி',
    'Talk Show': 'பேச்சு நிகழ்ச்சி',
    'Game Show': 'விளையாட்டு நிகழ்ச்சி',
    Cartoon: 'கார்ட்டூன்',
    Animation: 'அனிமேஷன்',
  },
  te: {
    News: 'వార్తలు',
    Movies: 'సినిమాలు',
    Sports: 'క్రీడలు',
    Entertainment: 'వినోదం',
    Kids: 'పిల్లలు',
    Music: 'సంగీతం',
    Religious: 'మత',
    Educational: 'విద్య',
    Documentary: 'డాక్యుమెంటరీ',
    Comedy: 'కామెడీ',
    Drama: 'నాటకం',
    Reality: 'రియాలిటీ',
    'Talk Show': 'టాక్ షో',
    'Game Show': 'గేమ్ షో',
    Cartoon: 'కార్టూన్',
    Animation: 'అనిమేషన్',
  },
  bn: {
    News: 'খবর',
    Movies: 'সিনেমা',
    Sports: 'খেলাধুলা',
    Entertainment: 'বিনোদন',
    Kids: 'শিশু',
    Music: 'সংগীত',
    Religious: 'ধর্মীয়',
    Educational: 'শিক্ষামূলক',
    Documentary: 'প্রামাণ্যচিত্র',
    Comedy: 'কমেডি',
    Drama: 'নাটক',
    Reality: 'রিয়ালিটি',
    'Talk Show': 'টক শো',
    'Game Show': 'গেম শো',
    Cartoon: 'কার্টুন',
    Animation: 'অ্যানিমেশন',
  },
};

export function translateCategory(
  category: string,
  languageCode: string
): string {
  const translations = CATEGORY_TRANSLATIONS[languageCode];
  if (!translations) return category;
  return translations[category] || category;
}
