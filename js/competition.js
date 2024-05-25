import LiveresultsAPI from './api.js';

function formatDate(date) {
    return date.split('-').reverse().join('/');
}

let competitionId = new URLSearchParams(window.location.search).get('id');

if (!competitionId) {
    window.location.href = '/liveresults';
}

let competition;

try {
    competition = await LiveresultsAPI.getCompetition(competitionId);
} catch (error) {
    window.location.href = '/liveresults';
}

if (!competition.date) {
    window.location.href = '/liveresults';
}
const competitionName = competition.name || 'Compétition sans nom';
document.title += ` - ${competitionName}`;
document.querySelector('#competition-infos h3').textContent = competitionName;
document.querySelector('span#competition-date').textContent = formatDate(competition.date);
document.querySelector('span#competition-organizer').textContent = competition.organizer || 'Organisateur inconnu';

let competitionClasses = (await LiveresultsAPI.getClasses(competitionId));
let classList = document.querySelector('#classes ul');
let tableResultBody = document.querySelector('section#results tbody');

// let status = ['OK', 'DNS', 'DNF', 'MP', 'DSQ', 'OT', , , , 'Not Started Yet', 'Not Started Yet', 'Walkover', 'Moved Up']

if (!competitionClasses.length) {
    let noResultsParagraph = document.createElement('p');
    noResultsParagraph.textContent = 'Aucune catégorie pour cette compétition';
    classList.remove();
    document.querySelector('#classes').appendChild(noResultsParagraph);
}

for (let competitionClass of competitionClasses) {
    let listItem = document.createElement('li');
    let link = document.createElement('a');
    link.textContent = competitionClass;
    listItem.appendChild(link);
    classList.appendChild(listItem);

    link.addEventListener('click', async (event) => {
        event.preventDefault();
        for (let otherLink of classList.querySelectorAll('a')) {
            otherLink.classList.remove('active');
        }
        link.classList.add('active');
        document.querySelector('section#results p')?.remove();
        let classResults = await LiveresultsAPI.getClassResults(competitionId, competitionClass);
        classResults.sort((a, b) => +a.place - +b.place); // make sure the results are sorted
        let newChildren = [];
        if (!classResults.length) {
            let noResultsParagraph = document.createElement('p');
            noResultsParagraph.textContent = 'Aucun résultat pour cette catégorie';
            document.querySelector('section#results table').classList.add('hidden');
            document.querySelector('#results').appendChild(noResultsParagraph);
            return;
        }
        for (const runner of classResults) {
            let runnerRow = document.createElement('tr');
            let { place, result, timeplus } = getRunnerDetails(runner);
            runnerRow.innerHTML = `
            <td>${place}</td>
            <td>${runner.name}</td>
            <td>${result}</td>
            <td>${timeplus}</td>
            `;
            newChildren.push(runnerRow);
        }
        tableResultBody.replaceChildren(...newChildren);
        document.querySelector('section#results table').classList.remove('hidden');
    });
}

function getRunnerDetails(runner) {
    let place, result, timeplus;
    switch (runner.status) {
        case 0: { // OK
            place = runner.place;
            result = runner.result;
            timeplus = runner.timeplus;
            break;
        }
        case 1:
        case 9:
        case 10: { // DNS
            place = '-';
            result = 'Non parti(e)';
            timeplus = '-';
            break;
        }
        case 2: { // DNF
            place = '-';
            result = 'En course';
            timeplus = '-';
            break;
        }
        case 3: { // MP
            place = '-';
            result = 'P.M.';
            timeplus = '-';
            break;
        }
        case 4: { // DSQ
            place = '-';
            result = 'Disqualifié(e)';
            timeplus = '-';
            break;
        }
        case 5: { // OT
            place = '-';
            result = 'Hors délai';
            timeplus = '-';
            break;
        }
        case 11: { // Walkover
            place = '-';
            result = 'Abandon';
            timeplus = '-';
            break;
        }
        case 12: { // Moved Up
            place = '-';
            result = 'Surclassé(e)';
            timeplus = '-';
            break;
        }
    }
    return { place, result, timeplus };
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