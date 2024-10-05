"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";

export default function InputPage() {
  const [inputType, setInputType] = useState("text"); // To toggle between 'text' and 'audio'
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [email, setUserEmail] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Function to start recording
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setUserEmail(userEmail);
    }
    console.log(email);
  });
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Media Devices API not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone.");
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (inputType === "text") {
      formData.append("message", message);
    } else if (inputType === "audio" && audioBlob) {
      formData.append("audio", audioBlob, "recording.wav");
    }

    // Example: Sending data to an API endpoint
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Form submitted successfully!");
        // Reset form
        setMessage("");
        setAudioURL(null);
        setAudioBlob(null);
      } else {
        alert("Failed to submit form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };
  return (
    email !== "" ?
    <div style={{textAlign:"center"}}>
        <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight first:mt-0">
            Patient Symptoms and Notes
        </h2>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
        {/* Input Type Toggle */}
        <div className="grid w-full gap-2">
            <Label>Choose Input Type</Label>
            <div className="flex space-x-4">
            <Button
                type="button"
                variant={inputType === "text" ? "primary" : "outline"}
                onClick={() => setInputType("text")}
            >
                Text Input
            </Button>
            <Button
                type="button"
                variant={inputType === "audio" ? "primary" : "outline"}
                onClick={() => setInputType("audio")}
            >
                Audio Input
            </Button>
            </div>
        </div>
        {inputType === "text" ? (
            <div className="grid w-full gap-2">
            <Label htmlFor="patient-info">Input Patient Information</Label>
            <Textarea
                id="patient-info"
                placeholder="Enter patient information here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required={inputType === "text"}
            />
            </div>
        ) : (
            <div className="grid w-full gap-2">
            <Label>Audio Input</Label>
            <div className="flex items-center space-x-4">
                {!isRecording ? (
                <Button type="button" onClick={startRecording}>
                    Start Recording
                </Button>
                ) : (
                <Button type="button" variant="destructive" onClick={stopRecording}>
                    Stop Recording
                </Button>
                )}
                {audioURL && (
                <audio controls src={audioURL} className="mt-2 w-full">
                    Your browser does not support the audio element.
                </audio>
                )}
            </div>
            </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
            <Button type="submit">Submit</Button>
        </div>
        </form>
    </div>: <div style={{textAlign:"center"}}>Not Signed Up</div>)
}