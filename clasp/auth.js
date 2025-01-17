import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { createServer } from 'http';
import open from 'open';
import readline from 'readline';
import enableDestroy from 'server-destroy';
import { ClaspError } from './clasp-error.js';
import { DOTFILE } from './dotfile.js';
import { ERROR, LOG } from './messages.js';
import { getOAuthSettings } from './utils.js';

//import puppeter from 'puppeter-core';
import { launch } from 'puppeteer';
 
/**
 * Authentication with Google's APIs.
 */
// Auth is complicated. Consider yourself warned.
// GLOBAL: clasp login will store this (~/.clasprc.json):
// {
//   "access_token": "XXX",
//   "refresh_token": "1/k4rt_hgxbeGdaRag2TSVgnXgUrWcXwerPpvlzGG1peHVfzI58EZH0P25c7ykiRYd",
//   "scope": "https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script ...",
//   "token_type": "Bearer",
//   "expiry_date": 1539130731398
// }
// LOCAL: clasp login will store this (./.clasprc.json):
// {
//   "token": {
//     "access_token": "XXX",
//     "refresh_token": "1/k4rw_hgxbeGdaRag2TSVgnXgUrWcXwerPpvlzGG1peHVfzI58EZH0P25c7ykiRYd",
//     "scope": "https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/script ...",
//     "token_type": "Bearer",
//     "expiry_date": 1539130731398
//   },
//   // Settings
//   "oauth2ClientSettings": {
//     "clientId": "807925367021-infvb16rd7lasqi22q2npeahkeodfrq5.apps.googleusercontent.com",
//     "clientSecret": "9dbdeOCRHUyriewCoDrLHtPg",
//     "redirectUri": "http://localhost"
//   },
//   "isLocalCreds": true
// }
// API settings
// @see https://developers.google.com/oauthplayground/
const REDIRECT_URI_OOB = 'urn:ietf:wg:oauth:2.0:oob';
const globalOauth2ClientSettings = {
    //clientId: '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com',
    //clientSecret: 'v6V3fKV_zWU7iw1DrpO1rknX',
    //redirectUri: 'http://localhost',


    //my proj, sembra non venga usato qua ma sotto
    clientId: '445239268862-o8rvrg61dv8n8ntthrtvnli7e8ok06ek.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://localhost',
    
};
const globalOAuth2Client = new OAuth2Client(globalOauth2ClientSettings);
let localOAuth2Client; // Must be set up after authorize.
// *Global* Google API clients
export const discovery = google.discovery({ version: 'v1' });
export const drive = google.drive({ version: 'v3', auth: globalOAuth2Client });
export const logger = google.logging({ version: 'v2', auth: globalOAuth2Client });
export const script = google.script({ version: 'v1', auth: globalOAuth2Client });
export const serviceUsage = google.serviceusage({ version: 'v1', auth: globalOAuth2Client });
/**
 * Gets the local OAuth client for the Google Apps Script API.
 * Only the Apps Script API needs to use local credential for the Execution API (script.run).
 * @see https://developers.google.com/apps-script/api/how-tos/execute
 */
export const getLocalScript = async () => google.script({ version: 'v1', auth: localOAuth2Client });
export const scopeWebAppDeploy = 'https://www.googleapis.com/auth/script.webapp.deploy'; // Scope needed for script.run
export const defaultScopes = [
    // Default to clasp scopes
    'https://www.googleapis.com/auth/script.deployments',
    'https://www.googleapis.com/auth/script.projects',
    scopeWebAppDeploy,
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/service.management',
    'https://www.googleapis.com/auth/logging.read',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    // Extra scope since service.management doesn't work alone
    'https://www.googleapis.com/auth/cloud-platform',
];
/**
 * Requests authorization to manage Apps Script projects.
 * @param {boolean} useLocalhost Uses a local HTTP server if true. Manual entry o.w.
 * @param {ClaspCredentials?} creds An optional credentials object.
 * @param {string[]} [scopes=[]] List of OAuth scopes to authorize.
 */
export const authorize = async (options) => {
    try {
        // Set OAuth2 Client Options
        let oAuth2ClientOptions;
        if (options.creds) {
            // If we passed our own creds
            // Use local credentials
            const { client_id: clientId, client_secret: clientSecret, project_id, redirect_uris: redirectUris, } = options.creds.installed;
            console.log(LOG.CREDS_FROM_PROJECT(project_id));
            oAuth2ClientOptions = { clientId, clientSecret, redirectUri: redirectUris[0] };
        }
        else {
            // Use global credentials
            const globalOauth2ClientOptions = {
                
                clientId: '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com',
                clientSecret: 'v6V3fKV_zWU7iw1DrpO1rknX',
                //redirectUri: 'http://localhost',
                redirectUri: 'https://hello-clasp.herokuapp.com/create',


            };
            oAuth2ClientOptions = globalOauth2ClientOptions;
        }
        // Set scopes
        let scope = (options.creds
            ? // Set scopes to custom scopes
                options.scopes
            : defaultScopes);
        if (options.creds && scope.length === 0) {
            scope = defaultScopes;
            // TODO formal error
            // throw new ClaspError('You need to specify scopes in the manifest.' +
            // 'View appsscript.json. Add a list of scopes in "oauthScopes"' +
            // 'Tip:' +
            // '1. clasp open' +
            // '2. File > Project Properties > Scopes');
        }
        const oAuth2ClientAuthUrlOptions = { access_type: 'offline', scope };
        // Grab a token from the credentials.
        const token = await (options.useLocalhost ? authorizeWithLocalhost : authorizeWithoutLocalhost)(oAuth2ClientOptions, oAuth2ClientAuthUrlOptions);
        console.log(`${LOG.AUTH_SUCCESSFUL}\n`);
        // Save the token and own creds together.
        let claspToken;
        if (options.creds) {
            const { client_id: clientId, client_secret: clientSecret, redirect_uris: redirectUri } = options.creds.installed;
            // Save local ClaspCredentials.
            claspToken = {
                token,
                oauth2ClientSettings: { clientId, clientSecret, redirectUri: redirectUri[0] },
                isLocalCreds: true,
            };
        }
        else {
            // Save global ClaspCredentials.
            claspToken = {
                token,
                oauth2ClientSettings: globalOauth2ClientSettings,
                isLocalCreds: false,
            };
        }
        await DOTFILE.AUTH(claspToken.isLocalCreds).write(claspToken);
        console.log(LOG.SAVED_CREDS(Boolean(options.creds)));
    }
    catch (error) {
        if (error instanceof ClaspError) {
            throw error;
        }
        throw new ClaspError(`${ERROR.ACCESS_TOKEN}${error}`);
    }
};
export const getLoggedInEmail = async () => {
    await loadAPICredentials();
    try {
        return (await google.oauth2('v2').userinfo.get({ auth: globalOAuth2Client })).data.email;
    }
    catch {
        return;
    }
};
/**
 * Loads the Apps Script API credentials for the CLI.
 *
 * Required before every API call.
 */
export const loadAPICredentials = async (local = false) => {
    // Gets the OAuth settings. May be local or global.
    const rc = await getOAuthSettings(local);
    await setOauthClientCredentials(rc);
    return rc;
};
/**
 * Requests authorization to manage Apps Script projects. Spins up
 * a temporary HTTP server to handle the auth redirect.
 * @param {OAuth2ClientOptions} oAuth2ClientOptions The required client options for auth
 * @param {GenerateAuthUrlOpts} oAuth2ClientAuthUrlOptions Auth URL options
 * Used for local/global testing.
 */
const authorizeWithLocalhost = async (oAuth2ClientOptions, oAuth2ClientAuthUrlOptions, externalHost, res) => {
    // Wait until the server is listening, otherwise we don't have
    // the server port needed to set up the Oauth2Client.
    const server = await new Promise(resolve => {
        const s = createServer();
        enableDestroy(s);
        s.listen(0, () => resolve(s));
    });

    var host = externalHost?"https://hello-clasp.herokuapp.com/testAuth":"http://localhost";
    console.log("host:" + host);

    const { port } = server.address();
    //const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: `http://localhost:${port}` });
    const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: `${host}:${port}` });
    // TODO Add spinner
    const authCode = await new Promise((resolve, reject) => {
        server.on('request', (request, response) => {
            var _a;
            //const urlParts = new URL((_a = request.url) !== null && _a !== void 0 ? _a : '', 'http://localhost').searchParams;
            const urlParts = new URL((_a = request.url) !== null && _a !== void 0 ? _a : '', host).searchParams;
            const code = urlParts.get('code');
            const error = urlParts.get('error');
            if (code) {
                resolve(code);
            }
            else {
                reject(error);
            }
            response.end(LOG.AUTH_PAGE_SUCCESSFUL + code); // risposta su pagina 'Logged in! You may close this page.'
            
        });
        const authUrl = client.generateAuthUrl(oAuth2ClientAuthUrlOptions);
        console.log(LOG.AUTHORIZE(authUrl));

         // su host questi non funzionano, bisogna usare redirect
        if (externalHost) {
            res.redirect(authUrl);
        }
        else { 
         //(async () => open("https://www.amazon.it/"))();
         (async () => open(authUrl))();  // work ok ,only in local

         //(async () =>res.redirect(authUrl))();
         //res.redirect(authUrl);  // test su host
         //
         //var authUrl2 = "http://www.facebook.com";
         //res.send('<script>window.location.href="' + authUrl + '";</script>');
         //res.send("<script>window.open('" + authUrl2 + "', '_blank');</script>");

         
         /* (async () => {
            const browser = await launch({headless: false});
            const page = await browser.newPage();
            await page.goto(authUrl);
            //await browser.close();
          })();  */
          
        }
    });
    server.destroy();
    return (await client.getToken(authCode)).tokens;
};
/**
 * Requests authorization to manage Apps Script projects. Requires the user to
 * manually copy/paste the authorization code. No HTTP server is used.
 * @param {OAuth2ClientOptions} oAuth2ClientOptions The required client options for auth.
 * @param {GenerateAuthUrlOpts} oAuth2ClientAuthUrlOptions Auth URL options
 */
const authorizeWithoutLocalhost = async (oAuth2ClientOptions, oAuth2ClientAuthUrlOptions) => {
    const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: REDIRECT_URI_OOB });
    const authUrl = client.generateAuthUrl(oAuth2ClientAuthUrlOptions);
    console.log(LOG.AUTHORIZE(authUrl));
    // TODO Add spinner
    const authCode = await new Promise((resolve, reject) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(LOG.AUTH_CODE, (code) => {
            rl.close();
            if (code && code.length > 0) {
                resolve(code);
            }
            else {
                reject(new ClaspError('No authorization code entered.'));
            }
        });
    });
    return (await client.getToken(authCode)).tokens;
};
/**
 * Set OAuth client credentails from rc.
 * Can be global or local.
 * Saves new credentials if access token refreshed.
 * @param {ClaspToken} rc OAuth client settings from rc file.
 */
// Because of mutation:
const setOauthClientCredentials = async (rc) => {
    /**
     * Refreshes the credentials and saves them.
     */
    const refreshCredentials = async (oAuthClient) => {
        await oAuthClient.getAccessToken(); // Refreshes expiry date if required
        rc.token = oAuthClient.credentials;
    };
    // Set credentials and refresh them.
    try {
        if (rc.isLocalCreds) {
            const { clientId, clientSecret, redirectUri } = rc.oauth2ClientSettings;
            localOAuth2Client = new OAuth2Client({ clientId, clientSecret, redirectUri });
            localOAuth2Client.setCredentials(rc.token);
            await refreshCredentials(localOAuth2Client);
        }
        else {
            globalOAuth2Client.setCredentials(rc.token);
            await refreshCredentials(globalOAuth2Client);
        }
        // Save the credentials.
        await DOTFILE.AUTH(rc.isLocalCreds).write(rc);
    }
    catch (error) {
        if (error instanceof ClaspError) {
            throw error;
        }
        throw new ClaspError(`${ERROR.ACCESS_TOKEN}${error}`);
    }
};
// /**
//  * Compare global OAuth client scopes against manifest and prompt user to
//  * authorize if new scopes found (local OAuth credentails only).
//  * @param {ClaspToken} rc OAuth client settings from rc file.
//  */
// // TODO: currently unused. Check relevancy
// export async function checkOauthScopes(rc: ReadonlyDeep<ClaspToken>) {
//   try {
//     await checkIfOnline();
//     await setOauthClientCredentials(rc);
//     const {scopes} = await globalOAuth2Client.getTokenInfo(globalOAuth2Client.credentials.access_token as string);
//     const {oauthScopes} = await readManifest();
//     const newScopes = oauthScopes && oauthScopes.length > 1 ? oauthScopes.filter(x => !scopes.includes(x)) : [];
//     if (newScopes.length === 0) return;
//     console.log('New authorization scopes detected in manifest:\n', newScopes);
//     const answers = await oauthScopesPrompt();
//     if (answers.doAuth) {
//       if (!rc.isLocalCreds) throw new ClaspError(ERROR.NO_LOCAL_CREDENTIALS);
//       await authorize({useLocalhost: answers.localhost, scopes: newScopes});
//     }
//   } catch (error) {
//     if (error instanceof ClaspError) throw error;
//     throw new ClaspError(ERROR.BAD_REQUEST((error as {message: string}).message));
//   }
// }
//# sourceMappingURL=auth.js.map





// add ach
export const authorize_getUrl = async (externalHost, res, automatic) => {
   try {
      // Set OAuth2 Client Options
      let oAuth2ClientOptions;
       
      // Use global credentials
      const globalOauth2ClientOptions = {
         
         clientId: '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com',
         clientSecret: 'v6V3fKV_zWU7iw1DrpO1rknX',
         //redirectUri: 'http://localhost',
         //redirectUri: 'https://hello-clasp.herokuapp.com/create',
         redirectUri: 'https://hello-clasp.herokuapp.com/testAuth',
      };
      oAuth2ClientOptions = globalOauth2ClientOptions;
       
      // Set scopes
      /* let scope = (options.creds?options.scopes: defaultScopes);
      if (options.creds && scope.length === 0) {
         scope = defaultScopes;
      } */

      let scope = defaultScopes;   
      const oAuth2ClientAuthUrlOptions = { access_type: 'offline', scope };
      // Grab a token from the credentials.

      if (automatic)
      {
         const token = await authorizeWithLocalhost(oAuth2ClientOptions, oAuth2ClientAuthUrlOptions, externalHost, res);// ok in locale
      
      // da qui solo parte per host
//      const token = await authorizeWithoutLocalhost(oAuth2ClientOptions, oAuth2ClientAuthUrlOptions);
//      console.log('token:' + token); 

         //const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: REDIRECT_URI_OOB });
         //const authUrl = client.generateAuthUrl(oAuth2ClientAuthUrlOptions);
         
         // Save global ClaspCredentials
         let claspToken;
         claspToken = {
            token,
            oauth2ClientSettings: globalOauth2ClientSettings,
            isLocalCreds: false,
         };
         
         await DOTFILE.AUTH(claspToken.isLocalCreds).write(claspToken);
         //console.log(LOG.SAVED_CREDS(Boolean(options.creds)));

         
         console.log('*** load credential');
         await loadAPICredentials();
      
         return 'ok';
      }
      else
      {
         // inside authorize without localhost (only for url)
         const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: REDIRECT_URI_OOB });
         const authUrl = client.generateAuthUrl(oAuth2ClientAuthUrlOptions);
         return authUrl;
      }
   }
   catch (error) 
   {
       if (error instanceof ClaspError) {
           throw error;
       }
       throw new ClaspError(`${ERROR.ACCESS_TOKEN}${error}`);
   }
};




// add ach
export const convertAuthCodeInToken = async (authCode, oAuth2ClientOptions, oAuth2ClientAuthUrlOptions) => {
   try {
      const client = new OAuth2Client({ ...oAuth2ClientOptions, redirectUri: REDIRECT_URI_OOB });
      var token =  (await client.getToken(authCode)).tokens; 


      let claspToken;
      claspToken = {
         token,
         oauth2ClientSettings: globalOauth2ClientSettings,
         isLocalCreds: false,
      };      
      await DOTFILE.AUTH(claspToken.isLocalCreds).write(claspToken);
   
      console.log('*** load credential');
      await loadAPICredentials();
   

      return token;
   }
   catch (error) 
   {
       if (error instanceof ClaspError) {
           throw error;
       }
       throw new ClaspError(`${ERROR.ACCESS_TOKEN}${error}`);
   }
};

