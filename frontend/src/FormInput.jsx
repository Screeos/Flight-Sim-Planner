import React from "react";
import Form from "react-bootstrap/Form";

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
      <Form.Label>
        {label}
      </Form.Label>
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
