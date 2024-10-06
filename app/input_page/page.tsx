"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, Send, File } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const frameworks = [
  { value: "english", label: "English" },
  { value: "amharic", label: "Amharic" },
  { value: "arabic", label: "Arabic" },
  { value: "bengali", label: "Bengali" },
  { value: "burmese", label: "Burmese" },
  { value: "chinese", label: "Chinese" },
  { value: "filipino", label: "Filipino" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "gujarati", label: "Gujarati" },
  { value: "hausa", label: "Hausa" },
  { value: "hindi", label: "Hindi" },
  { value: "igbo", label: "Igbo" },
  { value: "indonesian", label: "Indonesian" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "javanese", label: "Javanese" },
  { value: "korean", label: "Korean" },
  { value: "lahnda", label: "Lahnda (Western Punjabi)" },
  { value: "malayalam", label: "Malayalam" },
  { value: "marathi", label: "Marathi" },
  { value: "oromo", label: "Oromo" },
  { value: "persian", label: "Persian (Farsi)" },
  { value: "polish", label: "Polish" },
  { value: "portuguese", label: "Portuguese" },
  { value: "romanian", label: "Romanian" },
  { value: "russian", label: "Russian" },
  { value: "serbo-croatian", label: "Serbo-Croatian" },
  { value: "spanish", label: "Spanish" },
  { value: "sundanese", label: "Sundanese" },
  { value: "swahili", label: "Swahili" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "thai", label: "Thai" },
  { value: "turkish", label: "Turkish" },
  { value: "ukrainian", label: "Ukrainian" },
  { value: "urdu", label: "Urdu" },
  { value: "uzbek", label: "Uzbek" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "yoruba", label: "Yoruba" },
];


export default function InputPage() {
  const [inputType, setInputType] = useState("text"); // To toggle between 'text', 'audio', and 'pdf'
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [ssn, setSsn] = useState("");
  const [language, setLanguage] = useState("english");
  const [languageComboboxOpen, setLanguageComboboxOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // State for PDF file
  const [email, setUserEmail] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setUserEmail(userEmail);
    }
    console.log(email);
  }, [email]);

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
        setAudioURL(url); // Set audio URL for playback
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate that the file is a PDF
      if (file.type !== "application/pdf") {
        alert("Please upload a valid PDF file.");
        return;
      }
      setPdfFile(file);
    }
  };
  useEffect(() => {
    if (inputType != "audio") {
      setAudioBlob(null);
      setAudioURL(null);
    }
    if (inputType != "pdf") {
      setPdfFile(null);
    }
    if (inputType != "text") {
      setMessage("");
    }
  }, [inputType])
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("dob", dob);
    formData.append("ssn", ssn);
    formData.append("language", language);

    if (inputType === "text") {
      formData.append("message", message);
    } else if (inputType === "audio" && audioBlob) {
      formData.append("audio", audioBlob, "recording.wav");
    } else if (inputType === "pdf" && pdfFile) {
      formData.append("pdf", pdfFile);
      console.log("pdf");
    }

    try {
      let responseMessage = false;
      if (inputType === "audio") {
        console.log("hi");
        const response = await fetch("http://127.0.0.1:5000/upload-voice", {
          method: "POST",
          body: formData,
        });
        responseMessage = response.ok;
      } else if (inputType === "text") {
        const response = await fetch("http://127.0.0.1:5000/upload-text", {
          method: "POST",
          body: formData,
        });
        responseMessage = response.ok;
      } else {
        const response = await fetch("http://127.0.0.1:5000/upload-pdf", {
          method: "POST",
          body: formData,
        });
        responseMessage = response.ok;
      }
      if (responseMessage) {
        alert("Form submitted successfully!");
        // Reset form
        setFirstName("");
        setLastName("");
        setDob("");
        setSsn("");
        setMessage("");
        setAudioURL(null);
        setAudioBlob(null);
        setPdfFile(null);
      } else {
        alert("Failed to submit form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    email !== "" ? (
      <div className="min-h-screen bg-background max-w-[1000px] mx-auto">
        <div className="container mx-auto p-6 space-y-8">
          <h1 className="text-4xl font-bold text-primary">Patient Symptoms and Notes</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name Field */}
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-lg font-medium">First Name</Label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-lg font-medium">Last Name</Label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-lg font-medium">Date of Birth</Label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            {/* Social Security Number */}
            <div className="space-y-2">
              <Label htmlFor="ssn" className="text-lg font-medium">SSN</Label>
              <input
                id="ssn"
                type="text"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                placeholder="Enter SSN"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="block text-lg font-medium">Language</Label>

              <Popover open={languageComboboxOpen} onOpenChange={setLanguageComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languageComboboxOpen}
                    className="w-[450px] justify-between"
                  >
                    {language
                      ? frameworks.find((framework) => framework.value === language)?.label
                      : "Select language..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setLanguage(currentValue === language ? "" : currentValue)
                              setLanguageComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                language === framework.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {framework.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>






            </div>

            {/* Input Type Toggle */}
            <div className="space-y-4">
              <Label htmlFor="input-type" className="text-lg font-medium">Choose Input Type</Label>
              <RadioGroup
                id="input-type"
                className="flex space-x-4"
                value={inputType}
                onValueChange={setInputType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Text Input</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio">Audio Input</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF Input</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Input Fields */}
            {inputType === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="patient-info" className="text-lg font-medium">Input Patient Information</Label>
                <Textarea
                  id="patient-info"
                  placeholder="Enter patient information here..."
                  className="min-h-[200px] w-full"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            ) : inputType === "audio" ? (
              <div className="space-y-4">
                <Label className="text-lg font-medium">Record Audio</Label>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full py-8 text-lg flex items-center justify-center"
                  onClick={isRecording ? stopRecording : startRecording}
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
                {/* Audio Playback */}
                {audioURL && (
                  <div className="space-y-2">
                    <Label className="text-lg font-medium">Your Recording:</Label>
                    <audio controls src={audioURL} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="pdf-upload" className="text-lg font-medium flex items-center">
                  <File className="mr-2 h-6 w-6" /> Upload PDF
                </Label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
                {/* Display selected PDF file name */}
                {pdfFile && (
                  <div className="flex items-center space-x-2">
                    <File className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">{pdfFile.name}</span>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full py-6 text-lg flex items-center justify-center">
              <Send className="mr-2 h-5 w-5" /> Submit
            </Button>
          </form>
        </div>
      </div>
    ) : (
      <div style={{ textAlign: "center" }}>Not Signed Up</div>
    )
  );
}
