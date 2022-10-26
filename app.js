import fs from 'fs-extra';
 
import {Conf} from './clasp/conf.js';
import {hasOauthClientSettings, safeIsOnline, saveProject} from './clasp/utils.js';
import { pushFiles } from './clasp/files.js';

import { authorize_getUrl, convertAuthCodeInToken, defaultScopes } from './clasp/auth.js';
import { googleProvisioning, createGoogleProject } from './provisioning.js';
import open from 'open';

import { launch } from 'puppeteer';
//import body-parser from 'body-parser';
import bodyParser from "body-parser"; 


//const express = require('express');
import express from 'express';

//const path = require('path')
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

//const app = express();

const port = process.env.PORT || 5004

var scriptId;
 
express()
  .use(express.static(path.join(__dirname, 'public')))

  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(express.static("public"))
  .set('view engine', 'ejs')

  .get('/', (req, res) => { res.render('pages/index', { name: "-", tokenState: "-", momentprj: "-" })})

  .get('/testAuth', async (req, res) => {
   
      const externalHost = false;
      console.log('process.env:' + process.env.port);

      const automatic = true;
      const authUrl = await authorize_getUrl(externalHost, res, automatic);
      console.log('***' + authUrl);
      
      res.render('pages/index', { name: "-",  tokenState: "OK", momentprj: "-"}); // funziona in locale
   })
 
   .get('/testAuthSep', async (req, res) => {
      
      const externalHost = false;
      console.log('process.env:' + process.env.port);

      
      // no localhost
      const automatic = false;   
      const authUrl = await authorize_getUrl(externalHost, res, automatic);
      console.log('***' + authUrl);


      res.redirect(authUrl);
/*
      (async () => {
         const browser = await launch({headless: false});
         const page = await browser.newPage();
         await page.goto(authUrl);
         //await browser.close();
      })();  
*/

      //res.render('pages/index', { name: authUrl });
      //res.redirect(authUrl);
   })

   /*
  .get('/create', async (req, res) => { 
  
      console.log('clicked');
      
      scriptId = await createGoogleProject("fromget");

      console.log(scriptId);
      
      res.render('pages/index', { name: scriptId, tokenState: "OK" });
  })
  */

  .post('/createPrj', async(req,res) => {
      var prjName = req.body.ProjectName;
      scriptId = await createGoogleProject(prjName);

      console.log(scriptId);
      
      res.render('pages/index', { name: scriptId, tokenState: "OK", momentprj: "no"});
  })
  
  .get('/testGetToken', async (req, res) => { 

      var tok = req.query.AuthCode;
      console.log("test:" + tok);
   })

   .post('/add', async(req,res) => {
      var authCode = req.body.AuthCode;
      console.log("post:" + authCode);

      const globalOauth2ClientOptions = {
         
         clientId: '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com',
         clientSecret: 'v6V3fKV_zWU7iw1DrpO1rknX',
         redirectUri: 'https://hello-clasp.herokuapp.com/testAuth'
      };
      const oAuth2ClientAuthUrlOptions = { access_type: 'offline', defaultScopes };
      
      var token = convertAuthCodeInToken(authCode, globalOauth2ClientOptions, oAuth2ClientAuthUrlOptions);
      console.log("token:" + token);
      res.render('pages/index', { name: "-", tokenState: "OK", momentprj: "-" });
      
   })

   .get('/testOpen', async (req, res) => { 
      //res.redirect("http://www.facebook.com") // test
      //open("http://www.amazon.com");

      (async () => {
            const browser = await launch({headless: false});
            const page = await browser.newPage();
            await page.goto("http://www.amazon.com");
            //await browser.close();
       })();  
   })
  
  
  

  .get('/addFiles', async (req, res) => { 
  
      console.log('adding files');
      
      const config = Conf.get();
      console.log(config.projectRootDirectory);
      
      var dirFiles = path.join(__dirname, 'googleFiles');
      
      await saveProject(
         //{scriptId, rootDir: config.projectRootDirectory, parentId: parentId ? [parentId] : undefined},
         {scriptId, rootDir: dirFiles},
         false
      );

      await pushFiles();       
      
      res.render('pages/index', { name: scriptId, tokenState: "OK" });
  })
  
  
  .listen(port, () => console.log('port' + port))
  
  console.log(__dirname);
  console.log(path.join(__dirname, 'views'))
  
