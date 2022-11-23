/**
 * Searches for an airport with given input as contains
 * @param {string} a The string to search in airports name
 * @returns {Array} The airport names which match this search pattern
 */
function airportSearch(a) {
    const MAX_AIRPORTS = 5;
    const AIRPORTS = ["سیرجان", "یزد", "تهران", "بابل", "کرج", "اهواز", "کردستان", "تبریز", "رشت", "اصفهان", "مشهد"];
    if (a === "")
        return AIRPORTS.slice(0, MAX_AIRPORTS);
    return AIRPORTS.filter((value) => value.toLowerCase().includes(a.toLowerCase())).slice(0, MAX_AIRPORTS);
}