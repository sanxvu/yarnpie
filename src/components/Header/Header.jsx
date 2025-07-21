import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { doSignOut } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // Add this import

export default function Header() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <Link className="site-logo" to="/">
        Yarnpie
      </Link>

      <nav>
        {userLoggedIn && (
          <>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/stash">Yarn Stash</NavLink>
          </>
        )}

        {userLoggedIn ? (
          <button className="logout-button"
            onClick={() => {
              doSignOut().then(() => {
                navigate("/login");
              });
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink to="/login">Log in / Sign up</NavLink>
        )}
      </nav>
    </header>
  );
}
