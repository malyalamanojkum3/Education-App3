sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            sap.ui.core.BusyIndicator.show(0);
            sap.ui.core.BusyIndicator.hide();
        },

        OnLoginbutton: function () {
            var email = this.byId("emailinput").getValue();
            var password = this.byId("passinput").getValue();
        
            if (!email || !password) {
                MessageToast.show("Please enter both email and password.");
                return;
            }
        
            var oModel = this.getView().getModel("mainModel");
        
            oModel.callFunction("/loginUser", {
                method: "POST",
                urlParameters: {
                    email: email,
                    password: password
                },
                success: function (oData) {
                    MessageToast.show("login successfull");
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("dashboard");
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Invalid email or password.");
                    console.error("Login error:", oError);
                }
            });
        }
        ,

        onTogglePasswordVisibility: function () {
            var oInput = this.byId("passinput");
            var bIsPassword = oInput.getType() === "Password";
            oInput.setType(bIsPassword ? "Text" : "Password");
        },

        onTogglePasswordVisibilityreg: function () {
            var oInput = this.byId("regpass");
            var bIsPassword = oInput.getType() === "Password";
            oInput.setType(bIsPassword ? "Text" : "Password");
        },

        onSignup: function () {
            this.byId("loginfields").setVisible(false);
            this.byId("signUpFields").setVisible(true);
        },

        onLogin: function () {
            this.byId("signUpFields").setVisible(false);
            this.byId("loginfields").setVisible(true);
        },

        onRegister: function () {
            var oView = this.getView();
            var username = this.byId("regusername").getValue();
            var mobile = this.byId("regmobile").getValue();
            var email = this.byId("regemail").getValue();
            var password = this.byId("regpass").getValue();
            var confirmPassword = this.byId("regpass1").getValue();

            if (!username || !mobile || !email || !password || !confirmPassword) {
                MessageToast.show("Please fill in all fields.");
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                MessageToast.show("Please enter a valid email address.");
                return;
            }

            var mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(mobile)) {
                MessageToast.show("Please enter a valid 10-digit mobile number.");
                return;
            }

            var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,12}$/;

            if (!passwordRegex.test(password)) {
                MessageToast.show("Password must be at least 6 characters long and include both letters and numbers.");
                return;
            }

            if (password !== confirmPassword) {
                MessageToast.show("Passwords do not match.");
                return;
            }

            var oModel = this.getView().getModel("mainModel");
            var oNewUser = {
                email: email,
                password: password,
                username: username,
                mobileNumber: mobile,
                userRole: "Admin"
            };

            // Check if user already exists
            oModel.read("/user", {
                filters: [new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.EQ, email)],
                success: function (oData) {
                    if (oData.results && oData.results.length > 0) {
                        MessageToast.show("User already exists. Please login.");
                    } else {
                        // Create new user
                        
oModel.callFunction("/registerUser", {
         method: "POST",
         urlParameters: {
         email: email,
         password: password,
         username: username,
         mobileNumber: mobile
     },    
                            success: function () {
                                MessageToast.show("Registration successful!");
                                this.onLogin(); // Switch to login view
                            }.bind(this),
                            error: function (oError) {
                                MessageToast.show("Error during registration.");
                                console.error("Registration error:", oError);
                            }
                        });
                    }
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error checking existing users.");
                    console.error("User check error:", oError);
                }
            });
        }
    });
});
