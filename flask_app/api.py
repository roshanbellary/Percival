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

app = Flask(__name__)
CORS(app, origins=["*"])

# importing whisper model
model = whisper.load_model("base")


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
    print(response_text)
    return jsonify({'transcription': response_text}), 200

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
