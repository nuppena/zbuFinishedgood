sap.ui.define([
    "sap/ui/core/UIComponent",
    "./model/models",
    "./service/PackagingService",
    "./state/PackagingState",
    "sap/ui/model/json/JSONModel"
], (UIComponent, models,PackagingService,PackagingState,JSONModel) => {
    "use strict";

    return UIComponent.extend("pcf.com.acc.packaging.finishedgoods.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // set the device model
            let oJsonModel = new JSONModel();
            this.setModel(oJsonModel, "oJsonModel");

            this._oPackagingService = new PackagingService(this.getModel());
            this._oPackagingState = new PackagingState(this._oPackagingService);
            this.setModel(this._oPackagingState.getModel(), "oModel");
            // enable routing
            this.getRouter().initialize();
        },
        getService: function (sService) {
            return this["_o" + sService + "Service"];
        },
        getState: function (sState) {
            return this["_o" + sState + "State"];
        }
    });
});