CREATE TABLE IF NOT EXISTS Clone  (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  aa_changes TEXT,
  type TEXT NOT NULL,
  purify_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Virus_Stock (
  id INTEGER PRIMARY KEY,
  harvest_date DATE NOT NULL,
  clone INT NOT NULL,
  ffu_per_ml INTEGER NOT NULL,
  FOREIGN KEY (clone) REFERENCES Clone(id)
);

CREATE TABLE IF NOT EXISTS Drug (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT
);

CREATE TABLE IF NOT EXISTS Plate_Reading (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  read_date DATE NOT NULL,
  letter CHARACTER(1) NOT NULL,
  q1 INTEGER,
  q2 INTEGER,
  q3 INTEGER,
  q4 INTEGER,
  FOREIGN KEY (q1) REFERENCES Quadrant(id),
  FOREIGN KEY (q2) REFERENCES Quadrant(id),
  FOREIGN KEY (q3) REFERENCES Quadrant(id),
  FOREIGN KEY (q4) REFERENCES Quadrant(id)
);

CREATE TABLE IF NOT EXISTS Quadrant (
  id INTEGER PRIMARY KEY,
  virus_stock INTEGER NOT NULL,
  drug INTEGER NOT NULL,
  min_c DECIMAL(10, 10) NOT NULL,
  concentration_inc TEXT NOT NULL,
  num_controls INTEGER NOT NULL,
  q_abs TEXT NOT NULL,
  FOREIGN KEY (virus_stock) REFERENCES Virus_Stock(id),
  FOREIGN KEY (drug) REFERENCES Drug(id)
);

