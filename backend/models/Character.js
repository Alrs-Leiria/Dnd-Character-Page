class Character {

    constructor(
        characterdata,
        classes,
        attributes,
        feats,
        skills
    ) {

        this.id = characterdata.id;

        this.name = characterdata.name;

        this.race = characterdata.race_name;

        this.antecedent =
            characterdata.antecedent;

        this.alignment =
            characterdata.alignment;

        this.maxlife =
            characterdata.maxlife;

        this.currentlife =
            characterdata.currentlife;

        this.templife =
            characterdata.templife;

        this.displacement =
            characterdata.displacement;

        // collections

        this.classes = classes || [];

        this.skills = skills || [];

        this.feats = feats || [];

        this.attributes =
            attributes || {};

        // derived values

        this.level =
            this.classes.reduce(
                (sum, row) =>
                    sum + row.level,
                0
            );

        this.classesDescription =
            this.classes
                .map(
                    c =>
                        `${c.name} [${c.level}]`
                )
                .join(" / ");

        // attribute modifiers

        for (const key in this.attributes) {

            const attribute =
                this.attributes[key];

            attribute.modifier =
                this.modifier(
                    attribute.value
                );

            attribute.skills =
                this.skills.filter(
                    s =>
                        s.attribute ===
                        attribute.description
                );
        }
    }

    get proficiencyBonus() {

        const level = this.level;

        if (level >= 17) return 6;
        if (level >= 13) return 5;
        if (level >= 9) return 4;
        if (level >= 5) return 3;

        return 2;
    }

    modifier(value) {

        return Math.floor(
            (value - 10) / 2
        );
    }
}

module.exports = Character;