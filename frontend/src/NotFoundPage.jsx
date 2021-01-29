import React from "react";

import {
  VerticalContainer,
  Headline,
} from "./styles";
import BigLogo from "./BigLogo.jsx";

const NotFoundPage = () => {
  return (
    <VerticalContainer>
      <BigLogo></BigLogo>
      <Headline>Not found</Headline>
    </VerticalContainer>
  );
};

export default NotFoundPage;
