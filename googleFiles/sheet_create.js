 function createCustomSheet(filesheet)
{
  var mainPage = filesheet.getActiveSheet();
  mainPage.setName(FileSheetMapName);

  mainPage.getRange(1,1).setValue('Gps data');
  mainPage.getRange(2,1).setValue('Id');
  mainPage.getRange(2,2).setValue('DateTime');
  mainPage.getRange(2,3).setValue('Lat');
  mainPage.getRange(2,4).setValue('Lon');
  mainPage.getRange(2,5).setValue('Elevation');
  mainPage.getRange(2,6).setValue('Description');

  var cell = mainPage.getRange(2,1,1,6);
  cell.setBorder(true, null, true, null, false, false, "red", SpreadsheetApp.BorderStyle.SOLID);


  var controlpage = filesheet.insertSheet();
  controlpage.setName(FileSheetControlName);

  //
  var range = controlpage.getRange(1,1);
  range.setValue('GPS Status');
  range.setBackground("Orange");

  range = controlpage.getRange(2,1);
  range.setValue('GPS Command');
  range = controlpage.getRange(2,2);
  range.setValue('None');
  
  
  range = controlpage.getRange(4,1);
  range.setValue('Command');
  range = controlpage.getRange(5,1);
  range.setValue('None');

  range = controlpage.getRange(4,2);
  range.setValue('State');
  range = controlpage.getRange(5,2);
  range.setValue('');

  range = controlpage.getRange('D2');
  range.setValue("Data ultima ricezione get");

  range = controlpage.getRange('D3');
  range.setValue("Data ultima ricezione post");

  range = controlpage.getRange('D4');
  range.setValue("Numero linee gps ricevute");

  range = controlpage.getRange('D5');
  range.setValue("Elapsed");

  range = controlpage.getRange('D6');
  range.setValue("Stato dispositivo");

  range = controlpage.getRange('A10');
  range.setValue("Gps Parameters");
  range.offset(1,0).setValue("Stop[min]");
  range.offset(1,1).setValue("Step[sec]");

  range = controlpage.getRange('A15');
  range.setValue("Gps Parameters Input");
  range.offset(1,0).setValue("Stop[min]");
  range.offset(1,1).setValue("Step[sec]");

  range = controlpage.getRange('A20');
  range.setValue("Add new network");
  range.offset(1,0).setValue("SSID");
  range.offset(1,1).setValue("Pwd");

  range = controlpage.getRange('A25');
  range.setValue("Delete network by index");
  range.offset(1,0).setValue("Index");
  

  range = controlpage.getRange('A30');
  range.setValue("Friends networks");
  range.offset(1,0).setValue("SSID");
  range.offset(1,1).setValue("Pwd");



  var historypage = filesheet.insertSheet();
  historypage.setName(FileSheetHistoryName);

  range = historypage.getRange('A1');
  range.setValue("History Files");
  range.offset(1,0).setValue("Path");
  range.offset(1,1).setValue("Start");
  range.offset(1,2).setValue("Stop");

}
