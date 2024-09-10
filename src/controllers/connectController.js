

const { response } = require('express');
const { request } = require('express');
const Connect = require('../models/connect');

const getConnects = async (req = request, res = response) => {

    const { uid: uidAuth } = req.uid
    const {limit = 5, page = 1} = req.query;

    try {
        
        const connects = await Connect.find({ 
            userTo: uidAuth,
            isConnected: false
        },
            null,
            {
                // sort: { _id: 1 },
                skip: (page - 1) * limit,
                limit: limit,
        }).populate({   
            path: 'userFrom userTo', 
            select: '_id bio imgUser name followers following'
        })


        const connectsFormat = connects.map( (connect) => {

            const { userFrom, userTo, ...rest } = connect


            console.log(userFrom,userTo,rest._doc);
            

            const {followers: followersUserFrom, following: followingUserFrom, ...restUserFrom} = userFrom;
            const { _id: uidUserFrom,  followers: _f, following: _fw ,...restdataUserFrom } = restUserFrom._doc

            const {followers: followersUserTo, following: followingUserTo, ...restUserTo} = userTo;
            const { _id: uidUserTo, followers: _f2, following: _fw2 ,...restdataUserTo} = restUserTo._doc


            // console.log(restdataUserFrom, restdataUserTo);
            

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

module.exports = {
    getConnects
}