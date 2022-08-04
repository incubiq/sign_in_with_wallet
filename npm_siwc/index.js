/*!
 * siwc
 * Copyright(c) 2022-2022 Eric Duneau
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */

const {siwc_connect} = require('./libs/siwc_connect');

/**
 * Module exports.
 */

const _siwc=new siwc_connect();

module.exports = _siwc;