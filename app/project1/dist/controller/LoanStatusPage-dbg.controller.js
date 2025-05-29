sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";
 
    return Controller.extend("project1.controller.LoanStatusPage", {
        onInit: function() {
        },
        onLoanStatusDetailsButton: function(oEvent){
            var oInput = this.byId("Id");
            var sCustomerId = oInput.getValue();
 
            if (sCustomerId) {
                this._isValidCustomerId(sCustomerId).then(function(isValid) {
                    if (isValid) {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("LoanStatusDetails", {
                            customerId: sCustomerId
                        });
                    } else {
                        MessageToast.show("Please enter a valid Customer ID.");
                    }
                }.bind(this));
            } else {
                MessageToast.show("Please enter a valid Customer ID.");
            }
            this.byId("Id").setValue("");
        },
        _isValidCustomerId: function(sCustomerId) {
            var oModel = this.getView().getModel("mainModel");
            return new Promise(function(resolve, reject) {
                var oBindingContext = oModel.bindContext("/trackLoan('" + sCustomerId + "')");
                oBindingContext.requestObject().then(function(oData) {
                    resolve(!!oData);
                }).catch(function() {
                    resolve(false);
                });
            });
        },
        onLogout: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("main");
            MessageToast.show("Logged out!");
            this.byId("Id").setValue("");
        },
        onHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Returned Home");
            this.byId("Id").setValue("");
        }
    });
});
 
 