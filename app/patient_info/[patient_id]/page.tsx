"use client"
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ChevronDown, FileText, Heart, Home, Menu, User, Users } from "lucide-react";
interface MedicalRecord {
  PatientID: number
  FilePath: string
  FirstName: string
  DOB: string
  LastName: string
}

export default function Page({ params }: { params: { patient_id: string } }) {
  const [patientData, setPatientData] = useState<MedicalRecord>(); // Initialize state

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientResponse = await fetch(`http://127.0.0.1:5000/get-patient?id=${params.patient_id}`);
        const jsonData = await patientResponse.json();
        const patient = jsonData["patient"];

        // Set the patient data to state
        setPatientData(patient);

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

  const patientInitials = (patientData.FirstName.charAt(0) + patientData.LastName.charAt(0)).toUpperCase();
  const patientName = [patientData.FirstName, patientData.LastName].join(' ');

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
                <span className="text-sm text-gray-500">DOB: {patientData.DOB}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Blood Type: A+</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Allergies: Penicillin</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Last Visit: 01/06/2023</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">120/80 mmHg</div>
            <p className="text-sm text-gray-500">Last measured: 2 hours ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Heart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72 bpm</div>
            <p className="text-sm text-gray-500">Last measured: 2 hours ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Body Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.6 °F</div>
            <p className="text-sm text-gray-500">Last measured: 2 hours ago</p>
          </CardContent>
        </Card>

        {/* Recent Medical History */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Medical History</CardTitle>
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
      </div>
    </main>
  );
}
