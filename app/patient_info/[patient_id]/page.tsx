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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
      <span class="sr-only">Loading...</span>
    </div>
  );
}

export default function Page({ params }: { params: { patient_id: string } }) {
  const [patientData, setPatientData] = useState<MedicalRecord>(); // Initialize state
  const [treatments, setTreatments] = useState<{}>(null); // Initialize state
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientResponse = await fetch(
          `http://127.0.0.1:8000/get-patient?id=${params.patient_id}`
        );
        const jsonData = await patientResponse.json();
        const patient = jsonData["patient"];

        // Set the patient data to state
        setPatientData(patient);

        const treatments = await fetch(
          `http://127.0.0.1:8000/get-patient-treatments?patient_id=${params.patient_id}`
        );

        const treatmentsData = await treatments.json();
        console.log(treatmentsData);
        setTreatments(treatmentsData);

        // Log the file path
        if (patient && patient.FilePath) {
          console.log("File Path:", patient.FilePath);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPatientData(); // Call the fetch function
  }, [params.patient_id]); // Dependency array to refetch if patient_id changes

  // If patientData is not loaded yet, return a loading state or placeholder
  if (!patientData) {
    return <div>Loading...</div>;
  }

  const patientInitials = (
    patientData.FirstName.charAt(0) + patientData.LastName.charAt(0)
  ).toUpperCase();
  const patientName = [patientData.FirstName, patientData.LastName].join(" ");

  return (
    <main className="flex-1 overflow-y-auto p-6 max-w-[1000px] mx-auto">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Patient Summary */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-patient.jpg" alt="Patient" />
              <AvatarFallback>{patientInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{patientName}</CardTitle>
              {/* <CardDescription>Patient ID: 12345 • Male, 45 years old</CardDescription> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  DOB: {new Date(patientData.DOB).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Last Diagnosis: -</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Vital Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>HIV / AIDS Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">N/A</div>
            <p className="text-sm text-gray-500">Last measured: </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CD4 Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">N/A</div>
            <p className="text-sm text-gray-500">Last measured: </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>HIV Viral Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">N/A</div>
            <p className="text-sm text-gray-500">Last measured: </p>
          </CardContent>
        </Card>

        {/* Recent Medical History */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Electronic Health Record</CardTitle>
            <CardDescription>Automated APLA Diagnosis Form </CardDescription>
          </CardHeader>

          <CardContent>
            <iframe
              src={`http://localhost:3000${patientData.FilePath}`}
              width="100%"
              height="800"
              title="PDF Preview"
              className="border border-gray-300"
            />
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Similar Patients</CardTitle>
            <CardDescription>
              Treatments Recommended to Similar Patient Profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!treatments ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <LoadingSpinner />
              </div>
            ) : (
              <div></div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
