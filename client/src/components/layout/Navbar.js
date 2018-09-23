import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class Navbar extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-4">
          <div className="container-fluid">
            <NavLink className="navbar-brand" to="/">
              DevConnector
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#mobile-nav"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="mobile-nav">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item pr-4">
                  <NavLink
                    activeStyle={{ color: "#F5D53F" }}
                    className="nav-link"
                    to="/profiles"
                  >
                    {" "}
                    Developers
                  </NavLink>
                </li>
                <li className="nav-item pr-4">
                  <NavLink
                    activeStyle={{ color: "#F5D53F" }}
                    className="nav-link"
                    to="/register"
                  >
                    Sign Up
                  </NavLink>
                </li>
                <li className="nav-item pr-4">
                  <NavLink
                    activeStyle={{ color: "#F5D53F" }}
                    className="nav-link"
                    to="/login"
                  >
                    Login
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
