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
            const curr_users = await User.find();
            res.status(200).json({ message: '', data:curr_users });
        }
        catch(err) {
            console.log(err);
            res.status(500).json({ message:'Server error', data:{} });
        }
    });

    usersIdRoute.get(async (req,res)=>{
        try{
            const curr_user = await User.findById(req.params.id);
            console.log(curr_user);
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
                await Task.updateMany({assignedUser:pre_user._id},{assignedUser: "",assignedUserName: ""});
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