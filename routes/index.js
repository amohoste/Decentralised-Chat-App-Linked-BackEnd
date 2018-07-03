const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  
  const title = 'Welcome' + (req.user ? ' ' + req.user.username : '')
  
  res.render('index', { // Looks in view directory for index.handlebars
      title: title // Add variable to index.handlebars
  });
  
});

module.exports = router;
