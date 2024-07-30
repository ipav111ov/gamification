function getValuesFromSS() {
  const isTest = false
  const link = isTest ? '1Rt1thxsbOLpjp7Pp9vCsmm_OkMDEyA9m' : '1Kot2mBZytjeS2NkAFpfOIpAKNJjouj3y'
  const folder = DriveApp.getFolderById(link);
  const files = folder.getFiles();
  let result = [];
  while (files.hasNext()) {
    const file = files.next();
    let currentValues = SpreadsheetApp.openById(file.getId()).getSheets()[0].getDataRange().getValues()
    currentValues = currentValues[1][0] == '' ? currentValues.slice(2) : currentValues.slice(1)
    result = result.concat(currentValues)
  }
  return result;
}



