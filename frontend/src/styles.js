import styled from "styled-components";

import COLORS from "./colors";

const VerticalContainer = styled.div`
display: flex;
align-items: center;
flex-direction: column;
`;

const HorizontalContainer = styled.div`
display: flex;
flex-direction: row;
`;

const FormRow = styled(HorizontalContainer)`
justify-content: space-around;
`;

const Headline = styled.div`
font-size: 2rem;
color: ${COLORS.primary};
`;

const Section = styled.div`
width: 100%;
display: flex;
flex-direction: column;
padding: 1rem;
`;

const SectionTitle = styled.div`
font-size: 2rem;
font-weight: bold;
`;

const SectionContent = styled.div`
display: flex;
flex-direction: column;
padding-left: 1rem;
`;

export {
  VerticalContainer,
  HorizontalContainer,
  FormRow,
  Headline,
  Section,
  SectionTitle,
  SectionContent,
};
