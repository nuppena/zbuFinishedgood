const cds = require('@sap/cds');
const validation = require('./util/validations').default;
const onPrem = require('./onPrem/onPrem');
const {createLogger} = require('@sap-cloud-sdk/util');
const log = createLogger('goods-servicejs');
module.exports = async (srv) => {
    srv.on('uploadFile', async (request) => {
        try {
         
          updFileData = validation.base64ToJSON(request.data.payload[0].data);
         console.log(updFileData);
          
         
        } catch (error) {
          log.info("createSchedule service response............")
          return request.error({
            message: constants.JOBFAILED,
            status: constants.FAILSTATUS,
          });
        }
      });
      srv.on('runFinishedGoods',async(request) =>{
        const yourData= {
          "User Name": "uppena"
          };
       const awsConnect= await cds.connect.to("AWSAPI");
       const res = await awsConnect.tx(request).post("/api/runFinishedGoods",yourData)

       const rMessage = {
        "Status":"200",
        "Message":res
       }
       return rMessage;
    
      });
    
      srv.on('fetchFinishedGoods',async(request) =>{
        const yourData= {
           "User Name": "uppena"
           };
        const awsConnect= await cds.connect.to("AWSAPI");
        const res = await awsConnect.tx(request).post("/api/fetchFinishedGoods",yourData)

        const rMessage = {
          "Status":"200",
          "Message":res
         }
        return rMessage;

       });
       srv.on('loadFinishedGoods',async(request) =>{
    
        const pcfMaterials = request.data.material;
      
        const mArray=[];
    
        for(let i=0;i<pcfMaterials.length;i++)
          {
            mArray.push( {
              "Site ID": pcfMaterials[i].Site_ID,
              "Finished Good ID": pcfMaterials[i].Finished_Good_ID,
              "Finished Good Weight(kg)": pcfMaterials[i].Finished_Good_Weight
          })
          }
    
        const savePayload = {
          "User Name": request.data.uName,
         "goods":mArray
        }
        
          
        const awsConnect= await cds.connect.to("AWSAPI");
    
       const res =  await awsConnect.tx(request).post("/api/loadFinishedGoods",savePayload)
       console.log("Payload::::" +JSON.stringify(res));

       const rMessage = {
        "Status":"200",
        "Message":res
       }
       return rMessage;
    
          });
};