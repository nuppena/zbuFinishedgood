sap.ui.define([
    "./CoreService"
], function (CoreService) {
    "use strict";
    let PackagingService = CoreService.extend("pcf.com.acc.packaging.service.PackagingService", {
        /**
         * @class
         * @abstract
         * @extends ns.projectpcf.service.CoreService
         * @constructor
         * @param {Object} oService 
         * @param {Object} oResourceBundle
         * @public
         * @author g.lakshmi.dhandapani <g.lakshmi.dhandapani@accenture.com>
         * @since v0.0.1 Created On : 2024/05/27
         * @name ns.projectpcf.service.PackagingService
         */
        constructor: function (model) {
            CoreService.call(this, model);
        },
        /**
        * POST service call to  schedule the job
        * @param {object} payload  to schedule the job
        * @returns {object} Service Response
        * @public
        */
        uploadData: function (payload) {
            return this.odata("/uploadFile").post(payload);
        }
           });
    return PackagingService;
});
