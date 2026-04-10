sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"doctor/test/integration/pages/DoctorList",
	"doctor/test/integration/pages/DoctorObjectPage"
], function (JourneyRunner, DoctorList, DoctorObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('doctor') + '/test/flp.html#app-preview',
        pages: {
			onTheDoctorList: DoctorList,
			onTheDoctorObjectPage: DoctorObjectPage
        },
        async: true
    });

    return runner;
});

