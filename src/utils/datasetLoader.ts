import Papa from 'papaparse';

export interface BiologicalDatasetEntry {
  genus: string;
  species: string;
  commonName?: string;
  kingdom?: string;
  family?: string;
  author?: string;
  year?: string;
}

export class DatasetLoader {
  private static instance: DatasetLoader;
  private dataset: Map<string, BiologicalDatasetEntry> = new Map();
  private genusSet: Set<string> = new Set();
  private loaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatasetLoader {
    if (!DatasetLoader.instance) {
      DatasetLoader.instance = new DatasetLoader();
    }
    return DatasetLoader.instance;
  }

  public async loadDatasetFromFiles(files: File[]): Promise<void> {
    this.dataset.clear();
    this.genusSet.clear();
    this.loaded = false;

    try {
      for (const file of files) {
        await this.loadSingleDatasetFile(file);
      }
      this.loaded = true;
      console.log(`Loaded ${this.dataset.size} biological terms from ${files.length} dataset files`);
    } catch (error) {
      console.error('Failed to load biological datasets:', error);
      throw error;
    }
  }

  private async loadSingleDatasetFile(file: File): Promise<void> {
    const text = await file.text();
    
    const parsed = Papa.parse(text, {
      header: true,
      delimiter: file.name.toLowerCase().endsWith('.csv') ? ',' : '\t',
      skipEmptyLines: true
    });

    parsed.data.forEach((row: any) => {
      // Handle different column name variations
      const genus = row.Genus || row.genus || row.GENUS || 
                   row.scientificName?.split(' ')[0] || 
                   row.canonicalName?.split(' ')[0];
      
      const species = row.Species || row.species || row.SPECIES ||
                     row.specificEpithet || row.specific_epithet ||
                     row.scientificName?.split(' ')[1] || 
                     row.canonicalName?.split(' ')[1];

      if (genus && species && genus.length > 1 && species.length > 1) {
        const entry: BiologicalDatasetEntry = {
          genus: genus.trim(),
          species: species.trim(),
          commonName: row.Common_Name || row.commonName || row.vernacularName,
          kingdom: row.Kingdom || row.kingdom || row.KINGDOM,
          family: row.Family || row.family || row.FAMILY,
          author: row.Author || row.author || row.scientificNameAuthorship,
          year: row.Year || row.year || row.namePublishedInYear
        };

        const key = `${entry.genus} ${entry.species}`.toLowerCase();
        this.dataset.set(key, entry);
        this.genusSet.add(entry.genus);
      }
    });
  }

  public async loadDefaultDataset(): Promise<void> {
    if (this.loaded || this.loadingPromise) {
      return this.loadingPromise || Promise.resolve();
    }

    this.loadingPromise = this.loadBuiltInDataset();
    return this.loadingPromise;
  }

  private async loadBuiltInDataset(): Promise<void> {
    try {
      // Try to load from public folder first
      const datasetPaths = [
        '/datasets/Taxon.tsv',
        '/datasets/NameUsage.tsv',
        '/src/data/biological-terms.tsv'
      ];

      let loadedAny = false;
      for (const path of datasetPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const text = await response.text();
            await this.parseDatasetText(text, path.endsWith('.csv'));
            loadedAny = true;
          }
        } catch (error) {
          console.warn(`Could not load dataset from ${path}:`, error);
        }
      }

      if (!loadedAny) {
        // Load minimal built-in dataset
        await this.loadMinimalDataset();
      }

      this.loaded = true;
      console.log(`Loaded ${this.dataset.size} biological terms from built-in datasets`);
    } catch (error) {
      console.error('Failed to load any datasets:', error);
      await this.loadMinimalDataset();
      this.loaded = true;
    }
  }

  private async parseDatasetText(text: string, isCSV: boolean = false): Promise<void> {
    const parsed = Papa.parse(text, {
      header: true,
      delimiter: isCSV ? ',' : '\t',
      skipEmptyLines: true
    });

    parsed.data.forEach((row: any) => {
      const genus = row.Genus || row.genus || row.GENUS || 
                   row.scientificName?.split(' ')[0] || 
                   row.canonicalName?.split(' ')[0];
      
      const species = row.Species || row.species || row.SPECIES ||
                     row.specificEpithet || row.specific_epithet ||
                     row.scientificName?.split(' ')[1] || 
                     row.canonicalName?.split(' ')[1];

      if (genus && species && genus.length > 1 && species.length > 1) {
        const entry: BiologicalDatasetEntry = {
          genus: genus.trim(),
          species: species.trim(),
          commonName: row.Common_Name || row.commonName || row.vernacularName,
          kingdom: row.Kingdom || row.kingdom || row.KINGDOM,
          family: row.Family || row.family || row.FAMILY,
          author: row.Author || row.author || row.scientificNameAuthorship,
          year: row.Year || row.year || row.namePublishedInYear
        };

        const key = `${entry.genus} ${entry.species}`.toLowerCase();
        this.dataset.set(key, entry);
        this.genusSet.add(entry.genus);
      }
    });
  }

  private async loadMinimalDataset(): Promise<void> {
    // Minimal fallback dataset
    const minimalData = [
      { genus: 'Homo', species: 'sapiens', commonName: 'Human', kingdom: 'Animalia', family: 'Hominidae' },
      { genus: 'Canis', species: 'lupus', commonName: 'Gray Wolf', kingdom: 'Animalia', family: 'Canidae' },
      { genus: 'Felis', species: 'catus', commonName: 'Domestic Cat', kingdom: 'Animalia', family: 'Felidae' },
      { genus: 'Escherichia', species: 'coli', commonName: 'E. coli', kingdom: 'Bacteria', family: 'Enterobacteriaceae' },
      { genus: 'Arabidopsis', species: 'thaliana', commonName: 'Thale Cress', kingdom: 'Plantae', family: 'Brassicaceae' }
    ];

    minimalData.forEach(entry => {
      const key = `${entry.genus} ${entry.species}`.toLowerCase();
      this.dataset.set(key, entry);
      this.genusSet.add(entry.genus);
    });
  }

  public isValidTerm(genus: string, species: string): boolean {
    const key = `${genus} ${species}`.toLowerCase();
    return this.dataset.has(key);
  }

  public isKnownGenus(genus: string): boolean {
    return this.genusSet.has(genus);
  }

  public getTermInfo(genus: string, species: string): BiologicalDatasetEntry | null {
    const key = `${genus} ${species}`.toLowerCase();
    return this.dataset.get(key) || null;
  }

  public getAllTerms(): BiologicalDatasetEntry[] {
    return Array.from(this.dataset.values());
  }

  public getDatasetSize(): number {
    return this.dataset.size;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public clearDataset(): void {
    this.dataset.clear();
    this.genusSet.clear();
    this.loaded = false;
    this.loadingPromise = null;
  }
}