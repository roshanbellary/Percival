"""
    I have the below fields for a csv that contains data about HIV / AIDS patients

id,daysOld,diagnosisDays,hivA,hivS,aidsA,aidsS,fever,fatigue,diarrhea,other,cd4,pcp,ks,other,symptoms,cd4count,cd4percentage,HIVviral,neutrophil,cellsmm3,otherIllness,KARNOFSKY,KARNOFSKYSTAGE,Nursing,Dental,tbScreen,tbDiagnosis,tbPrevent,tbActive,tbCompliance

The map below describes them
id: increment from 1
daysOld: How old the patient is in Days
diagnosisDays: How many days since the patient was diagnosed
hivA: If the patient has HIV but asymptomatic (1 for yes, 0 for no)
hivS: If the patient has HIV and symptomatic (1 for yes, 0 for no)
aidsA: If the patient has AIDS but asymptomatic (1 for yes, 0 for no)
aidsS: If the patient has AIDS and symptomatic (1 for yes, 0 for no)
fever: If the patient has fever (1 for yes, 0 for no)
fatigue: If the patient has fatigue (1 for yes, 0 for no)
diarrhea: If the patient has diarrhea (1 for yes, 0 for no)
other: If the patient has other symptoms (1 for yes, 0 for no). Always ouput 0 for now.
cd4: If the patient has CD4 < 200 or CD4% < 14% (1 for yes, 0 for no)
pcp: If the patient has Pneumocystis pneumonia (1 for yes, 0 for no)
ks: If the patient has Kaposi's sarcoma (1 for yes, 0 for no)
other: If the patient has other symptoms (1 for yes, 0 for no). Always ouput 0 for now.
symptoms: The number of addtional symptoms the patient has
cd4count: The CD4 count of the patient
cd4percentage: The CD4 percentage of the patient
HIVviral: The HIV viral load of the patient
neutrophil: The neutrophil count of the patient
cellsmm3: The total number of cells per mm3
otherIllness: If the patient has other illnesses (1 for yes, 0 for no). Always ouput 0 for now.
KARNOFSKY: The Karnofsky score of the patient as a multiple of 10
KARNOFSKYSTAGE: The Karnofsky stage of the patient (1 for 80-100, 2 for 50-70, 3 for 20-40, 4 for 0-10)
Nursing: If the patient meets the nursing facility level of care (1 for yes, 0 for no) - Output random for now, bias towards 1
Dental: If the patient meets the dental facility level of care (1 for yes, 0 for no) - Output random for now, bias towards 1
tbScreen: If the patient has been screened for TB (1 for yes, 0 for no) - Random, very strong bias towards 1
tbDiagnosis: If the patient has been diagnosed with TB (1 for yes, 0 for no, only 1 if tbScreen is 1) - Random, very strong bias towards 1s
tbPrevent: If the patient is on TB prevention medication (1 for yes, 0 for no, only 1 if tbScreen is 1) - Random, bias towards 1s
tbActive: If the patient is on TB active medication (1 for yes, 0 for no, only 1 if tbDiagnosis is 1) - Random, bias towards 1s
tbCompliance: If the patient is NOT compliant with TB medication (1 for yes, 0 for no, only 1 if tbDiagnosis is 1) - Random, Strong bias towards 0s







    """
