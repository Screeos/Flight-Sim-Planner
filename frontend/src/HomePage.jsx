import React from "react";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

import {
  VerticalContainer,
  Headline,
} from "./styles";
import BigLogo from "./BigLogo.jsx";

const ActionsContainer = styled.div`
width: 100%;
max-width: 35rem;
display: flex;
justify-content: space-evenly;
margin-top: 4rem;
`;

const ActionLink = styled(Link)`
&:hover {
text-decoration: none;
}
`;

const HomePage = () => {
  return (
    <VerticalContainer>
      
      <BigLogo></BigLogo>
      <Headline>Tortoise Flight Ops</Headline>

      <ActionsContainer>
        <ActionLink to="/create-flight-plan">
          <Button variant="light">
            🛫 Share Flight Plan
          </Button>
        </ActionLink>

        <ActionLink to="/flight-plan">
          <Button variant="light">
            🔎 Search Flight Plans
          </Button>
        </ActionLink>
      </ActionsContainer>
    </VerticalContainer>
  );
};

export default HomePage;
