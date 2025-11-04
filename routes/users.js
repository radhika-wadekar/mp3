const User = require('../models/user.js');
const Task = require('../models/task.js');

module.exports = function(router){
    const usersRoute = router.route("/");
    const usersIdRoute = router.route("/:id");

    usersRoute.post(async (req, res) => {
         try {
                const { name, email } = req.body;
                if (!name || !email)
                    return res.status(400).json({ message: 'Name and email required!', data:{}});

                const check_existing = await User.findOne({ email });
                if (check_existing)
                    return res.status(400).json({ message: 'Email already exists!', data:{}});

                const curr_user = new User({
                    name,
                    email,
                    pendingTasks: []
                });
                console.log(curr_user);
                await curr_user.save();
                res.status(201).json({ message:'User created succesfully', data:curr_user });
            }
            catch (err) {
                res.status(500).json({ message: 'Server error', data:{}});
            }



    });
    usersRoute.get(async (req,res)=>{
         try {
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
            let curr_query = User.find(where).sort(sort).select(select).skip(skip);
            if (limit > 0) curr_query = curr_query.limit(limit);
            if(count){
                const user_cnt = await User.countDocuments(where);
                res.status(200).json({ message: 'OK', data: user_cnt });
            }
            else{
                const curr_users = await curr_query.exec();
                res.status(200).json({ message: 'OK', data:curr_users });
            }
        }
        catch(err) {
            console.log(err);
            res.status(500).json({ message:'Server error', data:{} });
        }
    });

    usersIdRoute.get(async (req,res)=>{
       try{
           let select = {};
           if(req.query.select){
               select = JSON.parse(req.query.select);
           }
           const curr_query = User.findById(req.params.id).select(select);
           const curr_user = await curr_query.exec();
           console.log(curr_user);
           if (!curr_user) {
               return res.status(404).json({ message: 'User not found', data: {} });
           }
           res.status(200).json({message:'OK',data:curr_user});
       }
       catch(err){
           res.status(500).json({message:'Server error',data:{}});
       }
    });

    usersIdRoute.put(async (req,res)=>{
        try{
            const {name, email, pendingTasks} = req.body;
            const pre_user = await User.findById(req.params.id);
            if(!pre_user){
                return res.status(404).json({message:"User not found",data:{}});
            }
            await Task.updateMany(
              { assignedUser: pre_user._id, _id:{$nin: pendingTasks}},
              { assignedUser: "",assignedUserName: ""}
            );

            await Task.updateMany(
              { _id: { $in: pendingTasks } },
              { assignedUser:pre_user._id, assignedUserName: name }
            );

            const updated_user = await User.findByIdAndUpdate(req.params.id, {name, email, pendingTasks}, {new:true});
            res.status(200).json({message:"User updated successfully",data:updated_user});
        }
        catch(err){
            res.status(500).json({message:'Server Error',data:{}});
        }
    });

    usersIdRoute.delete(async (req,res)=>{
            try{

                const pre_user = await User.findById(req.params.id)

                if(!pre_user){
                    return res.status(404).json({message:"User not found",data:{}});
                }
                await Task.updateMany({assignedUser:pre_user._id},{assignedUser: "",assignedUserName: "unassigned"});
                const deleted_user = await User.findByIdAndDelete(req.params.id);
                res.status(200).json({message:"User deleted successfully", data:deleted_user});
            }
            catch(err){
                console.log(err);
                res.status(500).json({message:'Server Error',data:{}});
            }
        });

    return router;



}