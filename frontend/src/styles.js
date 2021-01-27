import styled from "styled-components";

import COLORS from "./colors";

const VerticalContainer = styled.div`
display: flex;
align-items: center;
flex-direction: column;
`;

const Headline = styled.div`
font-size: 2rem;
color: ${COLORS.primary};
`;


export {
  VerticalContainer,
  Headline,
};
