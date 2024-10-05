"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mic, Send } from "lucide-react"

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
    (
      <div className="min-h-screen bg-background max-w-[1000px] mx-auto">
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-4xl font-bold text-primary">Patient Symptoms and Notes</h1>
        <form className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="input-type" className="text-lg font-medium">Choose Input Type</Label>
            <RadioGroup id="input-type" className="flex space-x-4" defaultValue="text" onValueChange={setInputType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text Input</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio">Audio Input</Label>
              </div>
            </RadioGroup>
          </div>

          {inputType === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="patient-info" className="text-lg font-medium">Input Patient Information</Label>
              <Textarea
                id="patient-info"
                placeholder="Enter patient information here..."
                className="min-h-[200px] w-full"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="text-lg font-medium">Record Audio</Label>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                className="w-full py-8 text-lg"
                onClick={isRecording ? () => stopRecording() : () => startRecording()}
              >
                {isRecording ? (
                  <>
                    <Mic className="mr-2 h-6 w-6" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-6 w-6" /> Start Recording
                  </>
                )}
              </Button>
            </div>
          )}

          <Button type="submit" className="w-full py-6 text-lg" onClick={(e) => {handleSubmit(e)}}>
            <Send className="mr-2 h-5 w-5" /> Submit
          </Button>
        </form>
      </div>
    </div>
    )
    
    : <div style={{textAlign:"center"}}>Not Signed Up</div>)
}