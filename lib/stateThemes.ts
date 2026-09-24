/**
 * Cultural identity registry — one visual + typographic identity per state / UT.
 *
 * Every entry carries the palette of that region's signature art form (pigment
 * colours wherever the tradition uses a fixed palette), a motif drawn from its
 * folklore, a display typeface family, and a short phrase in the local script.
 * Madhubani (Bihar) is the base theme the landing page rests on.
 */

export type MotifKey =
  | 'fish' | 'chakra' | 'trishul' | 'lotus' | 'peacock' | 'kolam' | 'paisley'
  | 'kalash' | 'sun' | 'elephant' | 'conch' | 'bamboo' | 'wave' | 'triangle'
  | 'stupa' | 'horse' | 'diamond' | 'shell';

/** Display typeface roles — resolved to CSS vars set by next/font in layout.tsx. */
export type FontKey =
  | 'classic'  /* Cormorant Garamond — Mithila / pan-Indian elegance */
  | 'royal'    /* Rozha One — Mughal, Indo-Persian, northern courts */
  | 'temple'   /* Marcellus — Dravidian temple, classical south */
  | 'folk';    /* Yatra One — tribal, folk, vernacular traditions */

export interface Palette {
  /** Page ground — always a handmade-paper tone, never pure white. */
  paper: string;
  /** Slightly deeper ground for panels and washes. */
  paperDeep: string;
  /** Primary text. */
  ink: string;
  /** Secondary text. */
  inkSoft: string;
  /** Signature pigment of the art form. */
  accent: string;
  /** Supporting pigment. */
  secondary: string;
  /** Third pigment, used sparingly in motifs and the canvas field. */
  tertiary: string;
  /** Hairline / border tone. */
  line: string;
}

export interface Shloka {
  /** Devanagari. */
  native: string;
  /** IAST transliteration. */
  roman: string;
  meaning: string;
  /** Where the line comes from — never guessed; "Traditional" when unfixed. */
  source: string;
}

export interface StateTheme {
  crafts: { name: string; featured: boolean }[];
  description: string;
  /** Kalakriti's home region. */
  primary?: boolean;
  /** Signature art form, shown as the identity badge. */
  art: string;
  /** Short phrase in the region's own script. */
  script: { native: string; roman: string; meaning: string };
  /** A Sanskrit line chosen to sit with this region's tradition. */
  shloka: Shloka;
  font: FontKey;
  motif: MotifKey;
  colors: Palette;
}

/* ── Base theme: Madhubani ────────────────────────────────────────────────
   Mithila's traditional palette — lamp-black kajal outline, sindoor red,
   turmeric yellow, indigo, and leaf green on unbleached handmade paper.   */
export const BASE_THEME: Palette = {
  paper:     '#3A0F14',
  paperDeep: '#2A0B0E',
  ink:       '#FFFBF2',
  inkSoft:   'rgba(255, 251, 242, 0.70)',
  accent:    '#D9A21B',
  secondary: '#E8E2D2',
  tertiary:  '#C4361B',
  line:      'rgba(255, 251, 242, 0.15)',
};

/** Sanskrit line carried across every theme — "truth, auspiciousness, beauty". */
export const BRAND_SHLOKA = {
  native:  'सत्यं शिवं सुन्दरम्',
  roman:   'satyaṁ śivaṁ sundaram',
  meaning: 'truth · auspiciousness · beauty',
};

export const STATE_THEMES: Record<string, StateTheme> = {
  'Bihar': {
    primary: true,
    art: 'Madhubani',
    crafts: [ { name: 'Madhubani painting', featured: true }, { name: 'Sikki grass work', featured: true }, { name: 'Sujani embroidery', featured: true }, { name: 'Makhana crafts', featured: true } ],
    description: "Kalakriti's heart. The Mithilanchal belt has sustained unbroken craft traditions for five centuries.",
    script: { native: 'मिथिला की माटी', roman: 'mithilā kī māṭī', meaning: 'the soil of Mithila' },
    shloka: { native: 'सत्यं वद धर्मं चर', roman: 'satyaṁ vada dharmaṁ cara', meaning: 'Speak the truth; walk in dharma.', source: 'Taittirīya Upaniṣad 1.11' },
    font: 'classic',
    motif: 'fish',
    colors: BASE_THEME,
  },

  'Andhra Pradesh': {
    art: 'Kalamkari',
    crafts: [ { name: 'Kalamkari', featured: true }, { name: 'Kondapalli toys', featured: true }, { name: 'Etikoppaka crafts', featured: true }, { name: 'Nirmal paintings', featured: true } ],
    description: 'Cradle of classical Kalamkari — pen and block-printed temple cloth art spanning 3,000 years.',
    script: { native: 'కళల భూమి', roman: 'kaḷala bhūmi', meaning: 'land of the arts' },
    shloka: { native: 'नमस्ते शारदे देवि', roman: 'namaste śārade devi', meaning: 'Salutations to Sharada, goddess of learning and art.', source: 'Traditional Sarasvatī prayer' },
    font: 'temple',
    motif: 'peacock',
    colors: { paper: '#FBF6EA', paperDeep: '#F2E8D3', ink: '#3B2412', inkSoft: 'rgba(59,36,18,0.60)', accent: '#8E3B1E', secondary: '#2C5E4A', tertiary: '#B08421', line: 'rgba(142,59,30,0.20)' },
  },
  'Arunanchal Pradesh': {
    art: 'Thangka',
    crafts: [ { name: 'Thangka paintings', featured: true }, { name: 'Tribal weaving', featured: true }, { name: 'Cane & bamboo', featured: true }, { name: 'Monpa masks', featured: true } ],
    description: 'Over 26 tribes, each with a distinct textile language — a living museum of northeast heritage.',
    script: { native: 'Donyi Polo', roman: 'donyi polo', meaning: 'sun and moon' },
    shloka: { native: 'तमसो मा ज्योतिर्गमय', roman: 'tamaso mā jyotir gamaya', meaning: 'From darkness, lead me to light.', source: 'Bṛhadāraṇyaka Upaniṣad 1.3.28' },
    font: 'folk',
    motif: 'sun',
    colors: { paper: '#F8F7F0', paperDeep: '#ECEBDE', ink: '#22301F', inkSoft: 'rgba(34,48,31,0.60)', accent: '#B8541E', secondary: '#2F6B52', tertiary: '#C9A227', line: 'rgba(47,107,82,0.22)' },
  },
  'Assam': {
    art: 'Muga Silk',
    crafts: [ { name: 'Muga silk', featured: true }, { name: 'Eri silk', featured: true }, { name: 'Pat silk', featured: true }, { name: 'Xorai bell metal', featured: true } ],
    description: 'Home of Muga — the only naturally golden silk in the world, exclusive to the Brahmaputra valley.',
    script: { native: 'শিল্পৰ দেশ', roman: 'śilpar dex', meaning: 'land of craft' },
    shloka: { native: 'मातृदेवो भव', roman: 'mātṛdevo bhava', meaning: 'Let your mother be as god to you.', source: 'Taittirīya Upaniṣad 1.11' },
    font: 'folk',
    motif: 'kalash',
    colors: { paper: '#FDF8E9', paperDeep: '#F4EBD0', ink: '#3A2E10', inkSoft: 'rgba(58,46,16,0.60)', accent: '#B8860B', secondary: '#2E6B4F', tertiary: '#8C4A1E', line: 'rgba(184,134,11,0.26)' },
  },
  'Chhattisgarh': {
    art: 'Dhokra',
    crafts: [ { name: 'Dhokra casting', featured: true }, { name: 'Bastar tribal art', featured: true }, { name: 'Bell metal', featured: true }, { name: 'Wrought iron', featured: true } ],
    description: "Dhokra — India's oldest metal casting tradition at 4,000+ years, still practised by Dhokra artisans.",
    script: { native: 'बस्तर के कला', roman: 'bastar ke kalā', meaning: 'the art of Bastar' },
    shloka: { native: 'उद्यमेन हि सिध्यन्ति कार्याणि', roman: 'udyamena hi sidhyanti kāryāṇi', meaning: 'It is by effort that works are accomplished.', source: 'Subhāṣita' },
    font: 'folk',
    motif: 'elephant',
    colors: { paper: '#F9F4E8', paperDeep: '#EEE5D0', ink: '#33260F', inkSoft: 'rgba(51,38,15,0.60)', accent: '#96601C', secondary: '#4A5B2B', tertiary: '#7C3B1B', line: 'rgba(150,96,28,0.22)' },
  },
  'Goa': {
    art: 'Kunbi Weave',
    crafts: [ { name: 'Coconut shell crafts', featured: true }, { name: 'Terracotta pottery', featured: true }, { name: 'Kunbi weaving', featured: true } ],
    description: 'Coastal craft tradition blending indigenous Konkani art with Portuguese colonial influences.',
    script: { native: 'कलेचो गांव', roman: 'kalecho gānv', meaning: 'village of art' },
    shloka: { native: 'लोकाः समस्ताः सुखिनो भवन्तु', roman: 'lokāḥ samastāḥ sukhino bhavantu', meaning: 'May all the worlds be happy.', source: 'Traditional invocation' },
    font: 'classic',
    motif: 'shell',
    colors: { paper: '#FBF7F0', paperDeep: '#F1EAE0', ink: '#2C2A24', inkSoft: 'rgba(44,42,36,0.60)', accent: '#C2411F', secondary: '#1F6E7A', tertiary: '#D3A02A', line: 'rgba(31,110,122,0.22)' },
  },
  'Gujarat': {
    art: 'Patola & Ajrakh',
    crafts: [ { name: 'Bandhani', featured: true }, { name: 'Patola silk', featured: true }, { name: 'Rogan art', featured: true }, { name: 'Kutch embroidery', featured: true }, { name: 'Ajrakh print', featured: true } ],
    description: 'Kutch alone hosts 20+ distinct craft traditions — the undisputed craft capital of India.',
    script: { native: 'કલાની ભૂમિ', roman: 'kalānī bhūmi', meaning: 'land of art' },
    shloka: { native: 'योगः कर्मसु कौशलम्', roman: 'yogaḥ karmasu kauśalam', meaning: 'Yoga is skill in action.', source: 'Bhagavad Gītā 2.50' },
    font: 'royal',
    motif: 'diamond',
    colors: { paper: '#FCF6EE', paperDeep: '#F3E9DC', ink: '#2B1A2E', inkSoft: 'rgba(43,26,46,0.60)', accent: '#A61E3C', secondary: '#1D3F73', tertiary: '#D98324', line: 'rgba(166,30,60,0.20)' },
  },
  'Haryana': {
    art: 'Phulkari',
    crafts: [ { name: 'Phulkari embroidery', featured: true }, { name: 'Pottery', featured: true }, { name: 'Darri weaving', featured: true } ],
    description: 'Phulkari — flower-work embroidery passed through generations of Punjabi women as living heirlooms.',
    script: { native: 'फुलकारी', roman: 'phulkārī', meaning: 'flower work' },
    shloka: { native: 'क्षणशः कणशश्चैव विद्यामर्थं च साधयेत्', roman: 'kṣaṇaśaḥ kaṇaśaścaiva vidyām arthaṁ ca sādhayet', meaning: 'Moment by moment, grain by grain, gather knowledge and wealth.', source: 'Subhāṣita' },
    font: 'royal',
    motif: 'lotus',
    colors: { paper: '#FDF7EC', paperDeep: '#F5EBD8', ink: '#3A2410', inkSoft: 'rgba(58,36,16,0.60)', accent: '#D2691E', secondary: '#B0182F', tertiary: '#C9A227', line: 'rgba(210,105,30,0.22)' },
  },
  'Himachal Pradesh': {
    art: 'Chamba Rumal',
    crafts: [ { name: 'Kullu shawls', featured: true }, { name: 'Chamba rumal', featured: true }, { name: 'Kinnauri shawls', featured: true }, { name: 'Wood carving', featured: true } ],
    description: 'Chamba Rumal — embroidered panels depicting Pahari miniature painting scenes in fine silk thread.',
    script: { native: 'देव भूमि', roman: 'deva bhūmi', meaning: 'land of the gods' },
    shloka: { native: 'शिवमस्तु सर्वजगतः', roman: 'śivam astu sarvajagataḥ', meaning: 'May there be well-being for all the world.', source: 'Traditional benediction' },
    font: 'royal',
    motif: 'trishul',
    colors: { paper: '#F8F8F3', paperDeep: '#ECEDE4', ink: '#22301C', inkSoft: 'rgba(34,48,28,0.60)', accent: '#9E2B2B', secondary: '#2B5D7A', tertiary: '#4F7A3A', line: 'rgba(43,93,122,0.22)' },
  },
  'Jammu & Kashmir': {
    art: 'Pashmina',
    crafts: [ { name: 'Pashmina', featured: true }, { name: 'Kashmiri embroidery', featured: true }, { name: 'Walnut wood carving', featured: true }, { name: 'Papier-mâché', featured: true }, { name: 'Kani shawls', featured: true } ],
    description: "Pashmina — fibre from the Changthangi goat at 14,000 ft, woven into the world's finest shawls.",
    script: { native: 'دستکاری', roman: 'dastkārī', meaning: 'handwork' },
    shloka: { native: 'शिवोऽहं शिवोऽहम्', roman: 'śivo’haṁ śivo’ham', meaning: 'I am Shiva, I am Shiva.', source: 'Nirvāṇa Ṣaṭkam, Ādi Śaṅkara' },
    font: 'royal',
    motif: 'paisley',
    colors: { paper: '#F6F8FA', paperDeep: '#E7EDF3', ink: '#1B2A3D', inkSoft: 'rgba(27,42,61,0.60)', accent: '#1D4E89', secondary: '#8E2F4A', tertiary: '#2E7D6B', line: 'rgba(29,78,137,0.22)' },
  },
  'Jharkhand': {
    art: 'Sohrai & Khovar',
    crafts: [ { name: 'Sohrai painting', featured: true }, { name: 'Khovar art', featured: true }, { name: 'Dokra metal', featured: true }, { name: 'Paitkar painting', featured: true } ],
    description: 'Sohrai — harvest festival wall art created by women on freshly mud-plastered walls each season.',
    script: { native: 'सोहराय', roman: 'sohrāy', meaning: 'the harvest painting' },
    shloka: { native: 'जननी जन्मभूमिश्च स्वर्गादपि गरीयसी', roman: 'jananī janmabhūmiśca svargādapi garīyasī', meaning: 'Mother and motherland are greater than heaven.', source: 'Traditional, attributed to the Rāmāyaṇa' },
    font: 'folk',
    motif: 'horse',
    colors: { paper: '#FAF4E9', paperDeep: '#F0E5D1', ink: '#2E2011', inkSoft: 'rgba(46,32,17,0.60)', accent: '#A34F1C', secondary: '#3D3026', tertiary: '#8A6A2E', line: 'rgba(163,79,28,0.22)' },
  },
  'Karnataka': {
    art: 'Bidriware',
    crafts: [ { name: 'Mysore silk', featured: true }, { name: 'Bidriware', featured: true }, { name: 'Lambani embroidery', featured: true }, { name: 'Channapatna toys', featured: true }, { name: 'Ilkal sarees', featured: true } ],
    description: 'Channapatna — the toy town of India, GI-protected since 2005, using lacquer on ivory wood.',
    script: { native: 'ಕಲೆಗಳ ನಾಡು', roman: 'kalegaḷa nāḍu', meaning: 'land of the arts' },
    shloka: { native: 'विद्या ददाति विनयम्', roman: 'vidyā dadāti vinayam', meaning: 'Knowledge gives humility.', source: 'Hitopadeśa' },
    font: 'temple',
    motif: 'elephant',
    colors: { paper: '#F7F5F0', paperDeep: '#EAE7DE', ink: '#231E1A', inkSoft: 'rgba(35,30,26,0.60)', accent: '#7A1F3D', secondary: '#1F4B4A', tertiary: '#B9942F', line: 'rgba(122,31,61,0.20)' },
  },
  'Kerala': {
    art: 'Kasavu',
    crafts: [ { name: 'Aranmula metal mirror', featured: true }, { name: 'Kasavu sarees', featured: true }, { name: 'Coir crafts', featured: true } ],
    description: 'Aranmula Kannadi — the only metal mirror in the world, a closely guarded family oral tradition.',
    script: { native: 'കലയുടെ നാട്', roman: 'kalayuṭe nāṭŭ', meaning: 'land of art' },
    shloka: { native: 'सर्वं खल्विदं ब्रह्म', roman: 'sarvaṁ khalvidaṁ brahma', meaning: 'All this, verily, is Brahman.', source: 'Chāndogya Upaniṣad 3.14.1' },
    font: 'temple',
    motif: 'conch',
    colors: { paper: '#FCFAF2', paperDeep: '#F1EEE0', ink: '#1F2E20', inkSoft: 'rgba(31,46,32,0.60)', accent: '#B8912E', secondary: '#1E5F3E', tertiary: '#9B3B1E', line: 'rgba(184,145,46,0.26)' },
  },
  'Madhya Pradesh': {
    art: 'Gond',
    crafts: [ { name: 'Chanderi silk', featured: true }, { name: 'Maheshwari silk', featured: true }, { name: 'Gond art', featured: true }, { name: 'Bagh print', featured: true } ],
    description: 'Chanderi silk — gossamer fabric woven since the 11th century with golden zari temple motifs.',
    script: { native: 'गोंड कला', roman: 'goṇḍ kalā', meaning: 'the Gond art' },
    shloka: { native: 'एकं सद्विप्रा बहुधा वदन्ति', roman: 'ekaṁ sad viprā bahudhā vadanti', meaning: 'Truth is one; the wise call it by many names.', source: 'Ṛgveda 1.164.46' },
    font: 'folk',
    motif: 'peacock',
    colors: { paper: '#FBF7EF', paperDeep: '#F1EADC', ink: '#26261A', inkSoft: 'rgba(38,38,26,0.60)', accent: '#C9541F', secondary: '#2F6E63', tertiary: '#D3A429', line: 'rgba(201,84,31,0.22)' },
  },
  'Maharashtra': {
    art: 'Warli',
    crafts: [ { name: 'Paithani silk', featured: true }, { name: 'Warli painting', featured: true }, { name: 'Kolhapuri chappals', featured: true }, { name: 'Himroo weaving', featured: true } ],
    description: "Warli — geometric tribal art from the Western Ghats, one of India's most ancient art forms.",
    script: { native: 'कलेची भूमी', roman: 'kalecī bhūmī', meaning: 'land of art' },
    shloka: { native: 'सङ्गच्छध्वं संवदध्वम्', roman: 'saṅgacchadhvaṁ saṁvadadhvam', meaning: 'Move together, speak together.', source: 'Ṛgveda 10.191.2' },
    font: 'folk',
    motif: 'triangle',
    colors: { paper: '#F6EFE2', paperDeep: '#EBE1CF', ink: '#3B2A18', inkSoft: 'rgba(59,42,24,0.60)', accent: '#8B4A22', secondary: '#5C4A32', tertiary: '#A8762F', line: 'rgba(139,74,34,0.24)' },
  },
  'Manipur': {
    art: 'Longpi',
    crafts: [ { name: 'Longpi pottery', featured: true }, { name: 'Moirang Phee weaving', featured: true }, { name: 'Kauna reed craft', featured: true } ],
    description: 'Longpi — unique black stone pottery of Manipur; no wheel used, entirely hand-built and burnished.',
    script: { native: 'শিল্পের ভূমি', roman: 'śilper bhūmi', meaning: 'land of craft' },
    shloka: { native: 'ॐ सह नाववतु', roman: 'oṁ saha nāvavatu', meaning: 'May we be protected together.', source: 'Śānti mantra, Taittirīya Upaniṣad' },
    font: 'folk',
    motif: 'lotus',
    colors: { paper: '#F7F6F2', paperDeep: '#E9E8E2', ink: '#20211F', inkSoft: 'rgba(32,33,31,0.60)', accent: '#3D4442', secondary: '#9E3A2A', tertiary: '#2E6B57', line: 'rgba(61,68,66,0.24)' },
  },
  'Meghalaya': {
    art: 'Eri Silk',
    crafts: [ { name: 'Eri silk', featured: true }, { name: 'Bamboo & cane weaving', featured: true }, { name: 'Dhara weaving', featured: true } ],
    description: 'Matrilineal society where woven cloth carries social, ritual, and identity significance.',
    script: { native: 'Ka Ri Bhoi', roman: 'ka ri bhoi', meaning: 'the land, in Khasi' },
    shloka: { native: 'यत्र नार्यस्तु पूज्यन्ते रमन्ते तत्र देवताः', roman: 'yatra nāryastu pūjyante ramante tatra devatāḥ', meaning: 'Where women are honoured, there the gods rejoice.', source: 'Manusmṛti 3.56' },
    font: 'folk',
    motif: 'bamboo',
    colors: { paper: '#F6F9F4', paperDeep: '#E7EEE3', ink: '#1F2C1F', inkSoft: 'rgba(31,44,31,0.60)', accent: '#3E7A45', secondary: '#8A5A22', tertiary: '#2C6B78', line: 'rgba(62,122,69,0.24)' },
  },
  'Mizoram': {
    art: 'Puan',
    crafts: [ { name: 'Puan weaving', featured: true }, { name: 'Bamboo crafts', featured: true }, { name: 'Puanchei textiles', featured: true } ],
    description: 'Puan — the traditional Mizo shawl; every pattern encodes tribal identity and social standing.',
    script: { native: 'Puanchei', roman: 'puanchei', meaning: 'the ceremonial weave' },
    shloka: { native: 'मित्रस्य चक्षुषा समीक्षामहे', roman: 'mitrasya cakṣuṣā samīkṣāmahe', meaning: 'May we look upon all with the eye of a friend.', source: 'Śukla Yajurveda 36.18' },
    font: 'folk',
    motif: 'diamond',
    colors: { paper: '#F8F7F3', paperDeep: '#EAE9E1', ink: '#232421', inkSoft: 'rgba(35,36,33,0.60)', accent: '#A82232', secondary: '#22503F', tertiary: '#C29A2C', line: 'rgba(168,34,50,0.22)' },
  },
  'Nagaland': {
    art: 'Naga Loin Loom',
    crafts: [ { name: 'Naga shawls', featured: true }, { name: 'Wood carving', featured: true }, { name: 'Bamboo crafts', featured: true }, { name: 'Beadwork', featured: true } ],
    description: 'Each Naga tribe has a distinct shawl pattern — a wearable language of status, lineage, and valor.',
    script: { native: 'Tsüngkotepsü', roman: 'tsüngkotepsü', meaning: 'the warrior shawl' },
    shloka: { native: 'आ नो भद्राः क्रतवो यन्तु विश्वतः', roman: 'ā no bhadrāḥ kratavo yantu viśvataḥ', meaning: 'Let noble thoughts come to us from every side.', source: 'Ṛgveda 1.89.1' },
    font: 'folk',
    motif: 'triangle',
    colors: { paper: '#F7F6F1', paperDeep: '#E9E7DE', ink: '#221F1C', inkSoft: 'rgba(34,31,28,0.60)', accent: '#9B2226', secondary: '#2B3A44', tertiary: '#C7952E', line: 'rgba(155,34,38,0.22)' },
  },
  'NCT of Delhi': {
    art: 'Zardozi',
    crafts: [ { name: 'Zardozi embroidery', featured: true }, { name: 'Meenakari', featured: true }, { name: 'Marble inlay', featured: true }, { name: 'Phulkari', featured: true } ],
    description: 'Historic centre of Mughal craft patronage — Zardozi gold-thread embroidery has thrived here since the 16th century.',
    script: { native: 'ज़रदोज़ी', roman: 'zardozī', meaning: 'gold embroidery' },
    shloka: { native: 'सत्यमेव जयते', roman: 'satyameva jayate', meaning: 'Truth alone triumphs.', source: 'Muṇḍaka Upaniṣad 3.1.6' },
    font: 'royal',
    motif: 'paisley',
    colors: { paper: '#FAF7EE', paperDeep: '#F0EADA', ink: '#2A2418', inkSoft: 'rgba(42,36,24,0.60)', accent: '#9C7A1E', secondary: '#5C1F3A', tertiary: '#2F5A6E', line: 'rgba(156,122,30,0.26)' },
  },
  'Odisha': {
    art: 'Pattachitra',
    crafts: [ { name: 'Pattachitra', featured: true }, { name: 'Sambalpuri silk', featured: true }, { name: 'Pipli appliqué', featured: true }, { name: 'Dhokra', featured: true } ],
    description: 'Pattachitra — scroll paintings depicting mythological narratives on cotton cloth or palm leaf.',
    script: { native: 'କଳାର ଭୂମି', roman: 'kaḷāra bhūmi', meaning: 'land of art' },
    shloka: { native: 'यत्र योगेश्वरः कृष्णो', roman: 'yatra yogeśvaraḥ kṛṣṇo', meaning: 'Where Krishna, lord of yoga, abides…', source: 'Bhagavad Gītā 18.78' },
    font: 'temple',
    motif: 'chakra',
    colors: { paper: '#FBF4E4', paperDeep: '#F2E7CE', ink: '#2E1B0E', inkSoft: 'rgba(46,27,14,0.60)', accent: '#B03A1A', secondary: '#1F5145', tertiary: '#D6A428', line: 'rgba(176,58,26,0.22)' },
  },
  'Punjab': {
    art: 'Phulkari',
    crafts: [ { name: 'Phulkari embroidery', featured: true }, { name: 'Jutti leather', featured: true }, { name: 'Tarkashi wire inlay', featured: true } ],
    description: "Phulkari — every stitch narrates a woman's life journey from birth through marriage and motherhood.",
    script: { native: 'ਕਲਾ ਦੀ ਧਰਤੀ', roman: 'kalā dī dhartī', meaning: 'land of art' },
    shloka: { native: 'अन्नं ब्रह्मेति व्यजानात्', roman: 'annaṁ brahmeti vyajānāt', meaning: 'He knew food to be Brahman.', source: 'Taittirīya Upaniṣad 3.2' },
    font: 'royal',
    motif: 'lotus',
    colors: { paper: '#FDF6E8', paperDeep: '#F6EAD2', ink: '#3A2313', inkSoft: 'rgba(58,35,19,0.60)', accent: '#D4441F', secondary: '#C48A16', tertiary: '#1F6B5B', line: 'rgba(212,68,31,0.22)' },
  },
  'Rajasthan': {
    art: 'Miniature & Blue Pottery',
    crafts: [ { name: 'Blue pottery', featured: true }, { name: 'Bandhani', featured: true }, { name: 'Block print', featured: true }, { name: 'Miniature painting', featured: true }, { name: 'Thewa jewelry', featured: true } ],
    description: 'Jaipur Blue Pottery — Persian-origin technique using quartz, not clay, producing sky-blue wares.',
    script: { native: 'रंगों की धरती', roman: 'raṅgoṁ kī dhartī', meaning: 'land of colours' },
    shloka: { native: 'धर्मो रक्षति रक्षितः', roman: 'dharmo rakṣati rakṣitaḥ', meaning: 'Dharma protects those who protect it.', source: 'Manusmṛti 8.15' },
    font: 'royal',
    motif: 'kalash',
    colors: { paper: '#FDF6EC', paperDeep: '#F5E9D6', ink: '#2B2338', inkSoft: 'rgba(43,35,56,0.60)', accent: '#1D6FA8', secondary: '#C0392B', tertiary: '#E0A02A', line: 'rgba(29,111,168,0.24)' },
  },
  'Sikkim': {
    art: 'Thangka',
    crafts: [ { name: 'Thangka painting', featured: true }, { name: 'Carpet weaving', featured: true }, { name: 'Lepcha weaving', featured: true } ],
    description: 'Thangka — Buddhist scroll paintings used as meditation aids, requiring years of dedicated training.',
    script: { native: 'འབྲས་ལྗོངས', roman: 'denjong', meaning: 'valley of rice' },
    shloka: { native: 'सर्वे भवन्तु सुखिनः', roman: 'sarve bhavantu sukhinaḥ', meaning: 'May all beings be happy.', source: 'Traditional śānti pāṭha' },
    font: 'temple',
    motif: 'stupa',
    colors: { paper: '#FAF8F1', paperDeep: '#EEEBDF', ink: '#231F2E', inkSoft: 'rgba(35,31,46,0.60)', accent: '#A62C1F', secondary: '#1F4F7A', tertiary: '#C79B25', line: 'rgba(166,44,31,0.22)' },
  },
  'Tamil Nadu': {
    art: 'Tanjore & Kolam',
    crafts: [ { name: 'Kanjivaram silk', featured: true }, { name: 'Tanjore painting', featured: true }, { name: 'Bronze casting', featured: true }, { name: 'Kolam art', featured: true } ],
    description: 'Kanjivaram — the queen of silks, woven with zari threads and Dravidian temple-inspired motifs.',
    script: { native: 'கலைகளின் தாயகம்', roman: 'kalaikaḷin tāyakam', meaning: 'homeland of the arts' },
    shloka: { native: 'या कुन्देन्दुतुषारहारधवला', roman: 'yā kundendu tuṣārahāradhavalā', meaning: 'She who is white as jasmine, moon, and snow.', source: 'Sarasvatī stotra' },
    font: 'temple',
    motif: 'kolam',
    colors: { paper: '#FCF6EA', paperDeep: '#F4E9D3', ink: '#2E1508', inkSoft: 'rgba(46,21,8,0.60)', accent: '#9E1B32', secondary: '#B58A1F', tertiary: '#1F5F52', line: 'rgba(158,27,50,0.22)' },
  },
  'Telangana': {
    art: 'Pochampally Ikat',
    crafts: [ { name: 'Pochampally Ikat', featured: true }, { name: 'Bidriware', featured: true }, { name: 'Nirmal paintings', featured: true }, { name: 'Gadwal sarees', featured: true } ],
    description: 'Pochampally Ikat — yarn dyed before weaving, creating geometric precision with a characteristic soft blur.',
    script: { native: 'కళల నేల', roman: 'kaḷala nela', meaning: 'soil of the arts' },
    shloka: { native: 'कर्मण्येवाधिकारस्ते', roman: 'karmaṇyevādhikāraste', meaning: 'Your right is to the work alone.', source: 'Bhagavad Gītā 2.47' },
    font: 'temple',
    motif: 'diamond',
    colors: { paper: '#F9F6EF', paperDeep: '#EEE9DB', ink: '#251F2C', inkSoft: 'rgba(37,31,44,0.60)', accent: '#7A2F6E', secondary: '#1F5B6E', tertiary: '#C08A24', line: 'rgba(122,47,110,0.22)' },
  },
  'Tripura': {
    art: 'Risa',
    crafts: [ { name: 'Risa cloth', featured: true }, { name: 'Tripura silk', featured: true }, { name: 'Bamboo crafts', featured: true } ],
    description: "Risa — traditional Tripuri women's fabric, handwoven with intricate tribal motifs and worn with pride.",
    script: { native: 'রিসা', roman: 'risā', meaning: 'the woven cloth' },
    shloka: { native: 'अतिथिदेवो भव', roman: 'atithidevo bhava', meaning: 'Let the guest be as god to you.', source: 'Taittirīya Upaniṣad 1.11' },
    font: 'folk',
    motif: 'bamboo',
    colors: { paper: '#F7F8F2', paperDeep: '#E9ECE0', ink: '#20291D', inkSoft: 'rgba(32,41,29,0.60)', accent: '#3B7A4A', secondary: '#A33B2A', tertiary: '#B98F26', line: 'rgba(59,122,74,0.24)' },
  },
  'Uttar Pradesh': {
    art: 'Banarasi & Chikankari',
    crafts: [ { name: 'Banarasi silk', featured: true }, { name: 'Chikankari embroidery', featured: true }, { name: 'Zardozi', featured: true }, { name: 'Blue pottery', featured: true } ],
    description: 'Banarasi silk — woven since the Mughal era with jangla, tanchoi, and cutwork patterns.',
    script: { native: 'काशी की कारीगरी', roman: 'kāśī kī kārīgarī', meaning: 'the craft of Kashi' },
    shloka: { native: 'गङ्गे च यमुने चैव', roman: 'gaṅge ca yamune caiva', meaning: 'O Ganga, and Yamuna too…', source: 'Traditional river invocation' },
    font: 'royal',
    motif: 'trishul',
    colors: { paper: '#FCF7EA', paperDeep: '#F4EBD4', ink: '#33230F', inkSoft: 'rgba(51,35,15,0.60)', accent: '#9B1B3C', secondary: '#B58A1C', tertiary: '#2A4E7A', line: 'rgba(155,27,60,0.22)' },
  },
  'Uttarakhand': {
    art: 'Aipan',
    crafts: [ { name: 'Aipan art', featured: true }, { name: 'Kinnauri shawls', featured: true }, { name: 'Copper crafts', featured: true }, { name: 'Pahari painting', featured: true } ],
    description: 'Aipan — ritual floor and wall art created by women using rice paste and ochre red clay.',
    script: { native: 'ऐपण', roman: 'aipaṇ', meaning: 'the ritual floor art' },
    shloka: { native: 'असतो मा सद्गमय', roman: 'asato mā sad gamaya', meaning: 'From the unreal, lead me to the real.', source: 'Bṛhadāraṇyaka Upaniṣad 1.3.28' },
    font: 'royal',
    motif: 'sun',
    colors: { paper: '#FBF3E9', paperDeep: '#F2E5D3', ink: '#3A1A0E', inkSoft: 'rgba(58,26,14,0.60)', accent: '#A32718', secondary: '#7A4A22', tertiary: '#2F6B54', line: 'rgba(163,39,24,0.24)' },
  },
  'West Bengal': {
    art: 'Kantha & Jamdani',
    crafts: [ { name: 'Kantha embroidery', featured: true }, { name: 'Baluchari silk', featured: true }, { name: 'Dokra casting', featured: true }, { name: 'Bankura horse', featured: true }, { name: 'Jamdani', featured: true } ],
    description: 'Jamdani — translucent muslin with woven geometric patterns, UNESCO-recognised intangible heritage.',
    script: { native: 'শিল্পের দেশ', roman: 'śilper deś', meaning: 'land of craft' },
    shloka: { native: 'काव्यशास्त्रविनोदेन कालो गच्छति धीमताम्', roman: 'kāvyaśāstravinodena kālo gacchati dhīmatām', meaning: 'The wise pass their time in poetry and learning.', source: 'Hitopadeśa' },
    font: 'classic',
    motif: 'horse',
    colors: { paper: '#FBF7F0', paperDeep: '#F1EADF', ink: '#2A1E14', inkSoft: 'rgba(42,30,20,0.60)', accent: '#B33A1F', secondary: '#1F4F6E', tertiary: '#C79A2A', line: 'rgba(179,58,31,0.22)' },
  },

  /* ── Union Territories ─────────────────────────────────────────────── */
  'Chandigarh': {
    art: 'Rock Garden Mosaic',
    crafts: [ { name: 'Rock Garden mosaic', featured: true }, { name: 'Phulkari', featured: true }, { name: 'Cane furniture', featured: true }, { name: 'Pottery', featured: true } ],
    description: "Nek Chand's Rock Garden — two decades of secret night-work turning industrial waste into a 40-acre folk-art city.",
    script: { native: 'ਕਲਾ ਦਾ ਸ਼ਹਿਰ', roman: 'kalā dā śahir', meaning: 'city of art' },
    shloka: { native: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते', roman: 'na hi jñānena sadṛśaṁ pavitram iha vidyate', meaning: 'Nothing in this world purifies like knowledge.', source: 'Bhagavad Gītā 4.38' },
    font: 'royal',
    motif: 'lotus',
    colors: { paper: '#FBF7EE', paperDeep: '#F1EADC', ink: '#2E2618', inkSoft: 'rgba(46,38,24,0.60)', accent: '#C2571F', secondary: '#2F5F6E', tertiary: '#C09A28', line: 'rgba(194,87,31,0.22)' },
  },
  'Andaman & Nicobar Island': {
    art: 'Padauk & Shell Craft',
    crafts: [ { name: 'Padauk woodwork', featured: true }, { name: 'Sea shell craft', featured: true }, { name: 'Nicobari mats', featured: true }, { name: 'Cane & bamboo', featured: true } ],
    description: 'Andaman padauk, close-grained and rose-dark, carved alongside shell inlay and Nicobari mat weaving.',
    script: { native: 'सागर शिल्प', roman: 'sāgar śilpa', meaning: 'craft of the sea' },
    shloka: { native: 'आपो हि ष्ठा मयोभुवः', roman: 'āpo hi ṣṭhā mayobhuvaḥ', meaning: 'O waters, you are the bringers of well-being.', source: 'Ṛgveda 10.9.1' },
    font: 'folk',
    motif: 'shell',
    colors: { paper: '#F4F9F9', paperDeep: '#E4EFEF', ink: '#173038', inkSoft: 'rgba(23,48,56,0.60)', accent: '#12707F', secondary: '#B5762A', tertiary: '#2E6B57', line: 'rgba(18,112,127,0.24)' },
  },
  'Dadara & Nagar Havelli': {
    art: 'Warli & Bamboo',
    crafts: [ { name: 'Warli painting', featured: true }, { name: 'Bamboo craft', featured: true }, { name: 'Warli beadwork', featured: true }, { name: 'Mat weaving', featured: true } ],
    description: 'Warli, Dhodia, and Kokna villages painting the same white rice-paste geometry their grandmothers did.',
    script: { native: 'वारली', roman: 'vārlī', meaning: 'the Warli people' },
    shloka: { native: 'वसुधैव कुटुम्बकम्', roman: 'vasudhaiva kuṭumbakam', meaning: 'The world is one family.', source: 'Mahā Upaniṣad 6.72' },
    font: 'folk',
    motif: 'triangle',
    colors: { paper: '#F4F0E4', paperDeep: '#E8E2D1', ink: '#33301F', inkSoft: 'rgba(51,48,31,0.60)', accent: '#7A5A2A', secondary: '#4B5C3A', tertiary: '#9E6B3C', line: 'rgba(122,90,42,0.24)' },
  },
  'Daman & Diu': {
    art: 'Shell & Palm Craft',
    crafts: [ { name: 'Sea shell craft', featured: true }, { name: 'Palm-leaf mats', featured: true }, { name: 'Fishing-net weaving', featured: true }, { name: 'Portuguese woodwork', featured: true } ],
    description: 'Four centuries of Portuguese carpentry settled into Gujarati shell, palm, and net craft along this coast.',
    script: { native: 'દરિયાઈ કલા', roman: 'dariyāī kalā', meaning: 'art of the sea' },
    shloka: { native: 'लोकाः समस्ताः सुखिनो भवन्तु', roman: 'lokāḥ samastāḥ sukhino bhavantu', meaning: 'May all the worlds be happy.', source: 'Traditional invocation' },
    font: 'classic',
    motif: 'wave',
    colors: { paper: '#F7F9F7', paperDeep: '#E8EFEB', ink: '#1E2E2C', inkSoft: 'rgba(30,46,44,0.60)', accent: '#1F6E7A', secondary: '#C2411F', tertiary: '#C79A2A', line: 'rgba(31,110,122,0.22)' },
  },
  'Lakshadweep': {
    art: 'Coir & Odam Craft',
    crafts: [ { name: 'Coir yarn & mats', featured: true }, { name: 'Odam boat building', featured: true }, { name: 'Coconut shell craft', featured: true }, { name: 'Sea shell work', featured: true } ],
    description: 'Coir spun from island husk, and the Odam — a sailing boat built plank by plank without a single drawing.',
    script: { native: 'ദ്വീപ് കല', roman: 'dvīp kala', meaning: 'island art' },
    shloka: { native: 'समुद्रवसने देवि', roman: 'samudravasane devi', meaning: 'O goddess robed in the ocean…', source: 'Traditional morning prayer to the earth' },
    font: 'temple',
    motif: 'wave',
    colors: { paper: '#F3F9FA', paperDeep: '#E2EFF2', ink: '#16303A', inkSoft: 'rgba(22,48,58,0.60)', accent: '#0E6E82', secondary: '#B08421', tertiary: '#2E7D6B', line: 'rgba(14,110,130,0.24)' },
  },
  'Puducherry': {
    art: 'Auroville Craft',
    crafts: [ { name: 'Auroville handmade paper', featured: true }, { name: 'Korai grass mats', featured: true }, { name: 'Studio pottery', featured: true }, { name: 'Leather sandals', featured: true } ],
    description: 'Auroville turned craft into practice — handmade paper, studio pottery, and Korai mats woven on the Coromandel coast.',
    script: { native: 'கலைத் துறை', roman: 'kalai tuṟai', meaning: 'the realm of art' },
    shloka: { native: 'तत्त्वमसि', roman: 'tattvamasi', meaning: 'That thou art.', source: 'Chāndogya Upaniṣad 6.8.7' },
    font: 'temple',
    motif: 'kolam',
    colors: { paper: '#FCF7F1', paperDeep: '#F2E9DF', ink: '#2A2018', inkSoft: 'rgba(42,32,24,0.60)', accent: '#B8452A', secondary: '#1F5F6E', tertiary: '#C99A2A', line: 'rgba(184,69,42,0.22)' },
  },
};

/**
 * Order of the opening showcase — begins at Mithila, Kalakriti's home, then
 * travels the country as a journey rather than an alphabetical list.
 */
export const TOUR_ORDER: string[] = [
  'Bihar', 'West Bengal', 'Odisha', 'Jharkhand',
  'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir',
  'Punjab', 'Haryana', 'Chandigarh', 'NCT of Delhi', 'Rajasthan', 'Gujarat',
  'Daman & Diu', 'Dadara & Nagar Havelli',
  'Madhya Pradesh', 'Chhattisgarh', 'Maharashtra', 'Goa',
  'Karnataka', 'Kerala', 'Tamil Nadu', 'Puducherry', 'Andhra Pradesh', 'Telangana',
  'Assam', 'Meghalaya', 'Arunanchal Pradesh', 'Nagaland',
  'Manipur', 'Mizoram', 'Tripura', 'Sikkim',
  /* The journey ends at sea. */
  'Lakshadweep', 'Andaman & Nicobar Island',
];

/** Nav grouping — how the state menu is organised. */
export const REGIONS: { label: string; states: string[] }[] = [
  { label: 'East & Mithila', states: ['Bihar', 'West Bengal', 'Odisha', 'Jharkhand'] },
  { label: 'North',          states: ['Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Punjab', 'Haryana', 'NCT of Delhi', 'Chandigarh'] },
  { label: 'West',           states: ['Rajasthan', 'Gujarat', 'Maharashtra', 'Goa', 'Dadara & Nagar Havelli', 'Daman & Diu'] },
  { label: 'Central',        states: ['Madhya Pradesh', 'Chhattisgarh'] },
  { label: 'South',          states: ['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Puducherry'] },
  { label: 'Northeast',      states: ['Assam', 'Meghalaya', 'Arunanchal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Sikkim'] },
  { label: 'Islands',        states: ['Andaman & Nicobar Island', 'Lakshadweep'] },
];

/** Display name — the geojson's formal names are not what people read. */
export function displayName(state: string): string {
  return state === 'NCT of Delhi' ? 'Delhi'
    : state === 'Andaman & Nicobar Island' ? 'Andaman & Nicobar'
    : state === 'Dadara & Nagar Havelli' ? 'Dadra & Nagar Haveli'
    : state === 'Arunanchal Pradesh' ? 'Arunachal Pradesh'
    : state;
}

/** Theme for a state name, falling back to the Madhubani base. */
export function themeFor(state: string | null | undefined): StateTheme {
  return (state && STATE_THEMES[state]) || STATE_THEMES['Bihar'];
}

/** Palette for a state name — the base Madhubani palette when unresolved. */
export function paletteFor(state: string | null | undefined): Palette {
  return (state && STATE_THEMES[state]?.colors) || BASE_THEME;
}
