from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from openai import OpenAI
import os
from dotenv import load_dotenv
import json


load_dotenv()

reader = PdfReader("namedform.pdf")
writer = PdfWriter()

page = reader.pages[0]
fields = reader.get_fields()

print("fields before completion \n")
print(fields)


PARSE_GPT_PROMPT_TEMPLATE = """
You are a Medical AI Assistant who is given a text file a Doctor uploaded with medical information, or from the transcript of a 
doctor's conversation with a patient as text. Your job is to parse the text and fill out a medical form with as much information as possible. 

The form is a PDF with the following fields that need to be filled out. The fields are provided below, with an explanation for each field. Using the text
fill out as much of the fields as you can. If there is no text for a field, do the following:
- If the field has some sort of default or common value, assume it to be that value.
- If the field value can be estimated or inferred from the text, do so.
- If the field value cannot be inferred, leave it blank.

You can be liberal with your assumptions, but make sure to note which fields you did not directly calculate in the output under GPT_ADDITIONAL (just list them). 
The doctor has the obligation to verify the form, and can edit the form as needed, so your job is simply to try to fill out as much as you can to save the doctor time.

All fields can be assumed to be text fields, except for checkboxes, which are labeled as such in the field description. For checkboxes set 
the value to "checked" if the checkbox is checked, and "nocheck" if it is not checked.

Complete boxes logicially. For example, if a checkbox for additional illnesses is not checked, then the field for the illnesses should not be filled out.

Your output should be a JSON with the field values replaced with the text you filled in (or blank). Provide the JSON and only the JSON. Any 
additional information should be in the GPT_ADDITIONAL field.

<FIELDS>
"""

keys_to_gpt_map = {
    'last_name': 'The last name of the patient',
    'first_name': 'The first name of the patient',
    'middle_name': 'The middle name of the patient',
    'date_of_birth': 'The date of birth of the patient',
    'social_security_number_0': 'The first 3 digits of the social security number of the patient',
    'social_security_number_2': 'The second 2 digits of the social security number of the patient',
    'social_security_number_3': 'The last 4 digits of the social security number of the patient',
    'hiv_asymptomatic': '(checkbox) If the patient has HIV+ but is asymptomatic',
    'aids_asymptomatic': '(checkbox) If the patient has AIDS but is asymptomatic',
    'hiv_symptomatic': '(checkbox) If the patient has HIV+ and is symptomatic',
    'aids_symptomatic': '(checkbox) If the patient has AIDS and is symptomatic',
    'diagnosis_date': 'The date of the diagnosis for HIV+ / AIDS above',
    'year_of_first_positive_test': 'Year of the first positive HIV test',
    'fatigue_checkbox': '(checkbox) If the patient has fatigue currently',
    'fevers_checkbox': '(checkbox) If the patient has fevers currently',
    'diarrhea_checkbox': '(checkbox) If the patient has diarrhea currently',
    'other_symptoms_checkbox': '(checkbox) If the patient has other symptoms currently',
    'other_symptoms': 'The other symptoms the patient has currently, if other_symptoms_checkbox is checked',
    'cd4<200/14_checkbox': '(checkbox) Opportunistic infection. If the patient has CD4 count < 200 or CD4% < 14',
    'cd4<200/14_date': 'If cd4<200/14_checkbox is checked, the date of the CD4 count',
    'pcp_checkbox': '(checkbox) Opportunistic infection. If the patient has Pneumocystis pneumonia',
    'pcp_date': 'If pcp_checkbox is checked, the date of the Pneumocystis pneumonia',
    'ks_checkbox': '(checkbox) Opportunistic infection. If the patient has Kaposi sarcoma',
    'ks_date': 'If ks_checkbox is checked, the date of the Kaposi sarcoma',
    'other_opportunistics_infections_checkbox': '(checkbox) Opportunistic infection. If the patient has other opportunistic infections',
    'other_opportunistic_infections': 'The other opportunistic infections the patient has, if other_opportunistics_infections_checkbox is checked',
    'other_opportunistic_infections_date': 'The date of the other opportunistic infections, if other_opportunistics_infections_checkbox is checked',
    'current_symptoms_1': 'List of other current symptoms the patient has (first line, max 5 words)',
    'current_symptoms_2': 'Continuation of the list of other current symptoms the patient has (second line, max 20 words)',
    'cd4_cell_count': 'CD4 cell count of the patient',
    'cd4_percentage': 'CD4 percentage of the patient',
    'cd4_date': 'The date of the CD4 cell count',
    'hiv_viral_load': 'HIV viral load of the patient',
    'hiv_viral_load_date': 'The date of the HIV viral load test',
    'neutrophil_count': 'The neutrophil count of the patient',
    'neutrophil_date': 'The date of the neutrophil count',
    'other_illnesses_checkbox_yes': '(checkbox) If the patient HAS any other illnesses. Only check if yes',
    'other_illnesses_checkbox_no': '(checkbox) If the patient DOES NOT HAVE any other illnesses. Only check if no',
    'other_illnesses': 'If other_illnesses_checkbox_yes is checked, list of other illnesses the patient has',
    'karnofsky_scale_100': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 100 (Stage 1)',
    'karnofsky_scale_90': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 90 (Stage 1)',
    'karnofsky_scale_80': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 80 (Stage 1)',
    'karnofsky_scale_70': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 70 (Stage 2)',
    'karnofsky_scale_60': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 60 (Stage 2)',
    'karnofsky_scale_50': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 50 (Stage 2)',
    'karnofsky_scale_40': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 40 (Stage 3)',
    'karnofsky_scale_30': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 30 (Stage 3)',
    'karnofsky_scale_20': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 20 (Stage 3)',
    'karnofsky_scale_10': '(checkbox) Karnofsky scale. If the patients score is nearest to a score of 10 (Stage 4)',
    'skilled_nursing_care_checkbox_yes': '(checkbox) Does this patient meet the nursing facility level of care? Only check if yes',
    'skilled_nursing_care_checkbox_no': '(checkbox) Does this patient meet the nursing facility level of care? Only check if no',
    'dental_checkbox_no': '(checkbox) Is this patient medically able to receive routine dental care and/or oral procedures? Only check if no',
    'dental_checkbox_yes': '(checkbox) Is this patient medically able to receive routine dental care and/or oral procedures? Only check if yes',
    'tuberculosis_checkbox_no': '(checkbox) Has this patient been screened for tuberculosis? Only check if no',
    'tuberculosis_checkbox_yes': '(checkbox) Has this patient been screened for tuberculosis? Only check if yes',
    'tb_skin_text_checkbox_positive': '(checkbox) TB skin test result. Only check if positive',
    'tb_skin_text_checkbox_negative': '(checkbox) TB skin test result. Only check if negative',
    'tb_chest_xray_checkbox_positive': '(checkbox) TB chest x-ray result. Only check if positive',
    'tb_chest_xray_checkbox_negative': '(checkbox) TB chest x-ray result. Only check if negative',
    'tb_skin_test_date': 'The date of the TB skin test',
    'tb_chest_xray_date': 'The date of the TB chest x-ray',
    'receiving_preventative_tb_treatment_checkbox': '(checkbox) Is the patient receiving preventative TB treatment.',
    'not_receiving_tb_treatment_checkbox': '(checkbox) If the patient is not receiving preventative TB treatment.',
    'receiving_active_tb_treatment_checkbox': '(checkbox) Is the patient receiving active TB treatment.',
    'noncompliant_with_recommended_tb_treatment': '(checkbox) If the patient is noncompliant with recommended TB treatment.',
    'physician_signature': 'Name of the physician (digital signature)',
    'date_completed': 'Current date',
    'physician_name': 'Name of the physician',
    'ca_license_number': 'California license number of the physician',
    'address': 'Address of the physician',
    'phone_number': 'Phone number of the physician',
    'city': 'City of the physician',
    'state': 'State of the physician',
    'additional_comments': 'Additional comments FOR THE PHYSICIAN OR PATIENT',
    'GPT_ADDITIONAL': 'Assumptions you made while filling ouit this form (as a list), or additional comments not covered by the form',
}

fields_json_str = json.dumps(keys_to_gpt_map, indent=4)

FINAL_PARSE_GPT_PROMPT = PARSE_GPT_PROMPT_TEMPLATE.replace(
    "<FIELDS>", fields_json_str)

test_input = """
The patient's name is Roshan Bellary. The Physican's name is Dr. Pulkith Paruchuri. The address is
1234 Main Street, San Francisco, CA 94123. The phone number is 415-555-1234. The city is San Francisco. The state is California. The California license number is 1234567890.
The date completed is October 1st 2024. 

Below is the information for the patient:
The patient has symptoms of diarrhea, fevers, and fatigue. In addition, they have an opportunistic infection of PCP the date of which was on October 1st 2024

The current symptoms related to HIV disease present with the patient are the rashes the patient has around the rectum and others.

For lab data, the patient’s CD4 cell count is 75 to 80 while their percentage is 70% as of October 1st 2024

The patient does have other illnesses too such as Covid-19

The patient is Stage II(60) on the karnofsky scale
The patient does meet the requirement for nursing care and should be able to receive dental care. The patient does not have tuberculosis based upon screening done
"""

client = OpenAI(
    # This is the default and can be omitted
    # api_key=os.environ.get(OPENAI_API_KEY),

)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": FINAL_PARSE_GPT_PROMPT,
        },
        {
            "role": "user",
            "content": test_input,
        }
    ],
    model="gpt-4o-mini-2024-07-18",
)
reply_json_str = chat_completion.choices[0].message.content
# write to file
# # with open("filled-out.json", "w") as f:
# #     f.write(reply_json_str)

# # read back from file
# with open("filled-out.json", "r") as f:
#     reply_json_str = f.read()

reply_json = json.loads(reply_json_str)

# Filter empty elements
filtered_json = {k: v for k, v in reply_json.items() if len(v) > 0}

noncheck_fields = {k: v for k, v in filtered_json.items() if not (
    "checked" in v or "nocheck" in v)}
check_fields = {k: v for k, v in filtered_json.items(
) if "checked" in v or "nocheck" in v}

# update all checked to /On and unchecked to /Off
for k, v in check_fields.items():
    if "checked" in v:
        # Makes no sense but No is checked
        check_fields[k] = "/No"
    else:
        # To-Do fix this
        check_fields[k] = "/Off"


print("check_fields")
print(check_fields)

writer.append(reader)

writer.update_page_form_field_values(
    writer.pages[0],
    noncheck_fields,
    auto_regenerate=True,
)

writer.update_page_form_field_values(
    writer.pages[0],
    check_fields,
    auto_regenerate=False,
)

# Manually iterate over checkboxes and update their values
for annotation in writer.pages[0]["/Annots"]:
    field = annotation.get_object()

    # Get the field name
    field_name = field.get("/T")

    if field_name in check_fields:
        # Set the checkbox value to /Yes (checked) or /Off (unchecked)
        if check_fields[field_name] == "/No":
            field.update({
                NameObject("/V"): NameObject("/No"),
                NameObject("/AS"): NameObject("/No"),
                NameObject("/DV"): NameObject("/No")
            })

            print("updated to true")
        else:
            field.update({
                NameObject("/V"): NameObject("/Off"),
                NameObject("/AS"): NameObject("/Off")
            })

print("fields after completion \n")
# For text fields, print their updated values
for field_name, field_info in noncheck_fields.items():
    print(f"Text Field '{field_name}': {field_info}")

# For checkbox fields, print their updated values
for annotation in writer.pages[0]["/Annots"]:
    field = annotation.get_object()
    field_name = field.get("/T")

    if field_name in check_fields:
        # Get the current value and appearance state of the checkbox
        checkbox_value = field.get("/V", "No Value")
        appearance_state = field.get("/AS", "No Appearance State")
        print(
            f"Checkbox Field '{field_name}': Value = {checkbox_value}, Appearance State = {appearance_state}")

# Save the updated PDF with checkboxes checked
with open("filled-out.pdf", "wb") as output_stream:
    writer.write(output_stream)
