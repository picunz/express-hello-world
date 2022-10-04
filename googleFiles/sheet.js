var sheetProps = PropertiesService.getScriptProperties();

var FileSheetId = "1xD2MTdAegLY62oKCoNdis24482eohhcHwbcEuTsH2Yg";  // preloaded
var SheetFileName = "trackerFile.x";

var FileSheetMapName =     "Map";
var FileSheetControlName = "Control";
var FileSheetHistoryName = "History";


//var file = DriveApp.getFileById(id);

function sys_setIDtoProps()
{
  sheetProps.setProperty('sheetId', FileSheetId);
}


function getRangeFromText(sheet, name)
{ 
  var rows = sheet.getDataRange();
   
  var values = rows.getValues();

  for (var i = 0; i <= rows.getNumRows() - 1; i++) 
  {
    var row = values[i];
    var found = row.indexOf(name);
    if (found != -1)
    {
      return sheet.getRange(i+1, found+1);
    }
  }
  return -1;
}

////


function createFileSheet(filename)
{
  var filesheet = SpreadsheetApp.create(filename);
  var url = filesheet.getUrl();
  Logger.log(url);

  var id = filesheet.getId();
  Logger.log(id);

  createCustomSheet(filesheet);

 
  return id;
}

function checkSheetFileExists()
{
  var file = DriveApp.getFilesByName(SheetFileName);
  var exists = file.hasNext();  
  return exists;
}


function getSheetId()
{
  return sheetProps.getProperty('sheetId');
}


function openSheet(stringPage)
{
  //var sheetId = sheetProps.getProperty(FileSheetId);
  var sheetId = sheetProps.getProperty('sheetId');
  //Logger.log(sheetId);

  if (sheetId == null) {
    return null;
  }

  var sheetFile = SpreadsheetApp.openById(sheetId);

  var sheet = sheetFile.getSheetByName(stringPage);
 
  return sheet;
}

// public functions

function createSheet(sheetname) // used in history
{
  var sheetFile = SpreadsheetApp.openById(FileSheetId);
  
  newSheet = sheetFile.insertSheet();
  newSheet.setName(sheetname);
  
  var num = sheetFile.getNumSheets();
  Logger.log(num);
  sheetFile.moveActiveSheet(num)

  return newSheet;
}



function getSheetControl()
{
  var sheet = openSheet(FileSheetControlName);
  return sheet;
}

function getSheetMap()
{
  var sheet = openSheet(FileSheetMapName);
  return sheet;
}

function getSheetHistory()
{
  var sheet = openSheet(FileSheetHistoryName);
  return sheet;
}

function getSheetPath(name)
{
  var sheet = openSheet(name);
  return sheet;
   
}

// sand box

function sandBoxSheet()
{
   

  deleteFileDrive(SheetFileName);
 // return;

  //var name = file.next().getName();

  

  var id = createFileSheet(SheetFileName);

  
  sheetProps.setProperty('sheetId', id);

  return;

  var sheet = getSheetMap();
  
  var r = getRangeFromText(sheet,"Id");
  var v = r.getValue();
  Logger.log(v);

    //var sh = SpreadsheetApp.create("test");
    //var url = sh.getUrl();

    //var sheet.getRange(i+1, found+1);
    //var rangeStart = getRangeFromText(sh,"Id");

    //Logger.log(url);
}
 


