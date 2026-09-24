/**
 * Bihar — the first state page, and the template for the rest.
 *
 * District ids match the `NAME_2` property in public/bihar-districts.geojson,
 * including its spellings ("Pashchim Champaran"), so the map and this file
 * stay joined without a lookup table.
 *
 * Prices are placeholder catalogue values for layout and conversion design.
 * They are not live inventory and must be replaced before selling anything.
 */

import type { StatePage } from './types';

export const bihar: StatePage = {
  slug: 'bihar',
  state: 'Bihar',
  title: 'Bihar',
  native: 'मिथिला की माटी',
  tagline: 'Where the wall came first, and the paper followed',
  intro:
    'Mithila painted its houses long before it painted for anyone else. What hangs in galleries today began as a wedding chamber, a courtyard floor, a grandmother teaching a granddaughter the order of the strokes. Kalakriti begins here — in the districts where those hands still work.',

  geojson: '/bihar-districts.geojson',
  districtProperty: 'NAME_2',

  districts: [
    { id: 'Madhubani',   name: 'Madhubani',   note: 'The heart of Mithila painting — Jitwarpur and Ranti still paint daily.', crafts: ['madhubani', 'sikki'] },
    { id: 'Darbhanga',   name: 'Darbhanga',   note: 'Makhana ponds and the old Mithila court that patronised the painters.',  crafts: ['makhana', 'madhubani'] },
    { id: 'Sitamarhi',   name: 'Sitamarhi',   note: 'Sikki grass country, and by tradition the birthplace of Sita.',          crafts: ['sikki'] },
    { id: 'Muzaffarpur', name: 'Muzaffarpur', note: 'Sujani quilting from Bhusra, lac bangles, and Shahi litchi orchards.',    crafts: ['sujani', 'lac'] },
    { id: 'Bhagalpur',   name: 'Bhagalpur',   note: 'The silk city — tussar looms and the Manjusha scroll tradition.',         crafts: ['tussar', 'manjusha'] },
    { id: 'Patna',       name: 'Patna',       note: 'Tikuli art, once a forehead ornament, now painted on board.',             crafts: ['tikuli'] },
    { id: 'Gaya',        name: 'Gaya',        note: 'Patharkatti stone carving, worked in local black stone.',                 crafts: ['stone'] },
    { id: 'Nalanda',     name: 'Nalanda',     note: 'Silao khaja and the ruins of the great monastic university.',             crafts: [] },
  ],

  chapters: [
    {
      title: 'The wall came first',
      motif: 'fish',
      body: 'Mithila painting was never made to be sold. It was made on the mud walls of the kohbar ghar — the wedding chamber — where a bride and groom would spend their first nights surrounded by lotus ponds, bamboo groves, fish and parrots, every one of them a wish for fertility and long life. The painting was the room. When the season turned, the wall was replastered and the painting began again.',
    },
    {
      title: 'A drought that travelled',
      motif: 'lotus',
      body: 'In the 1960s a long drought pushed Mithila households toward any income they could find. Paper was offered to the women who already knew how to paint, and the wall art moved onto a surface that could leave the village. What had been seasonal and impermanent became something a collector in Delhi or Tokyo could hold — and the names of individual painters, until then anonymous, began to be known.',
    },
    {
      title: 'Four hands, four styles',
      motif: 'peacock',
      body: 'Mithila is not one style. Bharni fills its forms with flat colour; kachni builds them from fine hatched line alone; godna borrows the vocabulary of tattoo, drawn in concentric registers; and the tantrik line renders deities in a deliberately spare, symbolic form. A trained eye reads the district, the community and often the household from the stroke.',
    },
    {
      title: 'What the pigments were',
      motif: 'kalash',
      body: 'The old palette came from the kitchen and the field: lamp-black soot for the outline, turmeric for yellow, kusum flower for red, indigo for blue, bel leaf for green, all bound with babul gum. Acrylic is common now and honest work is made with it — but the natural palette is still mixed by painters who want the older, quieter colour.',
    },
  ],

  crafts: [
    {
      id: 'madhubani',
      name: 'Madhubani Painting',
      native: 'मिथिला चित्रकला',
      district: 'Madhubani',
      gi: 'GI 2007',
      motif: 'fish',
      hook: 'A wedding-chamber wall art that became one of India’s most recognised painting traditions.',
      story:
        'Painted by women of Mithila for centuries on the walls and floors of the home — for weddings, for festivals, for the goddess. Every motif is a sentence: twin fish for fertility, the lotus for the womb, bamboo for lineage, the parrot for love. Nothing in a Mithila painting is decoration alone.',
      technique:
        'A double outline drawn in lamp-black, then filled with flat colour (bharni) or left as dense hatching (kachni). Traditionally worked with a nib of bamboo or a cloth-wrapped twig on handmade paper, cloth or replastered mud.',
      makers:
        'Households across Jitwarpur, Ranti and Rasidpur, where the tradition passes mother to daughter and the best-known painters are grandmothers.',
      image: { src: '', dynamicSearch: 'Madhubani painting Bihar', alt: 'Madhubani painting', width: 800, height: 600 },
    },
    {
      id: 'sikki',
      name: 'Sikki Grass Craft',
      native: 'सिक्की',
      district: 'Madhubani',
      motif: 'lotus',
      hook: 'Golden wetland grass, coiled into boxes that once carried a bride’s belongings.',
      story:
        'Sikki grows in Mithila’s wetlands and turns gold when dried. Coiled into pauti boxes, dolls and containers, it was traditionally part of a daughter’s dowry — made by her mother and aunts in the months before a wedding, and expected to outlast them.',
      technique:
        'The grass is cut, sun-dried, sometimes dyed, then wound around a core and stitched into a spiral with a needle called a takua. There is no loom and no mould; the form is held entirely in the maker’s hands.',
      makers: 'Women’s collectives around Raiyam and the villages of Madhubani and Sitamarhi.',
      image: { src: '', dynamicSearch: 'Sikki Grass Craft Bihar', alt: 'Sikki Grass Craft', width: 800, height: 600 },
    },
    {
      id: 'sujani',
      name: 'Sujani Embroidery',
      native: 'सुजनी',
      district: 'Muzaffarpur',
      gi: 'GI',
      motif: 'horse',
      hook: 'Worn-out saris layered into quilts that tell the story of the village that stitched them.',
      story:
        'Sujani began as thrift — old saris stacked and held together with a simple running stitch to make a quilt for a newborn. The figures came later, and with them a habit of narration: harvests, weddings, floods, and now the things the women’s collectives argue about in the open.',
      technique:
        'Layers of soft old cotton are tacked together, figures outlined in chain or running stitch, then filled with rows of running stitch that quilt and draw at the same time.',
      makers: 'The stitching collectives of Bhusra and neighbouring villages in Muzaffarpur.',
      image: { src: '', dynamicSearch: 'Sujani Embroidery Bihar', alt: 'Sujani Embroidery', width: 800, height: 600 },
    },
    {
      id: 'manjusha',
      name: 'Manjusha Art',
      native: 'मंजूषा',
      district: 'Bhagalpur',
      motif: 'conch',
      hook: 'A single legend, told in a strict palette of pink, green and yellow.',
      story:
        'Manjusha illustrates the Bihula-Bishahari legend of Anga — a story of a snake goddess and a wife who refuses to accept her husband’s death. It is one of the few Indian folk forms devoted to a continuous narrative, painted in sequence like a scroll and carried in temple boxes during the Bishahari festival.',
      technique:
        'Figures drawn in a characteristic wavy border with an X-shaped body line, coloured only in pink, green and yellow, on paper, cloth or the box (manjusha) itself.',
      makers: 'Painter families around Bhagalpur, where the festival is still observed.',
      image: { src: '', dynamicSearch: 'Manjusha Art Bihar', alt: 'Manjusha Art', width: 800, height: 600 },
    },
    {
      id: 'tikuli',
      name: 'Tikuli Art',
      native: 'टिकुली',
      district: 'Patna',
      motif: 'sun',
      hook: 'The forehead ornament that turned into a painting.',
      story:
        'Tikuli was once literal: gold-leaf and glass discs made in Patna and worn on the forehead. When the ornament fell out of fashion the craft did not die — it moved onto hardboard, keeping the enamel gloss and the miniature scale, and took up Mithila’s motifs.',
      technique:
        'Hardboard is primed and lacquered, the design painted in enamel with a fine brush, then finished to a glass-like surface.',
      makers: 'Workshops in Patna that trained a generation of women artisans in the craft’s revival.',
      image: { src: '', dynamicSearch: 'Tikuli Art Bihar', alt: 'Tikuli Art', width: 800, height: 600 },
    },
    {
      id: 'tussar',
      name: 'Bhagalpuri Tussar Silk',
      native: 'तसर',
      district: 'Bhagalpur',
      gi: 'GI',
      motif: 'diamond',
      hook: 'A wild silk with a slub and a shine that mulberry never has.',
      story:
        'Bhagalpur has woven tussar for long enough to be called the silk city. Tussar comes from wild silkworms feeding on Asan and Arjun trees rather than mulberry, which gives the yarn its uneven slub, its warmth and its natural gold.',
      technique:
        'Reeled and spun tussar is woven on pit and frame looms, often with a contrasting border; the fabric is finished soft rather than glazed.',
      makers: 'Weaving households in Nathnagar and Champanagar, many of them working family looms.',
      image: { src: '', dynamicSearch: 'Bhagalpuri Tussar Silk Bihar', alt: 'Bhagalpuri Tussar Silk', width: 800, height: 600 },
    },
    {
      id: 'lac',
      name: 'Lac Bangles',
      native: 'लहठी',
      district: 'Muzaffarpur',
      motif: 'diamond',
      hook: 'Resin worked warm, set with mirror and colour, made for a wedding.',
      story:
        'Lac bangles — lahthi — are part of the marriage rite across Bihar, given to a bride and worn in sets. The craft is a heat craft: the resin has to be worked at exactly the right temperature or it cracks.',
      technique:
        'Lac is warmed over a flame, rolled onto a wooden former to size, then set with colour, foil and small mirrors while still pliable.',
      makers: 'Bangle-makers in Muzaffarpur working to order through the wedding season.',
      image: { src: '', dynamicSearch: 'Lac Bangles Bihar', alt: 'Lac Bangles', width: 800, height: 600 },
    },
    {
      id: 'stone',
      name: 'Patharkatti Stone Craft',
      native: 'पत्थरकट्टी',
      district: 'Gaya',
      motif: 'stupa',
      hook: 'Black stone carved in a village that has done nothing else for generations.',
      story:
        'Patharkatti, near Gaya, carves the hard local black stone into images, lamps, mortars and bowls. The village’s carvers trace their trade to craftsmen settled there to work on temple commissions, and the skill has stayed in the same families since.',
      technique:
        'Blocks are split, roughed with chisels, then ground and polished by hand until the stone takes a deep, almost wet, black shine.',
      makers: 'Carving families of Patharkatti in Gaya district.',
      image: { src: '', dynamicSearch: 'Patharkatti Stone Craft Bihar', alt: 'Patharkatti Stone Craft', width: 800, height: 600 },
    },
    {
      id: 'makhana',
      name: 'Mithila Makhana',
      native: 'मखाना',
      district: 'Darbhanga',
      gi: 'GI 2022',
      motif: 'lotus',
      hook: 'A pond crop harvested by divers, then popped by hand over an open flame.',
      story:
        'Makhana is the seed of the prickly water lily, grown in Mithila’s ponds and harvested by the Mallah community, who dive repeatedly to collect the seed from the bed. It is food, but it is also ritual: no Mithila wedding is complete without it.',
      technique:
        'Seeds are dried, graded, tempered and then roasted in a shallow pan and struck at the moment they pop — a timing judgement made by hand, seed by seed.',
      makers: 'Pond-farming and popping households across Darbhanga and Madhubani.',
      image: { src: '', dynamicSearch: 'Mithila Makhana Bihar', alt: 'Mithila Makhana', width: 800, height: 600 },
    },
  ],

  products: [
    { id: 'p-kohbar',    name: 'Kohbar Wedding Panel',        craft: 'madhubani', price: 4800, spec: '22 × 30 in · handmade paper', gi: 'GI 2007', tag: 'One of one',    blurb: 'The full wedding-chamber composition — lotus pond, bamboo, the twin fish — painted in the bharni fill style.', motif: 'fish', image: { src: '', dynamicSearch: 'Madhubani art', alt: 'Kohbar Wedding Panel', width: 800, height: 600 } },
    { id: 'p-kachni',    name: 'Kachni Line Study',           craft: 'madhubani', price: 2400, spec: '11 × 15 in · handmade paper', gi: 'GI 2007',                       blurb: 'No colour fill at all: the whole image built from hatched line, which is the harder discipline.', motif: 'peacock', image: { src: '', dynamicSearch: 'Madhubani painting', alt: 'Kachni Line Study', width: 800, height: 600 } },
    { id: 'p-stole-mad', name: 'Hand-painted Mithila Stole',  craft: 'madhubani', price: 3200, spec: 'Tussar silk · 2.2 m',        gi: 'GI 2007',                       blurb: 'Painted directly onto Bhagalpuri tussar — two Bihar crafts in one piece.', motif: 'lotus', image: { src: '', dynamicSearch: 'Tussar silk', alt: 'Hand-painted Mithila Stole', width: 800, height: 600 } },
    { id: 'p-pauti',     name: 'Sikki Pauti Box',             craft: 'sikki',     price: 1450, spec: '6 in · lidded',                                                    blurb: 'The dowry box form, coiled in golden grass and stitched without any mould.', motif: 'kalash', image: { src: '', dynamicSearch: 'Sikki grass craft', alt: 'Sikki Pauti Box', width: 800, height: 600 } },
    { id: 'p-sikki-doll',name: 'Sikki Doll Pair',             craft: 'sikki',     price: 900,  spec: 'approx. 5 in',                                                     blurb: 'The bride-and-groom pair that a Mithila household keeps on the shelf for luck.', motif: 'lotus', image: { src: '', dynamicSearch: 'Sikki grass', alt: 'Sikki Doll Pair', width: 800, height: 600 } },
    { id: 'p-sujani',    name: 'Sujani Narrative Throw',      craft: 'sujani',    price: 6900, spec: '50 × 70 in · cotton',        gi: 'GI',      tag: 'Made to order',  blurb: 'A quilted panel that tells one village’s year in running stitch. Takes months.', motif: 'horse', image: { src: '', dynamicSearch: 'Sujni embroidery', alt: 'Sujani Narrative Throw', width: 800, height: 600 } },
    { id: 'p-manjusha',  name: 'Manjusha Scroll',             craft: 'manjusha',  price: 2600, spec: '12 × 36 in · paper',                                               blurb: 'The Bihula-Bishahari legend in sequence, in the three permitted colours.', motif: 'conch', image: { src: '', dynamicSearch: 'Manjusha art', alt: 'Manjusha Scroll', width: 800, height: 600 } },
    { id: 'p-tikuli',    name: 'Tikuli Coasters, set of six', craft: 'tikuli',    price: 1200, spec: '4 in · lacquered board',                                           blurb: 'Enamel on hardboard, finished to the glass shine the forehead ornament used to have.', motif: 'sun', image: { src: '', dynamicSearch: 'Tikuli art', alt: 'Tikuli Coasters', width: 800, height: 600 } },
    { id: 'p-tussar',    name: 'Bhagalpuri Tussar Stole',     craft: 'tussar',    price: 2900, spec: '2.2 m · natural gold',       gi: 'GI',                             blurb: 'Undyed tussar with a contrast border, woven on a family pit loom.', motif: 'diamond', image: { src: '', dynamicSearch: 'Bhagalpuri silk', alt: 'Bhagalpuri Tussar Stole', width: 800, height: 600 } },
    { id: 'p-lahthi',    name: 'Lac Bangle Set',              craft: 'lac',       price: 750,  spec: 'set of 8 · sized to order',                                        blurb: 'Warm-worked resin set with mirror, made the way a wedding set is made.', motif: 'chakra', image: { src: '', dynamicSearch: 'Bangle', alt: 'Lac Bangle Set', width: 800, height: 600 } },
    { id: 'p-stone',     name: 'Patharkatti Stone Bowl',      craft: 'stone',     price: 1900, spec: '5 in · black stone',                                               blurb: 'Split, chiselled and hand-polished until the stone looks wet.', motif: 'stupa', image: { src: '', dynamicSearch: 'Stone carving', alt: 'Patharkatti Stone Bowl', width: 800, height: 600 } },
    { id: 'p-makhana',   name: 'Mithila Makhana',             craft: 'makhana',   price: 420,  spec: '250 g · hand-popped',        gi: 'GI 2022',                        blurb: 'Graded large, popped over flame, sold straight from the pond-farming households.', motif: 'lotus', image: { src: '', dynamicSearch: 'Makhana', alt: 'Mithila Makhana', width: 800, height: 600 } },
  ],

  experiences: [
    { id: 'e-jitwarpur', name: 'Paint with a Mithila master',   district: 'Madhubani',   duration: '3 hours',  price: 1800, motif: 'fish',    blurb: 'Sit in a Jitwarpur courtyard, learn the double outline, and leave with the sheet you painted.', image: { src: '', dynamicSearch: 'Madhubani art', alt: 'Paint with a Mithila master', width: 800, height: 600 } },
    { id: 'e-sikki',     name: 'Sikki coiling with the makers', district: 'Madhubani',   duration: '2 hours',  price: 1100, motif: 'lotus',   blurb: 'Cut, dry and coil the grass with the women of the Raiyam collective.', image: { src: '', dynamicSearch: 'Basket weaving', alt: 'Sikki coiling with the makers', width: 800, height: 600 } },
    { id: 'e-makhana',   name: 'Pond to pan: a makhana day',    district: 'Darbhanga',   duration: 'Half day', price: 1400, motif: 'kalash',  blurb: 'Out to the ponds with a Mallah family, back for the roasting, popping and grading.', image: { src: '', dynamicSearch: 'Makhana', alt: 'Pond to pan: a makhana day', width: 800, height: 600 } },
    { id: 'e-loom',      name: 'Tussar loom morning',           district: 'Bhagalpur',   duration: '2 hours',  price: 950,  motif: 'diamond', blurb: 'A working pit loom in Nathnagar, from reeled yarn to woven border.', image: { src: '', dynamicSearch: 'Weaving loom', alt: 'Tussar loom morning', width: 800, height: 600 } },
    { id: 'e-sujani',    name: 'Sujani stitch circle',          district: 'Muzaffarpur', duration: '3 hours',  price: 1250, motif: 'horse',   blurb: 'Join the Bhusra women’s circle for an afternoon and stitch one panel of the story.', image: { src: '', dynamicSearch: 'Embroidery', alt: 'Sujani stitch circle', width: 800, height: 600 } },
  ],

  destinations: [
    { id: 'd-bodhgaya',  name: 'Mahabodhi Temple, Bodh Gaya', district: 'Gaya',              kind: 'UNESCO World Heritage', blurb: 'The place of the enlightenment, and the descendant of the Bodhi tree.', image: { src: '', dynamicSearch: 'Mahabodhi Temple', alt: 'Mahabodhi Temple', width: 800, height: 600 } },
    { id: 'd-nalanda',   name: 'Nalanda Mahavihara',          district: 'Nalanda',           kind: 'UNESCO World Heritage', blurb: 'The excavated ruins of the monastic university that taught for seven centuries.', image: { src: '', dynamicSearch: 'Nalanda', alt: 'Nalanda Mahavihara', width: 800, height: 600 } },
    { id: 'd-rajgir',    name: 'Rajgir',                      district: 'Nalanda',           kind: 'Ancient capital',       blurb: 'Hot springs, Griddhakuta hill, and the ridge road the Buddha walked.', image: { src: '', dynamicSearch: 'Rajgir', alt: 'Rajgir', width: 800, height: 600 } },
    { id: 'd-vaishali',  name: 'Vaishali',                    district: 'Vaishali',          kind: 'Ashokan site',          blurb: 'An Ashokan pillar with its lion intact, at one of the world’s early republics.', image: { src: '', dynamicSearch: 'Vaishali (ancient city)', alt: 'Vaishali', width: 800, height: 600 } },
    { id: 'd-kesaria',   name: 'Kesaria Stupa',               district: 'Purba Champaran',   kind: 'Buddhist site',         blurb: 'An enormous brick stupa, still only partly excavated.', image: { src: '', dynamicSearch: 'Kesaria Stupa', alt: 'Kesaria Stupa', width: 800, height: 600 } },
    { id: 'd-barabar',   name: 'Barabar Caves',               district: 'Jehanabad',         kind: 'Mauryan rock-cut',      blurb: 'Mauryan chambers cut into granite and polished to a mirror finish.', image: { src: '', dynamicSearch: 'Barabar Caves', alt: 'Barabar Caves', width: 800, height: 600 } },
    { id: 'd-jitwarpur', name: 'Jitwarpur & Ranti villages',  district: 'Madhubani',         kind: 'Craft village',         blurb: 'Painted house walls, and courtyards where you can watch the work happen.', image: { src: '', dynamicSearch: 'Madhubani district', alt: 'Jitwarpur & Ranti', width: 800, height: 600 } },
    { id: 'd-vikram',    name: 'Vikramshila',                 district: 'Bhagalpur',         kind: 'Monastic ruins',        blurb: 'The rival of Nalanda, on the Ganga, quieter and largely to yourself.', image: { src: '', dynamicSearch: 'Vikramaśīla', alt: 'Vikramshila', width: 800, height: 600 } },
    { id: 'd-patna',     name: 'Patna riverfront',            district: 'Patna',             kind: 'City',                  blurb: 'Takht Sri Patna Sahib, the Golghar granary and the Ganga ghats at dusk.', image: { src: '', dynamicSearch: 'Patna', alt: 'Patna riverfront', width: 800, height: 600 } },
    { id: 'd-sitamarhi', name: 'Punaura Dham, Sitamarhi',     district: 'Sitamarhi',         kind: 'Pilgrimage',            blurb: 'By tradition the birthplace of Sita, and the reason Mithila paints her.', image: { src: '', dynamicSearch: 'Sitamarhi', alt: 'Punaura Dham', width: 800, height: 600 } },
  ],
};

export default bihar;
