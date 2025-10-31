const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller.js');

// POST /api/auth/login (Para que todos inicien sesión)
router.post('/login', controller.login);

// ¡ESTA ES LA LÍNEA QUE PROBABLEMENTE FALTABA!
module.exports = router;