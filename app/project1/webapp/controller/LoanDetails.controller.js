sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, ODataModel, MessageToast,Filter,FilterOperator) {
    "use strict";

    return Controller.extend("project1.controller.LoanDetails", {
        onLogout: function () {
        
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Logged out!");
            
      
    
          },
          onHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Returned Home");
            
          },

          onSearch: function (oEvent) 
        {
          //var sQurey = oEvent.getParameter("query");
          var sQurey = oEvent.getSource().getValue();
          var filterConditions = [
            new Filter("applicantName", FilterOperator.Contains, sQurey),
            new Filter("applicantEmail", FilterOperator.Contains, sQurey),
            new Filter("applicantPHno", FilterOperator.Contains, sQurey),
            new Filter("applicantAadhar", FilterOperator.Contains, sQurey),
            //new Filter("Id", FilterOperator.Contains, sQurey)
        ];
        var combinedFilters=new Filter({
            filters: filterConditions,
            and: false
        })
          var oTable = this.byId("loanDetails");
          var oBinding = oTable.getBinding("items");
          if (oBinding) {
            oBinding.filter(combinedFilters);
        } else {
            console.error("Binding for 'items' aggregation is not available.");
        }
        },
      
        onReset: function(){
        var oTable = this.byId("loanDetails");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
          this.getView().byId("queryLoanSearch").setValue("");
            
        },
        onViewDetails: function(oEvent){
            var oDialog = this.getView().byId("loanDetailsDialog");
            var oItem = oEvent.getSource().getBindingContext("mainModel");
            oDialog.setBindingContext(oItem,"mainModel");
            oDialog.open();
        },
        onCloseDialog: function(){
            var oDialog = this.getView().byId("loanDetailsDialog");
            oDialog.close();
        }

    });
});
