/**
 * Flight planning API client.
 * 
 * FlightPlan object:
 *   - fromAirport (string)
 *   - toAirport (string)
 *   - route (string)
 */
class APIClient {
  constructor() {
    this.baseURL = new URL("http://localhost:8000/api/v0");
  }

  /**
   * Create a new flight plan.
   * @param flightPlan {FlightPlan} To create.
   * @returns {Promise<FlightPlan>} Resolves with created
   *   flight plan or rejects with an error.
   */
  async createFlightPlan(flightPlan) {
    // TODO: Make HTTP request to create flight plan endpoint
  }
}
