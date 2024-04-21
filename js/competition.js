import LiveresultsAPI from './api.js';
import { formatDate } from './utils.js';

let competitionId = new URLSearchParams(window.location.search).get('id');

if (!competitionId) {
    window.location.href = '/';
}

let competition;

try {
    competition = await LiveresultsAPI.getCompetition(competitionId);
} catch (error) {
    window.location.href = '/';
}

if (!competition.date) {
    window.location.href = '/';
}

document.title += ` - ${competition.name}`;
document.querySelector('#competition-infos h3').textContent = competition.name;
document.querySelector('span#competition-date').textContent = formatDate(competition.date);
document.querySelector('span#competition-organizer').textContent = competition.organizer;

let competitionClasses = (await LiveresultsAPI.getClasses(competitionId));
let classList = document.querySelector('#classes ul');
let tableResultBody = document.querySelector('section#results tbody');

for (let competitionClass of competitionClasses) {
    let listItem = document.createElement('li');
    let link = document.createElement('a');
    link.textContent = competitionClass;
    listItem.appendChild(link);
    classList.appendChild(listItem);

    link.addEventListener('click', async (event) => {
        for (let otherLink of classList.querySelectorAll('a')) {
            otherLink.classList.remove('active');
        }
        link.classList.add('active');
        document.querySelector('section#results p')?.remove();
        event.preventDefault();
        let classResults = await LiveresultsAPI.getClassResults(competitionId, competitionClass);
        classResults.sort((a, b) => +a.place - +b.place); // make sure the results are sorted
        let newChildren = [];
        for (const runner of classResults) {
            let runnerRow = document.createElement('tr');
            runnerRow.innerHTML = `
            <td>${runner.place}</td>
            <td>${runner.name}</td>
            <td>${runner.result}</td>
            <td>${runner.timeplus}</td>
            `;
            newChildren.push(runnerRow);
        }
        tableResultBody.replaceChildren(...newChildren);
        document.querySelector('section#results table').classList.remove('hidden');
    });
}

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