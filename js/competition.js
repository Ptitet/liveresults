import LiveresultsAPI from './api.js';
import { formatDate } from './utils.js';

let competitionId = new URLSearchParams(window.location.search).get('id');
let competition = await LiveresultsAPI.getCompetition(competitionId);

document.title += ` ${competition.name}`;
document.querySelector('h2').textContent = competition.name;
document.querySelector('span#competition-date').textContent = formatDate(competition.date);
document.querySelector('span#competition-organizer').textContent = competition.organizer;

let competitionClasses = (await LiveresultsAPI.getClasses(competitionId));
let classList = document.querySelector('ul');
let tableResultBody = document.querySelector('section#results tbody');

for (let competitionClass of competitionClasses) {
    let listItem = document.createElement('li');
    let link = document.createElement('a');
    // link.href = `category.html?id=${competitionClass.className}`;
    link.textContent = competitionClass;
    listItem.appendChild(link);
    classList.appendChild(listItem);

    link.addEventListener('click', async (event) => {
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
        document.querySelector('section#results').classList.remove('hidden');
    });
}