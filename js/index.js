import LiveresultsAPI from './api.js';


let competitions;
try {
    competitions = await LiveresultsAPI.getCompetitions();
} catch (error) {
    if (error.message.includes('NetworkError')) {
        alert('Erreur de réseau : veuillez vérifier votre connexion internet.');
    } else {
        alert('Une erreur est survenue.');
    }
}

document.querySelectorAll('.loading').forEach(loader => loader.style.display = 'none');

function areDatesSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

let todayDate = new Date();

function isDateInFuture(date) {
    return date.getFullYear() > todayDate.getFullYear() ||
        (date.getFullYear() === todayDate.getFullYear() && date.getMonth() > todayDate.getMonth()) ||
        (date.getFullYear() === todayDate.getFullYear() && date.getMonth() === todayDate.getMonth() && date.getDate() > todayDate.getDate());
}

function formatDate(date) {
    return date.split('-').reverse().join('/');
}

competitions = competitions.filter(competition => !isDateInFuture(new Date(competition.date))).map(competition => {
    competition.formattedDate = formatDate(competition.date);
    return competition;
});

let liveTodayCompetitions = competitions.filter(competition => areDatesSameDay(new Date(competition.date), todayDate));
let notLiveTodayCompetitions = competitions.filter(competition => !areDatesSameDay(new Date(competition.date), todayDate));

let liveTodayList = document.querySelector('section#live-today ul');
let notLiveTodayList = document.querySelector('section#not-live-today ul');

let groupedNotLiveTodayCompetitions = Object.groupBy(notLiveTodayCompetitions, ({ formattedDate }) => formattedDate);

if (liveTodayCompetitions.length === 0) {
    liveTodayList.innerText = 'Aucune compétition aujourd\'hui.';
} else {
    for (let competition of liveTodayCompetitions) {
        let listItem = generateCompetitionLink(competition);
        liveTodayList.appendChild(listItem);
    }
}

for (let date in groupedNotLiveTodayCompetitions) {
    let competitionsList = generateDateContainer(date);

    for (let competition of groupedNotLiveTodayCompetitions[date]) {
        let listItem = generateCompetitionLink(competition);
        competitionsList.appendChild(listItem);
    }
}

function generateDateContainer(date) {
    let detailsElement = document.createElement('details');
    let summaryElement = document.createElement('summary');
    summaryElement.textContent = date;
    detailsElement.appendChild(summaryElement);
    let competitionsList = document.createElement('ul');
    competitionsList.classList.add('competitions-list');
    detailsElement.appendChild(competitionsList);
    notLiveTodayList.appendChild(detailsElement);
    return competitionsList;
}

function generateCompetitionLink(competition) {
    let listItem = document.createElement('li');
    let link = document.createElement('a');
    link.classList.add('btn-like');
    link.href = `competition.html?id=${competition.id}`;
    let competitionName = document.createElement('h3');
    competitionName.textContent = competition.name || 'Compétition sans nom';
    let competitionOrganizer = document.createElement('p');
    competitionOrganizer.textContent = competition.organizer || 'Organisateur inconnu';
    link.appendChild(competitionName);
    link.appendChild(competitionOrganizer);
    listItem.appendChild(link);
    return listItem;
}

let searchInput = document.querySelector('#search input');
let searchResults = document.querySelector('#search-results');
let resultsCount = document.querySelector('#result-count');
searchInput.addEventListener('input', event => {
    let query = event.target.value;
    searchResults.innerText = '';
    resultsCount.textContent = '';
    if (query.length < 2) {
        return;
    }
    let results = competitions.filter(competition => {
        let competitionNameMatch = competition.name.toLowerCase().includes(query.toLowerCase());
        let competitionOrganizerMatch = competition.organizer.toLowerCase().includes(query.toLowerCase());
        let competitionDateMatch = competition.date.includes(query) || competition.formattedDate.includes(query);
        return competitionNameMatch || competitionOrganizerMatch || competitionDateMatch;
    });
    for (let competition of results) {
        let listItem = generateCompetitionLink(competition);
        let dateElement = document.createElement('p');
        dateElement.innerText = competition.formattedDate;
        listItem.firstChild.appendChild(dateElement);
        searchResults.appendChild(listItem);
    }
    resultsCount.textContent = `${results.length} résultat${results.length === 1 ? '' : 's'}`;
});

const settingsWrapper = document.querySelector('#settings-wrapper');

document.querySelector('#settings').addEventListener('click', () => {
    settingsWrapper.classList.toggle('hidden');
});

document.querySelector('#settings-close-btn').addEventListener('click', () => {
    settingsWrapper.classList.add('hidden');
});

const cacheSizeElement = document.querySelector('#cache-size');

document.querySelector('#setting-clear-cache').addEventListener('click', () => {
    LiveresultsAPI.clearCache();
    cacheSizeElement.textContent = 0;
});

cacheSizeElement.textContent = LiveresultsAPI.cacheManager.dataCache.size;