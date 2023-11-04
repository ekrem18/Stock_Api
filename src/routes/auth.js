"use strict"
/* -------------------------------------------------------*/
const router = require('express').Router()
/* ------------------------------------------------------- */
// routes/auth:

const auth = require('../controllers/auth')

// URL: /auth

router.post('/login', auth.login) // SimpleToken & JWT
router.post('/refresh', auth.refresh) // JWT Refresh
router.get('/logout', auth.logout) // SimpleToken Logout            //---> all metodunu kullanabilecekken yazmıyor oluşumuzun nedeni swagger all'u görmüyor
router.post('/logout', auth.logout) // SimpleToken Logout

/* ------------------------------------------------------- */
module.exports = router

