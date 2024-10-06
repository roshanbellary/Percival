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
from bson.objectid import ObjectId
from dotenv import load_dotenv
from datetime import datetime

from pdfs.full_pdf_pipeline import create_anon_pdf
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
    # Get the patient ID from query parameters
    patient_id = request.args.get('id')

    if patient_id is None:
        return jsonify({'message': 'Patient ID not provided'}), 400

    try:
        # Convert the patient_id to ObjectId if needed
        patient = patients_collection.find_one({'_id': ObjectId(patient_id)})
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404

        # Constructing the medical record response
        record = {
            'PatientID': str(patient['_id']),
            'FilePath': patient.get('file_path', ''),
            'FirstName': patient['first_name'],
            'LastName': patient['last_name'],
            'DOB': patient.get('dob', ''),
            'DoctorID': str(patient.get('doctor_id', ''))
        }
        print(patient.get('file_path', ''),)

        print("HEY")

        return jsonify({'patient': record}), 200
    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# getting all patients for a doctor


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
                # Assuming MongoDB's ObjectId is used
                'PatientID': str(patient['_id']),
                # Assuming 'file_path' contains the PDF or medical file
                'FilePath': patient.get('file_path', ''),
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
def upload_transcript():
    """Handle audio file uploads and return the transcription."""
    # Extract the form data fields
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    language = request.form.get('language')
    drEmailID = request.form.get('drEmailID')
    # Extract the audio file
    audio_file = request.files.get('audio')

    if not audio_file:
        return {'message': 'No audio file provided'}, 400
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(audio_file.read())
        tmp_file_path = tmp_file.name

    # Convert the audio file to WAV format using pydub
    # Automatically detects format
    audio = AudioSegment.from_file(tmp_file_path)
    wav_path = 'uploaded_recording.wav'
    audio.export(wav_path, format='wav')
    transcription = send_transcript(wav_path)
    print(transcription)
    os.remove(wav_path)
    os.remove(tmp_file_path)

    config = {
        "FIRSTNAME": first_name,
        "LASTNAME": last_name,
        "DOB": dob,
        "SSN_1": ssn[:3],
        "SSN_2": ssn[3:5],
        "SSN_3": ssn[5:],
        "LANGUAGE": language,
        "DATE": datetime.today().strftime('%m/%d/%Y'),
        "PATIENT_DATA": transcription,
        "_drEmailID": drEmailID
    }

    status = create_patient(config, drEmailID)
    if status:
        return jsonify({'message': 'Patient created successfully'}), 200
    else:
        return jsonify({'message': 'Doctor not found'}), 401


@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    language = request.form.get('language')
    drEmailID = request.form.get('drEmailID')
    pdf_file = request.form.get('pdf')
    doctor_email = request.form.get('doctor_email')
    if not pdf_file:
        return jsonify({'message': 'No pdf file provided'}), 400
    reader = PdfReader(pdf_file)
    pdf_text = ""
    for page in reader.pages:
        pdf_text += page.extract_text()

    config = {
        "FIRSTNAME": first_name,
        "LASTNAME": last_name,
        "DOB": dob,
        "SSN_1": ssn[:3],
        "SSN_2": ssn[3:5],
        "SSN_3": ssn[5:],
        "LANGUAGE": language,
        "DATE": datetime.today().strftime('%m/%d/%Y'),
        "PATIENT_DATA": pdf_text,
        "_drEmailID": drEmailID
    }
    # return jsonify({'transcription': response_text}), 200

    status = create_patient(config, drEmailID)
    if status:
        return jsonify({'message': 'Patient created successfully'}), 200
    else:
        return jsonify({'message': 'Doctor not found'}), 401


@app.route('/upload-text', methods=['POST'])
def upload_text():
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    text = request.form.get('message')
    language = request.form.get('language')
    drEmailID = request.form.get('drEmailID')

    config = {
        "FIRSTNAME": first_name,
        "LASTNAME": last_name,
        "DOB": dob,
        "SSN_1": ssn[:3],
        "SSN_2": ssn[3:5],
        "SSN_3": ssn[5:],
        "LANGUAGE": language,
        "DATE": datetime.today().strftime('%m/%d/%Y'),
        "PATIENT_DATA": text,
        "_drEmailID": drEmailID
    }

    status = create_patient(config, drEmailID)
    if status:
        return jsonify({'message': 'Patient created successfully'}), 200
    else:
        return jsonify({'message': 'Doctor not found'}), 401


def create_patient(config, doctor_id):
    doctor_details = doctors_collection.find_one({'email': doctor_id})
    if not doctor_details:
        return False

    config["DRFIRSTNAME"] = doctor_details['first_name']
    config["DRLASTNAME"] = doctor_details['last_name']
    config["DRLICENSE"] = doctor_details['license_number']
    config["DRPHONE"] = doctor_details['Phone']
    config["DRADDRESS"] = doctor_details['Address']
    config["DRCITY"] = doctor_details['City']
    config["DRSTATE"] = doctor_details['State']
    print("HERE")
    pdf_store_loc = create_anon_pdf(config)

    patient_upload_data = {
        "first_name": config["FIRSTNAME"],
        "last_name": config["LASTNAME"],
        "dob": config["DOB"],
        "ssn": config["SSN_1"] + config["SSN_2"] + config["SSN_3"],
        "language": config["LANGUAGE"],
        "date_updated": config["DATE"],
        "pdf": pdf_store_loc,
        "doctor_id": doctor_id,
        "instruction": config["PATIENT_DATA"],
    }
    print(patient_upload_data)
    patients_collection.insert_one(patient_upload_data)

    return True


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
    app.run(host='0.0.0.0', port=8000, debug=True)
