sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    'sap/viz/ui5/format/ChartFormatter',
     'sap/viz/ui5/api/env/Format'
], (Controller, JSONModel, FlattenedDataset, FeedItem,ChartFormatter, Format) => {
    "use strict";

    return Controller.extend("dashboard.controller.dashboardview", {
        onInit() {
            this._loadData();
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;
            this.byId("barChart").setVizProperties({
                title: {
                    visible: true,
                    text: "Cases Status Overview"
                },
                valueAxis: {
                    label: {
                        formatString: formatPattern.SHORTFLOAT
                    }
                }
            });


            const oVizFrame = this.byId("idVizFrame");
            oVizFrame.setVizProperties({
                title: {
                    text: "Case Analysis"
                },
                plotArea: {
                    dataLabel: {
                        visible: false,
                        formatString: "0" 
                    },
                    colorPalette: [
                        "#f39c12", // pending
                        "#27ae60"  // completed
                    ]
                },
                legend: {
                    visible: true
                }
            });

        },

        _loadData: async function () {
            const oVizFrame = this.byId("idVizFrame");
            oVizFrame.setVisible(true);  

            const oModel = this.getOwnerComponent().getModel();
            const oListBinding = oModel.bindList("/QueueStatusAnalytics");
            const aContexts = await oListBinding.requestContexts();
            const data = aContexts.map(ctx => ctx.getObject());
            this.dataBinding(data);
        },

        onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

        onChangeModel(){
             let total = 10, pending = 20, closed = 30, newItems = 40;
             const oDashboardData = {
                total,
                pending,
                closed,
                newItems
            };

            // SET JSON MODEL
            const oJsonModel = new JSONModel(oDashboardData);
            this.getView().setModel(oJsonModel, "dashboard");
        },

        doctorOneSelected: async function (){
            const oVizFrame = this.byId("idVizFrame");
           // const bVisible = oVizFrame.getVisible(); // current state
            oVizFrame.setVisible(false);  

            const oModel = this.getOwnerComponent().getModel();

            // const oListBinding = oModel.bindList("/AllQueue", null, null, null, {
            //     $filter: "doctor_ID eq 197cffad-31c6-4f32-998e-7abd2afebbd9"
            // });
            const oListBinding = oModel.bindList("/AllQueue", null, null, null, {
                $apply: "filter(doctor_ID eq 0953765a-9892-4861-b992-e94b6570a05e)/groupby((status),aggregate(ID with count as Total))"
            });

            const aContexts = await oListBinding.requestContexts();
            const data = aContexts.map(ctx => ctx.getObject());
            this.dataBinding(data);

        },

        dataBinding: function (data){
            let total = 0, pending = 0, closed = 0, cancelled = 0;

            data.forEach(item => {
                total += item.Total;

                if (item.status === "Pending") pending = item.Total;
                if (item.status === "Completed") closed = item.Total;
                if (item.status === "Cancelled") cancelled = item.Total;
            });

            const oDashboardData = {
                total,
                pending,
                closed,
                cancelled
            };

            const oJsonModel = new JSONModel(oDashboardData);
            this.getView().setModel(oJsonModel, "dashboard");
        },

        onNavigateToPatient: function () {
            window.location.href = "/patientenquiry/index.html";
        },

        onNavigateToDoctor: function () {
            window.location.href = "/doctor/index.html";
        },

    });
});