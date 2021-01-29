/**
 * Flight planning API client.
 * 
 * FlightPlan object:
 *   - FromAirport (string)
 *   - ToAirport (string)
 *   - Route (string)
 */
class APIClient {
  constructor() {
    this.baseURL = new URL("http://localhost:8000/api/v0/");
  }

  /**
   * Take a path and add it onto the base URL.
   * @param path {string} To append.
   * @returns {string} Base URL with appended path.
   */
  _urlPath(path) {
    return new URL(path, this.baseURL).toString();
  }

  /**
   * Checks that a fetch response is OK. 
   * @throws {string} A user friendly error message if
   *   the response does not indicate success.
   */
  async _checkFetchResp(resp) {
    if (resp.status !== 200) {
      const respBody = await resp.json();
      
      if (respBody["Message"] !== undefined) {
        // Normally the API will return a "Message" field
        // with a user friendly explination of what 
        // went wrong
        throw respBody["Message"];
      } else {
        // Otherwise throw up a generic internal server
        // error message
        throw "an unexpected error occurred on the server";
      }
    }
  }

  /**
   * Calls fetch on a path relative to the API's 
   * base URL. Checks the response and handles errors.
   * @param path {string} Path of endpoint relative to
   *   the baseURL.
   * @param opts {object} Any fetch options.
   * @returns {Promise<FetchResponse>} Resolves if fetch
   *   was successful.
   * @throws {string} User friendly error message if the
   *   API request failed.
   */
  async _wrappedFetch(path, opts) {
    try {
      const fullPath = this._urlPath(path);
      
      let resp = null;
      try {
        resp = await fetch(fullPath, opts);
      } catch (e) {
        console.error(`Failed to make API request to ${fullPath}`, e);
        throw "we had trouble contacting our server";
      }

      await this._checkFetchResp(resp);

      return resp;
    } catch (e) {
      // We wrap the entire function body in a try catch
      // just so any syntax errors or other gnarly
      // stuff is never seen by the user. But this means
      // any throws in the body which are user friendly
      // will be caught here again and the user will
      // never see it. So we assume that if e is a
      // string it is a user friendly error.
      if (typeof(e) === "string") {
        throw e;
      } else {
        // Bad gnarly error, hide from user
        console.error(`Failed to wrap fetch for API request (path argument=${path})`, e);
        throw "we had trouble contacting our server"
      }
    }
  }

  /**
   * Create a new flight plan.
   * @param flightPlan {FlightPlan} To create.
   * @returns {Promise<FlightPlan>} Resolves with
   *   created flight plan.
   * @throws {string} User friendly error message if 
   *   a flight plan fails to create.
   */
  async createFlightPlan(flightPlan) {
    const resp = await this._wrappedFetch(
      "flight_plan", {
        method: "POST",
        body: JSON.stringify({
          FlightPlan: flightPlan,
        }),
      });

    const respBody = await resp.json();
    
    return respBody.FlightPlan;
  }

  /**
   * Retrieve a flight plan by ID.
   * @param id {number} ID of flight plan.
   * @returns {Promise<FlightPlan>} Resolves when flight
   *   plan is retrieved.
   * @throws {string} User friendly error message if a
   *   flight plan cannot be retrieved.
   */
  async getFlightPlan(id) {
    const resp = await this._wrappedFetch(
      `flight_plan/${id}`, {
        method: "GET",
      });

    const respBody = await resp.json();

    return respBody.FlightPlan;
  }
}

export default APIClient;
