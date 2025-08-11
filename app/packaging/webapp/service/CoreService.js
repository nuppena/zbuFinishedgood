sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";
	return Object.extend("pcf.com.acc.packaging.finishedgoods.service.CoreService", {
		/**
		 * constructor of the coreService that gets inililised from the input modes-oModel 
		 * @param {Object} oModel 
		 * @public
		 */
		constructor: function (oModel) {
			Object.call(this);
			if (oModel) {
				this.setModel(oModel);
			}
		},
		/**
		 * This is a setter method used to set a new model to the current model
		 * @param {Object} oModel 		 
		 * @public
		 */
		setModel: function (oModel) {
			this.model = oModel;
		},
		/**
		 * This is used to promisify all OData calls (GET,POST,PUT,DELETE)
		 * @param {String} url 
		 * @returns {Object}
		 * @public 
		 */
		odata: function (url) {
			let me = this;
			let core = {
				ajax: function (type, url, data, parameters) {
					let promise = new Promise(function (resolve, reject) {
						let args = [];
						let params = {};
						args.push(url);
						if (data) {
							args.push(data);
						}
						if (parameters) {
							params = parameters;
						}
						params.success = function (result, response) {
							resolve({
								data: result,
								response: response
							});
						};
						params.error = function (error) {
							reject(error);
						};
						args.push(params);
						me.model[type].apply(me.model, args);
					});
					return promise;
				}
			};
			return {
				'get': function (params) {
					return core.ajax('read', url, false, params);
				},
				'post': function (data, params) {
					return core.ajax('create', url, data, params);
				},
				'put': function (data, params) {
					return core.ajax('update', url, data, params);
				},
				'delete': function (params) {
					return core.ajax('remove', url, false, params);
				}
			};
		}
	});
});