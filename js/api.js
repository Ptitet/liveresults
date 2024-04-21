class CacheManager {
    /**
     * The requests cache
     * @type {Map<string, string>}
     */
    requestCache;
    /**
     * The data cache
     * @type {Map<string, string>}
     */
    dataCache;

    constructor() {
        this.loadCacheFromLocalStorage();
    }

    loadCacheFromLocalStorage() {
        let requestCache = localStorage.getItem('requestCache');
        if (requestCache !== '{}' && requestCache) {
            this.requestCache = new Map(Object.entries(JSON.parse(requestCache)));
        } else {
            this.requestCache = new Map();
        }

        let dataCache = localStorage.getItem('dataCache');
        if (dataCache  !== '{}' && dataCache) {
            this.dataCache = new Map(Object.entries(JSON.parse(dataCache)));
        } else {
            this.dataCache = new Map();
        }
    }

    saveCacheToLocalStorage() {
        localStorage.setItem('requestCache', JSON.stringify(Object.fromEntries(this.requestCache.entries())));
        localStorage.setItem('dataCache', JSON.stringify(Object.fromEntries(this.dataCache.entries())));
    }

    checkRequest(requestURL) {
        return this.requestCache.get(requestURL);
    }
}

export default class LiveresultsAPI {
    static corsProxyURL = 'https://corsproxy.io/?';
    static url = 'http://liveresultat.orientering.se/api.php';
    static cacheManager = new CacheManager();

    /**
     * Makes a call to the Liveresults API
     * @param {string} method The method to call in the API
     * @param {*} params The parameters to pass to the API
     * @returns {Promise<any>} The response from the API
     */
    static async makeAPICall(method, params) {
        let searchParams = new URLSearchParams();
        searchParams.set('method', method);
        for (let key in params) {
            searchParams.set(key, params[key]);
        }
        let url = new URL(LiveresultsAPI.url);
        url.search = searchParams.toString();
        let requestURL = LiveresultsAPI.corsProxyURL + url.toString();
        let URLCacheKey = url.search.slice(1);
        // console.log(`Request cache: ${JSON.stringify(Object.fromEntries(LiveresultsAPI.cacheManager.requestCache.entries()))}`);
        // console.log(`Data cache: ${JSON.stringify(Object.fromEntries(LiveresultsAPI.cacheManager.dataCache.entries()))}`);
        let lastHash = LiveresultsAPI.cacheManager.checkRequest(URLCacheKey);
        if (lastHash) {
            requestURL += `&last_hash=${lastHash}`;
        }
        let apiResponse = await (await fetch(requestURL)).json();
        if (lastHash) {
            if (apiResponse.status === 'NOT MODIFIED') {
                console.log(`Cache hit for ${URLCacheKey}`);
                let cacheData = LiveresultsAPI.cacheManager.dataCache.get(lastHash);
                return JSON.parse(cacheData);
            } else {
                console.log(`Cache miss for ${URLCacheKey}`);
                LiveresultsAPI.cacheManager.dataCache.delete(lastHash);
                LiveresultsAPI.cacheManager.requestCache.delete(URLCacheKey);
                let cacheData = JSON.stringify(apiResponse);
                LiveresultsAPI.cacheManager.dataCache.set(apiResponse.hash, cacheData);
                LiveresultsAPI.cacheManager.requestCache.set(URLCacheKey, apiResponse.hash);
                return apiResponse;
            }
        } else if (apiResponse.hash) {
            console.log(`Initializing cache for ${URLCacheKey}`);
            let cacheData = JSON.stringify(apiResponse);
            LiveresultsAPI.cacheManager.dataCache.set(apiResponse.hash, cacheData);
            LiveresultsAPI.cacheManager.requestCache.set(URLCacheKey, apiResponse.hash);
            return apiResponse;
        } else {
            console.log(`Can't use cache for ${URLCacheKey}`);
            return apiResponse;
        }
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
        return response.competitions;
    }

    /**
     * Get info about a competition
     * @param {number} competitionId The id of the competition to get
     * @returns {Promise<{id: number, name: string, organizer: string, date: string, timediff: number}>} The competition info
     */
    static async getCompetition(competitionId) {
        let response = await this.makeAPICall('getcompetitioninfo', { comp: competitionId });
        return response;
    }

    /**
     * Get the last passings of a competition
     * @param {number} competitionId The id of the competition
     * @returns {{passtime: string, runnerName: string, class: string, control: number, controlName: string, time: number}[]} The last passings
     */
    static async getLastPassings(competitionId) {
        let response = await this.makeAPICall('getlastpassings', { comp: competitionId });
        return response.passings;
    }

    /**
     * Get the classes in a competition
     * @param {number} competitionId The id of the competition
     * @returns {Promise<string[]>} The classes in the competition
     */
    static async getClasses(competitionId) {
        let response = await this.makeAPICall('getclasses', { comp: competitionId });
        return response.classes.map(c => c.className);
    }

    /**
     * Get the results for a class
     * @param {number} competitionId The id of the competition
     * @param {string} className The name of the class
     * @returns {Promise<{place: string, name: string, club: string, result: string, status: number, timeplus: string, progress: number, start: number}[]>} The results for the class
     */
    static async getClassResults(competitionId, className) {
        let response = await this.makeAPICall('getclassresults', { comp: competitionId, class: className});
        return response.results;
    }

    /**
     * Get the results of a club
     * @param {number} competitionId The id of the competition
     * @param {string} clubName The name of the club
     * @returns {Promise<{place: string, name: string, club: string, class: string, result: string, status: number, timeplus: string, start: number}[]>} The results of the club
     */
    static async getClubResults(competitionId, clubName) {
        let response = await this.makeAPICall('getclubresults', { comp: competitionId, club: clubName});
        return response.results;
    }

    static clearCache() {
        LiveresultsAPI.cacheManager.dataCache.clear();
        LiveresultsAPI.cacheManager.requestCache.clear();
    }
}

window.onbeforeunload = () => {
    LiveresultsAPI.cacheManager.saveCacheToLocalStorage();
}