CREATE TABLE IF NOT EXISTS Clone  (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  aa_changes TEXT,
  type TEXT NOT NULL,
  purify_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Virus_Stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  harvest_date DATE NOT NULL,
  clone INT NOT NULL,
  ffu_per_ml INTEGER NOT NULL,
  FOREIGN KEY (clone) REFERENCES Clone(id)
);

CREATE TABLE IF NOT EXISTS Drug (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  abbreviation TEXT
);

CREATE TABLE IF NOT EXISTS Plate_Reading (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  read_date DATE NOT NULL,
  letter CHARACTER(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS Plate_to_Quadrant (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plate_id INTEGER NOT NULL,
  quad_location INTEGER NOT NULL,
  quad INTEGER,
  FOREIGN KEY (plate_id) REFERENCES Plate_Reading(id),
  FOREIGN KEY (quad) REFERENCES Quadrant(id)
);

CREATE TABLE IF NOT EXISTS Quadrant (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  virus_stock INTEGER NOT NULL,
  drug INTEGER NOT NULL,
  -- min_c DECIMAL(10, 10) NOT NULL,
  -- concentration_inc TEXT NOT NULL,
  concentration_range TEXT NOT NULL,
  num_controls INTEGER NOT NULL,
  q_abs TEXT NOT NULL,
  FOREIGN KEY (virus_stock) REFERENCES Virus_Stock(id),
  FOREIGN KEY (drug) REFERENCES Drug(id)
);

CREATE TABLE IF NOT EXISTS History (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    affected_table TEXT NOT NULL,
    type TEXT NOT NULL,
    affected_id INTEGER NOT NULL,
    date_entered DATE NOT NULL
);

CREATE TRIGGER IF NOT EXISTS insert_clone AFTER INSERT ON Clone
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Clone",'INSERT',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS update_clone AFTER UPDATE ON Clone
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Clone",'UPDATE',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS delete_clone AFTER DELETE ON Clone
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Clone",'DELETE',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS insert_vs AFTER INSERT ON Virus_Stock
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Virus_Stock",'INSERT',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS update_vs AFTER UPDATE ON Virus_Stock
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Virus_Stock",'UPDATE',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS delete_vs AFTER DELETE ON Virus_Stock
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Virus_Stock",'DELETE',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS insert_q AFTER INSERT ON Quadrant
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Quadrant",'INSERT',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS update_q AFTER UPDATE ON Quadrant
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Quadrant",'UPDATE',new.id,DATETIME('NOW'));
END;

CREATE TRIGGER IF NOT EXISTS delete_q AFTER DELETE ON Quadrant
    BEGIN
    INSERT INTO History (affected_table, type, affected_id, date_entered)
    values ("Quadrant",'DELETE',new.id,DATETIME('NOW'));
END;
