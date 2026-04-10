using { hq as db } from '../db/schema';

service HospitalService {
  @odata.draft.enabled
  entity PatientEnquiry as projection on db.PatientEnquiry;

  @odata.draft.enabled
  entity Doctor as projection on db.Doctor;
  entity Queue as projection on db.Queue;
  entity Diagnosis as projection on db.Diagnosis;
}