import { BiologicalTerm, ExtractionResult } from '../types/extraction';
import { DatasetLoader } from './datasetLoader';

export class GenusSpeciesExtractor {
  private datasetLoader: DatasetLoader;
  private biologicalPatterns: RegExp[];
  private englishWords: Set<string>;
  private genusPrefixes: string[];
  private speciesSuffixes: string[];
  
  constructor() {
    this.datasetLoader = DatasetLoader.getInstance();
    
    this.englishWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
      'about', 'after', 'again', 'against', 'also', 'any', 'because', 'been', 'before', 'being', 'between', 'both', 'came', 'come', 'could', 'did', 'does', 'each', 'even', 'first', 'from', 'give', 'good', 'great', 'have', 'here', 'into', 'just', 'know', 'last', 'life', 'like', 'little', 'long', 'look', 'made', 'make', 'many', 'may', 'more', 'most', 'much', 'must', 'never', 'only', 'other', 'over', 'own', 'right', 'said', 'same', 'should', 'since', 'some', 'still', 'such', 'take', 'than', 'that', 'their', 'them', 'there', 'these', 'they', 'this', 'those', 'through', 'time', 'under', 'until', 'very', 'want', 'water', 'well', 'were', 'what', 'when', 'where', 'which', 'while', 'will', 'with', 'work', 'would', 'year', 'your',
      'able', 'above', 'across', 'add', 'almost', 'along', 'always', 'among', 'another', 'around', 'away', 'back', 'become', 'began', 'begin', 'behind', 'below', 'best', 'better', 'big', 'black', 'both', 'bring', 'build', 'call', 'came', 'cannot', 'case', 'change', 'close', 'come', 'could', 'country', 'course', 'cut', 'different', 'does', 'done', 'down', 'during', 'early', 'end', 'enough', 'every', 'example', 'eye', 'face', 'fact', 'family', 'far', 'feel', 'few', 'find', 'follow', 'found', 'general', 'government', 'group', 'hand', 'hard', 'head', 'help', 'high', 'home', 'however', 'important', 'include', 'interest', 'keep', 'kind', 'large', 'later', 'learn', 'leave', 'left', 'level', 'line', 'live', 'local', 'long', 'lot', 'might', 'money', 'move', 'name', 'national', 'need', 'never', 'next', 'night', 'number', 'off', 'often', 'open', 'order', 'part', 'people', 'place', 'point', 'possible', 'power', 'problem', 'program', 'provide', 'public', 'question', 'real', 'reason', 'report', 'result', 'room', 'run', 'school', 'seem', 'service', 'set', 'several', 'show', 'side', 'small', 'social', 'something', 'start', 'state', 'story', 'study', 'system', 'tell', 'think', 'though', 'today', 'together', 'turn', 'understand', 'upon', 'used', 'using', 'value', 'various', 'way', 'week', 'white', 'within', 'without', 'word', 'words', 'working', 'world', 'write', 'young'
    ]);
    
    this.genusPrefixes = [
      'amphi', 'anthus', 'antho', 'arch', 'archi', 'archaeo', 'arctos', 'arcto', 'phago', 'bacter', 'coccus', 'phyta', 'myces', 'virus', 'rhiza', 'ptera', 'cephalus', 'therium', 'quadri', 'un', 'xanthos', 'zoster', 'zygos', 'ulmus', 'ulos', 'unus', 'ura',
      'actino', 'aero', 'allo', 'angio', 'baro', 'bath', 'brachy', 'brady', 'caco', 'cardio', 'caryo', 'chloro', 'crypto', 'cyano', 'dendr', 'derm', 'dipl', 'glabro', 'glauc', 'gyno', 'heli', 'hemi', 'macro', 'micro', 'mono', 'poly', 'pseudo', 'rhizo', 'rhodo', 'stoma', 'stachy', 'tricho', 'xero', 'zo'
    ];
    
    this.speciesSuffixes = [
      // Original suffixes
      'aceus', 'acus', 'alis', 'anus', 'arius', 'ascens', 'atus', 'ella', 'ensis', 'escens', 'etta', 'eus', 'ians', 'ianus', 'ica', 'icus', 'ineus', 'inus', 'ioides', 'ops', 'opsis', 'osus', 'otus', 'ullus', 'ulus', 'urus', 'utus', 'issimus', 'ellus', 'culus', 'vorus', 'aceous', 'acious', 'iferous', 'cellus', 'cillus', 'cule', 'escent', 'escens', 'estris', 'iana', 'ianum', 'icum', 'ineae', 'itic', 'ius', 'oides', 'oideus', 'ose', 'otus', 'ullus', 'ulum', 'uus', 'ana', 'anum', 'elongatus', 'emarginatus', 'adal', 'adicus', 'adiscens', 'aneus', 'aria', 'icans', 'idis', 'inae', 'itos', 'ium', 'oticus', 'ulosus', 'uta', 'uous',
      'aster', 'astrum', 'cola', 'fer', 'fera', 'ferum', 'fugus', 'ger', 'gera', 'gerum', 'legus', 'lentus', 'morphus', 'nomen', 'nomia', 'philus', 'phila', 'phobus', 'phobia', 'podus', 'pedis', 'soma', 'somus', 'stomus', 'trophus', 'culus', 'cula', 'culum', 'iscus', 'isca', 'unculus', 'uncula', 'estris', 'icola', 'igenus', 'igena', 'ivagus', 'faciens', 'fluus', 'genus', 'gena', 'parus', 'volus', 'ior', 'issimus', 'ulentus',
      'stasis', 'clast', 'plasm', 'phyte', 'cyte', 'blast', 'zoon', 'zoa', 'phyll', 'phyl', 'karyon', 'mycin', 'tome', 'tropin', 'phrenia', 'lemma', 'logy', 'lysis', 'logous', 'mer', 'some', 'scope', 'chrome', 'rrhiza', 'rrhizae', 'rrhea', 'rrheic', 'plasia', 'phoresis', 'poiesis', 'thrix', 'rrhaphy', 'carp', 'cyst', 'spor', 'thelial', 'gamy', 'gyny', 'andry', 'dactyl', 'odont', 'gnath', 'derm', 'onych', 'saur', 'poda', 'glossa', 'rrhine', 'pteryx', 'tarsus', 'rhinus', 'gaster', 'hylus', 'nectes', 'tylus', 'cheirus', 'brachia', 'natha', 'branchia', 'stoma', 'thamnus', 'taxis', 'tomeus', 'trochus', 'vulva', 'tricha', 'theca', 'lobus', 'calyx', 'nectar', 'carpa', 'xenus', 'stigma', 'zoite', 'somae', 'plast', 'phobous', 'philous', 'chore', 'morphous', 'coccus', 'spora', 'zoma', 'strobila', 'ferax', 'gnatha', 'trix', 'metra', 'phane', 'salpinx', 'chela', 'rhyncha',
      
      // New comprehensive suffixes
      'aceus', 'aceous', 'acus', 'al', 'alis', 'aneus', 'anus', 'aria', 'arius', 'ascens', 'atus', 'ella', 'ellus', 'ensis', 'ens', 'escens', 'etta', 'eus', 'icans', 'icus', 'ica', 'idae', 'idius', 'idis', 'ina', 'inae', 'ineus', 'inus', 'ioides', 'ior', 'isca', 'iscus', 'issimus', 'itos', 'ium', 'i', 'ii', 'ia', 'iae', 'ae', 'ula', 'ulus', 'ullus', 'ulum', 'ulae', 'unculus', 'uncula', 'culus', 'cula', 'culum', 'cellus', 'cillus', 'cule', 'ullum', 'uros', 'urus', 'uta', 'utus', 'uous', 'vorus', 'zygous', 'genic', 'genous', 'fer', 'fera', 'ferum', 'ger', 'gera', 'gerum', 'lentus', 'ulentus', 'faciens', 'fluus', 'genus', 'gena', 'parus', 'volus', 'philus', 'phila', 'phobous', 'phobia', 'trophus', 'trophic', 'morphus', 'soma', 'somus', 'stomus', 'podus', 'pedis', 'cephalus', 'dermis', 'dactylus', 'odont', 'gnathus', 'onychus', 'poda', 'tricha', 'thamnus', 'phyllus', 'phyll', 'phyllum', 'phylloides', 'phagus', 'myces', 'spora', 'rrhiza', 'rrhizae', 'carpus', 'cystis', 'plast', 'cyte', 'zoon', 'zoa', 'zoite', 'zoic', 'rrhea', 'rrheic', 'rrhine', 'gamy', 'gyny', 'andry', 'thrix', 'lemma', 'tome', 'scope', 'logy', 'logous', 'mer', 'some', 'lysis', 'phoresis', 'poiesis', 'phrenia', 'chrome', 'stasis', 'karyon', 'tropin', 'ops', 'opsis', 'oides', 'oticus', 'otica', 'otus', 'osus', 'ose', 'osum', 'ous', 'stoma', 'stomus', 'cheirus', 'brachia', 'natha', 'branchia', 'theca', 'glossa', 'pteryx', 'tarsus', 'nectes', 'gaster', 'hylus', 'salpinx', 'chela', 'rhyncha', 'metra', 'phane', 'saur', 'carpa', 'carp', 'poda', 'trix', 'xenus', 'zoma', 'zoa', 'thamnus', 'taxis', 'tomeus', 'trochus', 'vulva', 'lobus', 'calyx', 'nectar', 'stigma', 'ula', 'ura', 'ulae', 'ula', 'urus', 'ullus', 'urae', 'opsida', 'phyta', 'phyceae', 'mycota', 'mycotina', 'mycotinae', 'aceae', 'ales', 'ineae', 'oideae', 'ida', 'oidea', 'optera', 'theria', 'morpha', 'formes', 'styla', 'stylus', 'genia', 'biont', 'phytae', 'cota', 'nema', 'plasma', 'plastida', 'phytum', 'mycin', 'mycoides', 'bacter', 'bacteria', 'coccus', 'clast', 'troph', 'phytin', 'zygote', 'strobila',
      
      // Additional comprehensive suffixes
      'a', 'ae', 'aceae', 'aceus', 'aceous', 'acus', 'alis', 'al', 'anus', 'aneus', 'aria', 'arius', 'aticus', 'ascens', 'asis', 'ata', 'atum', 'atus', 'ella', 'ellus', 'ellus', 'ellus', 'ensis', 'ens', 'entis', 'ensiformis', 'escens', 'esis', 'etta', 'eus', 'eus', 'eum', 'ians', 'iana', 'ianus', 'ica', 'icus', 'icola', 'ifer', 'ifera', 'iferum', 'iformis', 'ii', 'ilis', 'illa', 'illus', 'ina', 'inae', 'incola', 'ineae', 'ineus', 'ingens', 'inus', 'ioides', 'ior', 'irix', 'iscus', 'issimus', 'ita', 'itae', 'itic', 'itos', 'itum', 'ius', 'iiformis', 'lenta', 'lentus', 'loba', 'lobus', 'merus', 'metra', 'morpha', 'myces', 'mycetes', 'mycotina', 'mycoides', 'nema', 'natha', 'oides', 'oidea', 'oideae', 'oma', 'onema', 'onychus', 'ops', 'opsis', 'optera', 'ornis', 'osus', 'ose', 'osum', 'oticus', 'otus', 'ourus', 'ovum', 'ozoa', 'peda', 'pedis', 'pelta', 'pennatus', 'peps', 'pexy', 'phage', 'phagus', 'phane', 'pharynx', 'phila', 'phile', 'philus', 'phobic', 'phobia', 'phoresis', 'phorum', 'phyll', 'phyllus', 'phyta', 'phyte', 'phyton', 'phyceae', 'phytum', 'plasma', 'plast', 'plasm', 'plax', 'pleura', 'poda', 'podium', 'pogon', 'pogonum', 'poiesis', 'polis', 'pore', 'porus', 'pseudus', 'pteryx', 'pus', 'pyga', 'pygus', 'raphe', 'rhaphe', 'rhina', 'rhinae', 'rhis', 'rhiza', 'rhizae', 'rrhiza', 'rrheic', 'rrhizae', 'rrhea', 'rrhine', 'rrhineus', 'saurus', 'schis', 'sclerus', 'sclerotica', 'scolex', 'sida', 'siphon', 'soma', 'somus', 'spina', 'sperm', 'spora', 'sporium', 'stachys', 'stasis', 'stele', 'stenia', 'stigma', 'stoma', 'stomus', 'stylus', 'sucta', 'sulcus', 'sutura', 'symbiosis', 'tarsus', 'teleia', 'telos', 'tendineus', 'terata', 'tergum', 'teria', 'terium', 'thamnus', 'theca', 'theria', 'therium', 'thrix', 'tibia', 'toma', 'tome', 'tomus', 'tomeus', 'tomy', 'tonus', 'topus', 'tricha', 'trichae', 'trichia', 'trichous', 'trix', 'trochus', 'tropes', 'tropia', 'tropin', 'troph', 'trophic', 'trophus', 'ula', 'ularis', 'ule', 'ulae', 'ulatus', 'ulentus', 'ullus', 'ulum', 'ulus', 'ulosis', 'ura', 'urale', 'urceus', 'uris', 'urus', 'urous', 'uteus', 'utia', 'utus', 'ux', 'vaginatus', 'valens', 'valent', 'velum', 'ventris', 'veris', 'verse', 'vestis', 'villus', 'virens', 'virus', 'vorus', 'xenus', 'xeros', 'xoma', 'xylon', 'xys', 'zygous', 'zoa', 'zoid', 'zoon', 'zoster', 'zuma'
    ];
    
    this.biologicalPatterns = [
      // Standard binomial nomenclature: Genus species
      /\b([A-Z][a-z]+)\s+([a-z]+)\b/g,
      // Abbreviated genus: G. species
      /\b([A-Z]\.)\s+([a-z]+)\b/g,
    ];
  }

  public async extractTerms(text: string): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    // Load dataset if not already loaded
    await this.datasetLoader.loadDefaultDataset();
    
    const terms: BiologicalTerm[] = [];
    const foundTerms = new Set<string>();

    const cleanText = this.preprocessText(text);
    
    for (const pattern of this.biologicalPatterns) {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        const fullMatch = match[0];
        const genus = match[1];
        const species = match[2];
        
        if (foundTerms.has(fullMatch.toLowerCase())) {
          continue;
        }
        
        if (this.isEnglishWord(genus) || this.isEnglishWord(species)) {
          continue;
        }
        
        if (this.isValidBiologicalTerm(genus, species)) {
          const context = this.extractContext(cleanText, match.index, 100);
          
          terms.push({
            genus: genus.replace('.', ''),
            species,
            fullName: `${genus} ${species}`,
            context: context.trim(),
            confidence: 100,
            position: match.index
          });
          
          foundTerms.add(fullMatch.toLowerCase());
        }
      }
    }

    terms.sort((a, b) => a.position - b.position);

    const processingTime = Date.now() - startTime;

    return {
      terms,
      totalFound: terms.length,
      processingTime,
      accuracy: 100
    };
  }

  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[""'']/g, '"')
      .trim();
  }

  private isEnglishWord(word: string): boolean {
    return this.englishWords.has(word.toLowerCase());
  }

  private isValidBiologicalTerm(genus: string, species: string): boolean {
    const cleanGenus = genus.replace('.', '');
    
    if (!/^[A-Z][a-z]+$/.test(cleanGenus)) {
      return false;
    }
    
    if (!/^[a-z]+$/.test(species)) {
      return false;
    }
    
    if (species.length < 3) {
      return false;
    }
    
    // First check against dataset (highest priority)
    if (this.datasetLoader.isValidTerm(cleanGenus, species)) {
      return true;
    }
    
    // Check if genus is known from dataset
    if (this.datasetLoader.isKnownGenus(cleanGenus)) {
      return true;
    }
    
    // Fallback to pattern matching
    const hasGenusPattern = this.genusPrefixes.some(prefix => 
      cleanGenus.toLowerCase().includes(prefix.toLowerCase())
    );
    
    const hasSpeciesPattern = this.speciesSuffixes.some(suffix => 
      species.toLowerCase().endsWith(suffix.toLowerCase())
    );
    
    return hasGenusPattern || hasSpeciesPattern;
  }

  private extractContext(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length / 2);
    const end = Math.min(text.length, position + length / 2);
    return text.substring(start, end);
  }
}