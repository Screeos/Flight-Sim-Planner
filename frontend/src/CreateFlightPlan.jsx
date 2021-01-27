import React, {
  useState,
  useContext,
} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {
  VerticalContainer,
  FormRow,
  Section,
  SectionTitle,
  SectionContent,
} from "./styles";
import { APIClientCtx } from "./App.jsx";

const CreateFlightPlan = () => {
  const apiClient = useContext(APIClientCtx);
  
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [route, setRoute] = useState("");

  const onFromAirportChange = (e) => {
    setFromAirport(e.target.value.toUpperCase());
  };

  const onToAirportChange = (e) => {
    setToAirport(e.target.value.toUpperCase());
  };

  const onRouteChange = (e) => {
    setRoute(e.target.value.toUpperCase());
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const created = await apiClient.createFlightPlan({
      FromAirport: fromAirport,
      ToAirport: toAirport,
      Route: route,
    });
  };
  
  return (
    <VerticalContainer>
      <Section>
        <SectionTitle>
          Create Flight Plan
        </SectionTitle>

        <SectionContent>
          <Form onSubmit={onSubmit}>
            <FormRow>
              <Form.Group controlId="fromAirport">
                <Form.Label>
                  From Airport (ICAO Code)
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={fromAirport}
                  onChange={onFromAirportChange}
                />
              </Form.Group>

              <Form.Group controlId="toAirport">
                <Form.Label>
                  To Airport (ICAO Code)
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={toAirport}
                  onChange={onToAirportChange}
                />
              </Form.Group>
            </FormRow>

            <Form.Group controlId="route">
              <Form.Label>
                Route
              </Form.Label>
              <Form.Control
                as="textarea"
                required
                value={route}
                onChange={onRouteChange}
              />
            </Form.Group>

            <Button type="submit">
              Create Flight Plan
            </Button>
          </Form>
        </SectionContent>
      </Section>
    </VerticalContainer>
  );
};

export default CreateFlightPlan;
