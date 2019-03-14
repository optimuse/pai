// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// module dependencies
const express = require('express');
const azureConfig = require('../config/azure');
const passport = require('passport');
const logger = require('../config/logger');
const util = require('util');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const tokenConfig = require('../config/token');
const tokenModel = require('../models/token');
const createError = require('../util/error');


const router = new express.Router();


router.route('/')
    /** GET /api/v1/auth - AAD AUTH */
    .get(
    function(req, res, next) {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,                      // required
                resourceURL: azureConfig.azAAD.resourceURL,    // optional. Provide a value if you want to specify the resource.
                customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
                failureRedirect: '/'
            }
        )(req, res, next);
    },
    function(req, res) {
        logger.info('Login was called in the Sample');
        res.redirect('/');
    }
    );

router.route('/logout')
/** GET /api/v1/auth/logout - AAD AUTH */
    .get(
        function(req, res){
            req.session.destroy(function(err) {
                req.logOut();
                res.redirect(config.destroySessionUrl);
            });
        }
    )

router.route('/openid/return')
    /** GET /api/v1/auth/openid/return - AAD AUTH RETURN */
    .get(
        function(req, res, next) {
            passport.authenticate('azuread-openidconnect',
                {
                    response: res,                      // required
                    failureRedirect: '/'
                }
            )(req, res, next);
        },
        function(req, res) {
            var email =  req.user._json.email;
            const username = email.substring(0, email.lastIndexOf("@"));
            const password = '123';
            const expiration = 7 * 24 * 60 * 60;
            tokenModel.checkAAD(username, password, (err, state, admin, hasGitHubPAT) => {
                if (err) {
                    return next(createError.unknown(err));
                }
                if (!state) {
                    return next(createError('Bad Request', 'IncorrectPasswordError', 'Password is incorrect.'));
                }
                jwt.sign({
                    username: username,
                    admin: admin,
                }, tokenConfig.secret, {expiresIn: expiration}, (signError, token) => {
                    if (signError) {
                        return next(createError.unknown(signError));
                    }
                    return res.redirect('http://' + process.env.WEBPORTAL_URL + '/login.html?'+ querystring.stringify({
                        user: username,
                        token: token,
                        admin: admin,
                        hasGitHubPAT: hasGitHubPAT,
                    }));
                });
            });
        }
    )
    /** POST /api/v1/auth/openid/return - AAD AUTH RETURN */
    .post(
        function(req, res, next) {
            passport.authenticate('azuread-openidconnect',
                {
                    response: res,                      // required
                    failureRedirect: '/'
                }
            )(req, res, next);
        },
        function(req, res) {
            var email =  req.user._json.email;
            const username = email.substring(0, email.lastIndexOf("@"));
            const password = '123';
            const expiration = 7 * 24 * 60 * 60;
            tokenModel.checkAAD(username, password, (err, state, admin, hasGitHubPAT) => {
                if (err) {
                    return next(createError.unknown(err));
                }
                if (!state) {
                    return next(createError('Bad Request', 'IncorrectPasswordError', 'Password is incorrect.'));
                }
                jwt.sign({
                    username: username,
                    admin: admin,
                }, tokenConfig.secret, {expiresIn: expiration}, (signError, token) => {
                    if (signError) {
                        return next(createError.unknown(signError));
                    }
                    return res.redirect('http://' + process.env.WEBPORTAL_URL + '/login.html?'+ querystring.stringify({
                        user: username,
                        token: token,
                        admin: admin,
                        hasGitHubPAT: hasGitHubPAT,
                    }));
                });
            });
        }
    );
// module exports
module.exports = router;