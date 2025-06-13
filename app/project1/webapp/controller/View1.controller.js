sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
  ], (Controller, MessageToast) => {
    "use strict";
   
    return Controller.extend("project1.controller.View1", {
      onInit() {
        sap.ui.core.BusyIndicator.show(0);
        sap.ui.core.BusyIndicator.hide();
   
        
        const userData = localStorage.getItem("UserData");
        if (userData) {
          const oUserModel = new sap.ui.model.json.JSONModel(JSON.parse(userData));
          sap.ui.getCore().setModel(oUserModel, "UserModel");
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("dashboard");
        }
      },
   
      OnLoginbutton: function () {
        const email = this.byId("emailinput").getValue();
        const password = this.byId("passinput").getValue();
   
        if (!email || !password) {
          MessageToast.show("Please enter both email and password.");
          return;
        }
   
        const oModel = this.getView().getModel("mainModel");
        
   
        const sFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.EQ, email),
            new sap.ui.model.Filter("password", sap.ui.model.FilterOperator.EQ, password)
          ],
          and: true

          
        });
   
        oModel.read("/user", {
          filters: [sFilter],
          success: function (oData) {
            if (oData.results && oData.results.length > 0) {
              const user = oData.results[0];
              MessageToast.show("Login successful for: " + email);
   
              const userData = {
                role: user.userRole,
                username: user.username,
                email: user.email
              };
   
              
              const oUserModel = new sap.ui.model.json.JSONModel(userData);
              sap.ui.getCore().setModel(oUserModel, "UserModel");
              localStorage.setItem("UserData", JSON.stringify(userData));
   
              
              const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oRouter.navTo("dashboard");
              window.location.reload();
   
             
              this.byId("emailinput").setValue("");
              this.byId("passinput").setValue("");
            } else {
              MessageToast.show("Invalid username or password.");
            }
          }.bind(this),
          error: function (oError) {
            MessageToast.show("Error during login. Please try again.");
            console.error(oError);
          }
        });
      },
   
      onTogglePasswordVisibility: function () {
        const oInput = this.byId("passinput");
        const bIsPassword = oInput.getType() === "Password";
        oInput.setType(bIsPassword ? "Text" : "Password");
      },
   
      onTogglePasswordVisibilityreg: function () {
        const oInput = this.byId("regpass");
        const bIsPassword = oInput.getType() === "Password";
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
        const username = this.byId("regusername").getValue();
        const mobile = this.byId("regmobile").getValue();
        const email = this.byId("regemail").getValue();
        const password = this.byId("regpass").getValue();
        const confirmPassword = this.byId("regpass1").getValue();
   
        if (!username || !mobile || !email || !password || !confirmPassword) {
          MessageToast.show("Please fill in all fields.");
          return;
        }
   
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          MessageToast.show("Please enter a valid email address.");
          return;
        }
   
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
          MessageToast.show("Please enter a valid 10-digit mobile number.");
          return;
        }
   
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
          MessageToast.show("Password must be at least 6 characters and include letters, numbers, and special characters.");
          return;
        }
   
        if (password !== confirmPassword) {
          MessageToast.show("Passwords do not match.");
          return;
        }
   
        const oModel = this.getView().getModel("mainModel");
        const userRole = email.includes("@admin.com") ? "Admin" : "Customer";
   
        const oNewUser = {
          email: email,
          password: password,
          username: username,
          mobileNumber: mobile,
          userRole: userRole
        };
   
        // Check if user already exists
        oModel.read("/user", {
          filters: [new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.EQ, email)],
          success: function (oData) {
            if (oData.results && oData.results.length > 0) {
              MessageToast.show("User already exists. Please login.");
            } else {
              // Create new user
              oModel.create("/user", oNewUser, {
                success: function () {
                  MessageToast.show("Registration successful!");
                  this.onLogin(); // Switch to login view
                  this.byId("regusername").setValue("");
                  this.byId("regmobile").setValue("");
                  this.byId("regemail").setValue("");
                  this.byId("regpass").setValue("");
                  this.byId("regpass1").setValue("");
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
   