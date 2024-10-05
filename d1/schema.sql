DROP TABLE IF EXISTS Patients;
DROP TABLE IF EXISTS Physicians;
DROP TABLE IF EXISTS Diagnoses;
DROP TABLE IF EXISTS LabData;
DROP TABLE IF EXISTS TuberculosisScreenings;
DROP TABLE IF EXISTS KarnofskyScale;

CREATE TABLE Physicians (
    Email TEXT PRIMARY KEY,
    LastName TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    MiddleName TEXT
);

CREATE TABLE Patients (
    PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
    LastName TEXT NOT NULL,
    FirstName TEXT NOT NULL,
    MiddleName TEXT,
    DateOfBirth TEXT,
    SocialSecurityNo TEXT,
    PhysicianID TEXT,
    FilePath TEXT,
    FOREIGN KEY (PhysicianID) REFERENCES Physicians(Email)
);

CREATE TABLE Diagnoses (
    DiagnosisID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER,
    DiagnosisType TEXT NOT NULL,  -- E.g., 'HIV+ Asymptomatic', 'HIV+ Symptomatic', etc.
    DiagnosisDate TEXT,
    YearOfFirstPositiveTest INTEGER,
    Symptoms TEXT,
    OpportunisticInfections TEXT,
    CurrentSymptoms TEXT,
    OtherIllnesses TEXT,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

CREATE TABLE LabData (
    LabDataID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER,
    CD4Count INTEGER,
    CD4Percentage REAL,
    HIVViralLoad INTEGER,
    NeutrophilCount INTEGER,
    LabDataDate TEXT,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

CREATE TABLE TuberculosisScreenings (
    TBScreeningID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER,
    TBScreeningDate TEXT,
    TBTestResult TEXT,  -- 'Positive' or 'Negative'
    TBXrayDate TEXT,
    TBXrayResult TEXT,  -- 'Positive' or 'Negative'
    TreatmentStatus TEXT,  -- E.g., 'Receiving preventative TB treatment', etc.
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

CREATE TABLE KarnofskyScale (
    KarnofskyID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER,
    Assessment INTEGER,  -- Store as an integer: 100, 90, 80, etc.
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

