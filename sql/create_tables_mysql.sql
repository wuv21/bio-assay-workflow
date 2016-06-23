CREATE DATABASE hiv2_drug_assay;

USE hiv2_drug_assay;

CREATE TABLE Clone (
  id INT NOT NULL AUTO_INCREMENT,
  aa_changes TINYTEXT,
  purify_date DATE NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Virus_Stock (
  id INT NOT NULL AUTO_INCREMENT,
  harvest_date DATE NOT NULL,
  clone INT NOT NULL,
  ffu_per_ml MEDIUMINT() UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (clone) REFERENCES Clone(id)
);

CREATE TABLE Drug (
  id INT NOT NULL AUTO_INCREMENT
  name CHAR(100) NOT NULL,
  abbreviation CHAR(5),
  PRIMARY KEY (id)
);

CREATE TABLE Plate_Reading (
  id INT NOT NULL AUTO_INCREMENT,
  read_date DATE() NOT NULL,
  letter CHAR(1) NOT NULL,
  q1 INT,
  q2 INT,
  q3 INT,
  q4 INT,
  q1_abs BLOB,
  q2_abs BLOB,
  q3_abs BLOB,
  q4_abs BLOB,
  PRIMARY KEY (id),
  FOREIGN KEY (q1) REFERENCES Quadrant(id),
  FOREIGN KEY (q2) REFERENCES Quadrant(id),
  FOREIGN KEY (q3) REFERENCES Quadrant(id),
  FOREIGN KEY (q4) REFERENCES Quadrant(id),
);

CREATE TABLE Quadrant (
  id <type> INT NOT NULL AUTO_INCREMENT,
  assay_date DATE() NOT NULL,
  virus_stock INT NOT NULL,
  drug INT NOT NULL,
  concentration_min DECIMAL() NOT NULL,
  concentration_max DECIMAL() NOT NULL,
  concentration_inc DECIMAL() NOT NULL,
  num_controls INT(24) UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY virus_stock REFERENCES Virus_Stock(id)
  FOREIGN KEY drug REFERENCES Drug(id)
);

