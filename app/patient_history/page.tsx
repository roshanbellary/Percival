"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function PatientHistory() {
    const [email, setUserEmail] = useState('');
    const [pdfList, setPdfList] = useState([]);

    // Effect to set user email from local storage
    useEffect(() => {
        const setAuthEmail = () => {
            const storedEmail = localStorage.getItem('email');
            if (storedEmail) {
                setUserEmail(storedEmail);
            }
        }
        setAuthEmail();
    }, []); // Run only once on mount

    // Effect to fetch PDF list based on the email
    useEffect(() => {
        const patientPdfs = async () => {
            if (email) {
                try {
                    const response = await fetch(`http://localhost:3000/api/doctor/${email}/get-files`);
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
            <Button onClick={() => {
                localStorage.setItem('email', email);
                alert('Email saved');
            }}>Save</Button>

            {/* Display PDFs preview */}
            {pdfList.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-bold mb-2">PDF Previews</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pdfList.map((pdf, index) => (
                            <Card key={index} className="p-4 shadow-md">
                                <h3 className="text-md font-semibold mb-2">PDF {index + 1}</h3>
                                <iframe
                                    src={pdf.FilePath} 
                                    width="100%"
                                    height="300"
                                    title={`PDF Preview ${index + 1}`}
                                    className="border border-gray-300"
                                />
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}