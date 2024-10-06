from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()


def anonpdf(input_pdf, aiclient):
    """
    Anonymizes an Electronic Health Record (EHR) in PDF format by replacing sensitive personal information 
    (Private Health Information, PHI) with "REDACTED" using an AI model.

    Args:
        input_pdf (str): The path to the input PDF file that needs to be anonymized.
        aiclient (object): An instance of the AI client used for processing the anonymization task.

    Returns:
        dict: A dictionary where fields containing PHI are replaced with "REDACTED".
    
    Functionality:
    1. Opens the provided PDF file and reads the form text fields.
    2. Creates a prompt that instructs the AI to identify and redact PHI while preserving useful non-personal information.
    3. The prompt is sent to the AI model, which returns a JSON with fields containing PHI replaced with "REDACTED".
    4. The function returns a dictionary of redacted fields as output.
    
    Note: The anonymized document ensures personal health data is removed while maintaining the integrity of other medical information for research or review purposes.
    """
    # open file
    reader = PdfReader(open(input_pdf, "rb"), strict=False)

    # get fields
    fields = reader.get_form_text_fields()

    prompt_template = """
    You are an AI medical assistant. You have been asked to anonymize an Electronic Health Record (EHR) in PDF format.
     The EHR contains sensitive information about a patient. 
     You need to replace all the patient's personal information with the word "REDACTED". Below is a map of all the fields in the EHR.

     For each field, if there is content AND it is Private Health Information (PHI), replace it with "REDACTED". Otherwise, leave it as is.

     The redacted EHR will be sent for research or other doctor's review. As such, it is important to ensure that the EHR is anonymized properly, 
     but also that the information is still useful for research or medical purposes. Keep as much information as possible. Keep as many symptoms and dates
     as possible, just remove sensitive information related to the patient or other individuals.

     The JSON within <INPUT> contains the field names and their values in JSON. Replace the values of the fields with PHI with "REDACTED" for the output. 
     Output as strictly JSON, no quotation marks, just the JSON as a string, and only output the fields that have been redacted.

     ************MAKE SURE IT IS VALID JSON WITHOUT ANY ADDITIONAL CHARACTERS***************

     <INPUT>
     <FIELDS>
     </INPUT>
    """

    field_values = {}

    fields_json_str = json.dumps(fields, indent=4)

    final_prompt = prompt_template.replace(
        "<FIELDS>", fields_json_str)

    chat_completion = aiclient.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": final_prompt,
            },
        ],
        model="gpt-4o-mini-2024-07-18",
    )

    reply_json_str = chat_completion.choices[0].message.content

    reply_json = json.loads(reply_json_str)

    return reply_json


# client = OpenAI(
#     # This is the default and can be omitted
#     # api_key=os.environ.get(OPENAI_API_KEY),
# )


# anonpdf("filled-out.pdf", client)
