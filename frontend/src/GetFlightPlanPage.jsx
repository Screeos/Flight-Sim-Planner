import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

import COLORS from "./colors";
import {
  VerticalContainer,
  Section,
  SectionTitle,
  SectionContent,
} from "./styles";
import {
  APIClientCtx,
  ShowErrCtx,
} from "./App.jsx";

const LoadingContainer = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`;

const SpinnerContainer = styled.div`
height: 17rem;
`;

const StyledSpinner = styled(Spinner)`
margin-top: 5rem;
width: 9rem;
height: 9rem;
position: relative;
`;

const SpinnerLogo = styled.div`
height: 5rem;
line-height: 3rem;
font-size: 5rem;
position: relative;
top: -7rem;
left: 1.9rem;
`;

const LoadingText = styled.div`
text-align: center;
font-size: 2rem;
color: ${COLORS.primary};
`;

const AirportsContainer = styled.div`
width: 100%;
display: flex;
justify-content: space-evenly;
`;

const OneAirportContainer = styled.div`
width: 100%;
display: flex;
flex-direction: column;
flex: 1;
`;

const AirportICAO = styled.div`
`;

const AirportICAOLabel = styled.div`
font-weight: bold;
`;

const RouteContainer = styled.div`
display: flex;
flex-direction: column;
margin-top: 2rem;
`;

const RouteLabel = styled.div`
display: flex;
font-weight: bold;
flex: 0;
`;

const RouteValue = styled.div`
display: flex;
flex: 1;
padding-top: 1rem;
padding-left: 2rem;
`;

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
      showErr(`failed to load the flight plan you asked for because ${e}`);
      return;
    }
    
    setFlightPlan(flightPlan);
    setIsLoading(false);
  }, [flightPlanID]);

  return (
    <VerticalContainer>
    {(isLoading && (
      <LoadingContainer>
        <SpinnerContainer>
          <StyledSpinner
            animation="border"
            variant="primary"
          />
          <SpinnerLogo>
            🐢
          </SpinnerLogo>
        </SpinnerContainer>
        <LoadingText>
          Loading Flight Plan
        </LoadingText>
      </LoadingContainer>
      )) || (
        <Section>
          <SectionTitle>
            View Flight Plan
          </SectionTitle>

          <SectionContent>
            <AirportsContainer>
              <OneAirportContainer>
                <AirportICAO>
                  {flightPlan.FromAirport}
                </AirportICAO>
                <AirportICAOLabel>
                  Origin Airport
                </AirportICAOLabel>
              </OneAirportContainer>

              <OneAirportContainer>
                <AirportICAO>
                  {flightPlan.ToAirport}
                </AirportICAO>
                <AirportICAOLabel>
                  Destination Airport
                </AirportICAOLabel>
              </OneAirportContainer>
            </AirportsContainer>
            <RouteContainer>
              <RouteLabel>
                Route
              </RouteLabel>
              <RouteValue>
                {flightPlan.Route}
              </RouteValue>
            </RouteContainer>
          </SectionContent>
        </Section>
      )}
    </VerticalContainer>
  );
};

export default GetFlightPlanPage;
