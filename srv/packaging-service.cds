service PackagingFinshCalculation {

     action uploadFile( payload : array of fileUpload) returns array of resultMessage;
     action loadFinishedGoods(uName: String, material: array of savePay) returns resultMessage;
     function userInfoUAA() returns String;
     action fetchFinishedGoods(uName: String) returns resultMessage;
      action runFinishedGoods(uName: String) returns resultMessage;

type savePay:{
    Site_ID : String;
    Finished_Good_ID: String;
    Finished_Good_Weight:Decimal
 }

 type fileUpload : {
    data       : LargeString;
 }
 type resultMessage:{
    Status:String;
    Message:String;
  }
}