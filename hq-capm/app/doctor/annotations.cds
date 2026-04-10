using HospitalService as service from '../../srv/service';

annotate service.Doctor with @Capabilities.InsertRestrictions.Insertable : true;
annotate service.Doctor with @Capabilities.UpdateRestrictions.Updatable : true;
annotate service.Doctor with @Capabilities.DeleteRestrictions.Deletable : true;
annotate service.Doctor with @UI.CreateHidden : false;
annotate service.Doctor with @UI.UpdateHidden : false;
annotate service.Doctor with @UI.DeleteHidden : false;

annotate service.Doctor with @(
    UI.HeaderInfo : {
        TypeName : 'Doctor',
        TypeNamePlural : 'Doctors',
        Title : {
            $Type : 'UI.DataField',
            Value : doctorName
        },
        Description : {
            $Type : 'UI.DataField',
            Value : specialty
        }
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
        }
    ],

    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Doctor Name', Value : doctorName },
        { $Type : 'UI.DataField', Label : 'Gender', Value : gender },
        { $Type : 'UI.DataField', Label : 'Mobile', Value : mobile },
        { $Type : 'UI.DataField', Label : 'Specialty', Value : specialty }
    ],

    Common.SemanticKey : [doctorName, mobile]
);
