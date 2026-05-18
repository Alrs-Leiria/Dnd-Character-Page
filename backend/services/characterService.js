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

    const classes = db.prepare(`
        SELECT 
            classes.name,
            character_classes.level
        FROM 
            character_classes
        LEFT JOIN classes ON character_classes.class_id = classes.id
        WHERE character_classes.character_id = ?
    `).all(id);
    
    const attributes = db.prepare(`
        SELECT 
            attributes.description,
            character_attributes.value
        FROM 
            character_attributes
        LEFT JOIN attribute_types attributes ON attributes.id = character_attributes.attribute_type_id
        WHERE character_attributes.character_id = ?
    `).all(id);

    const feats = db.prepare(`
        SELECT 
            feats.name,
            feats.description
        FROM 
            character_feats
        LEFT JOIN feats ON character_feats.feat_id = feats.id
        WHERE character_feats.character_id = ?
    `).all(id);

    const skills = db.prepare(`
        SELECT 
            skills.description,
            character_skills.proficient,
            attribute_types.description,
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
    `).all(id);

    if (!characterData) {
        return null;
    }

    return new Character(characterData, classes, attributes, feats, skills);
}

module.exports = {
    getCharacterById
};