import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";

import {
  VerticalContainer,
  FormRow,
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

const EditFlightSector = ({ i, flightPlan, setSector }) => {
  const [fromAirport, setFromAirport] = useState("");
  const [fromRunway, setFromRunway] = useState("");
  
  const [toAirport, setToAirport] = useState("");
  const [toRunway, setToRunway] = useState("");
  const [route, setRoute] = useState("");

  // TODO: Use this custom setter function to capitalize
  // state for the FormInput elements below.
  const fieldState = ([value, setter]) => {
    let newVal = value;
    
    // Capitalize
    newVal = newVal.toUpperCase();

    setter(newVal);
  };
  
  return (
    <>
      <FormRow>
        <FormInput
          controlId={`${i}-fromAirport`}
          label="Departure Airport (ICAO Code)"
          state={[fromAirport, setFromAirport]}
          inputParams={{required: true}}
        />

        <FormInput
          controlId={`${i}-fromRunway`}
          label="Departure Runway"
          state={[fromRunway, setFromRunway]}
        />

        <FormInput
          controlId={`${i}-toAriport`}
          label="Arrival Airport (ICAO Code)"
          state={[toAirport, setToAirport]}
          inputParams={{required: true}}
        />

        <FormInput
          controlId={`${i}-toRunway`}
          label="Arrival Runway"
          state={[toRunway, setToRunway]}
        />
      </FormRow>

      <FormInput
        controlId={`${i}-route`}
        type="textarea"
        label="Route"
        state={[route, setRoute]}
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
