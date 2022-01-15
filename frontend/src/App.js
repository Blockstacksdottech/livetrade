import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link
  } from "react-router-dom";
import { ToastProvider, useToasts } from 'react-toast-notifications';
import { AuthProvider } from './contexts/AuthContext';
import AddUser from './pages/adminAddUser';
import AdminDashboard from './pages/adminDashboard';
import Login from './pages/Login';
import UserConfig from './pages/userConfig';
import UserDashboard from './pages/userDashboard';


const App = ()=>{

	
	return (

		<ToastProvider>
			<AuthProvider>
			<Router>
		<Routes>
		<Route path="/" element={<Login />} />
		<Route path="login" element={<Login />} />
		<Route path="adpanel/dashboard"   element={<AdminDashboard />} />
		<Route path="adpanel/adduser" element={<AddUser />} />
		<Route path="userpanel/dashboard" element={<UserDashboard />} />
		<Route path="userpanel/config" element={<UserConfig />} />
		


		</Routes>


	</Router>
		</AuthProvider>

		</ToastProvider>
		
		
	)
}

export default App;