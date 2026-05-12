/**
 * Hand-curated flag descriptions, keyed by ISO 3166-1 alpha-3 (cca3).
 * Kept to a few sentences each: what the flag stands for and roughly when
 * it was adopted in its current form.
 */
export type FlagFact = {
  /** Short summary of symbolism. */
  description: string;
  /** Year (CE) the current design was officially adopted, if known. */
  adopted?: number;
};

export const FLAG_FACTS: Record<string, FlagFact> = {
  USA: {
    description:
      "Fifty white stars represent the current states; the thirteen red and white stripes recall the original British colonies that declared independence in 1776.",
    adopted: 1960,
  },
  GBR: {
    description:
      "The Union Jack overlays the red crosses of Saint George (England) and Saint Patrick (Ireland) on the blue saltire of Saint Andrew (Scotland), forming the modern United Kingdom in flag form.",
    adopted: 1801,
  },
  FRA: {
    description:
      "The tricolour pairs the white of the Bourbon monarchy with the blue and red of revolutionary Paris — a banner of the 1789 French Revolution and republican liberty, equality, and fraternity.",
    adopted: 1794,
  },
  DEU: {
    description:
      "Black, red, and gold horizontal bands echo the colours of 19th-century liberal and unification movements and the volunteers who fought against Napoleon.",
    adopted: 1949,
  },
  ITA: {
    description:
      "The green, white, and red tricolour was inspired by the French revolutionary flag and first carried by the short-lived Cispadane Republic in the 1790s.",
    adopted: 1946,
  },
  ESP: {
    description:
      "Two red bands frame a wider yellow band — colours of the Crown of Aragon and Castile — with the national coat of arms symbolizing Spain’s historic kingdoms.",
    adopted: 1981,
  },
  JPN: {
    description:
      "A simple red disc on a white field — the Hinomaru, or “sun-mark” — references Japan as the “Land of the Rising Sun,” with roots reaching back centuries.",
    adopted: 1999,
  },
  CHN: {
    description:
      "The red field stands for revolution; the large gold star represents the Communist Party leading four smaller stars symbolizing classes united under the People’s Republic.",
    adopted: 1949,
  },
  BRA: {
    description:
      "A green field for forests, a yellow rhombus for mineral wealth, and a blue celestial sphere showing the night sky over Rio on November 15, 1889 — the day the republic was proclaimed.",
    adopted: 1992,
  },
  IND: {
    description:
      "Saffron, white, and green stand for courage, peace, and faith; the navy-blue Ashoka Chakra in the centre is a 24-spoke dharma wheel from ancient Indian tradition.",
    adopted: 1947,
  },
  CAN: {
    description:
      "The red and white Maple Leaf, adopted to give Canada its own national symbol distinct from British and French heritage, features an 11-pointed stylized maple leaf.",
    adopted: 1965,
  },
  AUS: {
    description:
      "The Union Jack reflects Australia’s British origins; the large Commonwealth Star represents the federation, and the Southern Cross constellation marks the Southern Hemisphere sky.",
    adopted: 1908,
  },
  MEX: {
    description:
      "Green, white, and red recall independence, faith, and unity; the central emblem shows an eagle on a cactus devouring a snake — the Aztec founding legend of Tenochtitlan.",
    adopted: 1968,
  },
  NLD: {
    description:
      "The red, white, and blue horizontal tricolour grew out of the orange-white-blue Prince’s Flag used during the 16th-century revolt against Spain.",
    adopted: 1937,
  },
  SWE: {
    description:
      "A yellow Nordic cross on a blue field — colours drawn from the Swedish coat of arms, with the offset cross design shared across other Nordic countries.",
    adopted: 1906,
  },
  NOR: {
    description:
      "A blue Nordic cross outlined in white sits on a red field — the red and white referencing Denmark, the blue a nod to liberty and to neighbours Sweden, France, and Britain.",
    adopted: 1821,
  },
  KOR: {
    description:
      "The central yin-yang Taegeuk symbol stands for cosmic balance, framed by four black trigrams from the I Ching representing heaven, earth, water, and fire.",
    adopted: 1948,
  },
  ARG: {
    description:
      "Two light-blue bands frame a white centre with the radiant Sun of May — said to commemorate clear May skies above Buenos Aires during the 1810 revolution against Spain.",
    adopted: 1818,
  },
  ZAF: {
    description:
      "A horizontal Y-shape unites six colours from earlier flags and movements, symbolising the convergence of South Africa’s diverse peoples after apartheid.",
    adopted: 1994,
  },
  EGY: {
    description:
      "Red, white, and black bands trace back to the 1952 revolution; the golden Eagle of Saladin in the centre represents strength and Egypt’s historic leadership in the Arab world.",
    adopted: 1984,
  },
  NGA: {
    description:
      "Two green bands flank a white centre — green for Nigeria’s forests and natural wealth, white for peace and unity.",
    adopted: 1960,
  },
  TUR: {
    description:
      "A white crescent and star on a red field — symbols associated with Islam and earlier Ottoman flags, kept in essentially the same form by the modern Turkish republic.",
    adopted: 1936,
  },
  POL: {
    description:
      "Two horizontal bands, white over red, drawn from the colours of the centuries-old Polish coat of arms (a white eagle on a red field).",
    adopted: 1980,
  },
  PRT: {
    description:
      "Green and red panels carry the Portuguese coat of arms and an armillary sphere — a nod to navigation and Age of Discovery voyages.",
    adopted: 1911,
  },
  GRC: {
    description:
      "Nine blue-and-white stripes symbolize the syllables of the Greek motto “Freedom or Death,” with a cross in the canton representing Greek Orthodox Christianity.",
    adopted: 1978,
  },
  AUT: {
    description:
      "Two red bands sandwich a white stripe — by legend, the design dates to a medieval duke whose tunic was bloodstained except where his belt had been.",
    adopted: 1945,
  },
  CHE: {
    description:
      "A bold white cross on a square red field — one of only two square national flags in the world, with roots in medieval Confederation banners.",
    adopted: 1889,
  },
  BEL: {
    description:
      "Vertical black, yellow, and red bands take their colours from the coat of arms of the Duchy of Brabant, used in the 1830 Belgian Revolution.",
    adopted: 1831,
  },
  FIN: {
    description:
      "A blue Nordic cross on white represents the country’s many lakes and skies set against winter snow.",
    adopted: 1918,
  },
  IRL: {
    description:
      "A vertical tricolour: green for Gaelic Catholic Ireland, orange for Protestants of British heritage, and white in between for the peace between them.",
    adopted: 1922,
  },
  NZL: {
    description:
      "The Union Jack in the canton recalls New Zealand’s British origins; four red, white-bordered stars mark the Southern Cross constellation.",
    adopted: 1902,
  },
  SGP: {
    description:
      "Red over white with a white crescent and five stars — symbolising universal brotherhood, purity, and the ideals of democracy, peace, progress, justice, and equality.",
    adopted: 1959,
  },
  THA: {
    description:
      "Five horizontal bands of red, white, blue, white, and red — red for the nation, white for religion, and the wider blue centre for the monarchy.",
    adopted: 1917,
  },
  VNM: {
    description:
      "A large yellow star on a red field — red for revolutionary struggle and bloodshed, yellow for the people, with the star’s points representing classes of workers united.",
    adopted: 1955,
  },
  IDN: {
    description:
      "Two equal horizontal bands of red over white — red for courage and white for purity, drawn from banners used in the 13th-century Majapahit Empire.",
    adopted: 1945,
  },
  MYS: {
    description:
      "Fourteen red and white stripes and a 14-pointed star represent Malaysia’s states and federal territories, with the crescent reflecting Islam as the state religion.",
    adopted: 1963,
  },
  PHL: {
    description:
      "Blue for peace, red for valour, and a white triangle for liberty; eight sun rays mark the provinces that first rose against Spain, and three stars stand for the main island groups.",
    adopted: 1898,
  },
  PAK: {
    description:
      "A white crescent and star on a dark green field with a vertical white band — green and the crescent for the Muslim majority, white for religious minorities.",
    adopted: 1947,
  },
  SAU: {
    description:
      "The Islamic shahada is written in white Thuluth script above a horizontal sword on a green field, representing the kingdom’s Islamic identity.",
    adopted: 1973,
  },
  ARE: {
    description:
      "Red, green, white, and black — the pan-Arab colours of the 1916 Arab Revolt — combined in 1971 to unite the seven emirates of the federation.",
    adopted: 1971,
  },
  RUS: {
    description:
      "White, blue, and red horizontal bands, originally inspired by the 17th-century Dutch tricolour during Peter the Great’s reforms, restored after the Soviet era.",
    adopted: 1991,
  },
  UKR: {
    description:
      "A blue band above a yellow band, often read as a clear sky above Ukraine’s vast wheat fields and sunflowers.",
    adopted: 1992,
  },
  CHL: {
    description:
      "White and red stripes with a white star on a blue square — white for the Andes, red for the blood of independence fighters, and blue for the Pacific sky.",
    adopted: 1817,
  },
  COL: {
    description:
      "Yellow takes up the top half for Colombia’s wealth and sunlight; blue stands for the surrounding seas, and red for the sacrifice of those who fought for independence.",
    adopted: 1861,
  },
  PER: {
    description:
      "Three vertical red, white, and red bands — by legend inspired by flocks of red-and-white flamingoes seen by the liberator José de San Martín.",
    adopted: 1825,
  },
  KEN: {
    description:
      "Black, red, and green bands separated by thin white fimbriations, with Maasai warrior shield and crossed spears — symbols of defence of freedom.",
    adopted: 1963,
  },
  MAR: {
    description:
      "A red field carries the green interlaced pentagram known as the Seal of Solomon, representing Islam and the long-standing Moroccan dynasty.",
    adopted: 1915,
  },
  ISR: {
    description:
      "Two horizontal blue stripes recall the tallit prayer shawl, framing a blue Star of David — a long-standing Jewish symbol.",
    adopted: 1948,
  },
  CZE: {
    description:
      "White over red with a blue triangle on the hoist — colours of historic Bohemia and Moravia, kept after the peaceful split from Slovakia in 1993.",
    adopted: 1993,
  },
  DNK: {
    description:
      "The Dannebrog — a white Scandinavian cross on a red field — is one of the world’s oldest continuously used national flags, with origins in medieval legend.",
    adopted: 1625,
  },
};

export function getFlagFact(cca3: string | undefined): FlagFact | null {
  if (!cca3) return null;
  return FLAG_FACTS[cca3.toUpperCase()] ?? null;
}
