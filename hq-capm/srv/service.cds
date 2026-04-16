using { hq as db } from '../db/schema';

service HospitalService {
  @odata.draft.enabled
  entity PatientEnquiry as projection on db.PatientEnquiry;

  @odata.draft.enabled
  entity Doctor as projection on db.Doctor;
  entity Queue as projection on db.Queue;
  entity Diagnosis as projection on db.Diagnosis;
  
}

service DashboardService {

    // KPI 1: Total Queue Count
    // @readonly
    // entity TotalQueueCount as select from db.Queue {
    //     key count(ID) as totalCount
    // };
    @Aggregation.ApplySupported: {
        GroupableProperties: [doctor_ID, status],
        AggregatableProperties: [ID]
    }
    entity AllQueue as projection on db.Queue;

    // KPI 2: Queue Count by Status
    @readonly
    @Analytics.dataCategory: #CUBE
    @Aggregation.ApplySupported: {
        GroupableProperties: ['status'],
        AggregatableProperties: ['Total']
    }
    entity QueueStatusAnalytics as select from db.Queue {
        @Analytics.Dimension: true
        key status,

        @Analytics.Measure: true
        @Aggregation.default: #SUM
        count(ID) as Total : Integer
    }
    group by status;


    @readonly
    entity DoctorStatus as select from db.Queue{
        @Analytics.Dimension: true
        key doctorName,

        @Analytics.Measure: true
        @Aggregation.default: #SUM
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingCases: Integer,

        @Analytics.Measure: true
        @Aggregation.default: #SUM
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedCases: Integer
    }
    group by doctorName

}
