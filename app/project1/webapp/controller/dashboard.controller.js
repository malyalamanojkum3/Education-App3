sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";
 
  return Controller.extend("project1.controller.dashboard", {
    onInit: function () {
<<<<<<< HEAD
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
=======
      let oUserModel = sap.ui.getCore().getModel("UserModel");
 
      if (!oUserModel) {
        const userData = localStorage.getItem("UserData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          oUserModel = new sap.ui.model.json.JSONModel(parsedUser);
          sap.ui.getCore().setModel(oUserModel, "UserModel");
        }
      }
 
      const userRole = oUserModel ? oUserModel.getProperty("/role") : "Customer";
      const isAdmin = userRole === "Admin";
 
      const tiles = [
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
        }
      ];
 
      const tiles1 = [
        {
          title: "Loan Status",
          description: "Check current status of loan",
icon: "https://cdn-icons-png.flaticon.com/512/3135/3135773.png",
          key: "LoanStatus"
        }
      ];
 
      if (isAdmin) {
        tiles1.push({
          title: "Applied Loans",
          description: "Details of Customer Loan Applications",
icon: "https://cdn-icons-png.flaticon.com/512/943/943593.png",
          key: "AppliedLoan"
        });
      }
 
      const oModel = new sap.ui.model.json.JSONModel({
        tiles: tiles,
        tiles1: tiles1
>>>>>>> 7cfa304 (Based on role dashboard will be visible)
      });
      this.getView().setModel(oModel);
    },
 
    onTilePress: function (oEvent) {
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
      sap.ui.getCore().setModel(null, "UserModel");
      localStorage.removeItem("UserData");
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteView1");
MessageToast.show("Logged out!");
    }
  });
});