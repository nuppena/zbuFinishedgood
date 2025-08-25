sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "pcf/com/acc/packaging/finishedgoods/service/odataHelper",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller,BusyIndicator,MessageBox,odataHelper,Filter,FilterOperator) => {
    "use strict";

    return Controller.extend("pcf.com.acc.packaging.finishedgoods.Packaging", {
        onInit() {
          var that=this;
          this.userID="demoTestUser";
          this.PackagingState = this.getOwnerComponent().getState("Packaging");
         this.PackagingService = this.getOwnerComponent().getService("Packaging");
         this.oGlobalBusyDialog = new sap.m.BusyDialog(); 
          if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
        sap.ushell.Container.getServiceAsync("UserInfo").then(function(oUserInfo) {
            if (oUserInfo) {
                var uID = oUserInfo.getId(); // Get the user's ID
                //console.log("Logged-in BTP user ID:", sUserId);

                // You can also retrieve other user details:
                that.userID = oUserInfo.getEmail();
                // var sFirstName = oUserInfo.getFirstName();
               // var sFullName = oUserInfo.getShellUserInfo().getFullName();

                //console.log("Logged-in BTP user ID details:", sUserId +":"+sEmail);
              that.onAPIExecute();
            }
        }).catch(function(oError) {
            console.error("Error getting UserInfo service:", oError);
        });
    } else {
        console.warn("SAP Fiori Launchpad shell services not available. User information may not be accessible.");
    }
   
        },
        onDownloadTemplate: function(){
            var fileName = "Finished_Goods.xlsx";
            //  var sURL = sap.ui.require.toUrl(`zbue0004_massresui/DownloadTemplate/${fileName}`);
          var sURL = sap.ui.require.toUrl(`pcf/com/acc/packaging/finishedgoods/DownloadTemplate/${fileName}`);
            // var sURL = `./DownloadTemplate/${fileName}`;
            const oA = document.createElement("a");
            oA.href = sURL;
            oA.style.display = "none";
            document.body.appendChild(oA);
            oA.click();
            document.body.removeChild(oA);
        },
        onFileSelected: function (oEvent) {
            const oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                this._selectedFile = oFile;
            }
        },
        loadXLSXLibrary: function () {
          return new Promise(function (resolve, reject) {
              if (window.XLSX) {
                  resolve();
                  return;
              }
       
              var script = document.createElement("script");
              script.src = jQuery.sap.getModulePath("pcf.com.acc.packaging.finishedgoods.lib", "/xlsx.full.min.js");
              script.onload = function () {
                  resolve();
              };
              script.onerror = function () {
                  reject("Failed to load XLSX library");
              };
       
              document.head.appendChild(script);
          });
      },      
        onUploadFile: function () {
            if (!this._selectedFile) {
                sap.m.MessageToast.show("Please select a file first.");
                return;
            }
           // this._uploadFileExecute();
          
            const requiredFields = ["Site ID", "Finished Good ID", "Finished Good Weight(kg)"];
            const that = this;
            this.loadXLSXLibrary().then(function () {
             // var file = oEvent.getParameter("files")[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, { type: "binary" });
                var sheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[sheetName];
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
         
                // ✅ Check if Excel is completely empty or has only headers
                if (!jsonData || jsonData.length === 0) {
                    MessageBox.error("Please fill all the mandatory fields.");
                    that.getView().getModel("excelData").setData({ results: [] });
                    return;
                }
         
                let invalidRowIndexes = [];
         
                jsonData.forEach((row, index) => {
                    let isValid = requiredFields.every(field => row[field] && row[field].toString().trim() !== "");
                    if (!isValid) {
                        // Excel row numbers start at 2 (1 for header)
                        invalidRowIndexes.push(index + 2);
                    }
                });
         
                if (invalidRowIndexes.length > 0) {
                    MessageBox.error(
                        "Please fill all the mandatory fields.\nMissing fields Row Numbers: " + invalidRowIndexes.join(", ")
                    );
                    that.getView().getModel("excelData").setData({ results: [] });
                    return;
                }
         
                // All rows are valid — bind to model
                // var oModel = new sap.ui.model.json.JSONModel();
                // oModel.setData({ results: jsonData });
                // that.getView().setModel(oModel, "excelData");
         
                // MessageBox.success("File uploaded and validated successfully.");
                that.getOwnerComponent().getModel("locModel").setProperty("/excelData",jsonData);

                 if(jsonData || jsonData.length > 0){
                  that.onSaveChanges();
                  }

                if (that._oUploadDialog) {
                    that._oUploadDialog.close();
                }
            };
         
            reader.readAsBinaryString(that._selectedFile);
          }).catch(function (error) {
            console.error(error);
        });
          },
         
        onOpenUploadDialog: function () {
         const _getFileUploader= this.getView().byId('fileUploaderDialog');
         if(_getFileUploader){
          _getFileUploader.clear();
          this._selectedFile="";
         }
            if (!this._oUploadDialog) {
                this._oUploadDialog = new sap.m.Dialog({
                    title: "Upload Excel File",
                    contentWidth: "400px",
                    content: [
                        new sap.ui.unified.FileUploader({
                            id: this.createId("fileUploaderDialog"),
                            name: "upload",
                            fileType: ["xlsx", "csv"],
                            change: this.onFileSelected.bind(this)
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Upload",
                        press: this.onUploadFile.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this._oUploadDialog.close();
                        }.bind(this)
                    })
                });
            }
        
            this._oUploadDialog.open();
        },

        handleTxtFilter: function(oEvent) {
          const sQuery = oEvent.getParameter("query").trim();
        if (!sQuery) {
          this.byId("ftable").getBinding("rows").filter([]);
          return;
        }
    
        const aFilters = [
          new Filter("Site ID", FilterOperator.Contains, sQuery),
          new Filter("Finished Good ID", FilterOperator.Contains, sQuery),
          new Filter("Error Status", FilterOperator.Contains, sQuery),
          // new Filter("Short Description", FilterOperator.Contains, sQuery),
          // new Filter("Spend Currency Unit", FilterOperator.Contains, sQuery),
          // new Filter("Weight Unit", FilterOperator.Contains, sQuery)
        ];
    
        // Handle numeric inputs for materialid, spendinmillions, weight
        const fNum = parseFloat(sQuery);
        if (!isNaN(fNum)) {
          aFilters.push(
            new Filter("Finished Good Weight(kg)", FilterOperator.EQ, fNum),
            new Filter("Emission Intensity", FilterOperator.EQ, fNum),
            new Filter("Emission Allocated to Final Good(Kgco2e)", FilterOperator.EQ, fNum)
          );
        }
    
        const oMultiFilter = new Filter({
          filters: aFilters,
          and: false // OR logic
        });
    
        this.byId("ftable").getBinding("rows").filter(oMultiFilter);
      },


        onSaveChanges: function () {
          const that = this;
            //const oModel = this.getView().getModel("excelData");
            var exData = this.getOwnerComponent().getModel("locModel").getProperty("/excelData");
             var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ results: exData });

            if (!oModel || !oModel.getData().results || oModel.getData().results.length === 0) {
                MessageBox.warning("No data available to save.");
                return;
            }

            const aData = oModel.getData().results;

           
            const matPost = [];
            for(let i=0;i<aData.length;i++){
            
              matPost.push({
            "Site_ID": aData[i]['Site ID'],
            "Finished_Good_ID": aData[i]['Finished Good ID'],     
            "Finished_Good_Weight":aData[i]['Finished Good Weight(kg)'],
              });
            }
            
            const savePayload = {
              "uName": this.userID,
              "material":matPost
            }

            this.oGlobalBusyDialog.open();     
      var oModel1 = this.getOwnerComponent().getModel();
           
          odataHelper.postData(oModel1, "/loadFinishedGoods", savePayload)
               .then((oData) => {
                
                  if(oData.loadFinishedGoods.Status == "200"){
                    that.onRunExecute();
                  }
                  if(oData.loadFinishedGoods.statusCode == 502){
                    let errMessag = oData.loadFinishedGoods.reason.response.body.error;
                    MessageBox.error(errMessag.split(":")[1]+":"+errMessag.split(":")[2]);
                    this.oGlobalBusyDialog.close();
                  }
                 
              })
              .catch((oError) => {
                    // Handle the error
                    console.error("Error reading data:", oError);
                    this.oGlobalBusyDialog.close();
                    // Display an error message, etc.
                });
         
          
          
            // Convert JSON data to Excel sheet
            // const worksheet = XLSX.utils.json_to_sheet(aData);
            // const workbook = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(workbook, worksheet, "Updated Data");

            //  download of the updated Excel file
            //XLSX.writeFile(workbook, "Updated_PackagingData.xlsx");

            //MessageBox.success("Changes saved successfully!");
        },
        onRunExecute: function(){
          const that = this;
        var oModel1 = this.getOwnerComponent().getModel();

         const runPayload = {
              "uName": this.userID
            }
         
        odataHelper.postData(oModel1, "/runFinishedGoods", runPayload)
             .then((oData) => {

             // console.log("RUN PAYLOAD" + oData.saveData.result );

              if(oData.runFinishedGoods.Message.result == "Batch emission values updated successfully."){
                 that.onAPIExecute();
             }
             
            })
            .catch((oError) => {
                  // Handle the error
                  console.error("Error reading data:", oError);
                  that.oGlobalBusyDialog.close();
                  // Display an error message, etc.
              });

        },
        onAPIExecute: function () {
          const that = this;
          this.byId("ftable").setEnableBusyIndicator(true);
          var oModel1 = this.getOwnerComponent().getModel();

          const fetchPayload = {
              "uName": this.userID
            }
               
              odataHelper.postData(oModel1, "/fetchFinishedGoods", fetchPayload)
                    // .then(function(oData)=> {
                    //     // Handle successful data retrieval
                    //     console.log("Data received:", oData);
                    //     // Example:  Bind the data to a control
                    //     // this.getView().byId("myTable").setModel(new sap.ui.model.json.JSONModel(oData));
                    // })
                    .then((oData) => {
                      // Arrow function preserves 'this'
                      var aTableData = oData.fetchFinishedGoods.Message.result;
                      // aTableData.forEach(row => {
                      //   const match = row.top_activity_ids.find(item => item.result_id === row.active_result_id);
                      //   row.mapped_activity_id = match ? match.activity_id : null;
                      // });
                      var oModel = new sap.ui.model.json.JSONModel({ results: aTableData });
    
                      // Set to a named model
                      this.getView().setModel(oModel, "excelData");
                      //this.getView().byId("table").setModel(new sap.ui.model.json.JSONModel(oData));
                     // this.getView().byId("smartTable").rebindTable();
                      this.getView().getModel().refresh(true);
                      this.oGlobalBusyDialog.close();
                      this.byId("ftable").setEnableBusyIndicator(false);
                  })
                  .catch((oError) => {
                        // Handle the error
                        console.error("Error reading data:", oError);
                        // Display an error message, etc.
                        this.oGlobalBusyDialog.close();
                        this.byId("ftable").setEnableBusyIndicator(false);
                    });
         // this._chkFile().then(function () {
            //return that._uploadFileExecute();
         // });
        },
        onImportExcel: function () {
            var oFileUploader = this.byId("fileUploader");
            if (oFileUploader) {
                // Access native file input element safely
                var oFileInput = oFileUploader.getFocusDomRef();
                if (oFileInput) {
                    oFileInput.click();
                } else {
                    // Use jQuery fallback (works reliably after rendering)
                    setTimeout(() => {
                        oFileUploader.$().find("input[type='file']").trigger("click");
                    }, 0);
                }
            }
        },
        
          
      //   onFileSelected: function (oEvent) {
      //     var file = oEvent.getParameter("files")[0];
      //     if (file) {
      //         var reader = new FileReader();
      //         reader.onload = function (e) {
      //             var data = e.target.result;
      //             var workbook = XLSX.read(data, { type: "binary" });
      //             var sheetName = workbook.SheetNames[0];
      //             var worksheet = workbook.Sheets[sheetName];
      //             var jsonData = XLSX.utils.sheet_to_json(worksheet);
     
                 
      //             var requiredFields = ["Site ID", "Finished Good ID", "Packaging ID"];
      //             var isValid = jsonData.every(row =>
      //                 requiredFields.every(field => row[field] && row[field].toString().trim() !== "")
      //             );
     
      //             if (!isValid) {
      //                 MessageBox.error("Please fill all the mandatory fields.");
      //                 return;
      //             }
     
                 
      //             var oModel = new sap.ui.model.json.JSONModel();
      //             oModel.setData({ results: jsonData });
      //             // this.getView().setModel(oModel, "excelData");
     
      //             console.log("Parsed Excel Data:", jsonData);
      //         }.bind(this);
      //         reader.readAsBinaryString(file);
      //     }
      // },
          onExecute: function () {
            const that = this;
            this._chkFile().then(function () {
              return that._uploadFileExecute();
            });
          },
          _chkFile: function () {
             const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const oFile = this._getFileUploader().oFileUpload.files[0];
            return new Promise(function (resolve, reject) {
              if (typeof oFile === UIConstants.undefined) {
                MessageBox.error(oResourceBundle.getText('fileValidation'));
                return reject();
              }
             
              else {
                resolve();
              }
            });
    
          },
          _uploadFileExecute: function () {
            const that = this;
           //BusyIndicator.show(0);
            return new Promise(async function (resolve, reject) {
              const oFileUploader = that._getFileUploader();
              const oFile = oFileUploader.oFileUpload.files[0];
              const oFileName = oFile.name;
              sap.ui.getCore().fileUploadArr = [];
              const mimeDet = oFile.type;
             // let sCurrentUserEmailID ="g.lakshmi.dhandapani@accenture.com"
              let file1 = await that._base64conversionMethod(mimeDet, oFileName, oFile);
             
              if (file1) {
                let payload = {
                  "payload": [
                    {
                      "data": file1
                    }
                  ]
                };
                that._sendPayload(payload);
              }
            });
          },
            /**
      *  Method to convert the uploaded file to base64
      @param {Object} fileMime, fileName, fileDetails, DocNum passed as param to upload the file
      * @private
      */
      _base64conversionMethod: async function (fileMime, fileName, fileDetails, DocNum) {
        return new Promise((resolve, reject) => {
          const that = this;
          if (!FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function (fileData) {
              const binary = "";
              const reader = new FileReader();
              reader.onload = async function (e) {
                const bytes = new Uint8Array(reader.result);
                const length = bytes.byteLength;
                for (const i = 0; i < length; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                that.base64ConversionRes = await btoa(binary);
                sap.ui.getCore().fileUploadArr.push({
                  "DocumentType": DocNum,
                  "MimeType": fileMime,
                  "FileName": fileName,
                  "Content": that.base64ConversionRes,
                });
              };
              reader.readAsArrayBuffer(fileData);
            };
          }
          const reader = new FileReader();
          reader.onload = async function (readerEvt) {
            const binaryString = readerEvt.target.result;
            that.base64ConversionRes = await btoa(binaryString);
            await sap.ui.getCore().fileUploadArr.push({
              "DocumentType": DocNum,
              "MimeType": fileMime,
              "FileName": fileName,
              "Content": that.base64ConversionRes,
            });
            let excelpayload = new sap.ui.getCore().fileUploadArr[0].Content;
            resolve(excelpayload);
          };
          reader.readAsBinaryString(fileDetails);
        });
      },
      /**
      *   calls the uploadData function in MassGRGIService service file
        * @param {Object} payload passed as param to upload the file
      * @private
      */
      _sendPayload: async function (payload) {
        const that = this;
        const oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
        //BusyIndicator.show(0);
        return await this.PackagingService.uploadData(payload).then(
          function (data) {
           // BusyIndicator.hide();

            if (data.data) {

              let Status = data.data.status;
              if (Status === UIConstants.successStatus) {
                MessageBox.success(data.data.scheduleJob.message, {
                  onClose: function () {
                    that._resetFields();
                  }
                });

              }
              else {
                MessageBox.error(data.data.scheduleJob.message, {
                  onClose: function () {
                    that._resetFields();
                  }
                });
              }

            } else {

              MessageBox.error(oResourceBundle.getText("errorMsg"), {
                onClose: function () {
                  that._resetFields();
                }
              });
            }
          }.bind(this),
          function (error) {
          //  BusyIndicator.hide();
            const oerrMsg = JSON.parse(error.responseText).error.message.value;
            MessageBox.error(oerrMsg, {
              onClose: function () {
                that._resetFields();
              }
            });
          }.bind(this));
      },
      _resetFields: function () {
        const fileUploader = this._getFileUploader(); 
        fileUploader.clear();
      },
      _getFileUploader: function () {
        return this.getView().byId("fileUploaderDialog");
      },
      onExport: function () {
        const oModel = this.getView().getModel("excelData");
    
        if (!oModel || !oModel.getData().results || oModel.getData().results.length === 0) {
            sap.m.MessageBox.warning("No data available to export.");
            return;
        }
    
        const aData = oModel.getData().results;
    
        this.loadXLSXLibrary().then(function () {

          // const worksheet = XLSX.utils.json_to_sheet(aData);
           var worksheet = XLSX.utils.json_to_sheet(aData);
  const headersToKeep = ["Site ID", "Finished Good ID", "Finished Good Weight(kg)", "Emission Intensity", "Emission Allocated to Final Good(Kgco2e)", "Error Status"];  // Replace with your actual field names
 
  // Create filtered data array containing only the selected columns
  const filteredData = aData.map(item =>
    Object.fromEntries(
      headersToKeep.map(h => [h, item[h]])
    )
  );
 // Generate worksheet and workbook with specified headers order
  var worksheet = XLSX.utils.json_to_sheet(filteredData, { header: headersToKeep });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");
    
        
        XLSX.writeFile(workbook, "Finished Goods.xlsx");

}).catch(function (error) {
console.error(error);
});
        
       
    }
    
    });
});