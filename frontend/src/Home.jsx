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
display: flex;
margin-top: 2rem;
`;

const Home = () => {
  return (
    <VerticalContainer>
      
      <BigLogo></BigLogo>
      <Headline>Tortoise Flight Ops</Headline>

      <ActionsContainer>
        <Link to="/create-flight-plan">
          <Button variant="light">
            Create Flight Plan
          </Button>
        </Link>
      </ActionsContainer>
    </VerticalContainer>
  );
};

export default Home;
