sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("dashboard.controller.Login", {
        onInit: function () {
            localStorage.setItem("isLoggedIn", "false");
            if (localStorage.getItem("isLoggedIn") === "true") {
                this.getOwnerComponent().getRouter().navTo("dashboardview");
            }
        },

       onLogin: function () {
            var sEmail = this.getView().byId("username").getValue();
        
            // Store login + email
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", sEmail);
            debugger;
            this.getOwnerComponent().getRouter().navTo("dashboardview");
        }
    });
});