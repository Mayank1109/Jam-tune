const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const http = require('http');
const e = require('express');
const { triggerAsyncId } = require('async_hooks');

let currentUser = null;
let currentUserEmail = null;
let currentUserLikedSongs = null;
let currentUserSearchResults = null;
let trendingSongsArr = [];

// spotify trending options
const spotifyOptions = {
    method: 'GET',
    url: 'https://spotify-scraper.p.rapidapi.com/v1/chart/tracks/top',
    params: {region: 'GLOBAL'},
    headers: {
        'X-RapidAPI-Key': 'cb09d8c2a2msh7a395da94095bd0p1d3f25jsn6e18b9bb6db0',
        'X-RapidAPI-Host': 'spotify-scraper.p.rapidapi.com'
    }
};

mongoose.connect('mongodb://localhost:27017/musicApp');

const db = mongoose.connection;
db.on('error', console.log.bind(console, 'connection error...'));
db.once('open', function () {
    console.log('connection succeeded');
})

let app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    currentUser = null;
    trendingSongsArr = [];
    //* spotify top 200 songs

    axios.request(spotifyOptions).then(function (response) {
        for(let i=0; i<response.data.tracks.length; i++) {
            const trendingSongs = {
                songName : response.data.tracks[i].name,
                authorName: response.data.tracks[i].artists[0].name,
                thumbnail: response.data.tracks[i].album.cover[0].url
            }
            trendingSongsArr.push(trendingSongs);
        }
        console.log(trendingSongsArr);
        res.render('index.ejs', {
            user: '',
            loggedin: false,
            songsList: null,
            likedSongs: null,
            alertMessage: false,
            showLikedSongs: false,
            showTrendingSongs: trendingSongsArr
        })
    }).catch(function (error) {
        console.error(error);
    });
})

app.post('/', (req, res) => {
    // currentUser = null;
    trendingSongsArr = [];
    //* spotify top 200 songs

    axios.request(spotifyOptions).then(function (response) {
        for(let i=0; i<response.data.tracks.length; i++) {
            const trendingSongs = {
                songName : response.data.tracks[i].name,
                authorName: response.data.tracks[i].artists[0].name,
                thumbnail: response.data.tracks[i].album.cover[0].url
            }
            trendingSongsArr.push(trendingSongs);
        }
        console.log(trendingSongsArr);
        if(currentUser && currentUserEmail){
            console.log('here');
            res.render('index.ejs', {
                user: currentUser,
                loggedin: true,
                songsList: null,
                likedSongs: currentUserLikedSongs,
                alertMessage: false,
                showLikedSongs: false,
                showTrendingSongs: trendingSongsArr
            })
        }
        else{
            console.log('no here');
            res.render('index.ejs', {
                user: '',
                loggedin: false,
                songsList: null,
                likedSongs: null,
                alertMessage: false,
                showLikedSongs: false,
                showTrendingSongs: trendingSongsArr
            })
        }
    }).catch(function (error) {
        console.error(error);
    });
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: '' });
})

app.post('/signup', function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    const data = {
        'Name': name,
        'Email': email,
        'Password': password
    };

    db.collection('users').findOne({ Email: email }, (err, docs) => {
        if (docs !== null) {
            res.render('signup.ejs', { message: 'Email is already Registered!' })
        }
        else {
            db.collection('users').insertOne(data, (err, collection) => {
                if (err) throw err;
                res.redirect('/login');
            })
        }
    })
})

app.get('/login', (req, res) => {
    res.render('login.ejs', { message: ' ' });
})

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    db.collection('users').findOne({ Email: email }, (err, docs) => {
        if (err) throw err;
        if (password === docs.Password) {
            currentUser = docs.Name;
            currentUserEmail = docs.Email;
            currentUserLikedSongs = docs.LikedSongs;
            res.render('index.ejs', { 
                user: currentUser, 
                loggedin: true, 
                songsList: null, 
                likedSongs: docs.LikedSongs, 
                alertMessage: false, 
                showLikedSongs: false,
                showTrendingSongs: trendingSongsArr
            });
        }
        else {
            res.render('login.ejs', { message: 'Wrong username or password.' });
        }
    })
})

app.post('/search', (req, res) => {
    const optionsSearch = {   
        method: 'GET',
        url: 'https://youtube-music1.p.rapidapi.com/v2/search',
        params: {query: req.body.search},
        headers: {
            'X-RapidAPI-Key': 'cb09d8c2a2msh7a395da94095bd0p1d3f25jsn6e18b9bb6db0',
            'X-RapidAPI-Host': 'youtube-music1.p.rapidapi.com'
        }
    };

    axios.request(optionsSearch).then(function (response) {
        function fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}
        let results = response.data.result.songs;
        // ? Test Data
        // let results = testdata;
        for(let i=0; i<results.length; i++){
            results[i].duration = fmtMSS(results[i].duration);
            results[i].name = results[i].name.split('-')[1];
        }
        currentUserSearchResults = results;
        res.render('search.ejs', { 
            user: currentUser,
            loggedin: currentUser,
            songsList: results,
            likedSongs: currentUserLikedSongs,
            alertMessage: false,
            showLikedSongs: false
        });
    }).catch(function (error) {
        console.error(error);
    });


})

app.post('/download', (req, res) => {

    const options = {
        method: 'GET',
        url: 'https://youtube-music1.p.rapidapi.com/get_download_url',
        params: { id: req.body.songID },
        headers: {
            'X-RapidAPI-Key': 'cb09d8c2a2msh7a395da94095bd0p1d3f25jsn6e18b9bb6db0',
            'X-RapidAPI-Host': 'youtube-music1.p.rapidapi.com'
        }
    };

    axios.request(options).then(function (response) {
        res.redirect(response.data.result.download_url);

    }).catch(function (error) {
        console.error(error);
    });

})

app.post('/liked', (req, res) => {

    let renderFavPage = false;

    const songObj = {
        songID : req.body.songID,
        songName: req.body.songName,
        songAuthor: req.body.songAuthor,
        songDuration: req.body.songDuration
    }

    if (currentUser && currentUserEmail) {

        db.collection('users').findOne({ Email: currentUserEmail }, (err, docs) => {

            if (err) throw err;
            let likedArr = docs.LikedSongs || [];
            
            if(likedArr.filter(song => song.songID === songObj.songID).length > 0){
                //* song is already in the favorites list
                //* remove the song from favorite list
                likedArr = likedArr.filter(song => song.songID !== songObj.songID);
                renderFavPage = true;
            }
            else{
                //* song is not in the favorite list
                //* add the song to favorite list 
                likedArr.push(songObj);
                renderFavPage = false;
            }

            currentUserLikedSongs = likedArr;

            db.collection('users').updateOne({ Name: docs.Name }, { $set: { LikedSongs: likedArr } }, (err, collection) => {
                if (err) throw err;
                if(!renderFavPage){
                    res.render('search.ejs', { 
                        user: currentUser, 
                        loggedin: currentUser, 
                        songsList: currentUserSearchResults, 
                        likedSongs: currentUserLikedSongs, 
                        alertMessage: false,
                        showLikedSongs: false
                    });
                }
                else{
                    res.render('search.ejs', { 
                        user: currentUser, 
                        loggedin: currentUser, 
                        songsList: currentUserSearchResults, 
                        likedSongs: currentUserLikedSongs, 
                        alertMessage: false,
                        showLikedSongs: true
                    });
                }
            })
        });
    }
    else {
        res.render('index.ejs', { 
            user: currentUser, 
            loggedin: currentUser, 
            songsList: currentUserSearchResults, 
            likedSongs: currentUserLikedSongs, 
            alertMessage: true,
            showLikedSongs: false,
            showTrendingSongs: trendingSongsArr
        });
    }
})

app.post('/favorites', (req, res) => {
    if (currentUser && currentUserEmail) {
        db.collection('users').findOne({ Email: currentUserEmail }, (err, docs) => {
            if (err) throw err;
            res.render('search.ejs', {
                user: currentUser,
                loggedin: currentUser,
                songsList: currentUserSearchResults,
                likedSongs: currentUserLikedSongs,
                alertMessage: false,
                showLikedSongs: true
            });
        });
    }
    else {
        res.render('index.ejs', { 
            user: currentUser, 
            loggedin: currentUser, 
            songsList: null, 
            likedSongs: currentUserLikedSongs, 
            alertMessage: true,
            showLikedSongs: false,
            showTrendingSongs: trendingSongsArr
        })
    }
})

app.listen(3000, () => {
    console.log('connected and listening to port 3000');
});