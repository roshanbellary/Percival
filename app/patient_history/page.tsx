"use client"
import { useState, useEffect } from "react"
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"

interface MedicalRecord {
    PatientID: number
    FilePath: string
    FirstName: string
    LastName: string
  }
  
export default function PatientHistory() {
    const [email, setEmail] = useState('')
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const userEmail = localStorage.getItem('email')
        if (userEmail) {
        setEmail(userEmail)
        }
    }, [])

    useEffect(() => {
        const fetchMedicalRecords = async () => {
        if (email) {
            try {
            setIsLoading(true)
            //const prevLink = `https://d1-tutorial.cows.workers.dev/api/doctor/${email}/get-files`;
            const response = await fetch(`http://127.0.0.1:5000/get-patients?email=${email}`);
            const data = await response.json()
            console.log(data)
            setMedicalRecords(data['patients'])
            } catch (error) {
            console.error("Failed to fetch medical records:", error)
            } finally {
            setIsLoading(false)
            }
        }
        }
        fetchMedicalRecords()
    }, [email])

    return (
        <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">Your Medical History</h1>
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicalRecords.map((record, index) => (
                <Link key={index} href={`/patient_info/${record.PatientID}/`} passHref>
                <Card className="w-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                        <FileText className="mr-2" size={18} />
                        {`Medical Record: ${record.FirstName+ " " + record.LastName}`}
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Button variant="outline" className="w-full">
                        View Details
                    </Button>
                    </CardContent>
                    <CardContent>
                    <iframe
                        src={record.FilePath}
                        className="w-full h-96 border border-gray-300"
                        title="Patient PDF"
                    />
                    </CardContent>
                </Card>
                </Link>
            ))}
            </div>
        ) : (
            <Card className="w-full p-6 text-center">
            <p className="text-lg text-muted-foreground">No medical records found.</p>
            </Card>
        )}
        <div className="mb-6 text-center mt-5">
            <Link href={`/input_page/`} passHref>
                <Button variant="secondary">
                    Add New Patient
                </Button>
            </Link>
        </div>
        </div>
    )
}
