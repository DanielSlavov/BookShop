const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const fs = require('fs')

const {queryPromise} = require("./db.js")
const {isRequired} = require("./db.js")

const signOptions_default={
    expiresIn:"12h",
    algorithm:"RS256"
}
const secret = "secret"
let privateKey = fs.readFileSync("./model/private.key",'utf8')
let publicKey = fs.readFileSync("./model/public.key",'utf8')

class User {
    constructor(obj) {
        this.id = obj.id
        this.email = obj.email
        this.password = obj.password
        this.name = obj.name

    }
    static token(){
        var token = jwt.sign({name:"skr",email:"email"},privateKey,signOptions_default)

        console.log(token)
        var decoded = jwt.verify(token, publicKey);
        var dec=jwt.decode(token,{complete:true})
        console.log(decoded)
        console.log(dec)
    }


    static register({email = isRequired(),password = isRequired(),name = isRequired()}) {
        let hashedPassword
        return bcrypt.hash(password,1).then(res => {
            hashedPassword = res

            
            let token = jwt.sign({name:"skr",email:"email"},privateKey,signOptions_default)
            
            return queryPromise("INSERT INTO Users(email,password,name) VALUES (?,?,?)",[email, hashedPassword, name])
            .then(res=>{
                return {token}
            })
        })
    }
    static login({email=isRequired(),password=isRequired()}){
        return queryPromise("SELECT * FROM Users WHERE email=?",[email])
        .then(dbRes=>{
            let userId=dbRes[0].id
            let userEmail=dbRes[0].email
            let hashed=dbRes[0].password
            if(bcrypt.compareSync(password,hashed)){
                return jwt.sign({id:userId,email:userEmail},privateKey,signOptions_default)
            }else{
                throw Error("wrong credentials")
            }
        })
    }

    static userData({token=isRequired()}){
        let payload=jwt.verify(token,publicKey);
        return payload
    }

}
module.exports = User