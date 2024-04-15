import LiveresultsAPI from './api.js';
import { formatDate } from './utils.js';

let competitions = await LiveresultsAPI.getCompetitions();

function areDatesSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

let todayDate = new Date();

function isDateInFuture(date) {
    return date.getTime() > todayDate.getTime();
}

competitions = competitions.filter(competition => !isDateInFuture(new Date(competition.date))).map(competition => {
    competition.date = formatDate(competition.date);
    return competition;
});

let liveTodayCompetitions = competitions.filter(competition => areDatesSameDay(new Date(competition.date), todayDate));
let notLiveTodayCompetitions = competitions.filter(competition => !areDatesSameDay(new Date(competition.date), todayDate));

let liveTodayList = document.querySelector('section#live-today ul');
let notLiveTodayList = document.querySelector('section#not-live-today ul');

let groupedNotLiveTodayCompetitions = Object.groupBy(notLiveTodayCompetitions, ({ date }) => date);

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
    let listItem = document.createElement('li');
    let label = document.createElement('label');
    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    let dateElement = document.createElement('h2');
    dateElement.textContent = date;
    label.appendChild(dateElement);
    let replacedDate = date.replace(/\//g, '');
    label.htmlFor = replacedDate;
    checkBox.id = replacedDate;
    listItem.appendChild(checkBox);
    listItem.appendChild(label);
    let thisDateCompetitionsList = document.createElement('ul');
    thisDateCompetitionsList.classList.add('competitions-list');
    listItem.appendChild(thisDateCompetitionsList);
    notLiveTodayList.appendChild(listItem);
    return thisDateCompetitionsList;
}

function generateCompetitionLink(competition) {
    let listItem = document.createElement('li');
    let link = document.createElement('a');
    link.href = `competition.html?id=${competition.id}`;
    let competitionName = document.createElement('h3');
    competitionName.textContent = competition.name;
    let competitionOrganizer = document.createElement('p');
    competitionOrganizer.textContent = competition.organizer;
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
        let competitionDateMatch = competition.date.includes(query);
        return competitionNameMatch || competitionOrganizerMatch || competitionDateMatch;
    });
    for (let competition of results) {
        let listItem = generateCompetitionLink(competition);
        let dateElement = document.createElement('p');
        dateElement.innerText = competition.date;
        listItem.firstChild.appendChild(dateElement);
        searchResults.appendChild(listItem);
    }
    resultsCount.textContent = `${results.length} resultat${results.length === 1 ? '' : 's'}`;
});