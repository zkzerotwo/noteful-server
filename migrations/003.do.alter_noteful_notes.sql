ALTER TABLE noteful_notes ADD COLUMN  folder
    INTEGER REFERENCES noteful_folders(id)
    ON DELETE SET NULL;

