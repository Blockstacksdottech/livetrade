import React , {useState , useContext , createContext} from 'react';


export const AuthContext = createContext();

export const AuthProvider = props => {

    let obj = {
        logged : false,
        username : null,
        email : null,
        isAdmin : false,
        path : null,
    }
    
    const [user,setUser] = useState(obj);

    return <AuthContext.Provider value= {[user,setUser]}>{props.children}</AuthContext.Provider>

}
