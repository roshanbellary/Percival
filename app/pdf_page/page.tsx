"use client"
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { patient_id: string } }) {
    const [filePath, setFilePath] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch(`/get-patient/${params.patient_id}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.file_path) {
                        setFilePath(data.file_path);
                        setLoading(false);
                        // Fetch the PDF once the file path is available
                        fetchPdf(data.file_path);
                    }
                })
                .catch((error) => console.error("Error fetching patient data:", error));
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup the interval on unmount
    }, [params.patient_id]);

    const fetchPdf = (path: string) => {
        setPdfUrl(path);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setPdfFile(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (pdfFile) {
            const formData = new FormData();
            formData.append("pdf", pdfFile);

            try {
                const response = await fetch(`/upload-pdf/${params.patient_id}`, {
                    method: "POST",
                    body: formData,
                });
                
                if (!response.ok) {
                    throw new Error("Failed to upload PDF");
                }

                // Optionally handle response
                const result = await response.json();
                console.log(result); // or handle success notification
            } catch (error) {
                console.error("Error uploading PDF:", error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold">Generated PDF</h2>
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-96 border"
                            title="Generated PDF"
                        ></iframe>
                    ) : (
                        <p>No PDF available.</p>
                    )}
                    <div className="mt-4">
                        <label htmlFor="pdf-upload" className="block mb-2">
                            Upload a new PDF:
                        </label>
                        <input
                            type="file"
                            id="pdf-upload"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="block mb-4"
                        />
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Submit PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}