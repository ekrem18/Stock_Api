"use strict"
/* -------------------------------------------------------*/
// Auth Controller:

const jwt = require('jsonwebtoken')
const User = require('../models/user')                                          //---> her Cont. bir modeli kullandığından Auth Cont'ı User modelini baz alıyor
const Token = require('../models/token')
const passwordEncrypt = require('../helpers/passwordEncrypt')

module.exports = {

    login: async (req, res) => {                                                //---> token oluşturma kısmı diyebilirim
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password. You can use simpleToken or JWT'
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
                    
                    //TOKEN
                    let tokenData = await Token.findOne({ user_id: user._id })  //---> user_id: user._id eşleşen user'ın token'ı var mı tokenData'ya ata
                    if (!tokenData) tokenData = await Token.create({            //---> daha önceden bir token yoksa
                        user_id: user._id,                                      //---> token oluşturacağın user._id bu user._id
                        token: passwordEncrypt(user._id + Date.now())           
                    })

                    //JWT
                    const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_KEY, { expiresIn: '30m' })
                    const refreshToken = jwt.sign({ _id: user._id, password: user.password }, process.env.REFRESH_KEY, { expiresIn: '3d' })

                    res.send({
                        error: false,
                        // FOR REACT PROJECT:
                        key: tokenData.token,                                   //---> FE. senkronu ile gidildiğinden key prop.i ile kullanıyorum
                        // token: tokenData.token,                              //---> normalde böle yazıyorken,
                        bearer: { accessToken, refreshToken },
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

    refresh: async (req, res) => {
        /*
            #swagger.tags = ['Authentication']
            #swagger.summary = 'JWT: Refresh'
            #swagger.description = 'Refresh accessToken with refreshToken'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    bearer: {
                        refresh: '...refreshToken...'
                    }
                }
            }
        */

        const refreshToken = req.body?.bearer?.refreshToken

        if (refreshToken) {

            jwt.verify(refreshToken, process.env.REFRESH_KEY, async function (err, userData) {

                if (err) {

                    res.errorStatusCode = 401
                    throw err
                } else {

                    const { _id, password } = userData

                    if (_id && password) {

                        const user = await User.findOne({ _id })

                        if (user && user.password == password) {

                            if (user.is_active) {

                                // JWT:
                                const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_KEY, { expiresIn: '30m' })

                                res.send({
                                    error: false,
                                    bearer: { accessToken }
                                })

                            } else {

                                res.errorStatusCode = 401
                                throw new Error('This account is not active.')
                            }
                        } else {

                            res.errorStatusCode = 401
                            throw new Error('Wrong id or password.')
                        }
                    } else {

                        res.errorStatusCode = 401
                        throw new Error('Please enter id and password.')
                    }
                }
            })

        } else {
            res.errorStatusCode = 401
            throw new Error('Please enter token.refresh')
        }
    },

    logout: async (req, res) => {                                               //---> token silme kısmı diyebilirim
        /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "simpleToken: Logout"
            #swagger.description = 'Delete token key.'
        */
 
        const auth = req.headers?.authorization || null         // Token ...6s5d4gt56d4f6ghfdg...          // Bearer ...accessToken...  
        const tokenKey = auth ? auth.split(' ') : null          // ['Token', '...6s5d4gt56d4f6ghfdg...']   // ['Bearer', '...accessToken...']    

        let message = null, result = {}

        if (tokenKey) {                                                         //---> tokenkey var mı ve 0.endeksi 'Token' mı ? öyleyse;

            if (tokenKey[0] == 'Token') { // SimpleToken

                result = await Token.deleteOne({ token: tokenKey[1] })          //---> Token gelirse zaten siliyoruz. JWT gelirse işlem yapmaya gerek kalmıyor
                message = 'Token deleted. Logout OK.'

            } else { // JWT

                message = 'No need any process for logout. You must delete JWT tokens.'
            }
        }

        res.send({
            error: false,
            message,
            result
        })
    },
}