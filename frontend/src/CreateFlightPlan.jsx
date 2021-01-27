import React from "react";
import Form from "react-bootstrap/Form";

import {
  VerticalContainer,
  FormRow,
  Section,
  SectionTitle,
  SectionContent,
} from "./styles";

const CreateFlightPlan = () => {
  return (
    <VerticalContainer>
      <Section>
        <SectionTitle>
          Create Flight Plan
        </SectionTitle>

        <SectionContent>
          <Form>
            <FormRow>
              <Form.Group controlId="fromAirport">
                <Form.Label>
                  From Airport (ICAO Code)
                </Form.Label>
                <Form.Control type="text" />
              </Form.Group>

              <Form.Group controlId="toAirport">
                <Form.Label>
                  To Airport (ICAO Code)
                </Form.Label>
                <Form.Control type="text" />
              </Form.Group>
            </FormRow>

            <Form.Group controlId="route">
              <Form.Label>
                Route
              </Form.Label>
              <Form.Control as="textarea" />
            </Form.Group>
          </Form>
        </SectionContent>
      </Section>
    </VerticalContainer>
  );
};

export default CreateFlightPlan;
