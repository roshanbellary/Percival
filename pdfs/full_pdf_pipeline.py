from populate_pdf import store_initial_fields, edit_fields
from anonpdf import anonpdf
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

client = OpenAI()


def make_gen_prompt(configs):
    master_template = """
    The patient's name is <FIRSTNAME> <LASTNAME>. The date of birth of the patient is <DOB>. The Physican's name is Dr. <DRFIRSTNAME> <DRLASTNAME>. The address is
    <ADDRESS>. The phone number is <PHONE>. The California license number is <LICENSE NUMBER>.
    The date completed is <DATE>. Their SSN is <SSN_1> <SSN_2> <SSN_3>.

    Below is the information for the patient uploaded to the system by the doctor.:
    <PATIENT_DATA>
    """

    for key, value in configs.items():
        master_template = master_template.replace(f"<{key}>", value)

    return master_template


def create_anon_pdf(configs):
    prompt_gen = make_gen_prompt(configs)
    file_stored = store_initial_fields(client, prompt_gen)
    anon_json = anonpdf(file_stored, client)

    for key, value in anon_json.items():
        anon_json[key] = "[" + value + "]"

    # Fill out the output PDF with the anonymized fields
    file_anon = "anon_" + file_stored
    edit_fields(anon_json, file_stored, file_anon)


config = {
    "FIRSTNAME": "Roshan",
    "LASTNAME": "Bellary",
    "DOB": "January 1st 1990",
    "DRFIRSTNAME": "Pulkith",
    "DRLASTNAME": "Paruchuri",
    "ADDRESS": "1234 Main St, San Francisco, CA 94105",
    "PHONE": "669-350-7502",
    "SSN_1": "123",
    "SSN_2": "45",
    "SSN_3": "6789",
    "LICENSE NUMBER": "123456789",
    "DATE": "October 6th 2024",
    "PATIENT_DATA": """
    The patient has symptoms of diarrhea, fevers, and fatigue. In addition, they have an opportunistic infection of PCP the date of which was on October 1st 2024

    The current symptoms related to HIV disease present with the patient are the rashes the patient has around the rectum and others.

    For lab data, the patient’s CD4 cell count is 75 to 80 while their percentage is 70% as of October 1st 2024

    The patient does have other illnesses too such as Covid-19

    The patient is Stage II(60) on the karnofsky scale
    The patient does meet the requirement for nursing care and should be able to receive dental care. The patient does not have tuberculosis based upon screening done
    """
}

# create_anon_pdf(config)
