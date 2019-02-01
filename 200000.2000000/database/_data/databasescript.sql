#sqlite3 database 
#sqlite3 --> sqlite> .open database
#ctr+D = exit

CREATE TABLE bruker (
	brukerID SMALLINT(5),
    passordhash VARCHAR(100),
    fornavn VARCHAR(20),
    etternavn VARCHAR(20),
    
    PRIMARY KEY (brukerID)
);

CREATE TABLE sesjon (
	sesjonsID SMALLINT(5),
    brukerID SMALLINT(5),
    
    PRIMARY KEY (sesjonsID),
    FOREIGN KEY (brukerID) REFERENCES bruker (brukerID)
);

CREATE TABLE forfatter (

  forfatterID  SMALLINT(5),
  fornavn      VARCHAR(100),
  etternavn    VARCHAR(100),
  nasjonalitet VARCHAR(100),

  PRIMARY KEY (forfatterID)
);

CREATE TABLE bok (

  bokID       SMALLINT(5),
  tittel      VARCHAR(250),
  forfatterID SMALLINT(5),

  PRIMARY KEY (bokID),
  FOREIGN KEY (forfatterID) REFERENCES forfatter (forfatterID)
);

insert into bruker values(01,"56f491c56340a6fa5c158863c6bfb39f","Petter","Thorsen");
insert into bruker values(02,"56f491c56340a6fa5c158863c6bfb39f","Benjamin","Braathen");


