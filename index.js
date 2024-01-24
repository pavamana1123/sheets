const fs = require('fs')
const moment = require('moment')
var config = require("./config.js")
const {google} = require('googleapis')

const originalConsoleLog = console.log
console.log = function (...args) {
  const timestamp = new Date().toISOString()
  originalConsoleLog.apply(console, [`[${moment(timestamp).format("YY-MMM-DD HH:mm")}]`, ...args])
}

const express = require('express')
const app = express()
app.use(express.json())
const port = 5005

var credentials = JSON.parse(fs.readFileSync('credentials.json'))
var token = JSON.parse(fs.readFileSync('token.json'))
const {client_secret, client_id, redirect_uris} = credentials.installed
const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
auth.setCredentials(token)
var client = google.script({version: 'v1', auth})

app.post('/api', (req, res)=>{

    const { url, sheets } = req.body

    client.scripts.run({
        resource: {
            function: "getData",
            parameters: [ url, sheets ]
        },
        scriptId: config.scriptId,
    }, function(error, response) {

        console.log(`Served sheet: ${url}`)

        if (error) {
            console.log("Could not get data:", error)
            res.status(500).send(error)
            return
        }
    
        if(!response){
            console.log("Empty response!")
            res.status(500).send("Empty response!")
            return
        }else{
            if(response.error) {
                console.log("Error response:", response.error)
                res.status(500).send(response.error)
                return
            }
    
            if(response.data.error){
                console.log("Error in data:", response.data.error)
                res.status(500).send(response.data.error)
                return
            }
        } 
        res.status(200).send(response.data.response.result)
    })
})

app.listen(port, ()=>console.log("Server running on port :" + port))





