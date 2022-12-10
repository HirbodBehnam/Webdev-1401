/**
 * Converts a jalali date to Date object
 * @param y {number} Year
 * @param m {number} Month
 * @param d {number} Day
 * @return {Date} The constructed date or null
 */
function jalaliToDate(y, m, d) {
    // Check if it's valid
    if (!jalaali.isValidJalaaliDate(y, m, d))
        return null;
    // Convert it
    const date = jalaali.toGregorian(y, m, d);
    return new Date(date.gy, date.gm - 1, date.gd);
}

/**
 * Parses a persian date in format of YYYY/MM/DD
 * @param d {string} The date string
 * @return {Date} Parsed date or null if there was a error
 */
function parsePersianDate(d) {
    const chunks = d.split("/").map(x => parseInt(x));
    if (chunks.length !== 3)
        return null;
    for (let i = 0; i < 3; i++)
        if (Number.isNaN(chunks[i]))
            return null;
    return jalaliToDate(chunks[0], chunks[1], chunks[2]);
}

/**
 * Checks if departure and destination are valid
 * @param departureDate {string} Departure date
 * @param returnDate {string} Return date
 * @return {number} 0 if ok, 1 if invalid date, 2 if departure is after return date
 */
function validateDepartureAndDestination(departureDate, returnDate) {
    // Parse
    const departureTime = parsePersianDate(departureDate);
    const returnTime = parsePersianDate(returnDate);
    // Check
    if (departureTime === null) {
        document.getElementById("departureTime").classList.add("invalid-input");
        return 1;
    }
    if (returnTime === null) {
        document.getElementById("returnTime").classList.add("invalid-input");
        return 1;
    }
    if (departureTime >= returnTime)
        return 2;
    return 0;
}

function validateSearch() {
    // Reset everything
    const messageText = document.getElementById("messageText");
    const departure = document.getElementById("departureLocation");
    const destination = document.getElementById("destinationLocation");
    const departureDate = document.getElementById("departureTime");
    const returnDate = document.getElementById("returnTime");
    departure.classList.remove("invalid-input");
    destination.classList.remove("invalid-input");
    departureDate.classList.remove("invalid-input");
    returnDate.classList.remove("invalid-input");
    messageText.innerHTML = "";
    // Check equal airports
    let fine = true;
    if (departure.value === destination.value) {
        fine = false;
        messageText.innerHTML += "مبدا و مقصد نمی تواند یکی باشد." + "<br>";
        departure.classList.add("invalid-input");
        destination.classList.add("invalid-input");
    }
    if (document.getElementById("toway-ticket").checked) { // to way ticket
        // Check return before date
        switch (validateDepartureAndDestination(departureDate.value, returnDate.value)) {
            case 1:
                fine = false;
                messageText.innerHTML += "تاریخ نامعتبر" + "<br>";
                break;
            case 2:
                fine = false;
                messageText.innerHTML += "تاریخ رفت نمی‌تواند قبل از تاریخ برگشت باشد" + "<br>";
                break;
        }
    } else { // one way ticket
        if (parsePersianDate(departureDate.value) == null) {
            fine = false;
            document.getElementById("departureTime").classList.add("invalid-input");
            messageText.innerHTML += "تاریخ نامعتبر" + "<br>";
        }
    }
    // Reduce inner text if needed
    if (messageText.innerHTML.length > 4)
        messageText.innerHTML = messageText.innerHTML.slice(0, -4);
    return fine;
}

/**
 * This method must be called when the two-way checkbox state is changed to
 * enable or disable the return time textbox.
 */
function toWayTicketTriggered() {
    const checked = document.getElementById("toway-ticket").checked;
    const returnTimeInput = document.getElementById("returnTime");
    returnTimeInput.disabled = !checked;
    returnTimeInput.placeholder = checked ? "انتخاب کنید" : "";
    returnTimeInput.value = "";
}