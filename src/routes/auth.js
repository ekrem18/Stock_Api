"use strict"
/* -------------------------------------------------------*/
const router = require('express').Router()
/* ------------------------------------------------------- */
// routes/auth:

const auth = require('../controllers/auth')

// URL: /auth

router.post('/login', auth.login)
router.get('/logout', auth.logout)                              //---> all metodunu kullanabilecekken yazmıyor oluşumuzun nedeni swagger all'u görmüyor
router.post('/logout', auth.logout)

/* ------------------------------------------------------- */
module.exports = router