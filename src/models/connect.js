const {Schema,model} = require('mongoose');

const ConnectSchema = Schema({

    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,  
    },
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,  
    },   
    date: {
        type: Date,
        default: new Date()
    },
    isConnected: {
        type: Boolean,
        default: false
    }
    
});

ConnectSchema.method('toJSON', function() {
    const { __v, _id, ...object} = this.toObject();
    object.cid = _id;
    return object;
});

module.exports = model('Connect', ConnectSchema);