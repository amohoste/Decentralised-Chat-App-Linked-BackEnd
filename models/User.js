const mongoose = require('mongoose'); // Bring in mongoose
const Schema = mongoose.Schema;

// Create schema
const UserSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    registerdate: {
        type: Date,
        default: Date.now
    },
    datapod: {
        type: String,
        required: true
    }, maker: {
        type: String,
        required: false
    }
});

mongoose.model('users', UserSchema); // Create model (name ideas) and connect it to ide schema