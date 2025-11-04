const Task = require('../models/task.js');
const User = require('../models/user.js');

module.exports = function(router){
    const tasksRoute = router.route("/");
    const tasksIdRoute = router.route("/:id");

    tasksRoute.post(async (req, res) => {
         try {
                const { name, description, deadline, completed, assignedUser, assignedUserName } = req.body;
                if (!name ||!deadline)
                    return res.status(400).json({ message: 'Name and deadline required!', data:{}});





                const curr_task = new Task({
                    name,
                    description,
                    deadline,
                    completed,
                    assignedUser,
                    assignedUserName
                });

                await curr_task.save();
                console.log(curr_task);
                 if (assignedUser) {
                    await User.findByIdAndUpdate(assignedUser, { $addToSet: { pendingTasks: curr_task._id} });
                }
                res.status(201).json({ message:'Task created succesfully', data:curr_task });
            }
            catch (err) {
                res.status(500).json({ message: 'Server error', data:{}});
            }



    });
    tasksRoute.get(async (req,res)=>{
         try {
            const curr_tasks = await Task.find();
            res.status(200).json({ message: 'OK', data:curr_tasks });
        }
        catch(err) {
            console.log(err);
            res.status(500).json({ message:'Server error', data:{} });
        }
    });

    tasksIdRoute.get(async (req,res)=>{
        try{
            const curr_task = await Task.findById(req.params.id);
            console.log(curr_task);
            res.status(200).json({message:'OK',data:curr_task});
        }
        catch(err){
            res.status(500).json({message:'Server error',data:{}});


        }
    });

    tasksIdRoute.put(async (req,res)=>{
        try{
            const { name, description, deadline, completed, assignedUser, assignedUserName} = req.body;
            const pre_task = await Task.findById(req.params.id);
            if(!name ||!deadline){
                return res.status(400).json({ message: 'Name and deadline required!', data:{}});
            }
            if(pre_task.assignedUser && pre_task.assignedUser!== assignedUser) {
              await User.findByIdAndUpdate(pre_task.assignedUser, {$pull: { pendingTasks:pre_task._id }});
            }

            if(assignedUser) {
              await User.findByIdAndUpdate(assignedUser, {$addToSet: { pendingTasks:pre_task._id } });
            }

            const updated_task = await Task.findByIdAndUpdate(req.params.id,{ name, description, deadline, completed, assignedUser, assignedUserName},{new:true});
            //console.log(curr_task);
            if(!updated_task){
                return res.status(404).json({message:"Task not found",data:{}});
            }
            res.status(200).json({message:"Task updated successfully", data:updated_task});
        }
        catch(err){
            res.status(500).json({message:'Server Error',data:{}});
        }
    });

    tasksIdRoute.delete(async (req,res)=>{
            try{
                const pre_task = await Task.findById(req.params.id);
                if(!pre_task){
                     return res.status(404).json({message:"Task not found",data:{}});
                }
                if(pre_task.assignedUser){
                    await User.findByIdAndUpdate(pre_task.assignedUser, {$pull: { pendingTasks:pre_task._id }});
                }

                const deleted_task = await Task.findByIdAndDelete(req.params.id);

                res.status(200).json({message:"Task deleted successfully", data:deleted_task});
            }
            catch(err){
                console.log(err);
                res.status(500).json({message:'Server Error',data:{}});
            }
        });

    return router;



}