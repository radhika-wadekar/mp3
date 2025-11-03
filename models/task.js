var mongoose = require('mongoose');


var TaskSchema = new mongoose.Schema({
    name: String,
    description: String,
    deadline: Date,
    completed: Boolean,
    assignedUser: {
        type:String,
        default:""
    },
    assignedUserName: {
        type:String,
        default: "unassigned"
       },
    dateCreated: {
    type:Date,
    default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
