class Character {

    constructor(characterdata, classes, attributes, feats, skills) {
        this.id = characterdata.id;
        this.name = characterdata.name;
        this.race = characterdata.race_name;
        this.antecedent = characterdata.antecedent;
        this.alignment = characterdata.alignment;
        this.maxlife = characterdata.maxlife;
        this.currentlife = characterdata.currentlife;
        this.templife = characterdata.templife;
        this.displacement = characterdata.displacement;
        
        //classes
        this.classes = classes;

        //class attributes
        this.attributes = attributes;
        
        //class feats
        this.feats = feats;

        //class skills
        this.skills = skills;
    }

    //implementar calculo de proficiencia
    get proficiencyBonus(){
        return 2;
    }
}
    
module.exports = Character;