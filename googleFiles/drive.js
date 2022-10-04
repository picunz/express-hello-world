var WorkingFolderTest = "TrackerTest";

function createFolderDrive(folderName)
{
  var folders = DriveApp.getFoldersByName(folderName);
  
  if (!folders.hasNext()) 
  {
    return folder = DriveApp.createFolder(folderName);
  }
  else
  {
    return folders.next();
  }
}

function getNumberOfFilesInFolder(folderName)
{
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) 
  {
    var folder = folders.next();
    var files = folder.getFiles();
    
    var count = 0;

    while (files.hasNext()) 
    {
      count++;
      file = files.next();
    }

     
    return count;
  }
  else return -1;
}
 

function deleteFileDrive(folderName, fileName)
{
  var folders = DriveApp.getFoldersByName(folderName);
  
  if (!folders.hasNext()) 
  {
    return;
  }   
  var folder = folders.next();

  //check file exists
  var file = folder.getFilesByName(fileName);
  var exist = file.hasNext();
 
  if (exist)
  {
    file.next().setTrashed(true);
  }
}


function deleteFileDrive(filename)
{
   
  var file = DriveApp.getFilesByName(filename);
  var exist = file.hasNext();
  if (exist)
  {
    file.next().setTrashed(true);
  }
}
