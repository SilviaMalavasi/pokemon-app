CREATE TABLE IF NOT EXISTS CardSet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setId TEXT UNIQUE,
      name TEXT,
      series TEXT,
      printedTotal INTEGER,
      total INTEGER,
      releaseDate TEXT,
      updatedAt TEXT,
      ptcgoCode TEXT
    );

    CREATE TABLE IF NOT EXISTS Abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS Card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId TEXT UNIQUE,
      name TEXT,
      supertype TEXT,
      subtypes TEXT,
      hp INTEGER,
      types TEXT,
      evolvesFrom TEXT,
      weaknesses TEXT,
      resistances TEXT,
      evolvesTo TEXT,
      retreatCost TEXT,
      convertedRetreatCost INTEGER,
      flavorText TEXT,
      artist TEXT,
      rarity TEXT,
      nationalPokedexNumbers TEXT,
      regulationMark TEXT,
      imagesLarge TEXT,
      rules TEXT,
      number TEXT,
      setId INTEGER,
      FOREIGN KEY (setId) REFERENCES CardSet (id)
    );

    CREATE TABLE IF NOT EXISTS CardAbilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId INTEGER,
      abilityId INTEGER,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (abilityId) REFERENCES Abilities (id)
    );

    CREATE TABLE IF NOT EXISTS CardAttacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardId INTEGER,
      attackId INTEGER,
      cost TEXT,
      convertedEnergyCost INTEGER,
      damage TEXT,
      FOREIGN KEY (cardId) REFERENCES Card (id),
      FOREIGN KEY (attackId) REFERENCES Attacks (id)
    );
