import React, {useEffect,useState,useContext} from "react";
import "../../../static/styles/userStyle.css";
import 'regenerator-runtime/runtime';
import { isLogged,get_token } from "../../helpers";
import {useToasts} from "react-toast-notifications";
import Loader from "../../components/General/Loader";
import {Navigate,useLocation} from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function Login(props) {

  const navData = useLocation();
  const { addToast } = useToasts()
  const [Auth,setAuth] = useContext(AuthContext);
  const [Loading,setLoading] = useState(true);

  useEffect( 
    () => {
     async function test(){
       console.log('checking login')
       console.log(navData);
       let resp = await isLogged();
       if (resp){
           let obj = {...Auth};
           obj.logged = true;
           obj.username = resp.username;
           obj.email = resp.email;
           obj.isAdmin = resp.s;
           obj.path = resp.path;
           setAuth(obj);
       }
       setLoading(false);
       
 
   }
   test(); 
 
 
 
      if (navData.state){
       if (navData.state.error){
         addToast(navData.state.msg, {
           appearance: 'error',
           autoDismiss: true,
         })
        }
      } 
      }
      
   , [])


  async function Login(){
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let resp = await get_token(username,password);
    if (resp){
      let obj = {...Auth};
      obj.logged = true;
      obj.username = resp.username;
      obj.email = resp.email;
      obj.isAdmin = resp.s;
      obj.path = resp.path;
      setAuth(obj);
    }else{
      addToast("Failed to Login", {
        appearance: 'error',
        autoDismiss: true,
      })

    }
  }



  const html = (
    <section id="about" className="about ">
      <div className="container h-100">
        <div className="d-flex justify-content-center">
          <div className="user_card my-5" data-aos="fade-right">
            <div className="d-flex justify-content-center">
              <div className="brand_logo_container">
                <img
                  src="/assets/img/favicon.png"
                  className="brand_logo"
                  alt="Logo"
                />
                <h3>Login</h3>
              </div>
            </div>
            <div className="d-flex justify-content-center form_container">
              <form>
                <div className="input-group mb-3">
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="bi-person" />
                    </span>
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="form-control input_user"
            
                    placeholder="Username"
                  />
                </div>
                <div className="input-group mb-2">
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="bi-key" />
                    </span>
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="form-control input_pass"
                    
                    placeholder="Password"
                  />
                </div>
                <div className="d-flex justify-content-center mt-3 login_container">
                  <button onClick={Login} type="button" name="button" className="btn login_btn">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return ( Loading ? <div className="full">
  <Loader />
</div> : ( Auth.logged ? <Navigate
    to={{
      pathname: Auth.path,  
      state: { success : true }
    }}
    state = {{success : true}}
    /> :  html ));
}


export default Login;
