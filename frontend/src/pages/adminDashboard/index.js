import React,{Fragment,useState,useEffect,useContext} from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import "../../../static/styles/adminStyle.css"
import Header from '../../components/Admin/Header';
import Loader from '../../components/General/Loader';
import {isLogged,logout,req_body,req,postReq,moduser} from "../../helpers";
import 'regenerator-runtime/runtime';
import {Navigate} from "react-router-dom";
import {useToasts} from "react-toast-notifications";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';


function AdminDashboard(props){


    const [Auth,setAuth] = useContext(AuthContext);
    const [Loading,setLoading] = useState(true);
    const { addToast } = useToasts()
    const [Users,setUsers] = useState([]);
    const [open,setOpen] = useState(false);
    const [modifyData,setModify] = useState(null);
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: '#fff',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };


    async function getUsers(){
        
        let resp = await req('users');
        if (resp){
            console.log(resp);
            setUsers(resp)
        }else{
            addToast("Couldn't Get Users",{
                appearance : 'error',
                autoDismiss : true
            })
        }
    }

    function setMod(idd,index){
        let temp = Users[index];
        setModify(temp);
        setOpen(!open);
    }

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    async function modifyHandler(){
        let username = document.getElementById("username").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let confirm = document.getElementById("confirm").value;


        if (username.length > 0 && email.length > 0){

          if (validateEmail(email)){
            if (confirm === password){
              let resp = await  moduser(username,email,password,modifyData.id)
              if (resp){
                  await getUsers();
                  addToast("User Modified",{
                      appearance: "success",
                      autoDismiss:true
                  })
              }else{
                  addToast("User Modification Failed",{
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

    async function deleteUser(index){
        let body = {
            id : Users[index].id
        }

        let resp = await postReq('deluser',body);
        if (resp){
            await getUsers();
            addToast("User Deleted",{
                appearance: "success",
                autoDismiss:true
            })
        }else{
            addToast("User Deletion Failed",{
                appearance: "error",
                autoDismiss: true
            })
        }
    }



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
                await getUsers();
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



    const modal = <Modal
    open={open}
    onClose={() => setOpen(!open)}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
      <Box sx={style}>
      <div className="row">
        <div className="col-lg-8 m-auto" data-aos="fade-right" data-aos-delay={100}>
          <div  className="php-email-form">
            <div className="form-group mt-3">
              <input id="username" type="text" defaultValue={modifyData ? modifyData.username : ''} className="form-control" name placeholder="Username" required />
            </div>
            <div className="form-group mt-3">
              <input id="email" type="email" defaultValue={ modifyData ? modifyData.email : ''} className="form-control" name placeholder="Email" required />
            </div>
            <div className="form-group mt-3">
              <input id="password" type="password" className="form-control" name placeholder="Password" required />
            </div>
            <div className="form-group mt-3">
              <input id="confirm" type="password" className="form-control" name placeholder="Confirm Password" required />
            </div>
            <div className="text-center mt-2">
              <button id="modal-submit" onClick={modifyHandler} type="submit">Submit</button>
            </div>
          </div>
        </div>
      </div>
        </Box>
  </Modal>


    const html = (<main id="main">
  <section id="contact" className="contact">
    <div className="container">
      <div className="section-title" data-aos="fade-up">
        <h2>List of Users</h2>
      </div>
      <div className="row">
        <div className="col-lg-12" data-aos="fade-right" data-aos-delay={100}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th />
                  <th>Username</th>
                  <th>Email</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                  {Users.map((e,i) => {
                      return (
                        <tr>
                        <th scope="row">{i+1}</th>
                        <td>{e.username}</td>
                        <td>{e.email}</td>
                        <td>
                          <a><i onClick={() => setMod(e.id,i) } className="bi-pencil cursor-pointer event-hover" /></a> 
                          
                        </td>
                        <td>
                        <a className="pl-5"><i onClick={() => deleteUser(i) } className="bi-trash cursor-pointer event-hover" /></a>
                        </td>
                      </tr>
                      )
                  })}
                
               
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
);


    return Loading ? (
        <div className="full">
            <Loader />
        </div>
      
    ) : (
        Auth.logged && Auth.isAdmin ? 
      <Fragment>
        <Header loc="dashboard" logout={() => logout(setAuth,Auth)} link={Auth.path} />
        {html}
        {  modal}
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


export default AdminDashboard;

{/* <Navigate
          to={{
            pathname: "/login",
            state: { error: true, msg: "Please Login" },
          }}
          state={{ error: true, msg: "Please Login" }}
        /> */}