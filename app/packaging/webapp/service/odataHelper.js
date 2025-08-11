sap.ui.define([], function() {
    "use strict";
    return {
        readData: function(oModel, sPath) {
            return new Promise(function(resolve, reject) {
                oModel.create(sPath,{}, {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        getData: function(oModel, sPath) {
            return new Promise(function(resolve, reject) {
                oModel.read(sPath,{}, {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        postData: function(oModel, sPath, odata) {
            return new Promise(function(resolve, reject) {
                oModel.create(sPath,odata, {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        }
    };
});