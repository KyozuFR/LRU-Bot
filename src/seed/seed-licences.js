const { licences } = require('../dbObjects.js');

module.exports = async () => {
    //test unitaire de la première et dernière valeur pour savoir si la bdd est rempli
    const findfirst = await licences.findOne({ where: { name: 'Licence Langues étrangères appliquées parcours anglais-chinois L1' } });
    const findlast = await licences.findOne({ where: { name: 'Licence Sciences pour la santé L3' } });
    if (!findfirst) {
        if (!findlast) {
            const licencesvar = [
                { name: 'Licence Langues étrangères appliquées parcours anglais-chinois L1', id: null, year: 1 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-chinois L2', id: null, year: 2 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-chinois L3', id: null, year: 3 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-coréen L1', id: null, year: 1 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-coréen L2', id: null, year: 2 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-coréen L3', id: null, year: 3 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-espagnol-portugais L1', id: null, year: 1 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-espagnol-portugais L2', id: null, year: 2 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-espagnol-portugais L3', id: null, year: 3 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-indonésien L1', id: null, year: 1 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-indonésien L2', id: null, year: 2 },
                { name: 'Licence Langues étrangères appliquées parcours anglais-indonésien L3', id: null, year: 3 },
                { name: 'Licence Lettres L1', id: null, year: 1 },
                { name: 'Licence Lettres L2', id: null, year: 2 },
                { name: 'Licence Lettres L3', id: null, year: 3 },
                { name: 'Licence Droit L1', id: null, year: 1 },
                { name: 'Licence Droit L2', id: null, year: 2 },
                { name: 'Licence Droit L3', id: null, year: 3 },
                { name: 'Licence Gestion L1', id: null, year: 1 },
                { name: 'Licence Gestion L2', id: null, year: 2 },
                { name: 'Licence Gestion L3', id: null, year: 3 },
                { name: 'Licence Géographie et aménagement L1', id: null, year: 1 },
                { name: 'Licence Géographie et aménagement L2', id: null, year: 2 },
                { name: 'Licence Géographie et aménagement L3', id: null, year: 3 },
                { name: 'Licence Histoire L1', id: null, year: 1 },
                { name: 'Licence Histoire L2', id: null, year: 2 },
                { name: 'Licence Histoire L3', id: null, year: 3 },
                { name: 'Licence Génie civil L1', id: null, year: 1 },
                { name: 'Licence Génie civil L2', id: null, year: 2 },
                { name: 'Licence Génie civil L3', id: null, year: 3 },
                { name: 'Licence Informatique L1', id: null, year: 1 },
                { name: 'Licence Informatique L2', id: null, year: 2 },
                { name: 'Licence Informatique L3', id: null, year: 3 },
                { name: 'Licence Mathématiques L1', id: null, year: 1 },
                { name: 'Licence Mathématiques L2', id: null, year: 2 },
                { name: 'Licence Mathématiques L3', id: null, year: 3 },
                { name: 'Licence Physique, chimie L1', id: null, year: 1 },
                { name: 'Licence Physique, chimie L2', id: null, year: 2 },
                { name: 'Licence Physique, chimie L3', id: null, year: 3 },
                { name: 'Licence Portail Sciences de la vie - Accès Santé (LAS) L1', id: null, year: 1 },
                { name: 'Licence Portail Sciences de la vie - Accès Santé (LAS) L2', id: null, year: 2 },
                { name: 'Licence Portail Sciences de la vie - Accès Santé (LAS) L3', id: null, year: 3 },
                { name: 'Licence Portail Sciences pour la santé - Accès Santé (LAS) L1', id: null, year: 1 },
                { name: 'Licence Portail Sciences pour la santé - Accès Santé (LAS) L2', id: null, year: 2 },
                { name: 'Licence Portail Sciences pour la santé - Accès Santé (LAS) L3', id: null, year: 3 },
                { name: 'Licence Sciences de la Terre L1', id: null, year: 1 },
                { name: 'Licence Sciences de la Terre L2', id: null, year: 2 },
                { name: 'Licence Sciences de la Terre L3', id: null, year: 3 },
                { name: 'Licence Sciences de la vie L1', id: null, year: 1 },
                { name: 'Licence Sciences de la vie L2', id: null, year: 2 },
                { name: 'Licence Sciences de la vie L3', id: null, year: 3 },
                { name: 'Licence Sciences pour la santé L1', id: null, year: 1 },
                { name: 'Licence Sciences pour la santé L2', id: null, year: 2 },
                { name: 'Licence Sciences pour la santé L3', id: null, year: 3 },
            ];
            await licences.bulkCreate(licencesvar);

        }
    }


}