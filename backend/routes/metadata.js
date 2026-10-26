var express = require('express');
var router = express.Router();
var modelCategory = require('../models/category');

router.get('/', async function(req, res, next) {
  try {
    const rawCategories = await modelCategory.find();
    const categories = rawCategories.map(c => ({
      id: c._id.toString(),
      _id: c._id.toString(),
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: c.description || ''
    }));

    const brands = [
      { id: 1, name: 'Bandai Spirits' },
      { id: 2, name: 'Daban Model' },
      { id: 3, name: 'Jijia Model' }
    ];

    const grades = [
      { id: 1, name: 'SD' },
      { id: 2, name: 'HG' },
      { id: 3, name: 'RG' },
      { id: 4, name: 'IBO' },
      { id: 5, name: 'RE/100' },
      { id: 6, name: 'MG' },
      { id: 7, name: 'MGEX' },
      { id: 8, name: 'PG' },
      { id: 9, name: 'Mega Size' },
      { id: 10, name: 'TOOLS' },
      { id: 11, name: 'ONEPIECE' }
    ];

    const series = [
      { id: 1, name: 'Universal Century' },
      { id: 2, name: 'Cosmic Era (SEED)' },
      { id: 3, name: 'Post Disaster (IBO)' },
      { id: 4, name: 'Witch from Mercury' },
      { id: 5, name: 'One Piece Grand Ship' },
      { id: 6, name: 'Hobby Tools' }
    ];

    res.json({ categories, brands, grades, series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
