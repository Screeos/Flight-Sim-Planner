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
  urlPath(path) {
    return new URL(path, this.baseURL).toString();
  }

  /**
   * Create a new flight plan.
   * @param flightPlan {FlightPlan} To create.
   * @returns {Promise<FlightPlan>} Resolves with created
   *   flight plan or rejects with an error.
   */
  async createFlightPlan(flightPlan) {
    const resp = await fetch(
      this.urlPath("flight_plan"), {
        method: "POST",
        body: JSON.stringify({
          FlightPlan: flightPlan,
        }),
      });

    const respBody = await resp.json();
    
    return respBody.FlightPlan;
  }
}

export default APIClient;
