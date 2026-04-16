sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("login.controller.view1", {
        onInit() {
            if (localStorage.getItem("isLoggedIn") === "true") {
                this.getOwnerComponent().getRouter().navTo("dashboardview");
            }
        },

        onLogin: function () {
            localStorage.setItem("isLoggedIn", "true");
            MessageToast.show("Login successful");
            // this.getOwnerComponent().getRouter().navTo("dashboardview");
             window.location.href = "/doctor/index.html";
        }
    });
});