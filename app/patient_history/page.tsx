"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

import Link from 'next/link';

export default function PatientHistory() {
    const [email, setUserEmail] = useState('');
    const [pdfList, setPdfList] = useState([]);

    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            setUserEmail(userEmail);
        }
        console.log(email);
    });

    // Effect to fetch PDF list based on the email
    useEffect(() => {
        const patientPdfs = async () => {
            if (email) {
                try {
                    const response = await fetch(`https://d1-tutorial.cows.workers.dev/api/doctor/${email}/get-files`);
                    const data = await response.json();
                    for (const entry of data) {
                        if (entry["FilePath"]) {
                            setPdfList([...pdfList, entry["FilePath"]]);
                        }
                    }
                    setPdfList(data);
                } catch (error) {
                    console.error(error);
                }
            }
        }
        patientPdfs();
    }, [email]);

    return (
        <div className="p-4">
            <Label>Email</Label>
            <Textarea value={email} onChange={(e) => setUserEmail(e.target.value)} />

            {/* Display PDFs preview */}
            {pdfList.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-bold mb-2">PDF Previews</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pdfList.map((pdf, index) => (
                            <Link key={index} href={`/patient_info/${pdf.PatientID}/`}>
                                <Card className="p-4 shadow-md">
                                    <h3 className="text-md font-semibold mb-2">PDF {index + 1}</h3>
                                    <iframe
                                        src={pdf.FilePath}
                                        width="100%"
                                        height="300"
                                        title={`PDF Preview ${index + 1}`}
                                        className="border border-gray-300"
                                    />
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
