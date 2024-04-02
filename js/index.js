import LiveresultsAPI from './api.js';

let competitions = await LiveresultsAPI.getCompetitions();
console.log(competitions.length)
let competition = await LiveresultsAPI.getCompetition(29070);
console.log(competition);
console.log(await LiveresultsAPI.getClasses(29070));