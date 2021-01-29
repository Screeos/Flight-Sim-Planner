import React, {
  useContext,
  useState,
  useEffect,
} from "react";
import styled from "styled-components";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

import { library as FALib } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
FALib.add(faTimes);

import APIClient from "./apiClient";
import COLORS from "./colors";
import HomePage from "./HomePage.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import CreateFlightPlanPage from "./CreateFlightPlanPage.jsx";
import GetFlightPlanPage from "./GetFlightPlanPage.jsx";
import SearchFlightPlansPage from "./SearchFlightPlansPage.jsx";

const AppContainer = styled.div`
font-size: 1.3rem;
`;

const HeaderNav = styled(Nav)`
margin-right: 0 !important;
`;

const StyledNavbarText = styled(Navbar.Text)`
padding-right: 0.5rem;
padding-left: 0.5rem;
`;

const ErrContainer = styled.div`
width: 100%;
padding-top: 0.5rem;
padding-bottom: 0.5rem;
padding-left: 1rem;
padding-right: 1rem;
display: flex;
background: ${COLORS.red};
color: white;
position: relative;
z-index: 2;
`;

const ErrTxtContainer = styled.div`
display: flex;
flex: 1;
justify-content: start;
`;

const ErrButtonContainer = styled.div`
display: flex;
flex: 0;
justify-content: end;
`;

const ErrButton = styled.button`
color: white;
background: none;
border: none;
transition: none;

&:hover, &:active {
  background: none;
  border: none;
}
`;

const BrandLink = styled(Link)`
display: flex;
color: ${COLORS.light};
transition: font-weight 1s;
font-weight: bold;

&:hover {
  color: ${COLORS.light};
  text-decoration: none;
}
`;

const BrandTurtle = styled.div`
display: flex;
text-decoration: underline;
`;

const HeaderLink = styled(Link)`
&:hover {
  text-decoration: none;
}
`;

const Err = ({ error, doRemoveSelf }) => {
  return (
    <ErrContainer>
      <ErrTxtContainer>
        <div>Error: {error}</div>
      </ErrTxtContainer>
      <ErrButtonContainer>
        <ErrButton onClick={doRemoveSelf}>
          <FontAwesomeIcon icon="times" />
        </ErrButton>
      </ErrButtonContainer>
    </ErrContainer>
  );
};

const APIClientCtx = React.createContext(null);
const ShowErrCtx = React.createContext(null);

const App = () => {
  const [err, setErr] = useState([]);
  
  const apiClient = new APIClient();
  const showErr = (showThis) => {
    setErr(err => [...err, showThis]);
  };
  const removeErr = (i) => {
    setErr(err => {
      let newErr = [...err];
      newErr.splice(i, 1)
      return newErr;
    });
  };
  
  return (
    <APIClientCtx.Provider value={apiClient}>
      <ShowErrCtx.Provider value={showErr}>
	      <AppContainer>
		      <Router>
			      <Navbar
              bg="dark"
              variant="dark"
              expand="md"
            >
				      <Navbar.Brand>
				        <BrandLink to="/" >
                  <BrandTurtle>
                    🐢
                  </BrandTurtle>
                  Tortoise Flight Ops
                </BrandLink>
				      </Navbar.Brand>

				      <Navbar.Toggle
				        aria-controls="basic-navbar-nav"
				      />

				      <Navbar.Collapse
                id="basic-navbar-nav"
                className="justify-content-end"
              >
				        <HeaderNav className="mr-auto">
					          <StyledNavbarText>
						          <HeaderLink to="/">
                        Home
                      </HeaderLink>
					          </StyledNavbarText>

                    <StyledNavbarText>
                      <HeaderLink to="/create-flight-plan">
                        Share
                      </HeaderLink>
                    </StyledNavbarText>

                    <StyledNavbarText>
                      <HeaderLink to="/flight-plan">
                        Search
                      </HeaderLink>
                    </StyledNavbarText>
				        </HeaderNav>
				      </Navbar.Collapse>
			      </Navbar>

            {err.map((e, i) => {
              const doRemoveSelf = () => {
                removeErr(i);
              };
              
              return (
                <Err
                  key={i}
                  error={e}
                  doRemoveSelf={doRemoveSelf}
                />
              );
            })}

            <Switch>
              <Route exact path="/">
                <HomePage />
              </Route>

              <Route path="/create-flight-plan">
                <CreateFlightPlanPage />
              </Route>

              <Route path="/flight-plan/:flightPlanID">
                <GetFlightPlanPage />
              </Route>

              <Route path="/flight-plan">
                <SearchFlightPlansPage />
              </Route>

              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          </Router>
	      </AppContainer>
      </ShowErrCtx.Provider>
    </APIClientCtx.Provider>
  );
};

export default App;
export {
  APIClientCtx,
  ShowErrCtx,
};
