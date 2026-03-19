const express = require('express');
const router = express.Router();
const { userProtect } = require('../middleware/userAuth');
const { getAll, getOne, create, update, remove, setDefault } = require('../controllers/addressController');

router.use(userProtect);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.put('/:id/default', setDefault);

module.exports = router;