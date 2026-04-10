using HospitalService as service from '../../srv/service';
using from '@sap/cds/common';

annotate service.PatientEnquiry with @(
    UI.HeaderInfo : {
        TypeName : 'Patient',
        TypeNamePlural : 'Patients',
        Title : {
            $Type : 'UI.DataField',
            Value : patientName,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : mobile,
        },
    },
    UI.SelectionFields : [patientName, mobile, gender],
    UI.FieldGroup #PatientDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Patient Name', Value : patientName },
            { $Type : 'UI.DataField', Label : 'Age', Value : age },
            { $Type : 'UI.DataField', Label : 'Gender', Value : gender },
            { $Type : 'UI.DataField', Label : 'Mobile Number', Value : mobile },
            { $Type : 'UI.DataField', Label : 'Symptoms', Value : symptoms }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'PatientDetailsFacet',
            Label : 'Patient Details',
            Target : '@UI.FieldGroup#PatientDetails',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'AppointmentsFacet',
            Label : 'Appointments',
            Target : 'appointments/@UI.LineItem#PatientAppointments',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'DiagnosisFacet',
            Label : 'Diagnosis',
            Target : 'diagnoses/@UI.LineItem'
        }
    ],
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Patient Name', Value : patientName },
        { $Type : 'UI.DataField', Label : 'Age', Value : age },
        { $Type : 'UI.DataField', Label : 'Gender', Value : gender },
        { $Type : 'UI.DataField', Label : 'Mobile', Value : mobile },
        { $Type : 'UI.DataField', Label : 'Symptoms', Value : symptoms }
    ],
    Common.SemanticKey : [mobile]
);

annotate service.Queue with @(
    UI.HeaderInfo : {
        TypeName : 'Appointment',
        TypeNamePlural : 'Appointments',
        Title : {
            $Type : 'UI.DataField',
            Value : tokenNumber,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : status,
        },
    },
    UI.SelectionFields : [appointmentDate, status, doctor_ID],
    UI.LineItem #PatientAppointments : [
        { $Type : 'UI.DataField', Label : 'Doctor', Value : doctor_ID },
        { $Type : 'UI.DataField', Label : 'Specialty', Value : specialty },
        { $Type : 'UI.DataField', Label : 'Appointment Date', Value : appointmentDate },
        { $Type : 'UI.DataField', Label : 'Start Time', Value : startDateTime },
        { $Type : 'UI.DataField', Label : 'End Time', Value : endDateTime },
        { $Type : 'UI.DataField', Label : 'Token Number', Value : tokenNumber },
        { $Type : 'UI.DataField', Label : 'Status', Value : status },
        { $Type : 'UI.DataField', Label : 'Notes', Value : notes }
    ],
    UI.FieldGroup #AppointmentDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Doctor', Value : doctor_ID },
            { $Type : 'UI.DataField', Label : 'Appointment Date', Value : appointmentDate },
            { $Type : 'UI.DataField', Label : 'Start Time', Value : startDateTime },
            { $Type : 'UI.DataField', Label : 'End Time', Value : endDateTime },
            { $Type : 'UI.DataField', Label : 'Token Number', Value : tokenNumber },
            { $Type : 'UI.DataField', Label : 'Status', Value : status },
            { $Type : 'UI.DataField', Label : 'Notes', Value : notes }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'AppointmentDetailsFacet',
            Label : 'Appointment Details',
            Target : '@UI.FieldGroup#AppointmentDetails',
        }
    ]
);

annotate service.Queue with {
    doctor @Common.ValueListWithFixedValues;
    doctor @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Doctor',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : doctor_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterOut',
                LocalDataProperty : doctorName,
                ValueListProperty : 'doctorName'
            },
            {
                $Type : 'Common.ValueListParameterOut',
                LocalDataProperty : specialty,
                ValueListProperty : 'specialty'
            }
        ]
    };
};


annotate service.Diagnosis with @(
    UI.HeaderInfo : {
        TypeName : 'Diagnosis',
        TypeNamePlural : 'Diagnoses',
        Title : {
            $Type : 'UI.DataField',
            Value : prescription
        }
    },

    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Doctor', Value : doctor.doctorName },
        { $Type : 'UI.DataField', Label : 'Diagnosis Notes', Value : diagnosisNotes },
        { $Type : 'UI.DataField', Label : 'Prescription', Value : prescription },
        { $Type : 'UI.DataField', Label : 'Start Time', Value : startDateTime },
        { $Type : 'UI.DataField', Label : 'End Time', Value : endDateTime }
    ],

    UI.FieldGroup #DiagnosisDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Doctor', Value : doctor.doctorName },
            { $Type : 'UI.DataField', Label : 'Diagnosis Notes', Value : diagnosisNotes },
            { $Type : 'UI.DataField', Label : 'Prescription', Value : prescription },
            { $Type : 'UI.DataField', Label : 'Start Time', Value : startDateTime },
            { $Type : 'UI.DataField', Label : 'End Time', Value : endDateTime }
        ]
    },

    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'DiagnosisDetailsFacet',
            Label : 'Diagnosis Details',
            Target : '@UI.FieldGroup#DiagnosisDetails'
        }
    ]
);

annotate service.PatientEnquiry with @Capabilities.InsertRestrictions.Insertable : true;
annotate service.Queue with @Capabilities.InsertRestrictions.Insertable : true;