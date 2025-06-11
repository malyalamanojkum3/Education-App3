sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment"
], function (Controller, MessageToast, Fragment) {
  "use strict";

  return Controller.extend("project1.controller.dashboard", {

    onInit: function () {
      
      const oModel = new sap.ui.model.json.JSONModel({
        
        tiles: [
          {
            title: "Apply Loan",
            description: "Apply for new education loan",
            icon: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png",
            key: "ApplyLoan"
          },
          
          {
            title: "Profile",
            description: "User details and information",
            icon: "https://cdn-icons-png.flaticon.com/512/1077/1077063.png",
            key: "Profile"
          },
          
        ],

        tiles1 : [
          {
            title: "Loan Status",
            description: "Check current status of loan",
            icon: "https://cdn-icons-png.flaticon.com/512/3135/3135773.png",
            key: "LoanStatus"
          },
          {
            title: "Applied Loans",
            description: "Details of Customer Loan Applications",
            icon: "https://cdn-icons-png.flaticon.com/512/943/943593.png",
            key: "AppliedLoan"
          }
          
        ]
      });

      this.getView().setModel(oModel);
    },

    onTilePress: function (oEvent) {
      // Get the key from customData in the first child of GridListItem (VBox)
      const key = oEvent.getSource().getContent()[0].getCustomData()[0].getValue();
      const router = sap.ui.core.UIComponent.getRouterFor(this);

      switch (key) {
        case "ApplyLoan":
          router.navTo("RouteloanApplication");
          break;
        case "LoanStatus":
          router.navTo("LoanStatusPage");
          break;
        case "Profile":
          router.navTo("Profile");
          break;
        case "AppliedLoan":
          router.navTo("AdminAppliedLoans");
          break;
        default:
          MessageToast.show("Unknown tile key: " + key);
      }
    },

    onLogout: function () {

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteView1");
      MessageToast.show("Logged out!");

      
    }

  });
});