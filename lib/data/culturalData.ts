export interface StateData {
  id: string;
  name: string;
  slug: string;
  mapId: string;
  heroImage?: string;
  shortDescription: string;
  longDescription: string;
  aliases?: string[];
  translations?: Record<string, string>;
  tagline?: string;
  native?: string;
}

export interface CityData {
  id: string;
  name: string;
  stateId: string;
  stateSlug: string;
  stateName: string;
  regionId?: string;
  regionName?: string;
  aliases?: string[];
}

export interface RegionData {
  id: string;
  stateId: string;
  name: string;
  image?: string;
  description: string;
}

export interface CraftData {
  id: string;
  name: string;
  stateId: string;
  regionIds: string[];
  image?: string;
  origin: string;
  description: string;
  culturalSignificance: string;
  materials: string[];
  process: string;
  
  // Extended details for state/craft pages
  native?: string;
  hook?: string;
  story?: string;
  technique?: string;
  makers?: string;
  gi?: string;
  motif?: any;
  images?: string[];
  translations?: Record<string, string>;
  aliases?: string[];
}

export interface ArtisanData {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  regionId: string;
  regionName?: string;
  cityId?: string;
  cityName?: string;
  craftIds: string[];
  image?: string;
  location: string;
  biography: string;
}

export interface CulturalFact {
  id: string;
  stateId: string;
  regionId?: string;
  category: 'clothing' | 'food' | 'festival' | 'music' | 'dance' | 'architecture' | 'heritage';
  name: string;
  description: string;
  image?: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProductData {
  id: string;
  name: string;
  artisanId: string;
  stateId: string;
  regionId: string;
  craftId: string;
  images: ProductImage[];
  description: string;
  origin: string;
  price: number;
}

// Sample Mock Data focused on Punjab & Rajasthan for initial rendering

export const STATES: StateData[] = [
  { id: 's_andhra_pradesh', name: 'Andhra Pradesh', slug: 'andhra-pradesh', mapId: 'Andhra Pradesh', shortDescription: 'The land of Kalamkari and rich heritage.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_arunanchal_pradesh', name: 'Arunanchal Pradesh', slug: 'arunanchal-pradesh', mapId: 'Arunanchal Pradesh', shortDescription: 'Discover the traditions of Arunanchal Pradesh.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['Arunachal Pradesh'] },
  { id: 's_assam', name: 'Assam', slug: 'assam', mapId: 'Assam', shortDescription: 'The land of red river and blue hills.', longDescription: 'Assam is famous for its rolling tea gardens, the mighty Brahmaputra river, and the Kaziranga National Park. Known for beautiful Muga silk and bamboo crafts.' },
  { id: 's_bihar', name: 'Bihar', slug: 'bihar', mapId: 'Bihar', shortDescription: 'Ancient land of art, intellect, and timeless craft.', longDescription: 'Bihar is the birthplace of ancient empires and religions. It is world-famous for Madhubani art, Sikki grass craft, and Sujuni embroidery, representing deep cultural storytelling.' },
  { id: 's_chhattisgarh', name: 'Chhattisgarh', slug: 'chhattisgarh', mapId: 'Chhattisgarh', shortDescription: 'Discover the traditions of Chhattisgarh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_goa', name: 'Goa', slug: 'goa', mapId: 'Goa', shortDescription: 'Discover the traditions of Goa.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_gujarat', name: 'Gujarat', slug: 'gujarat', mapId: 'Gujarat', shortDescription: 'Vibrant traditions and stunning textiles.', longDescription: 'Gujarat is celebrated for its diverse landscapes and rich cultural heritage. Famous for Kutch embroidery, Patola sarees, and the spectacular Rann Utsav.' },
  { id: 's_haryana', name: 'Haryana', slug: 'haryana', mapId: 'Haryana', shortDescription: 'Discover the traditions of Haryana.', longDescription: 'A vibrant region of India with rich cultural heritage.', translations: { hi: 'हरियाणा' } },
  { id: 's_himachal_pradesh', name: 'Himachal Pradesh', slug: 'himachal-pradesh', mapId: 'Himachal Pradesh', shortDescription: 'Discover the traditions of Himachal Pradesh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_jharkhand', name: 'Jharkhand', slug: 'jharkhand', mapId: 'Jharkhand', shortDescription: 'Discover the traditions of Jharkhand.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_karnataka', name: 'Karnataka', slug: 'karnataka', mapId: 'Karnataka', shortDescription: 'One state, many worlds.', longDescription: 'Karnataka offers a mix of modern tech cities and ancient ruins like Hampi. Famous for Mysore silk, sandalwood crafts, and rich classical music traditions.', translations: { kn: 'ಕರ್ನಾಟಕ' } },
  { id: 's_kerala', name: 'Kerala', slug: 'kerala', mapId: 'Kerala', shortDescription: 'God\'s Own Country.', longDescription: 'Kerala is known for its palm-lined beaches, tranquil backwaters, and Ayurvedic treatments. It has a rich tradition of Kathakali dance and coir crafts.' },
  { id: 's_madhya_pradesh', name: 'Madhya Pradesh', slug: 'madhya-pradesh', mapId: 'Madhya Pradesh', shortDescription: 'Discover the traditions of Madhya Pradesh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_maharashtra', name: 'Maharashtra', slug: 'maharashtra', mapId: 'Maharashtra', shortDescription: 'A rich tapestry of history and culture.', longDescription: 'Maharashtra is home to the bustling city of Mumbai, ancient caves, and historic forts. It is known for Warli painting, Paithani sarees, and vibrant festivals like Ganesh Chaturthi.' },
  { id: 's_manipur', name: 'Manipur', slug: 'manipur', mapId: 'Manipur', shortDescription: 'Discover the traditions of Manipur.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_meghalaya', name: 'Meghalaya', slug: 'meghalaya', mapId: 'Meghalaya', shortDescription: 'Discover the traditions of Meghalaya.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_mizoram', name: 'Mizoram', slug: 'mizoram', mapId: 'Mizoram', shortDescription: 'Discover the traditions of Mizoram.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_nagaland', name: 'Nagaland', slug: 'nagaland', mapId: 'Nagaland', shortDescription: 'Discover the traditions of Nagaland.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_odisha', name: 'Odisha', slug: 'odisha', mapId: 'Odisha', shortDescription: 'Soul of Incredible India.', longDescription: 'Odisha is known for its tribal cultures, ancient Hindu temples, and the majestic Rath Yatra. Famous for Pattachitra art and intricate silver filigree.', aliases: ['Orissa'] },
  { id: 's_punjab', name: 'Punjab', slug: 'punjab', mapId: 'Punjab', shortDescription: 'Where colour, music and craftsmanship live together.', longDescription: 'Punjab, the land of five rivers, is known for its vibrant culture, rich agriculture, and legendary hospitality. It is home to world-renowned crafts like Phulkari embroidery, traditional Punjabi Juttis, and dynamic folk dances like Bhangra.', translations: { pa: 'ਪੰਜਾਬ' } },
  { id: 's_rajasthan', name: 'Rajasthan', slug: 'rajasthan', mapId: 'Rajasthan', shortDescription: 'The land of colour, craft and living traditions.', longDescription: 'Rajasthan boasts a majestic heritage of forts, palaces, and deserts. Its cultural identity is deeply woven into intricate crafts like Blue Pottery, Block Printing, Bandhani, and traditional jewelry.' },
  { id: 's_sikkim', name: 'Sikkim', slug: 'sikkim', mapId: 'Sikkim', shortDescription: 'Discover the traditions of Sikkim.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_tamil_nadu', name: 'Tamil Nadu', slug: 'tamil-nadu', mapId: 'Tamil Nadu', shortDescription: 'The land of ancient temples and timeless weaves.', longDescription: 'Tamil Nadu is famous for its monumental Dravidian Hindu temples and classical Indian dance. It is renowned for Kanchipuram silk sarees and intricate bronze casting.', translations: { ta: 'தமிழ்நாடு' } },
  { id: 's_telangana', name: 'Telangana', slug: 'telangana', mapId: 'Telangana', shortDescription: 'Discover the traditions of Telangana.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_tripura', name: 'Tripura', slug: 'tripura', mapId: 'Tripura', shortDescription: 'Discover the traditions of Tripura.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_uttar_pradesh', name: 'Uttar Pradesh', slug: 'uttar-pradesh', mapId: 'Uttar Pradesh', shortDescription: 'Discover the traditions of Uttar Pradesh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_uttarakhand', name: 'Uttarakhand', slug: 'uttarakhand', mapId: 'Uttarakhand', shortDescription: 'Discover the traditions of Uttarakhand.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['Uttaranchal'] },
  { id: 's_west_bengal', name: 'West Bengal', slug: 'west-bengal', mapId: 'West Bengal', shortDescription: 'Discover the traditions of West Bengal.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_andaman_nicobar', name: 'Andaman and Nicobar Islands', slug: 'andaman-nicobar', mapId: 'Andaman & Nicobar Island', shortDescription: 'Discover the traditions of Andaman & Nicobar.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['Andaman & Nicobar Island', 'Andaman'] },
  { id: 's_chandigarh', name: 'Chandigarh', slug: 'chandigarh', mapId: 'Chandigarh', shortDescription: 'Discover the traditions of Chandigarh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_dadra_nagar_haveli', name: 'Dadra and Nagar Haveli and Daman and Diu', slug: 'dadra-nagar-haveli-daman-diu', mapId: 'Dadara & Nagar Havelli', shortDescription: 'Discover the traditions of Dadra & Nagar Haveli.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['Dadara & Nagar Havelli', 'Daman & Diu', 'Daman and Diu', 'Dadra and Nagar Haveli'] },
  { id: 's_delhi', name: 'Delhi', slug: 'delhi', mapId: 'NCT of Delhi', shortDescription: 'Discover the traditions of Delhi.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['NCT of Delhi', 'New Delhi'] },
  { id: 's_jammu_kashmir', name: 'Jammu & Kashmir', slug: 'jammu-kashmir', mapId: 'Jammu & Kashmir', shortDescription: 'Paradise on earth.', longDescription: 'Jammu & Kashmir is known for its breathtaking landscapes and serene lakes. Famous for Pashmina shawls, intricate walnut wood carving, and paper mache crafts.', aliases: ['Jammu and Kashmir'] },
  { id: 's_ladakh', name: 'Ladakh', slug: 'ladakh', mapId: 'Ladakh', shortDescription: 'Discover the traditions of Ladakh.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_lakshadweep', name: 'Lakshadweep', slug: 'lakshadweep', mapId: 'Lakshadweep', shortDescription: 'Discover the traditions of Lakshadweep.', longDescription: 'A vibrant region of India with rich cultural heritage.' },
  { id: 's_puducherry', name: 'Puducherry', slug: 'puducherry', mapId: 'Puducherry', shortDescription: 'Discover the traditions of Puducherry.', longDescription: 'A vibrant region of India with rich cultural heritage.', aliases: ['Pondicherry'] }
];

export const CITIES: CityData[] = [
  { id: 'city_madurai', name: 'Madurai', stateId: 's_tamil_nadu', stateSlug: 'tamil-nadu', stateName: 'Tamil Nadu' },
  { id: 'city_jaipur', name: 'Jaipur', stateId: 's_rajasthan', stateSlug: 'rajasthan', stateName: 'Rajasthan' },
  { id: 'city_amritsar', name: 'Amritsar', stateId: 's_punjab', stateSlug: 'punjab', stateName: 'Punjab' },
  { id: 'city_srinagar', name: 'Srinagar', stateId: 's_jammu_kashmir', stateSlug: 'jammu-kashmir', stateName: 'Jammu & Kashmir' },
  { id: 'city_varanasi', name: 'Varanasi', stateId: 's_uttar_pradesh', stateSlug: 'uttar-pradesh', stateName: 'Uttar Pradesh', aliases: ['Kashi', 'Banaras'] },
  { id: 'city_mysuru', name: 'Mysuru', aliases: ['Mysore'], stateId: 's_karnataka', stateSlug: 'karnataka', stateName: 'Karnataka' },
  { id: 'city_kutch', name: 'Kutch', stateId: 's_gujarat', stateSlug: 'gujarat', stateName: 'Gujarat' },
  { id: 'city_kolkata', name: 'Kolkata', aliases: ['Calcutta'], stateId: 's_west_bengal', stateSlug: 'west-bengal', stateName: 'West Bengal' },
  { id: 'city_patiala', name: 'Patiala', stateId: 's_punjab', stateSlug: 'punjab', stateName: 'Punjab', regionId: 'r_patiala', regionName: 'Patiala' },
  { id: 'city_panipat', name: 'Panipat', stateId: 's_haryana', stateSlug: 'haryana', stateName: 'Haryana' },
  { id: 'city_lucknow', name: 'Lucknow', stateId: 's_uttar_pradesh', stateSlug: 'uttar-pradesh', stateName: 'Uttar Pradesh' },
  { id: 'city_kochi', name: 'Kochi', stateId: 's_kerala', stateSlug: 'kerala', stateName: 'Kerala', aliases: ['Cochin'] },
  { id: 'city_ahmedabad', name: 'Ahmedabad', stateId: 's_gujarat', stateSlug: 'gujarat', stateName: 'Gujarat' },
  { id: 'city_mumbai', name: 'Mumbai', stateId: 's_maharashtra', stateSlug: 'maharashtra', stateName: 'Maharashtra', aliases: ['Bombay'] },
  { id: 'city_chennai', name: 'Chennai', stateId: 's_tamil_nadu', stateSlug: 'tamil-nadu', stateName: 'Tamil Nadu', aliases: ['Madras'] },
  { id: 'city_bengaluru', name: 'Bengaluru', stateId: 's_karnataka', stateSlug: 'karnataka', stateName: 'Karnataka', aliases: ['Bangalore'] }
];

export const REGIONS: RegionData[] = [
  { id: 'r_patiala', stateId: 's_punjab', name: 'Patiala', description: 'Known for its royal heritage, Phulkari crafts, and the famous Patiala peg and Jutti.' },
  { id: 'r_jaipur', stateId: 's_rajasthan', name: 'Jaipur', description: 'The Pink City, known globally for its Blue Pottery, block prints, and exquisite jewelry.' },
  { id: 'r_mithila', stateId: 's_bihar', name: 'Mithila', description: 'The cultural heartland of Bihar, famous globally for its intricate Madhubani paintings.' }
];

export const CRAFTS: CraftData[] = [
  {
    id: 'c_phulkari',
    name: 'Phulkari',
    stateId: 's_punjab',
    regionIds: ['r_patiala'],
    origin: 'Punjab / Surrounding regions',
    description: 'Traditional embroidery of Punjab, literally translating to "flower work". It features bright colors and intricate geometric patterns.',
    culturalSignificance: 'Woven into the life of Punjabi women, traditionally gifted during weddings and festivals as a symbol of love and blessings.',
    materials: ['Khaddar (cotton cloth)', 'Pat (silk thread)'],
    process: 'Embroidered entirely on the wrong side of the cloth using darn stitch, creating a vibrant pattern on the front.',
    images: ['/images/crafts/phulkari_main.jpg', '/images/crafts/phulkari_detail.jpg']
  },
  {
    id: 'c_blue_pottery',
    name: 'Blue Pottery',
    stateId: 's_rajasthan',
    regionIds: ['r_jaipur'],
    origin: 'Jaipur, Rajasthan',
    description: 'Recognized by its striking cobalt blue dye, it is a unique form of pottery that does not use clay.',
    culturalSignificance: 'A blend of Turko-Persian origins and Indian craftsmanship, introduced to Jaipur in the 19th century.',
    materials: ['Quartz stone powder', 'Powdered glass', 'Multani Mitti (Fuller\'s Earth)', 'Borax', 'Gum'],
    process: 'The dough is pressed into molds, fired once, painted with cobalt oxide, glazed, and fired again at low temperatures.'
  },
  {
    id: 'c_madhubani',
    name: 'Madhubani Painting',
    stateId: 's_bihar',
    regionIds: ['r_mithila'],
    origin: 'Mithila region, Bihar',
    description: 'A traditional style of painting characterized by eye-catching geometrical patterns and vibrant natural colors.',
    culturalSignificance: 'Originally created by women on the freshly plastered mud walls of their huts to celebrate festivals, weddings, and nature.',
    materials: ['Natural dyes (turmeric, indigo, sandalwood)', 'Twigs', 'Nibs', 'Matchsticks'],
    process: 'Artists paint complex natural and mythological scenes without leaving any empty space, using traditional tools.',
    images: ['/images/crafts/madhubani_main.jpg', '/images/crafts/madhubani_detail.jpg']
  }
];

export const ARTISANS: ArtisanData[] = [
  {
    id: 'a_harpreet',
    name: 'Harpreet Kaur',
    stateId: 's_punjab',
    stateName: 'Punjab',
    regionId: 'r_patiala',
    regionName: 'Patiala',
    cityId: 'city_patiala',
    cityName: 'Patiala',
    craftIds: ['c_phulkari'],
    location: 'Patiala, Punjab',
    biography: 'Harpreet comes from a lineage of Phulkari weavers. For over three decades, she has been preserving traditional Bagh embroidery techniques.'
  },
  {
    id: 'a_sunita',
    name: 'Sunita Devi',
    stateId: 's_bihar',
    stateName: 'Bihar',
    regionId: 'r_mithila',
    regionName: 'Mithila',
    craftIds: ['c_madhubani'],
    location: 'Madhubani, Bihar',
    biography: 'A master artist recognized for her intricate line work (Kachni style), Sunita has been painting since childhood.'
  },
  {
    id: 'a_madurai_artisan',
    name: 'Kannan Weaver',
    stateId: 's_tamil_nadu',
    stateName: 'Tamil Nadu',
    regionId: 'r_madurai',
    regionName: 'Madurai',
    cityId: 'city_madurai',
    cityName: 'Madurai',
    craftIds: ['c_sungudi'],
    location: 'Madurai, Tamil Nadu',
    biography: 'A master weaver of traditional Sungudi sarees.'
  }
];

export const CULTURAL_FACTS: CulturalFact[] = [
  {
    id: 'cf_1',
    stateId: 's_punjab',
    category: 'food',
    name: 'Sarson da Saag & Makki di Roti',
    description: 'A classic Punjabi winter dish made from mustard greens and served with flat cornbread.'
  },
  {
    id: 'cf_2',
    stateId: 's_punjab',
    category: 'dance',
    name: 'Bhangra',
    description: 'A lively, powerful folk dance originating from the Majha area of Punjab, celebrating the harvest.'
  },
  {
    id: 'cf_3',
    stateId: 's_rajasthan',
    category: 'architecture',
    name: 'Hawa Mahal',
    description: 'The Palace of Winds in Jaipur, featuring 953 intricate pink sandstone windows.'
  }
];

export const PRODUCTS: ProductData[] = [
  {
    id: 'p_1',
    name: 'Phulkari Bagh Dupatta',
    artisanId: 'a_harpreet',
    stateId: 's_punjab',
    regionId: 'r_patiala',
    craftId: 'c_phulkari',
    origin: 'Patiala, Punjab',
    description: 'A vibrant red Khaddar dupatta heavily embroidered with traditional golden silk thread patterns.',
    price: 4500,
    images: [
      {
        src: '/images/products/punjab/phulkari/bridal-dupatta-1.jpg',
        alt: 'Authentic red Phulkari bridal dupatta with golden embroidery',
        caption: 'Traditional Bagh Phulkari displaying heavy geometric embroidery'
      },
      {
        src: '/images/products/punjab/phulkari/bridal-dupatta-2.jpg',
        alt: 'Close-up of golden silk darn stitches on red Khaddar cloth',
        caption: 'Detailed craftsmanship showing the reverse-stitch technique'
      }
    ]
  },
  {
    id: 'p_2',
    name: 'Madhubani Tree of Life',
    artisanId: 'a_sunita',
    stateId: 's_bihar',
    regionId: 'r_mithila',
    craftId: 'c_madhubani',
    origin: 'Mithila, Bihar',
    description: 'A hand-painted canvas depicting the sacred Tree of Life surrounded by birds and nature motifs.',
    price: 3200,
    images: [
      {
        src: '/images/products/bihar/madhubani/tree-of-life-1.jpg',
        alt: 'Madhubani Tree of Life painting with intricate nature motifs',
        caption: 'Sacred Tree of Life painted in Kachni and Bharni styles'
      },
      {
        src: '/images/products/bihar/madhubani/tree-of-life-2.jpg',
        alt: 'Macro detail showing black line work and natural dyes of the Madhubani painting',
        caption: 'Close-up revealing the intricate hand-drawn line work'
      }
    ]
  }
];
