import LiveresultsAPI from './api.js';

let competitions = await LiveresultsAPI.getCompetitions();

function areDatesSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

let todayDate = new Date();

let notLiveTodayCompetitions = [];
let liveTodayCompetitions = [];

for (let competition of competitions) {
    if (areDatesSameDay(new Date(competition.date), todayDate)) {
        liveTodayCompetitions.push(competition);
    } else {
        notLiveTodayCompetitions.push(competition);
    }
}

let liveTodayList = document.querySelector('section#live-today ul');
let notLiveTodayList = document.querySelector('section#not-live-today ul');

for (let competition of liveTodayCompetitions) {
    let listItem = document.createElement('li');
    listItem.textContent = competition.name;
    liveTodayList.appendChild(listItem);
}

for (let competition of notLiveTodayCompetitions) {
    let listItem = document.createElement('li');
    listItem.textContent = competition.name;
    notLiveTodayList.appendChild(listItem);
}