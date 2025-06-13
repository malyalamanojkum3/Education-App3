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
                sap.ui.core.BusyIndicator.show(0);
                this._isValidCustomerId(sCustomerId).then(function(isValid) {
                    sap.ui.core.BusyIndicator.hide(0);
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
                MessageToast.show("Please enter Customer ID.");
            }
            this.byId("Id").setValue("");
        },
        _isValidCustomerId: function(sCustomerId) {
            var oModel = this.getView().getModel("mainModel");
            return new Promise(function(resolve, reject) {
                oModel.callFunction("/trackLoan", {
                    method: "GET",
                    urlParameters: {
                        Id: sCustomerId
                    },
                    success: function(oData) {
                        resolve(!!oData);
                    },
                    error: function() {
                        resolve(false);
                    }
                });
            });
        },
        onLogout: function () {
            // Clear session storage
            sessionStorage.removeItem("loggedInUser");
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
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
 
 