var GpsStatusArr = ['', 'Active', 'Pause', 'Stopped', 'Uploading', 'StopOver'];
 
var scriptPrp = PropertiesService.getScriptProperties();


function getData() 
{
  var sheet = getSheetMap();

  var rangeStart = getRangeFromText(sheet,"Id");

  if(rangeStart.offset(1,0).isBlank())
  {
    Logger.log('exit');
    return null;
  }

  var values = sheet.getRange(rangeStart.getRowIndex()+1,
                              rangeStart.getColumnIndex(), 
                              sheet.getLastRow()-rangeStart.getRowIndex(), 
                              6).getValues();

  Logger.log(values[0]);
  return values;

}

function getDataNetworks()
{
  var sheetN = getSheetControl();

  var rangeTitle = getRangeFromText(sheetN, "Friends networks");

  var values = sheetN.getRange(rangeTitle.getRowIndex()+2, rangeTitle.getColumnIndex(), sheetN.getLastRow()-rangeTitle.getRowIndex() -1, 2).getValues();

  //values[0][0]= 'sda';values[0][1]= 'sda';
  //values[0][0] = "'" +  values[0][0].toString() + "'";
  //values[1][0]= '';//toString
  Logger.log(values);

  return values;
}

function getDataPath() 
{
  var sheet = getSheetPath("Path_2022-03-13");

  var rangeStart = getRangeFromText(sheet,"DateTime");

  var values = sheet.getRange(rangeStart.getRowIndex()+1, rangeStart.getColumnIndex(), sheet.getLastRow()-rangeStart.getRowIndex(), 4).getValues();
  Logger.log(values[0]);
  return values;
}

function getDataGps()
{
  var sheetN = getSheetControl();
  var range = getRangeFromText(sheetN, "Gps Parameters");
  var gpsParameters = range.offset(2, 0, 1, 2).getValues();
  Logger.log(gpsParameters[0]);
  return gpsParameters[0];
}

function gui_getStatus()
{
  var sheetN = getSheetControl();
  var rngStatusDevice = getRangeFromText(sheetN, "Stato dispositivo");
  var rngStatusGPS = getRangeFromText(sheetN, "GPS Status");
  
  var statusArray = [];
  statusArray.push(rngStatusDevice.offset(0,1).getValue());
  statusArray.push(rngStatusGPS.offset(0,1).getValue());
  Logger.log(statusArray);
  return statusArray;
}


function include(filename) 
{
  return HtmlService.createHtmlOutputFromFile(filename).getContent();

}
 
function getScriptUrl() 
{
  var url = ScriptApp.getService().getUrl();
  Logger.log(url);
  return url;
}

function showInfoDevice(sheet,getOrPost)
{
  var dtNow = new Date();
  var now = Utilities.formatDate(dtNow, "GMT+1", "yyyy-MM-dd HH:mm:ss");
  
  var rangeLastGet;
  if (getOrPost)
  {
    rangeLastGet = getRangeFromText(sheet, "Data ultima ricezione get");  
  }
  else
  {
    rangeLastGet = getRangeFromText(sheet, "Data ultima ricezione post");  
  }
  rangeLastGet.offset(0,1).setValue(now);
 

//  var lastGet = rangeLastGet.offset(0,1).getValue();
//  var elapsedFromLastGet = (dtNow.getTime() - lastGet.getTime())/100;
//  getRangeFromText(sheet, "Elapsed").offset(0,1).setValue(elapsedFromLastGet); 
   
}

// command name and command state
function setCommandCell(value)
{
  var sheet = getSheetControl();
  var rangeCmd = getRangeFromText(sheet, "Command");  
  rangeCmd.offset(1,0).setValue(value);

  clearResult();

  setStateCommand("");
}

function getCommandCell()
{
  var sheet = getSheetControl();
  var rangeCmd = getRangeFromText(sheet, "Command");  
  var val = rangeCmd.offset(1,0).getValue();
  return val;
}

function setStateCommand(value)
{
  var sheet = getSheetControl();
  var rangeCmd = getRangeFromText(sheet, "State");  
  rangeCmd.offset(1,0).setValue(value);
}

function getStateCommand()
{
  var sheet = getSheetControl();
  var rangeCmd = getRangeFromText(sheet, "State");  
  var val = rangeCmd.offset(1,0).getValue();
  return val;
}
 
function getCommandParameters(objParams, strTitle)
{
  var sheet = getSheetControl();
  var rangeParam1 = getRangeFromText(sheet, strTitle);  
  objParams.parameter1 = rangeParam1.offset(2,0).getValue();  // param1
  objParams.parameter2 = rangeParam1.offset(2,1).getValue();  // param2
}

function clearResult()
{
  var sheetN = getSheetControl();

  var rngFn = getRangeFromText(sheetN, "Friends networks");
  var rngGps = getRangeFromText(sheetN, "Gps Parameters");

  rngFn.offset(2,0).setValue("");
  rngFn.offset(2,1).setValue("");
  rngGps.offset(2,0).setValue("");
  rngGps.offset(2,1).setValue("");
}

function checkForDoneCommand()
{
  return (getStateCommand() == "done");
}

function getCommandGPSCell()
{
  var sheetN = getSheetControl();
  var rangeCmd = getRangeFromText(sheetN, "GPS Command");  
  var val = rangeCmd.offset(0, 1).getValue();
  return val;
}

function setCommandGPSCell(value)
{
  var sheetN = getSheetControl();
  var rangeCmd = getRangeFromText(sheetN, "GPS Command");  
  rangeCmd.offset(0, 1).setValue(value);
}


function getDay()
{
  var sheetM = getSheetMap();
  var rangeDt = getRangeFromText(sheetM, "DateTime");
  var dt = rangeDt.offset(1,0).getValue();
  
  var strDate = dt.split('T');
  return strDate[0];
}

function clearNetworkFriends()
{
  var sheetN = getSheetControl();
  // clean precs values
  for (var i = 0; i < 20; i++)
  {
    rangeSSID = getRangeFromText(sheetN, "Friends networks");

    var test = rangeSSID.offset(2+i,0).getValue();
    
    rangeSSID.offset(2+i,0).setValue("");
    rangeSSID.offset(2+i,1).setValue("");

    if (test == "")
    {
      break;
    }
  }
}

function doGet(e)
{
  var sheetN = getSheetControl();

  showInfoDevice(sheetN, true);
 
  var event = e.parameter.event;
  if (event == "start")
  {
    return ContentService.createTextOutput("GPS0");
  }
  if (event == "ok")
  {
    setStateCommand("done");
    return ContentService.createTextOutput("OK");
  }
  
  if (event == "arc")
  {
    //storePath();

    ScriptApp.newTrigger("storePath")
      .timeBased()
      .after(5 * 1000)
      .create();

    return ContentService.createTextOutput("OK");
  }

  if (event == "crf")
  {
    
    var strReturn = "";

    if (!checkSheetFileExists() || getSheetId() == null) 
    {
      // create file
      deleteFileDrive(SheetFileName);

      var id = createFileSheet(SheetFileName); 

      sheetProps.setProperty('sheetId', id);

      strReturn = "create sh file with Id:" + id;
    }     
    else
    {
      strReturn = "sh file exists";    
    }

    return ContentService.createTextOutput(strReturn);   
  }

  if (event == "upd")
  {
    var status = e.parameter.status;
    var rangeStGps = getRangeFromText(sheetN, "GPS Status");
    rangeStGps.offset(0, 1).setValue(GpsStatusArr[status]);


    if (getCommandCell() == "Pause" && getStateCommand() == "")
    {
      setStateCommand("");

      setCommandCell("none");
      
      //clearNetworkFriends();

      return ContentService.createTextOutput("req-pse");
    }


    if (getCommandCell() == "ShowNets" && getStateCommand() == "")
    {
      setStateCommand("processing");
      
      clearNetworkFriends();

      return ContentService.createTextOutput("req-sn");
    }
    if (getCommandCell() == "AddNet" && getStateCommand() == "")
    {
      setStateCommand("processing");

      var objParams = {
        parameter1: "-",
        parameter2: "-"
      }
      getCommandParameters(objParams, "Add new network");
          
      //setStateCommand("done");
      return ContentService.createTextOutput("req-an:" + objParams.parameter1 + " " +  objParams.parameter2);
    }
    if (getCommandCell() == "RemoveNet" && getStateCommand() == "")
    {
      setStateCommand("processing");
      

      var sheet = getSheetControl();
 
      // clean precs values
      //clearNetworkFriends();


      var rangeParam1 = getRangeFromText(sheet, "Index");  
      var indexToDel = rangeParam1.offset(1,0).getValue();
          
      //setStateCommand("done");
      return ContentService.createTextOutput("req-dn:" + indexToDel);
    }
    if (getCommandCell() == "UpdateGps" && getStateCommand() == "")
    {
      setStateCommand("processing");

      var objParams = {
        parameter1: "-"
      }
      getCommandParameters(objParams, "Gps Parameters Input");
          
      return ContentService.createTextOutput("req-ug:" + objParams.parameter1 + " " +  objParams.parameter2);
    }
    if (getCommandCell() == "RefreshGps" && getStateCommand() == "")
    {
      setStateCommand("processing");

      return ContentService.createTextOutput("req-rg");
    }

    // commands gps
    var gpsCommand = getCommandGPSCell();
    if (gpsCommand == "Start")
    {
      setCommandGPSCell("None");
      return ContentService.createTextOutput("S:1");  // active
    }
    if (gpsCommand == "Stop")
    {
      setCommandGPSCell("None");
      return ContentService.createTextOutput("S:3");  // stop
    }

    return ContentService.createTextOutput("no-upd");
  }
  var page = e.parameter['page'];

  //getRangeFromText(sheetN, "Test").offset(1,0).setValue(page);
  //getRangeFromText(sheetN, "Test").offset(2,0).setValue(e);
  if (!page) 
  {
     
    return HtmlService.createHtmlOutputFromFile('index_gmaps').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createHtmlOutputFromFile(page).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}



function doPost(e)
{ 
  try
  {
    var sheetM = getSheetMap();
    var sheetN = getSheetControl();

    showInfoDevice(sheetN, false);

    var firstChar = e.postData.contents.substring(0,1);
    if (firstChar != '{') // csv
    {
      var rangeStGps = getRangeFromText(sheetN, "GPS Status");
      rangeStGps.offset(0, 1).setValue("Uploading");

      Logger.log('csv')
      
      var range = getRangeFromText(sheetM, "Id");
   
      var csv = Utilities.parseCsv(e.postData.contents, ";");
      range = range.offset(1,0);
      var lastRow = sheetM.getLastRow();
      
      // check date
      // if arrival date is before last date, send last date as info
      var arrivalDateIso = csv[0][1];

      var arrivalDate = new Date(arrivalDateIso).getTime();
      
      var lastDateIso = sheetM.getRange(lastRow, 2).getValue();        
      var lastDateArrived = new Date(lastDateIso).getTime();
      if (lastRow==2) {  // empty table
        lastDateArrived = 0;
      }
       
       

      //range.offset(1,8).setValue("arrival:" + arrivalDateIso + "lastDate" + lastDateArrived );

      if (arrivalDate > lastDateArrived || ( arrivalDate == lastDateArrived && csv[0][0] > sheetM.getRange(lastRow, 1).getValue()))
      {
        scriptPrp.setProperty('counter', 0);

        sheetM.getRange(lastRow+1, range.getColumnIndex(), csv.length, csv[0].length).setValues(csv);
        
        // update stats
        var rangeLines = getRangeFromText(sheetN, "Numero linee gps ricevute");
        rangeLines.offset(0, 1).setValue(csv.length-1);
         

        return ContentService.createTextOutput("csvok " + (csv.length));
      }
      else
      {
        var counter = scriptPrp.getProperty('counter');
        counter++;
        scriptPrp.setProperty('counter', counter);

        sheetM.getRange(1,10).setValue(counter);
        
        var indexGps = sheetM.getRange(lastRow, 1).getValue();
        return ContentService.createTextOutput("csvbef " + indexGps + ";" + lastDateIso);
      }
    }
 
    var parsedData = JSON.parse(e.postData.contents);
   
    if (parsedData.networks != null)
    {
      
      var sheetN = getSheetControl();
       
      
      var len = parsedData.networks.length;
      for (var i = 0; i < len; i++)
      {
        var name = parsedData.networks[i].name;
        var pwd = parsedData.networks[i].pwd;
        rangeSSID = getRangeFromText(sheetN, "Friends networks");
        rangeSSID.offset(2+i,0).setValue(name);
        rangeSSID.offset(2+i,1).setValue(pwd);
      }
      setStateCommand("done");
      return ContentService.createTextOutput("post-n");    
    }

    if (parsedData.gpsConfig != null)
    {
      var sheetN = getSheetControl();
      var rangeGps = getRangeFromText(sheetN, "Gps Parameters");
      rangeGps.offset(2, 0).setValue(parsedData.gpsConfig.stop);
      rangeGps.offset(2, 1).setValue(parsedData.gpsConfig.step);

      setStateCommand("done");
      return ContentService.createTextOutput("post-c");
    }

    //var csvraw = res.getContentText()
    //var csv = Utilities.parseCsv(csvraw)

    return ContentService.createTextOutput("post ok");
  }
  catch(f)
  {
    return ContentService.createTextOutput("Error in parsing request body: " + f.message);
  }
}
 
function sandBox_main()
{


  var url2 = ScriptApp.getService().getUrl();
  var url = ScriptApp.getProjectKey();
  
  var a1 = getScriptUrl();

  Logger.log(a1);

  var a = getCommandCell();
  Logger.log(a);

  var b = getStateCommand();
  Logger.log(b);

  return;
 
}
