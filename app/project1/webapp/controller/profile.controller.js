sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";
   
    return Controller.extend("project1.controller.profile", {
   
      onInit: function () {
        // Get logged-in user data from session storage
        var loggedInUserData = sessionStorage.getItem("loggedInUser");
        
        if (loggedInUserData) {
          var userData = JSON.parse(loggedInUserData);
          
          // First show basic user info from session data
          this._showBasicUserInfo(userData);
          
          // Then try to load additional data from service
          this._attemptServiceLoad(userData);
        } else {
          // If no user is logged in, redirect to login page
          MessageToast.show("Please login first");
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteView1");
        }
      },

      _attemptServiceLoad: function(userData) {
        // Try to get the model with multiple fallback options
        var oModel = this.getView().getModel("mainModel") || 
                     this.getOwnerComponent().getModel("mainModel") ||
                     this.getOwnerComponent().getModel();
        
        if (oModel && typeof oModel.read === 'function') {
          this._loadUserProfile(userData, oModel);
        } else {
          // If no OData model is available, we'll just show the basic info
          console.log("OData model not available, showing basic user information");
        }
      },

      _loadUserProfile: function(userData, oModel) {
        try {
          // Read user details to get complete information
          oModel.read("/user('" + userData.id + "')", {
            success: function(oUserData) {
              // Get loan details for this user
              var sFilter = new Filter("applicantEmail", FilterOperator.EQ, userData.email);
              
              oModel.read("/customer", {
                filters: [sFilter],
                success: function(oLoanData) {
                  var profileData = {
                    name: userData.username,
                    email: userData.email,
                    mobile: userData.mobileNumber,
                    address: oLoanData.results.length > 0 ? oLoanData.results[0].applicantAddress : "Not provided",
                    loanId: oLoanData.results.length > 0 ? oLoanData.results[0].Id : "No active loans",
                    monthlyEmi: oLoanData.results.length > 0 ? this._calculateEMI(oLoanData.results[0]) : "N/A"
                  };
                  
                  var oProfileModel = new JSONModel(profileData);
                  this.getView().setModel(oProfileModel);
                }.bind(this),
                error: function(oError) {
                  console.log("Error loading loan data:", oError);
                  // Keep the basic user info already shown
                }.bind(this)
              });
            }.bind(this),
            error: function(oError) {
              console.log("Error loading user data:", oError);
              // Keep the basic user info already shown
            }.bind(this)
          });
        } catch (error) {
          console.log("Error in _loadUserProfile:", error);
          // Basic user info is already shown, so just log the error
        }
      },

      _showBasicUserInfo: function(userData) {
        var profileData = {
          name: userData.username,
          email: userData.email,
          mobile: userData.mobileNumber,
          address: "Not provided",
          loanId: "No active loans",
          monthlyEmi: "N/A"
        };
        
        var oProfileModel = new JSONModel(profileData);
        this.getView().setModel(oProfileModel);
      },

      _calculateEMI: function(loanData) {
        if (loanData && loanData.loanAmount && loanData.loanRepaymentMonths) {
          var principal = parseFloat(loanData.loanAmount);
          var months = parseInt(loanData.loanRepaymentMonths);
          var rate = 0.10 / 12; // Assuming 10% annual interest rate
          
          if (months > 0) {
            var emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
            return "₹" + Math.round(emi).toLocaleString();
          }
        }
        return "N/A";
      },

      onLogout: function () {
        // Clear session storage
        sessionStorage.removeItem("loggedInUser");
        
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
   