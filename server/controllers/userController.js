//server/controllers/userController.js
const User = require('../models/userModel.js');
const spotifyApi = require('../utils/apiWrapper');

const userController = {}

//This calls the Spotify API********
userController.getUserToken = (req, res, next) => {
    console.log('userController.getUserToken executed');
    const { code } = req.query;
    console.log('code is: ', code);

  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      console.log('authorizationCodeGrant data.body: ', data.body);
      const { access_token, refresh_token } = data.body;
      // STRETCH: maybe setInterval and refreshToken here
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      res.cookie('access', access_token).cookie('refresh', refresh_token);
      console.log('userController.getUserToken spotifyApi: ', spotifyApi);
      next()
    })
    .catch(err => {
      console.log('userController.getUserToken err: ', err)
      res.status(err.statusCode).json(`Error: Status Code ${err.statusCode}`)});
}

//This calls the Spotify API********
//call the Spotify API to get the currently logged in user's "spotify_id"
userController.getSpotifyId = (req, res, next) => {
    console.log('userController.getSpotifyId');
    spotifyApi.getMe()
      .then((data) => {
        res.locals.spotify_id = data.body.id;
        res.locals.display_name = data.body.display_name;
        return next();
      })
      .catch(err => {console.log('userController.getSpotifyId err: ', err)})
}

//Queries DB*********
//this queries the DB to see if a user with a particular spotify_id exists
userController.checkIfUserExists = (req, res, next) => {
    const spotify_id = res.locals.spotify_id
    const display_name = res.locals.display_name
    console.log('userController.checkIfUserExists res.locals.spotify_id: ', res.locals.spotify_id)
    User.findOneAndUpdate({spotify_id}, {spotify_id, display_name}, {upsert:true, new:true})
    .then((doc)=>{
        res.locals.doc = doc;
        console.log("checkIfUserExists res.locals.doc: ", res.locals.doc)
        res.locals.redirect = '/#/playlistform'
        next();
    })
}

//Queries DB*********
//getAllUsers (find)
userController.getAllUsers = (req, res, next) => {
    User.find({})
    .exec()
    .then((data)=>{
        console.log('next in get all users', data);
        res.locals.data = data;
        next();
    })
}

//Queries DB*********
//getDoc (findOne)
userController.getDoc = (req, res, next) => {
    const { spotify_id } = req.body
    
    console.log('userController.getDoc req.body.id: ', spotify_id)
    User.findOne({spotify_id}, (err, doc) => {
        if(err){
            return next('Error in userController.getDoc: ' + JSON.stringify(err))
        }
        res.locals.doc = doc;
        next()
    })
}

//Queries DB*********
//createDoc (create)
userController.createDoc = (req, res, next) => {
    const spotify_id = "spotify_id"
    console.log('userController.createDoc req.params.id: ', spotify_id)
    const playlist_id = "playlistId goes here";
    User.create({spotify_id, playlist_id}, (err, doc) => {
        if(err){
            return next('Error in userController.createDoc: ' + JSON.stringify(err))
        }
        //res.locals.doc = doc;
        next()
    })
}

//Queries DB*********
//updateDoc (findOneAndUpdate)
userController.updateDoc = (req, res, next) => {
    const {spotify_id, playlist_id} = req.body
    //console.log('userController.updateDoc req.params.id: ', id)
    User.findOneAndUpdate({spotify_id}, {playlist_id}, {new:true}, (err, doc) => {
        if(err){
            return next('Error in userController.updateDoc: ' + JSON.stringify(err))
        }
        res.locals.doc = doc;
        next()
    })
}


module.exports = userController;