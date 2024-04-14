export default class LiveresultsAPI {
    static corsProxyURL = 'https://corsproxy.io/?';
    static url = 'http://liveresultat.orientering.se/api.php';

    /**
     * Makes a call to the Liveresults API
     * @param {string} method The method to call in the API
     * @param {*} params The parameters to pass to the API
     * @returns {Promise<Response>} The response from the API
     */
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

    /**
     * Cleans and parses JSON data
     * @param {string} data The JSON data to clean and parse
     * @returns {any} The parsed JSON data
     */
    static clearAndParseJSON(data) {
        let cleanJSON = data.replace(/\t/g, '');
        return JSON.parse(cleanJSON);
    }

    /**
     * Gets the competitions from the API
     * @returns {Promise<Array<{id: number, name: string, organizer: string, date: string, timediff: number}>>} The competitions
     */
    static async getCompetitions() {
        let response = await this.makeAPICall('getcompetitions');
        let data = await response.text();
        return this.clearAndParseJSON(data).competitions;
    }

    /**
     * Get info about a competition
     * @param {number} competitionId The id of the competition to get
     * @returns {Promise<{id: number, name: string, organizer: string, date: string, timediff: number}>} The competition info
     */
    static async getCompetition(competitionId) {
        let response = await this.makeAPICall('getcompetitioninfo', { comp: competitionId });
        let data = await response.text();
        return this.clearAndParseJSON(data);
    }

    /**
     * Get the last passings of a competition
     * @param {number} competitionId The id of the competition
     * @returns {{passtime: string, runnerName: string, class: string, control: number, controlName: string, time: number}[]} The last passings
     */
    static async getLastPassings(competitionId) {
        let response = await this.makeAPICall('getlastpassings', { comp: competitionId });
        return (await response.json()).passings;
    }

    /**
     * Get the classes in a competition
     * @param {number} competitionId The id of the competition
     * @returns {Promise<string[]>} The classes in the competition
     */
    static async getClasses(competitionId) {
        let response = await this.makeAPICall('getclasses', { comp: competitionId });
        return (await response.json()).classes.map(c => c.className);
    }

    /**
     * Get the results for a class
     * @param {number} competitionId The id of the competition
     * @param {string} className The name of the class
     * @returns {Promise<{place: string, name: string, club: string, result: string, status: number, timeplus: string, progress: number, start: number}[]>} The results for the class
     */
    static async getClassResults(competitionId, className) {
        let response = await this.makeAPICall('getclassresults', { comp: competitionId, class: className, unformattedTimes: true });
        return (await response.json()).results;
    }

    /**
     * Get the results of a club
     * @param {number} competitionId The id of the competition
     * @param {string} clubName The name of the club
     * @returns {Promise<{place: string, name: string, club: string, class: string, result: string, status: number, timeplus: string, start: number}[]>} The results of the club
     */
    static async getClubResults(competitionId, clubName) {
        let response = await this.makeAPICall('getclubresults', { comp: competitionId, club: clubName, unformattedTimes: true });
        return (await response.json()).results;
    }
}