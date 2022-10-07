import fs from 'fs-extra';
 
import {Conf} from './clasp/conf.js';
import {hasOauthClientSettings, safeIsOnline, saveProject} from './clasp/utils.js';
import { pushFiles } from './clasp/files.js';

import { authorize_getUrl, defaultScopes } from './clasp/auth.js';
import { googleProvisioning, createGoogleProject } from './provisioning.js';


//const express = require('express');
import express from 'express';

//const path = require('path')
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

//const app = express();

const port = process.env.PORT || 5001

var scriptId;
 
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('view engine', 'ejs')
  .get('/', (req, res) => { res.render('pages/index', { name: "-" })})

  .get('/testUrl', async (req, res) => {
      
      //const useLocalhost = false;  
      //const authUrl = authorize_getUrl({ scopes: defaultScopes, useLocalhost });
      
      const externalHost = true;
      console.log('process.env:' + process.env.port);

      const authUrl = await authorize_getUrl(externalHost);
      console.log('***' + authUrl);
      
      res.render('pages/index', { name: authUrl }); // funziona in locale

      //res.redirect(authUrl);  // test su host
      
      //res.redirect("http://www.facebook.com") // test
   })

  .get('/create', async (req, res) => { 
  
      console.log('clicked');
              
      //scriptId = await googleProvisioning();

      scriptId = await createGoogleProject();

      

      console.log(scriptId);
      
      res.render('pages/index', { name: scriptId });
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
      
      res.render('pages/index', { name: scriptId });
  })
  
  
  .listen(port, () => console.log('port' + port))
  
  console.log(__dirname);
  console.log(path.join(__dirname, 'views'))
  
