from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import librosa as lb
import torch
import pandas as pd
from pydub import AudioSegment
from pypdf import PdfReader
from flask_cors import CORS
import os
import whisper
import json
import tempfile
from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv
# MongoDB connection setup
load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")
print(mongo_uri)
client = MongoClient(mongo_uri)  # Change to your MongoDB URI
db = client["percival"]  # Replace with your database name
patients_collection = db["patients"]  # Define patients collection
doctors_collection = db["doctors"]  # Define doctors collection
fs = gridfs.GridFS(db)
app = Flask(__name__)
CORS(app, origins=["*"])

@app.route('/get-patient', methods=['GET'])
def get_patient():
    patient_id = request.args.get('id')  # Get the patient ID from query parameters
    
    if not patient_id:
        return jsonify({'message': 'Patient ID not provided'}), 400

    try:
        # Convert the patient_id to ObjectId if needed
        patient = patients_collection.find_one({'_id': ObjectId(patient_id)})
        
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404

        # Constructing the medical record response
        record = {
            'PatientID': str(patient['_id']),  # Assuming MongoDB's ObjectId is used
            'FilePath': patient.get('file_path', ''),  # Assuming 'file_path' contains the PDF or medical file
            'FirstName': patient['first_name'],
            'LastName': patient['last_name'],
            'DOB': patient.get('dob', ''),  # Adding DOB if it's part of the schema
            'DoctorID': str(patient.get('doctor_id', ''))  # Adding DoctorID if it's part of the schema
        }

        return jsonify({'patient': record}), 200
    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

#getting all patients for a doctor
@app.route('/get-patients', methods=['GET'])
def get_patients():
    doctor_email = request.args.get('email')
    
    if not doctor_email:
        return jsonify({'message': 'Doctor email not provided'}), 400
    
    try:
        doctor = doctors_collection.find_one({'email': doctor_email})
        doctorId = str(doctor['_id'])
        patients = list(patients_collection.find({'doctor_id': doctorId}))
        if not patients:
            return jsonify({'message': 'No patients found for this doctor'}), 404
        medical_records = []
        for patient in patients:
            record = {
                'PatientID': str(patient['_id']),  # Assuming MongoDB's ObjectId is used
                'FilePath': patient.get('file_path', ''),  # Assuming 'file_path' contains the PDF or medical file
                'FirstName': patient['first_name'],
                'LastName': patient['last_name']
            }
            medical_records.append(record)
        return jsonify({'patients': medical_records}), 200
    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# importing whisper model
model = whisper.load_model("base")

result_text = ""
def send_transcript(file):
    result = model.transcribe(file)
    transcription = result["text"]
    return transcription

    
@app.route('/upload-voice', methods=['POST'])
def get_transcript():
    """Handle audio file uploads and return the transcription."""
    # Extract the form data fields
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    language = request.form.get('language')
    # Extract the audio file
    audio_file = request.files.get('audio')
    
    if not audio_file:
        return {'message': 'No audio file provided'}, 400

    # Create a temporary file to save the audio Blob
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(audio_file.read())
        tmp_file_path = tmp_file.name

    # Convert the audio file to WAV format using pydub
    audio = AudioSegment.from_file(tmp_file_path)  # Automatically detects format
    wav_path = 'uploaded_recording.wav'
    audio.export(wav_path, format='wav')  # Export as .wav

    # Transcribe the WAV file using Whisper
    transcription = send_transcript(wav_path)
    print(transcription)
    # Clean up: remove the temporary WAV file
    os.remove(wav_path)
    os.remove(tmp_file_path)

    # Combine transcription with user information
    response_text = f"First Name: {first_name}, Last Name: {last_name}, DOB: {dob}, SSN: {ssn}, Language: {language}, Transcription: {transcription}"
    global result_text
    result_text = response_text
    return jsonify({'transcription': response_text}), 200

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    language = request.form.get('language')
    pdf_file = request.form.get('pdf')
    if not pdf_file:
        return jsonify({'message': 'No pdf file provided'}), 400
    reader = PdfReader(pdf_file)
    pdf_text = ""
    for page in reader.pages:
        pdf_text += page.extract_text()
    response_text = f"First Name: {first_name}, Last Name: {last_name}, DOB: {dob}, SSN: {ssn}, Language: {language}, Transcription: {pdf_text}"
    global result_text
    result_text = response_text
    print(response_text)
    return jsonify({'transcription': response_text}), 200

@app.route('/upload-text', methods=['POST'])
def upload_text():
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    text = request.form.get('message')
    language = request.form.get('language')
    result = {"first_name": first_name, "last_name": last_name,
                       "dob": dob, "ssn": ssn, "message": text, "language": language}
    response_text = f"First Name: {first_name}, Last Name: {last_name}, DOB: {dob}, SSN: {ssn}, Language: {language}, Transcription: {text}"
    global result_text
    result_text = response_text
    print(response_text)
    return jsonify({'transcription': response_text}), 200

# def add_patient():
#     global result_text
#     if len(result_text) > 0:
#         # do pdf making code
#         # create a patient entity based upon given pdf
    


@app.route('/get-pdf', methods=['GET'])
def get_pdf():
    if (len(result_text) > 0):
        return jsonify({'message': result_text}), 200
    else:
        return jsonify({'message': 'No data uploaded'}), 400
def translate_text(text, target_language):
    """Translate text to the target language."""
    model_name = f'Helsinki-NLP/opus-mt-en-{target_language}'
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    translated_text = model.generate(
        **tokenizer(text, return_tensors="pt"), max_length=128)[0]
    translated_text = tokenizer.decode(
        translated_text, skip_special_tokens=True)

    return translated_text


def get_language_id(language):
    """Retrieve language ID from a CSV file."""
    df = pd.read_csv('./data_pipeline/language_ids.csv')
    row = df[df['Language'] == language]
    if not row.empty:
        return row.iloc[0]['ID']
    return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
