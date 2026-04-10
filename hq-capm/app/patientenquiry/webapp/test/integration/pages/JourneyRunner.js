sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"patientenquiry/test/integration/pages/PatientEnquiryList",
	"patientenquiry/test/integration/pages/PatientEnquiryObjectPage"
], function (JourneyRunner, PatientEnquiryList, PatientEnquiryObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('patientenquiry') + '/test/flp.html#app-preview',
        pages: {
			onThePatientEnquiryList: PatientEnquiryList,
			onThePatientEnquiryObjectPage: PatientEnquiryObjectPage
        },
        async: true
    });

    return runner;
});

