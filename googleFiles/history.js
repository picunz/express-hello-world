function storePath()
{
  var stringNow = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd");

  var sheetName = "Path_" + stringNow;


  // check exist
  var i = 1;
  while(1)
  {
    var sn = getSheetPath(sheetName);
    Logger.log(sn);
    if (sn==null)
    {
      break;
    }
    else{
      sheetName = sheetName + "_" + i++;
    }
  }
  
  var newSheet = createSheet(sheetName);
  
  var sheetM = getSheetMap();
  var range = sheetM.getDataRange();
  
  range.copyTo(newSheet.getRange(1,1));
  
}

function getAllPath() 
{
  var sheetFile = SpreadsheetApp.openById(FileSheetId);
  
  var num = sheetFile.getNumSheets();
  Logger.log(num);  

  var sheetH = getSheetHistory();
  var range = getRangeFromText(sheetH, "History Files");
  

  var pathSheet = [];
  var sheets = sheetFile.getSheets();
  var ip = 0;
  for (var i = 0; i < num; i++)
  {
    var sn = sheets[i].getName();
    if (sn.startsWith("Path_"))
    {
      pathSheet.push(sn);
      range.offset(1 + ip++,0).setValue(sn);
    }
  }
  Logger.log(pathSheet);
  return pathSheet;
}




function getDataHistory()
{

  var sheetH = getSheetHistory();

  var rangeTitle = getRangeFromText(sheetH, "History Files");

  var values = sheetH.getRange(rangeTitle.getRowIndex()+1, rangeTitle.getColumnIndex(), sheetH.getLastRow()-rangeTitle.getRowIndex(), 1).getValues();
  Logger.log(values);

  return values;
}

