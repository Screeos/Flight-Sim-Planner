import React from "react";
import styled from "styled-components";

import Form from "react-bootstrap/Form";

import COLORS from "./colors";

const StyledFormLabel = styled.div`
font-size: 1.1rem;
color: rgba(1, 1, 1, 0.8);
`;

const FormInput = ({ controlId, type, state, label, inputParams }) => {
  const [value, setValue] = state;
  if (type === undefined) {
    type = "text";
  } else if (type === "textarea") {
    type = undefined;
    inputParams["as"] = "textarea";
  }

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Form.Group controlId={controlId}>
      <StyledFormLabel>
        {label}
      </StyledFormLabel>
      <Form.Control
        type={type}
        {...inputParams}
        value={value}
        onChange={onChange}
      />
    </Form.Group>
  );
};

export default FormInput;
