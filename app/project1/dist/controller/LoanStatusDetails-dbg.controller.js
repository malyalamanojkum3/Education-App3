sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel"
], function(Controller, JSONModel, ODataModel) {
    "use strict";
 
    return Controller.extend("project1.controller.LoanStatusDetails", {
       
        onInit: function() {
            // Create a JSON model to manage the progress indicator state.
            var oProgressModel = new JSONModel({
                displayValue: "",
                percentValue: 0,
                state: "None"
            });
            this.getView().setModel(oProgressModel, "progressModel");
           
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("LoanStatusDetails").attachPatternMatched(this._onObjectMatched, this);
        },
       
        _onObjectMatched: function(oEvent) {
            var sCustomerId = oEvent.getParameter("arguments").customerId;
            this._loadCustomerDetails(sCustomerId);
        },
       
        _loadCustomerDetails: function(sCustomerId) {
            var oMainModel = this.getView().getModel("mainModel");
            oMainModel.callFunction("/trackLoan", {
                method: "GET",
                urlParameters: {
                    Id: sCustomerId
                },
                success: function(oData) {
                    var oResult = (oData &&  oData.results && oData.results[0]) ? oData.results[0] : {};
                    var oJsonModel = new sap.ui.model.json.JSONModel(oResult);
                    this.getView().setModel(oJsonModel, "loanDetailModel");
                    this.getView().setBindingContext(oJsonModel.createBindingContext("/"), "loanDetailModel");
                    this._onDataReceived(); 
                }.bind(this),
                error: function(oError) {
                    sap.m.MessageToast.show("Failed to load loan details.");
                }
            });
        },
       
        _onDataReceived: function() {
            // Get the data directly from the model
            var oModel = this.getView().getModel("loanDetailModel");
            var oData = oModel ? oModel.getData() : {};
            var sLoanStatus = oData.loanStatus; // Expected values: "Submitted", "Pending", "Approved", "Rejected"
           
            var oProgressModel = this.getView().getModel("progressModel");
            switch (sLoanStatus) {
                case "Submitted":
                    oProgressModel.setProperty("/displayValue", "");
                    oProgressModel.setProperty("/percentValue", 33);
                    oProgressModel.setProperty("/state", "None");
                    break;
                case "Pending":
                    oProgressModel.setProperty("/displayValue", "");
                    oProgressModel.setProperty("/percentValue", 66);
                    oProgressModel.setProperty("/state", "Warning"); // Typically renders as yellow/orange.
                    break;
                case "Approved":
                    oProgressModel.setProperty("/displayValue", "");
                    oProgressModel.setProperty("/percentValue", 100);
                    oProgressModel.setProperty("/state", "Success"); // Green bar.
                    break;
                case "Rejected":
                    oProgressModel.setProperty("/displayValue", "");
                    oProgressModel.setProperty("/percentValue", 100);
                    oProgressModel.setProperty("/state", "Error"); // Red bar.
                    break;
                default:
                    // Fallback for any other status values.
                    oProgressModel.setProperty("/displayValue", sLoanStatus);
                    oProgressModel.setProperty("/percentValue", 0);
                    oProgressModel.setProperty("/state", "None");
                    break;
            }
        },
       
        onNavBack: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("LoanStatusPage");
        }
    });
});