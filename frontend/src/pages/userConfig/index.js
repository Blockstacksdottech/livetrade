import React,{Fragment,useState,useEffect,useContext} from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import "../../../static/styles/userStyle.css"
import Header from '../../components/User/Header';
import Loader from '../../components/General/Loader';
import {isLogged,logout,req_body,req,postReq,moduser} from "../../helpers";
import 'regenerator-runtime/runtime';
import {Navigate} from "react-router-dom";
import {useToasts} from "react-toast-notifications";


function UserConfig(props){
    const [Auth,setAuth] = useContext(AuthContext);
    const [Loading,setLoading] = useState(true);
    const { addToast } = useToasts()
    const [keys,setKeys] = useState({
      1 : {
        public_key : "",
        private_key : ""
      },
      2 : {
        public_key : "",
        private_key : ""
      },
      3 : {
        public_key : "",
        private_key : ""
      },
      4 : {
        public_key : "",
        private_key : ""
      }
    })

    const [wallet,setWallet] = useState({
      'eth_wallet' : '',
      'bsc_wallet': "" 
    })

    



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
                await getExchanges();
                await getWallets();
                setAuth(obj);
                return obj;
            }else{
                console.log("login out")
                logout(setAuth,Auth)
                return Auth;
            }

            
        }


        

        Check().then((obj) => {
            setLoading(false);
        })



    }, [])


    async function getWallets(){
      let resp = await req('wallet')
      if (resp){
        setWallet(resp)
        addToast("Wallets Configs loaded",{
          appearance:"success",
          autoDismiss:true
        })
      }else{
        addToast("Wallets Configs Not loaded",{
          appearance:"error",
          autoDismiss:true
        })
      }

    }

    async function updateWallets(){
      let eth = document.getElementById("eth").value;
      let bsc = document.getElementById("bsc").value;
      let data = {
        'eth_wallet' : eth,
        'bsc_wallet' : bsc
      }

      let resp = await postReq("wallet",data);
      if (resp){
        await getWallets();
        addToast("Wallet Config Updated",{
          appearance:"success",
          autoDismiss:true
        })
      }else{
        addToast("Wallet Config Update Failed",{
          appearance:"error",
          autoDismiss:true
        })
      }
    }


    async function getExchanges(){
      let resp = await req("exchanges");
      console.log(resp)
      if (resp){
        addToast("Exchanges Loaded",{
          appearance:"success",
          autoDismiss:true
        })
        let temp = {...keys};
        for (let i of Object.keys(temp)){
          if (resp[i]){
            temp[i] = resp[i];
          }
        }
        console.log(temp);
        setKeys(temp)
      }else{
        addToast("Exchanges Load Failed",{
          appearance:"error",
          autoDismiss:true
        })
      }
      
    }


    async function saveExchange(id){
      let e_id;
      switch(id){
        case 1:
          e_id = "ripio_";
          break;
        case 2:
          e_id = "ftx_";
          break;
        case 3:
          e_id = "livetrade_"
          break;
        case 4:
          e_id = "binance_"
          break;
      }
      let public_key = document.getElementById(e_id+"public").value;
      let private_key = document.getElementById(e_id+"private").value;

      let data = {
        'exchange' : id,
        'public_key' : public_key,
        'private_key' : private_key
      }

      let resp = await postReq("exchanges",data);
      if (resp){
        await getExchanges();
        addToast("Exchanges Updated",{
          appearance:"success",
          autoDismiss:true
        })
      }else{
        addToast("Exchanges Update Failed",{
          appearance:"error",
          autoDismiss:true
        })
      }
    }


    const html = (
       <main id="main">
  <section id="features" className="features">
    <div className="container">
      <div className="section-title" data-aos="fade-up">
        <h2>Exchange Balances</h2>
        <p>Configure</p>
      </div>
      <div className="row" data-aos="fade-left">
        <div className="col-lg-6 col-md-6">
          <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
            <h3 className="text-center mb-4">Ripio</h3>
            <form>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="ripio_public" defaultValue={keys[1].public_key}  className="form-control"  placeholder="Public Api" />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="ripio_private" defaultValue={keys[1].private_key}  className="form-control"  placeholder="Private Key" />
              </div>
              
              <div className="d-flex justify-content-center mt-3">
                <button onClick={() => saveExchange(1) } type="button"  className="btn login_btn">Save</button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-6 col-md-6">
          <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
            <h3 className="text-center mb-4">FTX</h3>
            <form>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="ftx_public" defaultValue={keys[2].public_key}  className="form-control"  placeholder="Public Api" />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="ftx_private" defaultValue={keys[2].private_key}  className="form-control"  placeholder="Private Key" />
              </div>
              <div className="d-flex justify-content-center mt-3">
                <button onClick={() => saveExchange(2) } type="button" name="button" className="btn login_btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="row mt-4" data-aos="fade-left">
        <div className="col-lg-6 col-md-6">
          <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
            <h3 className="text-center mb-4">LiveTrade</h3>
            <form>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="livetrade_public" defaultValue={keys[3].public_key}  className="form-control"  placeholder="Public Api" />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="livetrade_private" defaultValue={keys[3].private_key}  className="form-control"  placeholder="Private Key" />
              </div>
              
              <div className="d-flex justify-content-center mt-3">
                <button onClick={() => saveExchange(3) } type="button" name="button" className="btn login_btn">Save</button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-6 col-md-6">
          <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
            <h3 className="text-center mb-4">Binance</h3>
            <form>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="binance_public"  defaultValue={keys[4].public_key} className="form-control"  placeholder="Public Api" />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-key" /></span>
                </div>
                <input type="text" id="binance_private" defaultValue={keys[4].private_key}  className="form-control"  placeholder="Private Key" />
              </div>
             
              <div className="d-flex justify-content-center mt-3">
                <button onClick={() => saveExchange(4) } type="button" name="button" className="btn login_btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="row mt-4 d-flex justify-content-center" data-aos="fade-left">
        <div className="col-lg-8 col-md-8">
          <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
            <h3 className="text-center mb-4">Wallets</h3>
            <form>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-wallet2" /></span>
                </div>
                <input id="eth" type="text" defaultValue={wallet.eth_wallet}  className="form-control"  placeholder="ERC20 Wallet" />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-append">
                  <span className="input-group-text"><i className="bi-wallet2" /></span>
                </div>
                <input id="bsc" type="text" defaultValue={wallet.bsc_wallet}   className="form-control"  placeholder="BSC Wallet" />
              </div>
              <div className="d-flex justify-content-center mt-3">
                <button onClick={ updateWallets } type="button" name="button" className="btn login_btn">Save</button>
              </div>
            </form>
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
        Auth.logged && !Auth.isAdmin ? 
      <Fragment>
        <Header loc="config" logout={() => logout(setAuth,Auth)} link={Auth.path} />
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



export default UserConfig