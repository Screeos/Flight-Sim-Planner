import React from "react";
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

import COLORS from "./colors";
import Home from "./Home.jsx";
import NotFound from "./NotFound.jsx";
import CreateFlightPlan from "./CreateFlightPlan.jsx";

const AppContainer = styled.div`
font-size: 1.3rem;
`;

const StyledNavItem = styled(Nav.Item)`
font-size: 1.5rem;
`;

const App = () => {
  return (
	  <AppContainer>
		  <Router>
			  <Navbar bg="dark" variant="dark" expand="lg">
				  <Navbar.Brand>
				    🐢 Tortoise Flight Ops
				  </Navbar.Brand>

				  <Navbar.Toggle
				  aria-controls="basic-navbar-nav"
				  />

				  <Navbar.Collapse id="basic-navbar-nav">
				    <Nav className="mr-auto">
					    <StyledNavItem>
						    <Link to="/">Home</Link>
					    </StyledNavItem>
				    </Nav>
				  </Navbar.Collapse>
			  </Navbar>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route path="/create-flight-plan">
            <CreateFlightPlan />
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Router>
	  </AppContainer>
  );
};

export default App;
