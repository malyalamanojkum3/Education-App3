sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
            sap.ui.core.BusyIndicator.show(0);
            // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // oRouter.navTo("dashboard");
            sap.ui.core.BusyIndicator.hide();
        },
        
        onSignup: function () {
            var oSignupBox = this.byId("signUpFields");
            var oLoginBox = this.byId("loginfields");

            if(oSignupBox) {
                oSignupBox.setVisible(true);
                oLoginBox.setVisible(false);
            }
        },
        onLogin: function () {
            var oSignupBox = this.byId("signUpFields");
            var oLoginBox = this.byId("loginfields");

            if(oLoginBox) {
                oSignupBox.setVisible(false);
                oLoginBox.setVisible(true);
            }
        },
        onTogglePasswordVisibility: function () {
            var oInput = this.byId("passinput");
            var bIsPassword = oInput.getType() === "Password";
        
            oInput.setType(bIsPassword ? "Text" : "Password");
            oInput.setValueHelpIconSrc(bIsPassword ? "sap-icon://hide" : "sap-icon://show");
        },
        onTogglePasswordVisibilityreg: function () {
            var oInput = this.byId("regpass");
            var bIsPassword = oInput.getType() === "Password";
        
            oInput.setType(bIsPassword ? "Text" : "Password");
            oInput.setValueHelpIconSrc(bIsPassword ? "sap-icon://hide" : "sap-icon://show");
        },
        OnLoginbutton: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
        }

        

    });
});