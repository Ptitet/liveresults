export default class LiveresultsAPI {
    static corsProxyURL = 'https://corsproxy.io/?';
    static url = 'http://liveresultat.orientering.se/api.php';

    static makeAPICall(method, params) {
        let searchParams = new URLSearchParams();
        searchParams.set('method', method);
        for (let key in params) {
            searchParams.set(key, params[key]);
        }
        let url = new URL(LiveresultsAPI.url);
        url.search = searchParams.toString();
        let requestURL = LiveresultsAPI.corsProxyURL + url.toString();
        return fetch(requestURL);
    }

    static clearAndParseJSON(data) {
        let cleanJSON = data.replace(/\t/g, '');
        return JSON.parse(cleanJSON);
    }

    static async getCompetitions() {
        let response = await this.makeAPICall('getcompetitions');
        let data = await response.text();
        return this.clearAndParseJSON(data).competitions;
    }

    static async getCompetition(competitionId) {
        let response = await this.makeAPICall('getcompetitioninfo', { comp: competitionId });
        let data = await response.text();
        return this.clearAndParseJSON(data);
    }

    static async getLastPassings(competitionId) {
        let response = await this.makeAPICall('getlastpassings', { comp: competitionId });
        return response.json();
    }

    static async getClasses(competitionId) {
        let response = await this.makeAPICall('getclasses', { comp: competitionId });
        return response.json();
    }

    static async getClassResults(competitionId, className) {
        let response = await this.makeAPICall('getclassresults', { comp: competitionId, class: className, unformattedTimes: 1 });
        return response.json();
    }

    static async getClubResults(competitionId, clubName) {
        let response = await this.makeAPICall('getclubresults', { comp: competitionId, club: clubName, unformattedTimes: 1 });
        return response.json();
    }
}