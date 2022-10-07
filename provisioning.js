/**
 * Clasp command method bodies.
 */
import fs from 'fs-extra';
import { enableAppsScriptAPI } from './clasp/apiutils.js';
import { authorize, defaultScopes, getLoggedInEmail, scopeWebAppDeploy } from './clasp/auth.js';
import { FS_OPTIONS } from './clasp/constants.js';
import { readManifest } from './clasp/manifest.js';
import { ERROR, LOG } from './clasp/messages.js';
import { hasOauthClientSettings, safeIsOnline, saveProject } from './clasp/utils.js';
import { script, loadAPICredentials } from './clasp/auth.js';
import { pushFiles } from './clasp/files.js';
import { Conf } from './clasp/conf.js';
//import {getDefaultProjectName, getProjectSettings, saveProject, spinner, stopSpinner} from '../utils.js';
const { readJsonSync } = fs;

 
// fa tutto ma andrebbe spezzata
export async function googleProvisioning()
{
   console.log('*** authorize');
   //const { oauthScopes = [] } = await readManifest();
   //const scopes = [...new Set([...oauthScopes, scopeWebAppDeploy])];
        
   const useLocalhost = true;     
   await authorize({ scopes: defaultScopes, useLocalhost });
    
   console.log('*** load credential');
   await loadAPICredentials();
   
   const config = Conf.get();
    const { data } = await script.projects.create({
        requestBody: {
            "title": "from_node2"
        },
    });
    
    
   const scriptId = data.scriptId ?? '';
   
   const linkPrj = "https://script.google.com/home/projects/" + scriptId + "/edit";
   //console.log('Project link: ' + linkPrj);
   
   return scriptId;
   
    /*
    const scriptId = (_a = data.scriptId) !== null && _a !== void 0 ? _a : '';
    console.log("end");
    await saveProject(
    { scriptId, rootDir: config.projectRootDirectory }, false);
    await pushFiles();
    */
}

export async function createGoogleProject(title)
{
   console.log('*** creating');
   
   const config = Conf.get();
    const { data } = await script.projects.create({
        requestBody: {
            "title": title
        },
    });
    
    
   const scriptId = data.scriptId ?? '';
   
   const linkPrj = "https://script.google.com/home/projects/" + scriptId + "/edit";
   
   return scriptId;
}