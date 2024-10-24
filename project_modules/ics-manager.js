// Importation des modules nécessaires
const ical = require('ical');

/**
 * Fonction pour récupérer les données ICS à partir d'une URL.
 * @param {string} url - L'URL du fichier ICS.
 * @returns {Promise<Object>} - Les données ICS parsées.
 * @throws {Error} - Si la récupération ou le parsing des données échoue.
 */
async function getIcsData(url) {
    try {
        // Effectuer une requête pour récupérer les données ICS
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Response status: ${response.status}`);
        }
        // Lire le texte de la réponse et parser les données ICS
        const text = await response.text();
        return ical.parseICS(text);
    } catch (error) {
        console.error(`Error fetching or parsing data: ${error.message}`);
        throw error;
    }
}

/**
 * Fonction pour convertir les données ICS en JSON paginé.
 * @param {Object} icsData - Les données ICS parsées.
 * @param {number} nbElmtPage - Le nombre d'éléments par page.
 * @returns {Object} - Les données JSON paginées.
 */
function getJsonDataFromIcs(icsData, nbElmtPage) {
    const newJsonData = {};
    let curPage = 1;
    let curElmt = 0;
    const now = Date.now();

    //trié les données ICS par date (choix de classement par date de fin car compatible avec EDT et Moodle)
    icsData = Object.values(icsData).sort((a, b) => new Date(a.end) - new Date(b.end));

    // Parcourir chaque événement dans les données ICS
    for (const event in icsData) {
        const eventEndDate = new Date(icsData[event].end).getTime();

        // Vérifier si l'événement n'est pas encore terminé
        if (eventEndDate > now) {
            if (!newJsonData[curPage]) {
                newJsonData[curPage] = [];
            }

            // Ajouter l'événement à la page courante
            newJsonData[curPage].push(icsData[event]);
            curElmt++;

            // Passer à la page suivante si le nombre d'éléments par page est atteint
            if (curElmt >= nbElmtPage) {
                curPage++;
                curElmt = 0;
            }
        }
    }
    return newJsonData;
}

module.exports = {
    getIcsData,
    getJsonDataFromIcs
};