sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
    "use strict";
    return Object.extend("ns.projectpcf.model.BaseObject", {
        /**
         * constructor for initilizing the baseObject with the input values(data)
         * @param {Object} data 
         */
        constructor: function (data) {
            let that = this;
            that.copyValues(data);
            if (that.isState) {
                that.initDirtyCheck();
            }
        },
        /**
         * Creates a shallow copy object from base obejct. 
         * The shallow object contains the fields provided in aFields variable
         * @param {Array} aFields 
         * @returns {Object}
         * @public
         */
        copyFieldsToObject: function (aFields) {
            return this.copyFields(this, {}, aFields);
        },
        /**
         * Creates a shallow copy object from oFrom obejct. 
         * The shallow object contains the fields provided in aFields variable
         * @param {Object} oFrom 
         * @param {Array} aFields 
         * @returns {Object} 
         * @public
         */
        copyFieldsToThis: function (oFrom, aFields) {
            return this.copyFields(oFrom, this, aFields);
        },
        /**
         * function to copy a set of fields(provided in aFields)from oFrom object to oTo Object
         * @param {Object} oFrom 
         * @param {Object} oTo 
         * @param {Array} aFields 
         * @returns {Object} oTo
         * @public
         */
        copyFields: function (oFrom, oTo, aFields) {
            for (let prop in oFrom) {
                if (aFields.find(function (field) {
                    return field === prop;
                })) {
                    oTo[prop] = oFrom[prop];
                }
            }
            return oTo;
        },
        /**
         * Function checks the changes/updates in the original model and refresh the model
         * @public
         */
        initDirtyCheck: function () {
            this.isDirty = false;
            this.enableDirtyFlag();
            this.updateModel();
        },
        /**
         * Function to diable the change/update check by setting the flag to false 
         * @public
         */
        disableDirtyFlag: function () {
            this.setDirtyFlag(false);
        },
        /**
         * Function enable dirty flag to ture if any changes happend to original model
         * @public
         */
        enableDirtyFlag: function () {
            this.setDirtyFlag(this.isDirty);
        },
        /**
         * This function updates the dirty flag in uShell contained based on value reveived in bIsDirtly(true/false)
         * @param {Boolean} bIsDirty 
         * @public
         */
        setDirtyFlag: function (bIsDirty) {
            if (sap && sap.ushell && sap.ushell.Container) {
                sap.ushell.Container.setDirtyFlag(bIsDirty);
            }
        },
        /**
         * This function reads the required properties provided in data and extracts from results and returns a simpe object with the required fields         * 
         * @param {Object} data 
         * @public
         */
        copyValues: function (data) {
            if (data) {
                for (let field in data) {
                    switch (typeof (data[field])) {
                        case "object":
                            if (data[field] && data[field]["results"]) {
                                this[field] = data[field]["results"];
                            }
                            break;
                        default:
                            this[field] = data[field];
                    }
                }
            }
        },
        /**
         * This helper function of returns the current model 
         * @returns {Object}
         * @public
         */
        getModel: function () {
            if (!this.model) {
                this.model = new JSONModel(this.data, true);
            }
            return this.model;
        },
        /**
         * Updates/refreshs the bindings of current model
         * @param {Boolean} bHardRefresh 
         * @public
         */
        updateModel: function (bHardRefresh) {
            if (this.model) {
                this.model.refresh(bHardRefresh);
            }
        },
        /**
         * this helper method returns the data from current model 
         * @returns{Object}
         * @public
         */
        getData: function () {
            let req = jQuery.extend({}, this);
            delete req["model"];
            return req;
        },
        /**
         * This function reads all the nested node of json model and returns a simple json model with all nesded node properties
         * @param {Object} oObject 
         * @returns {Object}
         * @public
         */
        fnMap: function (oObject) {
            let obj = {};
            for (let prop in oObject) {
                if (oObject.hasOwnProperty(prop) && typeof (oObject[prop]) !== "object") {
                    obj[prop] = oObject[prop];
                }
            }
            return obj;
        }
    });
});