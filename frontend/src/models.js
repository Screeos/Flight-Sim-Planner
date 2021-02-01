import { useState } from "react";

class FlightSector {
  static MakeBlank() {
    return {
      Departure: {
        Airport: "",
        Runway: "",
        SID: null,
      },
      Arrival: {
        Airport: "",
        Runway: "",
        STAR: null,
      },
      Route: [],
    };
  }
}

export { FlightSector };
