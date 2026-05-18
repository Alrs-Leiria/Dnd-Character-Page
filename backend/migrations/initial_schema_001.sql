PRAGMA foreign_keys = ON;

-- =========================================
-- ATTRIBUTE TYPES
-- =========================================

CREATE TABLE attribute_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL UNIQUE
);

-- =========================================
-- RACES
-- =========================================

CREATE TABLE races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- =========================================
-- CLASSES
-- =========================================

CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- =========================================
-- FEATS
-- =========================================

CREATE TABLE feats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- =========================================
-- SKILLS
-- =========================================

CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL UNIQUE,

    attribute_type_id INTEGER NOT NULL,

    FOREIGN KEY (attribute_type_id)
        REFERENCES attribute_types(id)
);

-- =========================================
-- CHARACTERS
-- =========================================

CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    antecedent TEXT,
    alignment TEXT,

    max_life INTEGER NOT NULL DEFAULT 1,
    current_life INTEGER NOT NULL DEFAULT 1,
    temp_life INTEGER NOT NULL DEFAULT 0,

    displacement INTEGER NOT NULL DEFAULT 30,

    race_id INTEGER,

    FOREIGN KEY (race_id)
        REFERENCES races(id)
);

-- =========================================
-- CHARACTER ATTRIBUTES
-- =========================================

CREATE TABLE character_attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    attribute_type_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,

    value INTEGER NOT NULL DEFAULT 10,

    FOREIGN KEY (attribute_type_id)
        REFERENCES attribute_types(id),

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    UNIQUE(character_id, attribute_type_id)
);

-- =========================================
-- CHARACTER CLASSES
-- =========================================

CREATE TABLE character_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    class_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,

    level INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (class_id)
        REFERENCES classes(id),

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE
);

-- =========================================
-- CHARACTER FEATS
-- =========================================

CREATE TABLE character_feats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    feat_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,

    FOREIGN KEY (feat_id)
        REFERENCES feats(id),

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    UNIQUE(character_id, feat_id)
);

-- =========================================
-- CHARACTER SKILLS
-- =========================================

CREATE TABLE character_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    skill_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,

    proficient INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (skill_id)
        REFERENCES skills(id),

    FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    UNIQUE(character_id, skill_id)
);

-- =========================================
-- RACE BONUSES
-- =========================================

CREATE TABLE race_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    race_id INTEGER NOT NULL,
    attribute_type_id INTEGER NOT NULL,

    value INTEGER NOT NULL,

    FOREIGN KEY (race_id)
        REFERENCES races(id)
        ON DELETE CASCADE,

    FOREIGN KEY (attribute_type_id)
        REFERENCES attribute_types(id)
);

-- =========================================
-- CLASS BONUSES
-- =========================================

CREATE TABLE class_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    class_id INTEGER NOT NULL,
    attribute_type_id INTEGER NOT NULL,

    value INTEGER NOT NULL,

    FOREIGN KEY (class_id)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    FOREIGN KEY (attribute_type_id)
        REFERENCES attribute_types(id)
);

-- =========================================
-- FEAT BONUSES
-- =========================================

CREATE TABLE feat_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    feat_id INTEGER NOT NULL,
    attribute_type_id INTEGER NOT NULL,

    value INTEGER NOT NULL,

    FOREIGN KEY (feat_id)
        REFERENCES feats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (attribute_type_id)
        REFERENCES attribute_types(id)
);