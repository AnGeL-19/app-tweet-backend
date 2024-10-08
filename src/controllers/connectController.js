

const { response } = require('express');
const { request } = require('express');
const Connect = require('../models/connect');
const User = require('../models/user');
const user = require('../models/user');


const getRecommendConnects = async (req = request, res = response) => {

    const { uid: uidAuth } = req.uid
    const {limit = 5, page = 1} = req.query;

    try {
        
        const connects = await Connect.find({ 
            userTo: uidAuth,
            isConnected: false
        },
            null,
            {
                sort: { _id: 1 },
                skip: (page - 1) * limit,
                limit: limit,
        }).populate({   
            path: 'userFrom userTo', 
            select: '_id bio imgUser name followers following'
        })


        const connectsFormat = connects.map( (connect) => {

            const { userFrom, userTo, ...rest } = connect

            const {followers: followersUserFrom, following: followingUserFrom, ...restUserFrom} = userFrom;
            const { _id: uidUserFrom,  followers: _f, following: _fw ,...restdataUserFrom } = restUserFrom._doc

            const {followers: followersUserTo, following: followingUserTo, ...restUserTo} = userTo;
            const { _id: uidUserTo, followers: _f2, following: _fw2 ,...restdataUserTo} = restUserTo._doc

            return {
                ...rest._doc,
                userFrom: {
                    uid: uidUserFrom,
                    ...restdataUserFrom,
                    nfollowers: followersUserFrom.length,
                    isFollowing: followingUserFrom.includes(uidAuth)
                },
                userTo: {
                    uid: uidUserTo,
                    ...restdataUserTo,
                    nfollowers: followersUserTo.length,
                    isFollowing: followingUserTo.includes(uidAuth)
                }
            }
        })
        

        return res.status(200).json({
            ok: true,
            length: connects.length,
            data: connectsFormat
        });

    }catch(e){

        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    } 

}

const getConnects = async (req = request, res = response) => {
    const { uid } = req.uid
    // const {limit = 5, page = 1} = req.query;

    try {

        const connects = await Connect.find({
            $or: [
              { userFrom: uid, isConnected: true },
              { userTo: uid, isConnected: true }
            ]
        }).populate({
            path: 'userFrom userTo',
            select: '_id name imgUser'
        })
        
        
        const connectsFormat = connects.map( (connect) => {

            const { userFrom, userTo, _id } = connect

            let user = {}

            if (userFrom._id.toString() === uid) {
                user = userTo
            }else{
                user = userFrom
            }

            return {
                connectId: _id,
                ...user._doc
            }

        })

        return res.status(200).json({
            ok: true,
            length: connects.length,
            data: connectsFormat
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }
}

const connectUser = async (req = request, res = response) => {

    const { uid } = req.uid
    const { userToId } = req.params

    try {

        const findConnect = await Connect.findOne({
            $or: [
              { userFrom: uid, userTo: userToId},
              { userFrom: userToId, userTo: uid }
            ]
        })



        if (findConnect) {

            await findConnect.updateOne({
                isConnected: true
            }, { new: true })
            
        } else {
            const connect = new Connect({
                userFrom: uid, 
                userTo: userToId
            })

            const [ userFromResponse, userToResponse ] = await Promise.all([
                User.findByIdAndUpdate(uid, {
                   $push: {
                       connects: connect._id
                   }
               }, { new: true }),
               User.findByIdAndUpdate(userToId, {
                   $push: {
                       connects: connect._id
                   }
               }, { new: true })
           ])

            await connect.save();
        }
   
        
        return res.status(200).json({
            ok: true,
            message: findConnect ? 'Connection successful, now you can to talk' : 'Connection was sent, now wait for it to accept',
            connect: {
                connectId: findConnect ? findConnect._id : '',
                isPending: findConnect ? findConnect.isConnected : true,
                isConnected: findConnect ? !findConnect.isConnected : false,
            }
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
    getRecommendConnects,
    connectUser,
    getConnects
}