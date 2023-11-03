"use strict"
/* ------------------------------------------------------- */                      //authorization da diyebilirim yetkisi var mı yok mu baktığım yer
// Middleware: permissions

module.exports = {

    isLogin: (req, res, next) => {

        // Set Passive:
        return next()

        // any User:
        if (req.user && req.user.is_active) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('No Permission: You must LOGIN.')
        }
    },

    isAdmin: (req, res, next) => {

        // Set Passive:
        return next()
        
        // only Admin:
        if (req.user && req.user.is_active && req.user.is_superadmin) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('No Permission: You must LOGIN and be an ADMIN.')
        }
    },

    isStaff: (req, res, next) => {

        // Set Passive:
        return next()
        
        // only Admin or Staff:
        if (req.user && req.user.is_active && (req.user.is_superadmin || req.user.is_staff)) {

            next()

        } else {

            res.errorStatusCode = 403
            throw new Error('No Permission: You must LOGIN and be a STAFF.')
        }
    },
}