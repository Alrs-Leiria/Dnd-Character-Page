const Character = require("../models/Character");

const db = require('../database');

function getCharacterById(id) {
    
    const characterData = db.prepare(`
       SELECT 
            characters.*,
            races.name as race_name
        FROM 
            characters
        LEFT JOIN races ON  races.id = characters.race_id
        WHERE characters.id = ?
    `).get(id);


    if (!characterData) {
        return null;
    }

    const attributes = getAttributes(id);
    const classes = getCharacterClasses(id);
    const feats = getCharacterFeats(id);
    const skills = getCharacterSkills(id);
    return new Character(characterData, classes, attributes, feats, skills);
}

function getAttributes(characterId) {
    
    const attributeRows = db
    .prepare(`
        SELECT 
            attributes.description,
            character_attributes.value
        FROM 
            character_attributes
        LEFT JOIN attribute_types attributes ON attributes.id = character_attributes.attribute_type_id
        WHERE character_attributes.character_id = ?`)
    .all(characterId);
    
    return attributeRows.map(row => ({
        description: row.description,
        value: row.value
    }));
}

function getCharacterClasses(characterId) {
    
    const classesRows = db.prepare(`
        SELECT 
            classes.name,
            classes.description,
            character_classes.level
        FROM 
            character_classes
        LEFT JOIN classes ON character_classes.class_id = classes.id
        WHERE character_classes.character_id = ?
    `).all(characterId);
    
    return classesRows.map(row => ({
        name: row.name,
        description: row.description,
        level: row.level
    }));
}

function getCharacterFeats(characterId) {
    
    const featsRows = db.prepare(`
        SELECT 
            feats.name,
            feats.description
        FROM 
            character_feats
        LEFT JOIN feats ON character_feats.feat_id = feats.id
        WHERE character_feats.character_id = ?
    `).all(characterId);

    return featsRows.map(row => ({
        name: row.name,
        description: row.description
    }));
}

function getCharacterSkills(characterId) {

    const skillsRows = db.prepare(`
        SELECT 
            skills.description,
            character_skills.proficient,
            attribute_types.description as attribute,
            character_attributes.value
        FROM 
            character_skills
        INNER JOIN skills 
            ON skills.id = character_skills.skill_id
        INNER JOIN attribute_types 
            ON attribute_types.id = skills.attribute_type_id
        LEFT JOIN character_attributes 
            ON character_attributes.attribute_type_id = attribute_types.id 
            AND character_attributes.character_id = character_skills.character_id
        WHERE character_skills.character_id =?
    `).all(characterId);

    return skillsRows.map(row => ({
        description: row.description,
        proficient: !!row.proficient,
        attribute: row.attribute,
        attributeValue: row.value
    }));
}

module.exports = {
    getCharacterById
};
