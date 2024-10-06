#!/usr/bin/python3.12
import json
from flask import Flask
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import librosa as lb
import torch
import pandas as pd
from flask import request
from flask_cors import CORS, cross_origin
import os
import whisper
from pdfs.full_pdf_pipeline import create_anon_pdf

app = Flask(__name__)
a = None
CORS(app, support_credentials=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

#importing whisper model
model = whisper.load_model("base")
def send_transcript(file):
  result = model.transcribe(file)
  transcription = result["text"]
  return transcription
@app.route('/upload-voice', methods=['POST'])
def get_transcript():
    # Extract the form data fields
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    dob = request.form.get('dob')
    ssn = request.form.get('ssn')
    
    # Extract the audio file
    audio_file = request.files.get('audio')
    a = send_transcript(audio_file)
    a = f"First Name: ${first_name}, Last Name: ${last_name}, DOB: ${dob}, SSN: ${ssn} " + a
    return a

@app.route('/get-transcript', methods=['GET'])
def return_transcript(file):
    return a

@app.route('/populate-pdf', methods=['POST'])
def populate_pdf():
    data = request.data
    args = data['details']
    file_name = create_anon_pdf(args)
    return_object = {
        data: file_name
    }
    return json.stringify(return_object)

def translate_text(text, target_language):
    model_name = f'Helsinki-NLP/opus-mt-en-{target_language}'
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    translated_text = model.generate(**tokenizer(text, return_tensors="pt"), max_length=128)[0]
    translated_text = tokenizer.decode(translated_text, skip_special_tokens=True)

    return translated_text

def get_language_id(language):
    df = pd.read_csv('./data_pipeline/language_ids.csv')
    row = df[df['Language'] == language]
    if not row.empty:
        return row.iloc[0]['ID']
    return None