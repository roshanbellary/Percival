"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MedicalRecord {
  PatientID: number;
  FilePath: string;
  FirstName: string;
  LastName: string;
}

export const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function PatientHistory() {
  const [email, setEmail] = useState("");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (email) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `http://127.0.0.1:8000/get-patients?email=${email}`
          );
          const data = await response.json();
          console.log(data);
          setMedicalRecords(data["patients"]);
          setFilteredMedicalRecords(data["patients"]);
        } catch (error) {
          console.error("Failed to fetch medical records:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchMedicalRecords();
  }, [email]);

  const getColorForPatient = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">Your Patients</h1>
          <Link href={`/input_page/`} passHref>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
            </Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
          <Input
            className="pl-10 pr-4 py-2 w-full border-2 border-indigo-200 focus:border-indigo-500 rounded-full"
            placeholder="Search for patient"
            onChange={(e) => {
              const searchValue = e.target.value;
              if (searchValue === "") {
                setFilteredMedicalRecords(medicalRecords);
              } else {
                const filtered = medicalRecords.filter((record) => {
                  return record.FirstName.toLowerCase().includes(searchValue.toLowerCase()) || record.LastName.toLowerCase().includes(searchValue.toLowerCase());
                });
                setFilteredMedicalRecords(filtered);
              }
            }}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMedicalRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMedicalRecords.map((record, index) => (
              <Link
                key={index}
                href={`/patient_info/${record.PatientID}/`}
                passHref
              >
                <Card className="w-full hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 cursor-pointer" style={{ borderLeftColor: getColorForPatient(index) }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                      <FileText className="mr-2" size={18} />
                      {`${record.FirstName} ${record.LastName}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className={`h-12 w-12 ${getColorForPatient(index)} text-white`}>
                        <AvatarFallback className={getColorForPatient(index)}>{record.FirstName[0]}{record.LastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 truncate text-ellipsis">ID: {record.PatientID.toString().slice(0, 15)}...</p>
                      </div>
                      <div className="flex-grow"></div>
                      <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-300 hover:bg-indigo-50">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full p-6 text-center">
            <p className="text-lg text-muted-foreground">
              No medical records found.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
