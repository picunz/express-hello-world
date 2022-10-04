function checkConnectionState() 
{
  var now = new Date();

  var sheetN = getSheetControl();
  var lastGet = getRangeFromText(sheetN, "Data ultima ricezione get").offset(0, 1).getValue();
  var lastPost = getRangeFromText(sheetN, "Data ultima ricezione post").offset(0, 1).getValue();

/*
  var elapsedFromLastGet = now.getTime() - lastGet.getTime();
  var elapsedFromLastPost = now.getTime() - lastPost.getTime();

  var rangeState = getRangeFromText(sheetN, "Stato dispositivo");
  rangeState = rangeState.offset(0, 1);
  if (elapsedFromLastGet < 15000 || elapsedFromLastPost < 15000)
  {
    rangeState.setValue("Connected");
    Logger.log("Connect");
  }
  else
  {
    rangeState.setValue("Disconnected");
    Logger.log("Disconnect");
  }
  */

}
