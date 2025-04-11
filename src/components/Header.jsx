import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const activeStyles = {
    fontWeight: "bold",
    textDecoration: "underline",
    color: "#161616",
  };

  return (
    <header>
      <Link className="site-logo" to="/">
        yarnies
      </Link>

      <nav>
        {userLoggedIn && (
          <>
            <NavLink
              to="/projects"
              style={({ isActive }) => (isActive ? activeStyles : null)}
            >
              Projects
            </NavLink>

            <NavLink
              to="/stash"
              style={({ isActive }) => (isActive ? activeStyles : null)}
            >
              Stash
            </NavLink>
          </>
        )}

        {userLoggedIn ? (
          <button
            onClick={() => {
              doSignOut().then(() => {
                navigate("/login");
              });
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            style={({ isActive }) => (isActive ? activeStyles : null)}
          >
            Log in / Sign up
          </NavLink>
        )}
      </nav>
    </header>
  );
}
