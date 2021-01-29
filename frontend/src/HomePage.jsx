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
max-width: 40rem;
display: flex;
justify-content: space-evenly;
margin-top: 2rem;
`;

const ActionLink = styled(Link)`
&:hover {
text-decoration: none;
}
`;

const ActionButton = styled(Button)`

`;

const HomePage = () => {
  return (
    <VerticalContainer>
      
      <BigLogo></BigLogo>
      <Headline>Tortoise Flight Ops</Headline>

      <ActionsContainer>
        <ActionLink to="/create-flight-plan">
          <ActionButton variant="light">
            🛫 Share Flight Plan
          </ActionButton>
        </ActionLink>

        <ActionLink to="/flight-plan">
          <ActionButton variant="light">
            🔎 Search Flight Plans
          </ActionButton>
        </ActionLink>
      </ActionsContainer>
    </VerticalContainer>
  );
};

export default HomePage;
