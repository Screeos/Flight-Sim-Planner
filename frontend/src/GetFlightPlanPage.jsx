import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";

import {
  APIClientCtx,
  ShowErrCtx,
} from "./App.jsx";

const GetFlightPlanPage = () => {
  const { flightPlanID } = useParams();
  const apiClient = useContext(APIClientCtx);
  const showErr = useContext(ShowErrCtx);

  const [flightPlan, setFlightPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    let flightPlan = null;
    
    try {
      flightPlan = await apiClient.getFlightPlan(
        flightPlanID);
    } catch (e) {
      showErr(`failed to load the flight plan you asked for: ${e}`);
      return;
    }
    
    setFlightPlan(flightPlan);
    setIsLoading(false);
  }, [flightPlanID]);

  // TODO: Show loading bar when retrieving flight plan
  // TODO: Display flight plan details
  return (
    <>
      JSON flight plan (id: {flightPlanID}):
      <pre>{JSON.stringify(flightPlan, null, 4)}</pre>
    </>
  );
};

export default GetFlightPlanPage;
