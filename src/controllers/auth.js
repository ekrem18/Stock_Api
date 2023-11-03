"use strict"
/* -------------------------------------------------------*/
// Auth Controller:

const User = require('../models/user')                                          //---> her Cont. bir modeli kullandığından Auth Cont'ı User modelini baz alıyor
const Token = require('../models/token')
const passwordEncrypt = require('../helpers/passwordEncrypt')

module.exports = {

    login: async (req, res) => {                                                //---> token oluşturma kısmı diyebilirim
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password.'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                }
            }
        */

        const { username, email, password } = req.body                          //---> req.body içerisinden işlem yapabilmek için bunları alıyorum

        if ((username || email) && password) {

            const user = await User.findOne({ $or: [{ username }, { email }] }) //---> user tablosu içinde ara ( username VEYA email birini getir)

            if (user && user.password == passwordEncrypt(password)) {           //---> kullanıcı geldi mi mu ve kullanıcının şifresi,  gelen şifreyle aynı mı? 

                if (user.is_active) {

                    let tokenData = await Token.findOne({ user_id: user._id })  //---> user_id: user._id eşleşen user'ın token'ı var mı tokenData'ya ata
                    if (!tokenData) tokenData = await Token.create({            //---> daha önceden bir token yoksa
                        user_id: user._id,                                      //---> token oluşturacağın user._id bu user._id
                        token: passwordEncrypt(user._id + Date.now())           
                    })

                    // Use UUID:
                    // const { randomUUID } = require('node:crypto')
                    // if (!tokenData) tokenData = await Token.create({
                    //     user_id: user._id,
                    //     token: randomUUID()
                    // })

                    res.send({
                        error: false,
                        // token: tokenData.token,
                        // FOR REACT PROJECT:
                        key: tokenData.token,
                        user,
                    })

                } else {

                    res.errorStatusCode = 401
                    throw new Error('This account is not active.')
                }
            } else {

                res.errorStatusCode = 401
                throw new Error('Wrong username/email or password.')
            }
        } else {

            res.errorStatusCode = 401
            throw new Error('Please enter username/email and password.')
        }
    },

    logout: async (req, res) => {                                //---> token silme kısmı diyebilirim
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Logout"
            #swagger.description = 'Delete token key.'
        */

        const auth = req.headers?.authorization || null // Token ...tokenKey...
        const tokenKey = auth ? auth.split(' ') : null // ['Token', '...tokenKey...']

        let result = {}
        if (tokenKey && tokenKey[0] == 'Token') {
            result = await Token.deleteOne({ token: tokenKey[1] })
        }

        res.send({
            error: false,
            message: 'Logout was OK.',
            result
        })
    },
}