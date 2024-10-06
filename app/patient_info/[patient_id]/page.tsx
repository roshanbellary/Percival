"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  ChevronDown,
  FileText,
  Heart,
  Home,
  Menu,
  User,
  Users,
} from "lucide-react";

interface MedicalRecord {
  PatientID: number;
  FilePath: string;
  FirstName: string;
  DOB: string;
  LastName: string;
}

export function LoadingSpinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-indigo-200 animate-spin dark:text-indigo-600 fill-indigo-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function Page({ params }: { params: { patient_id: string } }) {
  const [patientData, setPatientData] = useState<MedicalRecord | null>(null);
  const [treatments, setTreatments] = useState<{} | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientResponse = await fetch(
          `http://127.0.0.1:8000/get-patient?id=${params.patient_id}`
        );
        const jsonData = await patientResponse.json();
        const patient = jsonData["patient"];
        setPatientData(patient);

        const treatments = await fetch(
          `http://127.0.0.1:8000/get-patient-treatments?patient_id=${params.patient_id}`
        );
        const treatmentsData = await treatments.json();
        console.log(treatmentsData);
        setTreatments(treatmentsData);

        if (patient && patient.FilePath) {
          console.log("File Path:", patient.FilePath);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPatientData();
  }, [params.patient_id]);

  if (!patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-white">
        <LoadingSpinner />
      </div>
    );
  }

  const patientInitials = (
    patientData.FirstName.charAt(0) + patientData.LastName.charAt(0)
  ).toUpperCase();
  const patientName = [patientData.FirstName, patientData.LastName].join(" ");

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="max-w-4xl container mx-auto">
        <h1 className="text-4xl font-bold text-indigo-800 mb-8">
          Patient Details
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient Summary */}
          <Card className="col-span-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-indigo-500">
                <AvatarImage src="/placeholder-patient.jpg" alt="Patient" />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {patientInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-indigo-800">{patientName}</CardTitle>
                <CardDescription className="text-indigo-600">
                  Patient ID: {patientData.PatientID}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm text-indigo-800">
                    DOB: {new Date(patientData.DOB).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm text-indigo-800">Activity: N/A</span>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg">
                  <Heart className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm text-indigo-800">Heart Rate: N/A</span>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm text-indigo-800">Last Diagnosis: -</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Statistics */}
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-indigo-700">HIV / AIDS Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">N/A</div>
              <p className="text-sm text-indigo-400">Last measured: -</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-indigo-700">CD4 Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">N/A</div>
              <p className="text-sm text-indigo-400">Last measured: -</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-indigo-700">HIV Viral Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">N/A</div>
              <p className="text-sm text-indigo-400">Last measured: -</p>
            </CardContent>
          </Card>

          {/* Electronic Health Record */}
          <Card className="col-span-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-800">Electronic Health Record</CardTitle>
              <CardDescription className="text-indigo-600">Automated APLA Diagnosis Form</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                src={`/${patientData.FilePath}`}
                width="100%"
                height="800"
                title="PDF Preview"
                className="border border-indigo-200 rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Similar Patients */}
          <Card className="col-span-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-800">Similar Patients</CardTitle>
              <CardDescription className="text-indigo-600">
                Treatments Recommended to Similar Patient Profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!treatments ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="text-indigo-700">No treatments data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}