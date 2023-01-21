const mongoose = require('mongoose');

const Avatares = mongoose.Schema({
  
  userID: {
    type: String,
    required: true,
  },
  avatares: {
    type: Array,
    default: [],
  },
 
});


module.exports = mongoose.model('Avatar', Avatares);