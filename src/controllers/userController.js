const {response, request} = require('express');
const User = require('../models/user');

const getUsers = async (req = request, res) => {

    const {uid} = req;

    try{

        const user = await User.findById(uid).select('following')

        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        const users = await User.find({$nor: [{_id: uid }, ...followings] })
        .select('_id name bio imgUser imgUserBackground followers')
        
        return res.status(200).json({
            ok: true,
            data: users
        })


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserById = async (req = request, res) => {

    const {id} = req.params;

    try{

        const user = await User.findById(id);

        const {followers, following, ...rest} = user;
        const { _id: uid, ...restdata } = rest._doc

        if(user){

            return res.status(200).json({
                ok: true,
                data: {
                    uid,
                    ...restdata,
                    nfollowers: followers.length,
                    nfollowing: following.length
                }
            })

        }else{
            return res.status(204).json({
                ok: true,
                msg: 'User not found'
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserFollowers = async (req = request, res) => {

    const {id} = req.params;

    try{

        const user = await User.findById(id).populate({path:'followers', select: '_id name bio imgUser followers'});

        if(user){

            const { followers, _id, ...rest } = user;
            return res.status(200).json({
                ok: true,
                uid: _id,
                data: followers
            })

        }else{
            return res.status(204).json({
                ok: true,
                msg: 'User not found'
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserFollowing = async (req = request, res) => {

    const {id} = req.params;

    try{

        const user = await User.findById(id).populate({path:'following', select: '_id name bio imgUser followers'});

        if(user){

            const { following, _id, ...rest } = user;
            return res.status(200).json({
                ok: true,
                uid: _id,
                data: following
            })

        }else{
            return res.status(204).json({
                ok: true,
                msg: 'User not found'
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addFollowAndUnfollow = async (req, res) => {


    const {id} = req.params;
    const {uid} = req;

    try{
        
        const [userFollowing , user] = await Promise.all([
            User.findById(id).populate(),
            User.findById(uid).populate()
        ])


        if(user.following.includes(id)){
            console.log("si esta, dejar de seguir");
            // userFollowing.following.length

            await Promise.all([
                // user.updateOne({$pull: {following: id}}),
                user.updateOne({$pull: {following: id}}), // PULL SACA DEL ARRAY
                userFollowing.updateOne({$pull: {followers: uid}}),
                // userFollowing.updateOne({$pull: {followers: uid}})
            ]);
            return res.status(200).json({
                ok:true,
                msg: 'Unfollow'
            })
        }else{
            await Promise.all([
                user.updateOne({$push: {following: id}}), // PUSH SACA DEL ARRAY
                userFollowing.updateOne({$push: {followers: uid}})
            ]);
            return res.status(200).json({
                ok:true,
                msg: 'Following'
            })
        }       

        

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }


}

const getUsersRecomment = async (req = request, res = response) => {

    const {uid} = req;

    try {

        // mongoose.ObjectId(uid)
        const followingsUser = await User.findById(uid).select('following')

        const followings = followingsUser.following.map( f => {
            return {
                _id: f
            }
        })

        const users = await User.find({$nor: [{_id: uid }, ...followings] })
        .select('_id name bio imgUser imgUserBackground followers')
        .limit(2)

        return res.status(200).json({
            ok: true,
            data: users
        }); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

module.exports = {

    addFollowAndUnfollow,
    getUserById,
    getUsers,
    getUserFollowers,
    getUserFollowing,
    getUsersRecomment
}