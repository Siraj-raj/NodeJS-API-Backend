'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/user/user.service');

// routes
router.get('/', getAll);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getAll(req, res, next) {
    service.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    service._delete(req.params.id)
        .then(() => res.json({success: true}))
        .catch(err => next(err));
}

function update(req, res, next) {
    service.update(req.params.id, req.body)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}