using HospitalService as service from '../../srv/service';

annotate service.Doctor with @Capabilities.InsertRestrictions.Insertable : false;
annotate service.Doctor with @Capabilities.UpdateRestrictions.Updatable : false;
annotate service.Doctor with @Capabilities.DeleteRestrictions.Deletable : false;
annotate service.Doctor with @UI.CreateHidden : true;
annotate service.Doctor with @UI.UpdateHidden : true;
annotate service.Doctor with @UI.DeleteHidden : true;

annotate service.Doctor with @(
    UI.HeaderInfo : {
        TypeName : 'Doctor',
        TypeNamePlural : 'Doctors',
        Title : { $Type : 'UI.DataField', Value : doctorName },
        Description : { $Type : 'UI.DataField', Value : specialty }
    },
    UI.SelectionFields : [doctorName, specialty, mobile],
    UI.FieldGroup #DoctorDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Label : 'Doctor Name', Value : doctorName },
            { $Type : 'UI.DataField', Label : 'Gender', Value : gender },
            { $Type : 'UI.DataField', Label : 'Mobile', Value : mobile },
            { $Type : 'UI.DataField', Label : 'Specialty', Value : specialty }
        ]
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'DoctorDetailsFacet',
            Label : 'Doctor Details',
            Target : '@UI.FieldGroup#DoctorDetails'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'DoctorAppointmentsFacet',
            Label : 'Appointments',
            Target : 'appointments/@UI.LineItem#DoctorAppointments'
        }
    ],
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Doctor Name', Value : doctorName },
        { $Type : 'UI.DataField', Label : 'Specialty', Value : specialty },
        { $Type : 'UI.DataField', Label : 'Mobile', Value : mobile }
    ]
);

annotate service.Queue with @(
    UI.LineItem #DoctorAppointments : [
        { $Type : 'UI.DataField', Label : 'Patient', Value : patient.patientName },
        { $Type : 'UI.DataField', Label : 'Doctor', Value : doctorName },
        { $Type : 'UI.DataField', Label : 'Specialty', Value : specialty },
        { $Type : 'UI.DataField', Label : 'Date', Value : appointmentDate },
        { $Type : 'UI.DataField', Label : 'Start Time', Value : startDateTime },
        { $Type : 'UI.DataField', Label : 'End Time', Value : endDateTime },
        { $Type : 'UI.DataField', Label : 'Token', Value : tokenNumber },
        { $Type : 'UI.DataField', Label : 'Status', Value : status },
        { $Type : 'UI.DataField', Label : 'Diagnosis Details', Value : notes }
    ]
);
