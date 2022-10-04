

function showParameters() 
{ 
  var sheetN = getSheetControl();

  setStateCommand("");

  var rangeGps = getRangeFromText(sheetN, "Gps Parameters");

  rangeGps.offset(2, 0).setValue("");
  rangeGps.offset(2, 1).setValue("");

  setCommandCell("RefreshGps");
  
}

function setParameters(gpsStop, gpsStep) 
{ 
  Logger.log(arguments.length);

  if (arguments.length == 2)
  {
    var sheet = getSheetControl();
    var rangeParam = getRangeFromText(sheet, "Gps Parameters Input");  

    rangeParam.offset(2,0).setValue(gpsStop);
    rangeParam.offset(2,1).setValue(gpsStep);
    Logger.log('inside');
  }
  Logger.log('outside')
   
  setStateCommand("");
  setCommandCell("UpdateGps");
}


function showNetworks() 
{ 
  setStateCommand("");///
  clearNetworkFriends();
  setCommandCell("ShowNets");
  //setStateCommand("");
}

function addNetwork(name, pwd) 
{ 
  if (arguments.length == 2)
  {
    var sheet = getSheetControl();
    var rangeParam = getRangeFromText(sheet, "Add new network");  

    rangeParam.offset(2,0).setValue(name);
    rangeParam.offset(2,1).setValue(pwd);
  }

  setStateCommand("");
  clearNetworkFriends();
  setCommandCell("AddNet");
}

function deleteNetwork(index) 
{ 
  if (arguments.length == 1)
  {
    var sheet = getSheetControl();
    var rangeParam = getRangeFromText(sheet, "Delete network by index");  

    rangeParam.offset(2,0).setValue(index);
  }

  setStateCommand("");
  clearNetworkFriends();
  setCommandCell("RemoveNet");
}

function pause() 
{  
  setStateCommand("");
  setCommandCell("Pause");
  //setStateCommand("");
 
}

function sandBox()
{
  setParameters(1,2);
}

