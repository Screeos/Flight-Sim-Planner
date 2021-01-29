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
            <div>
              <div>{flightPlan.FromAirport}</div>
              <div>Origin Airport</div>
              
              <div>{flightPlan.ToAirport}</div>
              <div>Destination Airport</div>
            </div>
            <div>
              <div>Route</div>
              <div>{flightPlan.Route}</div>
            </div>
          </SectionContent>
        </Section>
      )}
    </VerticalContainer>
  );
};

export default GetFlightPlanPage;
