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

/**
 * Must be called when we want to open the search result dialog
 * @param caller The dom object which calls this method
 */
function searchBoxFocusFunction(caller) {
    const classes = document.getElementById(caller.id + "PlaceholderParent").classList;
    classes.remove("opacity-0", "scale-95", "ease-in", "hidden");
    classes.add("opacity-100", "scale-100", "ease-out");
    searchBoxHandleSearch(caller);
}

/**
 * Must be called when we want to close the search dialog
 * @param caller The dom object which calls this method
 */
function searchBoxBlurFunction(caller) {
    const classes = document.getElementById(caller.id + "PlaceholderParent").classList;
    classes.add("opacity-0", "scale-95", "ease-in");
    classes.remove("opacity-100", "scale-100", "ease-out");
    setTimeout(() => classes.add("hidden"), 100); // disable clicking on it
}

function searchBoxHandleSearch(caller) {
    const airports = airportSearch(caller.value);
    const placeholder = document.getElementById(caller.id + "Placeholder");
    placeholder.innerHTML = "";
    airports.forEach(airport => {
        placeholder.innerHTML += `<span
                               class="search-result-text" role="menuitem" tabindex="-1"
                               onmousedown="searchBoxMenuItemClicked('${caller.id}','${airport}')">${airport}</span>`;
    });
}

function searchBoxMenuItemClicked(toChangeCallerID, value) {
    const input = document.getElementById(toChangeCallerID);
    input.value = value;
    input.blur();
}