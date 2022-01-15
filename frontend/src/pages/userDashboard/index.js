import React,{Fragment,useState,useEffect,useContext} from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import "../../../static/styles/userStyle.css"
import Header from '../../components/User/Header';
import Loader from '../../components/General/Loader';
import {isLogged,logout,req_body,req,postReq,moduser} from "../../helpers";
import 'regenerator-runtime/runtime';
import {Navigate} from "react-router-dom";
import {useToasts} from "react-toast-notifications";

function UserDashboard(props){

    const [Auth,setAuth] = useContext(AuthContext);
    const [Loading,setLoading] = useState(true);
    const [TradesLoading,setTradesLoading] = useState(true)
    const { addToast } = useToasts()
    const [data,setData] = useState({
        "all_balances" : [],
        "ftx_balances" : [],
        "rex_balances" : [],
        "binance_balances" : [],
        "binance_total" :0,
        "ftx_total" : 0,
        "rex_total" : 0,
        "all_total" : 0,
        
    })

    const [wallet,setWallet] = useState({
      "eth_balances" : [],
      "bsc_balances" : []
    })
    const [Orders,setOrders] = useState([]);

    async function getData(){
        let resp = await req("getdata");
        if (resp){
            setData(resp);
            addToast("Loaded Data", {
                appearance:"success",
                autoDismiss:true
            })
        }else{
            addToast("Failed getting Data",{
                appearance:"error",
                autoDismiss:true
            })
        }
    }

    async function getWallet(){
      let resp = await req('getwallet')
      if (resp){
        setWallet(resp);
        addToast("Loaded Wallets Data", {
          appearance:"success",
          autoDismiss:true
      })
      }else{
        addToast("Failed getting Data",{
          appearance:"error",
          autoDismiss:true
      })
      }
    }
    async function getOrders(){
      let resp = await req('getOrders')
      if (resp){
        setOrders(resp);
        addToast("Loaded Orders Data", {
          appearance:"success",
          autoDismiss:true
      })
      }else{
        addToast("Failed getting Data",{
          appearance:"error",
          autoDismiss:true
      })
      }
      setTradesLoading(false);
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
                await getData();
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
            getWallet();
            getOrders();
        })



    }, [])

    const html = <div>
  (<main id="main">
    <section id="about" className="about">
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-6 col-lg-6 d-flex justify-content-center" data-aos="fade-right">
            <img src="/assets/img/about.png" className="img-fluid" />
          </div>
          <div className="col-xl-6 col-lg-6 icon-boxes d-flex flex-column align-items-stretch justify-content-center py-5 px-lg-5" data-aos="fade-left">
            <h3>Total Balance</h3>
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={100}>
              <div className="table-responsive">
                {data['all_balances'].length > 0 ?<table className="table">
                  <tbody>
                      {data['all_balances'].map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['total'] }</td>
                            <td>{ e['total_usd'] }</td>
                          </tr>)
                      })}
                      </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td><span data-purecounter-start={0} data-purecounter-end={data["all_total"]} data-purecounter-duration={4} className="purecounter" />${data["all_total"]}</td>
                    </tr>
                  </tfoot>
                </table> : <h5>Data Not Available</h5> }
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="features" className="features">
      <div className="container">
        <div className="section-title" data-aos="fade-up">
          <h2>Exchange Balances</h2>
          <p>Check The Balances</p>
        </div>
        <div className="row" data-aos="fade-left">
          <div className="col-lg-6 col-md-6 mt-2">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={50}>
              <h3 className="text-center mb-4">FTX</h3>
              <div className="table-responsive">
                
              {data['ftx_balances'].length > 0 ? <table className="table">
                  <tbody>{data['ftx_balances'].map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['total'] }</td>
                            <td>{ e['total_usd'] }</td>
                          </tr>)
                      })}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td>$<span data-purecounter-start={0} data-purecounter-end={data["ftx_total"]} data-purecounter-duration={5} className="purecounter" />{data["ftx_total"]}</td>
                    </tr>
                  </tfoot>
                </table> : <h5>Data Not Available</h5> }
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 mt-2">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={100}>
              <h3 className="text-center mb-4">Binance</h3>
              <div className="table-responsive">
              {data['binance_balances'].length > 0 ? <table className="table">
                  <tbody>{data['binance_balances'].map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['total'] }</td>
                            <td>{ e['total_usd'] }</td>
                          </tr>)
                      })}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td>$<span data-purecounter-start={0} data-purecounter-end={data["binance_total"]} data-purecounter-duration={6} className="purecounter" />{data["binance_total"]}</td>
                    </tr>
                  </tfoot>
                </table> : <h5>Data Not Available</h5>}
              </div>
            </div>
          </div>
          {/* <div className="col-lg-4 col-md-4">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={100}>
              <h3 className="text-center mb-4">REX</h3>
              <div className="table-responsive">
                <table className="table">
                  <tbody>{data['rex_balances'].map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['total'] }</td>
                            <td>{ e['total_usd'] }</td>
                          </tr>)
                      })}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td>$<span data-purecounter-start={0} data-purecounter-end={data["rex_total"]} data-purecounter-duration={6} className="purecounter" />.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div> */}
          <div className="col-lg-6 col-md-6 mt-2">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={150}>
              <h3 className="text-center mb-4">Bitcoin Trade</h3>
              <div className="table-responsive">
              {data['rex_balances'].length > 0 ?<table className="table">
                 <tbody>{data['rex_balances'].map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['total'] }</td>
                            <td>{ e['total_usd'] }</td>
                          </tr>)
                      })}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Total</td>
                      <td>$<span data-purecounter-start={0} data-purecounter-end={18880} data-purecounter-duration={7} className="purecounter" />{data['rex_total']}</td>
                    </tr>
                  </tfoot>
                </table> : <h5>Data Not Available</h5>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>{/* End Exchange Balances Section */}
    { wallet.eth_balances.length > 0 || wallet.bsc_balances.length > 0 ? 
    
    <section id="features" className="features">
    <div className="container">
      <div className="section-title" data-aos="fade-up">
        <h2>Exchange Balances</h2>
        <p>Check The Balances</p>
      </div>
      <div className="row" data-aos="fade-left">
        { wallet.eth_balances.length > 0 ? <div className="col-lg-6 col-md-6 mt-2">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={150}>
              <h3 className="text-center mb-4">Ethereum Wallet</h3>
              <div className="table-responsive">
                <table className="table">
                <tbody>{wallet.eth_balances.map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['balance'] }</td>
                            
                          </tr>)
                      })}</tbody>
                  
                </table>
              </div>
            </div>
          </div> : ""}
          { wallet.bsc_balances.length > 0 ? <div className="col-lg-6 col-md-6 mt-2">
            <div className="icon-box" data-aos="zoom-in" data-aos-delay={150}>
              <h3 className="text-center mb-4">Binance SmartChain Wallet</h3>
              <div className="table-responsive">
                <table className="table">
                <tbody>{wallet.bsc_balances.map((e,i) => {
                          return (<tr>
                            <th scope="row">{ e['coin'] }</th>
                            <td>{ e['balance'] }</td>
                            
                          </tr>)
                      })}</tbody>
                  
                </table>
              </div>
            </div>
          </div> : ""}
      
      </div>
      </div>
      </section>
      :
      ""
  }
    



    {/* ======= Last Trades Section ======= */}
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-title" data-aos="fade-up">
          <h2>Last Trades</h2>
        </div>
        <div className="row">
          <div className="col-lg-12" data-aos="fade-right" data-aos-delay={100}>
            
    {Orders.length > 0  ? 
              <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exchange</th>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                    {Orders.map( (e,i) => {
                        return (
                            <tr>
                    <th scope="row">{e['exc']}</th>
                    <td>{e['market']}</td>
                    <td className="text-uppercase">{e['side']}</td>
                    <td>{e['size']}</td>
                    <td><span data-purecounter-start={0} data-purecounter-end={e['price']} data-purecounter-duration={9} className="purecounter" /></td>
                    <td><span data-purecounter-start={0} data-purecounter-end={e['total']} data-purecounter-duration={9} className="purecounter" /></td>
                    <td>{e['stamp']}</td>
                  </tr>
                        )
                    } )}
                    </tbody>
              </table>
              </div>
             : TradesLoading ? 
          <Loader /> : <h2>No Trades Available</h2>
    }
    
          </div>
        </div>
      </div>
    </section>
    
  </main>)
</div>




    return Loading ? (
        <div className="full">
            <Loader />
        </div>
      
    ) : (
        Auth.logged && !Auth.isAdmin ? 
      <Fragment>
        <Header loc="dashboard" logout={() => logout(setAuth,Auth)} link={Auth.path} />
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


export default UserDashboard;