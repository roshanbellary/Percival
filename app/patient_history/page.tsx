"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MedicalRecord {
  PatientID: number;
  FilePath: string;
  FirstName: string;
  LastName: string;
}

export const LoadingSpinner = ({ className }) => {
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
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>;
};

export default function PatientHistory() {
  const [email, setEmail] = useState("");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState<MedicalRecord[]>();
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
          //const prevLink = `https://d1-tutorial.cows.workers.dev/api/doctor/${email}/get-files`;
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




  return (
    <div className="max-w-[1000px] mx-auto p-6 max-w-4xl">
      <div className="flex pb-4">
        <h1 className="text-4xl font-bold text-primary">
          Your Patients
        </h1>
        <div className="grow"></div>
        <Link href={`/input_page/`} passHref>
          <Button variant="secondary">Add New Patient</Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      ) : medicalRecords ? (
        <div className="grid gap-6">
          <Input type="text" placeholder="Search for patient" onChange={(e) => {
            const searchValue = e.target.value;
            if (searchValue === "") {
              setFilteredMedicalRecords(medicalRecords);
            } else {
              const filtered = medicalRecords.filter((record) => {
                return record.FirstName.toLowerCase().includes(searchValue.toLowerCase()) || record.LastName.toLowerCase().includes(searchValue.toLowerCase());
              });
              setFilteredMedicalRecords(filtered);
            }
          }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedicalRecords!.map((record, index) => (
              <Link
                key={index}
                href={`/patient_info/${record.PatientID}/`}
                passHref
              >
                <Card className="w-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <FileText className="mr-2" size={18} />
                      {`Patient Record: ${record.FirstName + " " + record.LastName
                        }`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="w-full p-6 text-center">
          <p className="text-lg text-muted-foreground">
            No medical records found.
          </p>
        </Card>
      )}
    </div>
  );
}
