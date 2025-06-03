sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ], function (Controller, JSONModel, MessageToast) {
    "use strict";
   
    return Controller.extend("project1.controller.profile", {
   
      onInit: function () {
        // Temporary mock data for UI testing
        const oData = {
          name: "Sri Lakshmanan M",
          email: "Sri@example.com",
          mobile: "9876543210",
          address: "5/225 vijay nagar 2 nd street tamilnadu Chennai-7689054",
          loanId: "LN123456",
          monthlyEmi: "25000"
        };
   
        const oModel = new JSONModel(oData);
        this.getView().setModel(oModel);
      },

      onLogout: function () {
        
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteView1");
        MessageToast.show("Logged out!");
        
  

      },
      onHome: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("dashboard");
        MessageToast.show("Returned Home");
        
      }
      
  
   
    });
  });
   