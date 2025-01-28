import React from "react"
import { Link, NavLink } from "react-router-dom"

export default function Header() {
    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    return (
        <header>
            <Link className="site-logo" to="/">Yarnies</Link>
            <nav>
                <NavLink
                    to="/projects"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Projects
                </NavLink>

                <NavLink
                    to="/stash"
                    style={({ isActive }) => isActive ? activeStyles : null}
                >
                    Stash
                </NavLink>

                <Link to="login" className="login-link">
                    <img
                        className="login-icon"
                    />
                    Login
                </Link>
            </nav>
        </header>
    )
}