sap.ui.define([
    "../model/BaseObject"
], function (BaseObject) {
    "use strict";
    let PackagingState = BaseObject.extend("pcf.com.acc.packaging.state.PackagingState", {
        /**
        * @class
        * @abstract
        * @extends ns.projectpcf.state.BaseObject
        * @constructor
        * @param {Object} oService 
        * @param {Object} oResourceBundle
        * @public
        * @author g.lakshmi.dhandapani <g.lakshmi.dhandapani@accenture.com>
        * @since v0.0.1 Created On : 2024/05/27
        * @name ns.projectpcf.state.PackagingState
        */
        constructor: function (oService, oResourceBundle) {
            let that = this;
            that.MassGRGIService = oService; // OData service.
            that.BusyCounter = 0; // Busy indicator counter.
            that.ResourceBundle = oResourceBundle; // Text Resources
            that.ViewController = null; // View controller instance
            that.bDateThresholdAccepted = false;   // this._ValidateLocalDateOlderThanThreshold() with this fun validation if user select yes make this variable true otherwise false
            that.data = {
                display: true,
            };
            // Initialize base object.
            BaseObject.call(that, {
                isState: true
            });
        }
    });
    return PackagingState;
});