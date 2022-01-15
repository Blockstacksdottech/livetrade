import React, {useContext} from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
    Link
  } from "react-router-dom";




function Header(props){

    const [Auth,setAuth] = useContext(AuthContext);


    const html = (<header id="header" className="d-flex align-items-center header-transparent">
  <div className="container d-flex align-items-center justify-content-between">
    <div className="logo">
      <Link to={props.link} className="text-center"><img src="/assets/img/logo.png" className="img-fluid" alt="MOROBIT" /></Link>
    </div>
    <nav id="navbar" className="navbar">
      <ul>
        <li><Link to="/adpanel/dashboard" className={props.loc == "dashboard" ? "nav-link scrollto active" : "nav-link scrollto" }   href="admin-dashboard.html">Dashboard</Link></li>
        <li><Link to="/adpanel/adduser" className={props.loc == "addUser" ? "nav-link scrollto active" : "nav-link scrollto" } href="add-user.html">Add User</Link></li>
        <li><a className="nav-link scrollto"><i className="bi-person-fill"> </i> {Auth.username}</a></li>
        <li><a className="nav-link scrollto" onClick={props.logout}> Logout</a></li>
      </ul>
      <i className="bi bi-list mobile-nav-toggle" />
    </nav>
  </div>
</header>
);


return html;

}



export default Header;