import React, {
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {
  VerticalContainer,
  FormRow,
  Section,
  SectionTitle,
  SectionContent,
} from "./styles";

const SearchFlightPlansPage = () => {
  const routerHistory = useHistory();

  const [flightPlanID, setFlightPlanID] = useState("");
  
  const onFlightPlanIDChange = (e) => {
    setFlightPlanID(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    routerHistory.push(`/flight-plan/${flightPlanID}`);
  };

  return (
    <VerticalContainer>
      <Section>
        <SectionTitle>
          Search Flight Plans
        </SectionTitle>

        <SectionContent>
          <Form onSubmit={onSubmit}>
            <Form.Group controlId="flightPlanID">
              <Form.Label>
                Flight Plan ID
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={flightPlanID}
                onChange={onFlightPlanIDChange}
              />
            </Form.Group>

            <Button type="submit">
              Search
            </Button>
          </Form>
        </SectionContent>
      </Section>
    </VerticalContainer>
  );
};

export default SearchFlightPlansPage;
