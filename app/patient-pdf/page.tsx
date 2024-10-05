"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
                    const response = await fetch(`/api/patient-pdf?doctorEmail=${doctorEmail}&patientName=${patientName}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    
                } catch (error) {
                    console.error('Error fetching the PDF:', error);
                }
            }
        }
        fetchPdf();
    }, [doctorEmail, patientName]); // Dependency array to trigger fetch when email or name changes

    return (
        <div>
            <h1>Patient PDF</h1>
            {doctorEmail && patientName ? (
                <p>Fetching PDF for {patientName} (Doctor: {doctorEmail})...</p>
            ) : (
                <p>Please provide the necessary information in the URL.</p>
            )}
        </div>
    );
}