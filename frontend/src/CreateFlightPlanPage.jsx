import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

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
import FormInput from "./FormInput.jsx";
import { FlightSector } from "./models";

const DepAppContainer = styled.div`
display: flex;
justify-content: space-evenly;
`;

const DepApp = styled.div`
display: flex;
flex-direction: column;
`;

const DepAppTitle = styled.div`
font-size: 1.5rem;
font-weight: bold;
`;

const EditFlightSector = ({ i, flightPlan, setSector }) => {
  const [fromAirport, setFromAirport] = useState("");
  const [fromRunway, setFromRunway] = useState("");
  
  const [toAirport, setToAirport] = useState("");
  const [toRunway, setToRunway] = useState("");
  
  const [route, setRoute] = useState("");

  const wrpSet = (setter) => {
    return (value) => {
      let newVal = value;
      
      // Capitalize
      newVal = newVal.toUpperCase();

      setter(newVal);
    };
  };
  
  return (
    <>
      <DepAppContainer>
        <DepApp>
          <DepAppTitle>
            Departure
          </DepAppTitle>
          
          <FormInput
            controlId={`${i}-fromAirport`}
            label="Airport (ICAO)"
            state={[fromAirport, wrpSet(setFromAirport)]}
            inputParams={{required: true}}
          />

          <FormInput
            controlId={`${i}-fromRunway`}
            label="Runway"
            state={[fromRunway, wrpSet(setFromRunway)]}
          />
        </DepApp>

        <DepApp>
          <DepAppTitle>
            Approach
          </DepAppTitle>
          
          <FormInput
            controlId={`${i}-toAriport`}
            label="Airport (ICAO)"
            state={[toAirport, wrpSet(setToAirport)]}
            inputParams={{required: true}}
          />

          <FormInput
            controlId={`${i}-toRunway`}
            label="Runway"
            state={[toRunway, wrpSet(setToRunway)]}
          />
        </DepApp>
      </DepAppContainer>

      <FormInput
        controlId={`${i}-route`}
        type="textarea"
        label="Route"
        state={[route, wrpSet(setRoute)]}
        inputParams={{required: true}}
      />
    </>
  );
}

const CreateFlightPlanPage = () => {
  const routerHistory = useHistory();
  
  const apiClient = useContext(APIClientCtx);
  const showErr = useContext(ShowErrCtx);

  const [flightPlan, setFlightPlan] = useState({
    Sectors: [],
  });

  const addBlankSector = () => {
    setFlightPlan((fp) => {
      const newFP = {...fp};
      
      const sector = FlightSector.MakeBlank();
      newFP.Sectors.push(sector);

      return newFP;
    });
  };

  const setSector = (sectorData, i) => {
    setFlightPlan((fp) => {
      const newFP = {...fp};
      newFP.Sectors[i] = sectorData;

      return newFP;
    });
  };

  useEffect(() => {
    // Add one blank sector to start with
    addBlankSector();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    let created = null;
    try {
      created = await apiClient.createFlightPlan(
        flightPlan);
    } catch (e) {
      showErr(`failed to create your new flight plan because ${e}`);
      return;
    }

    routerHistory.push(`/flight-plan/${created.ID}`);
  };
  
  return (
    <VerticalContainer>
      <Section>
        <SectionTitle>
          Share Flight Plan
        </SectionTitle>

        <SectionContent>
          <Form onSubmit={onSubmit}>
            {flightPlan.Sectors.map((sector, i) => {
              return (
                <EditFlightSector
                  key={i}
                  flightPlan={flightPlan}
                  i={i}
                  setSector={setSector}
                />
              );
            })}

            <Button type="submit">
              Share Flight Plan
            </Button>
          </Form>
        </SectionContent>
      </Section>
    </VerticalContainer>
  );
};

export default CreateFlightPlanPage;
