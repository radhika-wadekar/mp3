const Task = require('../models/task.js');
const User = require('../models/user.js');

module.exports = function(router){
    const tasksRoute = router.route("/");
    const tasksIdRoute = router.route("/:id");

    tasksRoute.post(async (req, res) => {
         try {
                const { name, description, deadline, completed, assignedUser, assignedUserName} = req.body;
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
                    await User.findByIdAndUpdate(assignedUser, {$addToSet: { pendingTasks: curr_task._id} });
                }
                res.status(201).json({ message:'Task created succesfully', data:curr_task });
            }
            catch (err) {
                res.status(500).json({ message: 'Server error', data:{}});
            }



    });
    tasksRoute.get(async (req,res)=>{
        try{
        let where = {};
            let sort = {};
            let select = {};
            let skip = 0;

            let limit = 100;
            if(req.query.where){
                where = JSON.parse(req.query.where);
            }
            if(req.query.sort){
                sort = JSON.parse(req.query.sort);
            }
            if(req.query.select){
                select = JSON.parse(req.query.select);
            }
            if(req.query.skip){
                skip = parseInt(req.query.skip);
            }
            if(req.query.limit){
                limit = parseInt(req.query.limit);
            }
            const count = req.query.count ==='true';
            console.log(count);
            let curr_query = Task.find(where).sort(sort).select(select).skip(skip);
            curr_query = curr_query.limit(limit);
            console.log(curr_query);
            if(count){
                const task_cnt = await Task.countDocuments(where);
                res.status(200).json({ message: 'OK', data:task_cnt });
            }
            else{
                const curr_tasks = await curr_query.exec();
                res.status(200).json({ message: 'OK', data:curr_tasks });
            }
        }
        catch(err) {
            console.log(err);
            res.status(500).json({ message:'Server error', data:{} });
        }
    });

    tasksIdRoute.get(async (req,res)=>{
        try{
            let select = {};
            if(req.query.select){
                select = JSON.parse(req.query.select);
            }
            const curr_query = Task.findById(req.params.id).select(select);
            const curr_task = await curr_query.exec();
            console.log(curr_task);
            if (!curr_task) {
                return res.status(404).json({ message: 'Task not found', data: {} });
            }
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
            if(updated_task.completed && updated_task.assignedUserName !== 'unassigned'){
                await User.findByIdAndUpdate(updated_task.assignedUser, {$pull: { pendingTasks:updated_task._id }});
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