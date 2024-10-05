"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Card, Typography } from 'shadcn/ui'; // Import necessary components from ShadCN

export default function PatientPdfPage() {
    const [doctorEmail, setDoctorEmail] = useState("");
    const [patientName, setPatientName] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Retrieve doctorEmail and patientName from the URL query parameters
        const { doctorEmail, patientName } = router.query;
        if (doctorEmail && patientName) {
            setDoctorEmail(doctorEmail[0]);
            setPatientName(patientName[0]);
        }
    }, [router.query]);

    useEffect(() => {
        async function fetchPdf() {
            if (doctorEmail && patientName) {
                try {
                    const response = await fetch(`https://d1-tutorial.cows.workers.dev/api/patient-pdf?doctorEmail=${doctorEmail}&patientName=${patientName}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const pdfUrl = await response.text();
                    if (pdfUrl) {
                        setPdfUrl(pdfUrl);
                    }
                } catch (error) {
                    console.error('Error fetching the PDF:', error);
                }
            }
        }
        fetchPdf();
    }, [doctorEmail, patientName]); // Dependency array to trigger fetch when email or name changes

    return (
        <div className="flex flex-col items-center p-6">
            <Card className="w-full max-w-2xl shadow-lg">
                <Typography variant="h1" className="mb-4">Patient PDF</Typography>
                {doctorEmail && patientName ? (
                    <>
                        <Typography variant="body1" className="mb-2">
                            Fetching PDF for {patientName} (Doctor: {doctorEmail})...
                        </Typography>
                        {pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-96 border border-gray-300"
                                title="Patient PDF"
                            />
                        ) : (
                            <Typography variant="body2">Loading PDF...</Typography>
                        )}
                    </>
                ) : (
                    <Typography variant="body2">Please provide the necessary information in the URL.</Typography>
                )}
            </Card>
            <Button variant="secondary" className="mt-4" onClick={() => router.push('/')}>
                Back to Home
            </Button>
        </div>
    );
}