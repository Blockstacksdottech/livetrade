import React,{Fragment,useState,useEffect,useContext} from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import "../../../static/styles/adminStyle.css"
import Header from '../../components/Admin/Header';
import Loader from '../../components/General/Loader';
import {isLogged,logout, adduser} from "../../helpers";
import 'regenerator-runtime/runtime';
import {Navigate} from "react-router-dom";
import {useToasts} from "react-toast-notifications";




function AddUser(props){

    const [Auth,setAuth] = useContext(AuthContext);
    const [Loading,setLoading] = useState(true);
    const { addToast } = useToasts()
    



    useEffect( () => {
        async function Check(){
            let resp = await isLogged();
            if (resp){
                let obj = {...Auth};
                obj.logged = true;
                obj.username = resp.username;
                obj.email = resp.email;
                obj.isAdmin = resp.s;
                obj.path = resp.path;
                setAuth(obj);
                return obj;

            }else{
                console.log("login out")
                logout(setAuth,Auth)
                return Auth;
            }

            return {}
        }

        Check().then((obj) => {
            setLoading(false);
        })



    }, [])

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    async function addHandler(){
        let username = document.getElementById("username").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let confirm = document.getElementById("confirm").value;

        if (username.length > 0 && email.length > 0 && password.length > 0){

          if (validateEmail(email)){
            if (confirm === password){
              let resp = await  adduser(username,email,password)
              if (resp){
                  addToast("User Created",{
                      appearance: "success",
                      autoDismiss:true
                  })
              }else{
                  addToast("User Creation Failed",{
                      appearance: "error",
                      autoDismiss: true
                  })
              }
          }else{
              addToast("Password not matching",{
                  appearance:'error',
                  autoDismiss: true
              })
          }
          } else{
            addToast("Email Not valid",{
              appearance:"error",
              autoDismiss:true
            })
          }


          

        }else{
          addToast("Fields Can't be empty",{
            appearance:"error",
            autoDismiss:true
          })
        }

        
    }


    const html = (<main id="main">
  <section id="contact" className="contact">
    <div className="container">
      <div className="section-title" data-aos="fade-up">
        <h2>Add Users</h2>
      </div>
      <div className="row">
        <div className="col-lg-8 m-auto" data-aos="fade-right" data-aos-delay={100}>
          <div  className="php-email-form">
            <div className="form-group mt-3">
              <input id="username" type="text" className="form-control" name placeholder="Username" required />
            </div>
            <div className="form-group mt-3">
              <input id="email" type="email" className="form-control" name placeholder="Email" required />
            </div>
            <div className="form-group mt-3">
              <input id="password" type="password" className="form-control" name placeholder="Password" required />
            </div>
            <div className="form-group mt-3">
              <input id="confirm" type="password" className="form-control" name placeholder="Confirm Password" required />
            </div>
            <div className="text-center mt-2">
              <button onClick={addHandler} type="submit">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
);



    return  Loading ? (
        <div className="full">
            <Loader />
        </div>
      
    ) : (
        Auth.logged && Auth.isAdmin ? 
      <Fragment>
        <Header loc="addUser" logout={() => logout(setAuth,Auth)} link={Auth.path} />
        {html}
      </Fragment> : 
     <Navigate
     to={{
       pathname: "/login",
       state: { error: true, msg: "Please Login" },
     }}
     state={{ error: true, msg: "Please Login" }}
   />
      
    );


}


export default AddUser;