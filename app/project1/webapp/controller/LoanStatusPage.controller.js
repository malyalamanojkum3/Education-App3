sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";
 
    return Controller.extend("project1.controller.LoanStatusPage", {
        onInit: function() {
            this._loadUserLoans();
        },

        _loadUserLoans: function() {
            // Get logged-in user data from session storage
            var loggedInUserData = sessionStorage.getItem("loggedInUser");
            
            if (loggedInUserData) {
                var userData = JSON.parse(loggedInUserData);
                
                // Get the model
                var oModel = this.getView().getModel("mainModel") || 
                           this.getOwnerComponent().getModel("mainModel") ||
                           this.getOwnerComponent().getModel();
                
                if (oModel && typeof oModel.read === 'function') {
                    // Filter loans by logged-in user's email
                    var sFilter = new Filter("applicantEmail", FilterOperator.EQ, userData.email);
                    
                    oModel.read("/customer", {
                        filters: [sFilter],
                        success: function(oData) {
                            var loansData = {
                                loans: oData.results.map(function(loan) {
                                    return {
                                        loanId: loan.Id,
                                        applicantName: loan.applicantName,
                                        applicantEmail: loan.applicantEmail,
                                        applicantPHno: loan.applicantPHno,
                                        loanStatus: loan.loanStatus,
                                        loanAmount: loan.loanAmount,
                                        loanRepaymentMonths: loan.loanRepaymentMonths
                                    };
                                }),
                                userInfo: {
                                    name: userData.username,
                                    email: userData.email
                                }
                            };
                            
                            var oLoansModel = new JSONModel(loansData);
                            this.getView().setModel(oLoansModel, "loansModel");
                        }.bind(this),
                        error: function(oError) {
                            console.log("Error loading loans:", oError);
                            MessageToast.show("Error loading loan data");
                            
                            // Show empty state with user info
                            var emptyData = {
                                loans: [],
                                userInfo: {
                                    name: userData.username,
                                    email: userData.email
                                }
                            };
                            var oEmptyModel = new JSONModel(emptyData);
                            this.getView().setModel(oEmptyModel, "loansModel");
                        }.bind(this)
                    });
                } else {
                    MessageToast.show("Service not available");
                }
            } else {
                // If no user is logged in, redirect to login page
                MessageToast.show("Please login first");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1");
            }
        },

        onLoanPress: function(oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext("loansModel");
            var sLoanId = oBindingContext.getProperty("loanId");
            
            if (sLoanId) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("LoanStatusDetails", {
                    customerId: sLoanId
                });
            }
        },

        formatStatusState: function(sStatus) {
            switch (sStatus) {
                case "Approved":
                    return "Success";
                case "Rejected":
                    return "Error";
                case "Pending":
                    return "Warning";
                default:
                    return "None";
            }
        },

        onRefresh: function() {
            MessageToast.show("Refreshing loan data...");
            this._loadUserLoans();
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
 
 