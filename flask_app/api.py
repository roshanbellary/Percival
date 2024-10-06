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
from pathlib import Path

from pdfs.full_pdf_pipeline import create_anon_pdf
from pdfs.ml.ml_find_similar import find_closest_pipeline
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
        # doctorId = str(doctor['_id'])
        patients = list(patients_collection.find({'doctor_id': doctor_email}))
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

    patient_id = create_patient(config, drEmailID)
    if patient_id:
        return jsonify({'message': 'Patient created successfully',
                        'patientId': str(patient_id)}), 200
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

    patient_id = create_patient(config, drEmailID)
    if patient_id:
        return jsonify({'message': 'Patient created successfully',
                        'patientId': str(patient_id)}), 200
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

    patient_id = create_patient(config, drEmailID)
    if patient_id:
        return jsonify({'message': 'Patient created successfully',
                        'patientId': str(patient_id)}), 200
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
    result = patients_collection.insert_one(patient_upload_data)

    return result.inserted_id


@app.route('/get-pdf', methods=['GET'])
def get_pdf():
    if (len(result_text) > 0):
        return jsonify({'message': result_text}), 200
    else:
        return jsonify({'message': 'No data uploaded'}), 400


def get_field_value(pdd, field_path, default=-2, true_value=1, false_value=0):
    """
    Helper function to retrieve a value from the dictionary safely.
    If the field does not exist, return the default value.
    If it does exist, return true_value or false_value depending on the field content.
    """
    try:
        field_value = pdd[field_path]['/V']
        return true_value if field_value == '/No' else false_value
    except KeyError:
        return default


def get_days_old(pdd, field_path, default=-2):
    """
    Helper function to calculate the number of days between today and a given date.
    Returns the default value if the field is not found or invalid.
    """
    try:
        date_value = pd.to_datetime(pdd[field_path]['/V'])
        return (datetime.today() - date_value).days
    except (KeyError, ValueError):
        return default


def get_symptoms_count(pdd, symptom_field_1, symptom_field_2, default=-2):
    """
    Helper function to count symptoms if the fields exist.
    """
    try:
        return (1 if len(pdd.get(symptom_field_1, '')) > 0 else 0) + \
               (1 if len(pdd.get(symptom_field_2, '')) > 0 else 0)
    except KeyError:
        return default


@app.route('/get-patient-treatments', methods=['GET'])
def get_similar_treatments():
    patient_id = request.args.get('patient_id')
    patient = patients_collection.find_one({'_id': ObjectId(patient_id)})
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404

    patient_data = get_all_form_fields(patient_id)
    pdd = patient_data
    # for each 10 from 10 to 100 inclusive...
    kIndex = 100
    kStage = 1
    for i in range(10, 101, 10):
        key = "karnofsky_scale_" + str(i)
        if pdd[key]['/V'] == '/No':
            kIndex = i
            kStage = (100 - i) // 30 + 1
            break

    # dataMap = {
    #     'id': -1,
    #     'daysOld': (datetime.today() - pd.to_datetime(pdd['date_of_birth']['/V'])).days,
    #     'diagnosisDays': (datetime.today() - pd.to_datetime(pdd['diagnosis_date']['/V'])).days,
    #     'hivA': 1 if pdd['hiv_asymptomatic']['/V'] == '/No' else 0,
    #     'hivS': 1 if pdd['hiv_symptomatic']['/V'] == '/No' else 0,
    #     'aidsA': 1 if pdd['aids_asymptomatic']['/V'] == '/No' else 0,
    #     'aidsS': 1 if pdd['aids_symptomatic']['/V'] == '/No' else 0,
    #     'fever': 1 if pdd['fevers_checkbox']['/V'] == '/No' else 0,
    #     'fatigue': 1 if pdd['fatigue_checkbox']['/V'] == '/No' else 0,
    #     'diarrhea': 1 if pdd['diarrhea_checkbox']['/V'] == '/No' else 0,
    #     'other_symptoms': 0,
    #     #  1 if pdd['other_symptoms_checkbox']['/V'] == '/No' else 0,
    #     'cd4': 1 if pdd['cd4<200/14_checkbox']['/V'] == '/No' else 0,
    #     'pcp': 1 if pdd['pcp_checkbox']['/V'] == '/No' else 0,
    #     'ks': 1 if pdd['ks_checkbox']['/V'] == '/No' else 0,
    #     'other_illness': 0,
    #     # 1 if pdd['other_opportunistics_infections_checkbox']['/V'] == '/No' else 0,
    #     'symptoms': (1 if len(pdd['current_symptoms_1']) > 0 else 0) +
    #                 (1 if len(pdd['current_symptoms_2']) > 0 else 0),
    #     'cd4count': pdd['cd4_cell_count'],
    #     'cd4percentage': pdd['cd4_percentage'],
    #     'HIVviral': pdd['hiv_viral_load'],
    #     'neutrophil': pdd['neutrophil_count'],
    #     'cellsmm3': 0,
    #     'otherIllness': 0,
    #     'KARNOFSKY': kIndex,
    #     'KARNOFSKYSTAGE': kStage,
    #     'Nursing': 1 if pdd['skilled_nursing_care_checkbox_yes']['/V'] == '/No' else 0,
    #     'Dental': 1 if pdd['dental_checkbox_yes']['/V'] == '/No' else 0,
    #     'tbScreen': 1 if pdd['tuberculosis_checkbox_yes']['/V'] == '/No' else 0,
    #     'tbDiagnosis': 1 if (pdd['tb_skin_text_checkbox_positive']['/V'] == '/No' or pdd['tb_chest_xray_checkbox_positive']['/V'] == '/No') else 0,
    #     'tbPrevent': 1 if pdd['receiving_preventative_tb_treatment_checkbox']['/V'] == '/No' else 0,
    #     'tbActive': 1 if pdd['receiving_active_tb_treatment_checkbox']['/V'] == '/No' else 0,
    #     'tbCompliance': 1 if pdd['noncompliant_with_recommended_tb_treatment']['/V'] == '/No' else 0,
    # }
    dataMap = {
        'id': -1,
        'daysOld': get_days_old(pdd, 'date_of_birth'),
        'diagnosisDays': get_days_old(pdd, 'diagnosis_date'),
        'hivA': get_field_value(pdd, 'hiv_asymptomatic'),
        'hivS': get_field_value(pdd, 'hiv_symptomatic'),
        'aidsA': get_field_value(pdd, 'aids_asymptomatic'),
        'aidsS': get_field_value(pdd, 'aids_symptomatic'),
        'fever': get_field_value(pdd, 'fevers_checkbox'),
        'fatigue': get_field_value(pdd, 'fatigue_checkbox'),
        'diarrhea': get_field_value(pdd, 'diarrhea_checkbox'),
        'other_symptoms': 0,  # Adjust logic if needed
        'cd4': get_field_value(pdd, 'cd4<200/14_checkbox'),
        'pcp': get_field_value(pdd, 'pcp_checkbox'),
        'ks': get_field_value(pdd, 'ks_checkbox'),
        'other_illness': 0,  # Adjust logic if needed
        'symptoms': get_symptoms_count(pdd, 'current_symptoms_1', 'current_symptoms_2'),
        'cd4count': pdd.get('cd4_cell_count', -2),
        'cd4percentage': pdd.get('cd4_percentage', -2),
        'HIVviral': pdd.get('hiv_viral_load', -2),
        'neutrophil': pdd.get('neutrophil_count', -2),
        'cellsmm3': 0,  # Adjust logic if needed
        'otherIllness': 0,  # Adjust logic if needed
        'KARNOFSKY': kIndex,  # Assuming kIndex is predefined
        'KARNOFSKYSTAGE': kStage,  # Assuming kStage is predefined
        'Nursing': get_field_value(pdd, 'skilled_nursing_care_checkbox_yes'),
        'Dental': get_field_value(pdd, 'dental_checkbox_yes'),
        'tbScreen': get_field_value(pdd, 'tuberculosis_checkbox_yes'),
        'tbDiagnosis': 1 if (get_field_value(pdd, 'tb_skin_text_checkbox_positive') == 1 or
                             get_field_value(pdd, 'tb_chest_xray_checkbox_positive') == 1) else 0,
        'tbPrevent': get_field_value(pdd, 'receiving_preventative_tb_treatment_checkbox'),
        'tbActive': get_field_value(pdd, 'receiving_active_tb_treatment_checkbox'),
        'tbCompliance': get_field_value(pdd, 'noncompliant_with_recommended_tb_treatment'),
    }

    # convert map to Series
    data = pd.Series(dataMap)

    print(data)

    # treatments = find_closest_pipeline(data)

    # print(treatments)

    # return jsonify({'treatments': treatments}), 200


def get_all_form_fields(patient_id):
    # load file

    patient = patients_collection.find_one({'_id': ObjectId(patient_id)})
    if not patient:
        return None
    parent = str(Path(__file__).parent.parent)
    pdf_path = patient['pdf']
    full_path = parent + "/app/public/pdfs/" + pdf_path

    reader = PdfReader(full_path)
    # fields = reader.get_form_text_fields()
    page = reader.pages[0]
    fields = reader.get_fields()

    return fields


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
