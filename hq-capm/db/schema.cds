using { cuid, managed } from '@sap/cds/common';
namespace hq;

entity Doctor : cuid, managed {
      doctorName   : String(100);
      gender       : Gender;
      mobile       : String(10) @assert.format: '^[0-9]{10}$';
      specialty    : String(100);
}

entity PatientEnquiry : cuid, managed {
      patientName    : String(100);
      age            : Integer;
      gender         : Gender;
      mobile         : String(10) @assert.format: '^[0-9]{10}$';
      symptoms       : String(255);
      appointments   : Composition of many Queue on appointments.patient = $self;
      diagnoses      : Composition of many Diagnosis on diagnoses.patient = $self;
}

entity Queue : cuid, managed {
      patient               : Association to PatientEnquiry;
      doctor                : Association to Doctor;
      doctorName            : String(100);
      specialty             : String(100);
      appointmentDate       : Date;
      startDateTime         : DateTime;
      endDateTime           : DateTime;
      tokenNumber           : Integer;
      status                : Status default 'Pending';
      notes                 : String(255);
      consultationStartedAt : DateTime;
      consultationEndedAt   : DateTime;
}

entity Diagnosis : cuid, managed {
      patient        : Association to PatientEnquiry;
      doctor         : Association to Doctor;
      queue          : Association to Queue;
      diagnosisNotes : String(500);
      prescription   : String(500);
      startDateTime  : DateTime;
      endDateTime    : DateTime;
}

type Status : String enum {
    Pending;
    Confirmed;
    InProgress;
    Completed;
    Cancelled;
}

type Gender : String enum {
    Male;
    Female;
    Other;
}