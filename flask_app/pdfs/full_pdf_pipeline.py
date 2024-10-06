from pdfs.populate_pdf import store_initial_fields, edit_fields
from pdfs.anonpdf import anonpdf
from openai import OpenAI
import dotenv
from pathlib import Path

dotenv.load_dotenv()

client = OpenAI()


def make_gen_prompt(configs):
    master_template = """
    The patient's name is <FIRSTNAME> <LASTNAME>. The date of birth of the patient is <DOB>. The Physican's name is Dr. <DRFIRSTNAME> <DRLASTNAME>. The address is
    <DRADDRESS>, <DRCITY>, <DRSTATE>. The phone number is <DRPHONE>. The California license number is <DRLICENSE>.
    The date completed is <DATE>. Their SSN is <SSN_1> <SSN_2> <SSN_3>.

    Below is the information for the patient uploaded to the system by the doctor.:
    <PATIENT_DATA>
    """

    for key, value in configs.items():
        master_template = master_template.replace(f"<{key}>", value)

    return master_template


def create_anon_pdf(configs):
    parent = str(Path(__file__).parent.parent.parent)

    prompt_gen = make_gen_prompt(configs)
    file_stored = store_initial_fields(client, prompt_gen)
    nonanon_file_loc = parent + "/public/pdfs/" + file_stored
    anon_json = anonpdf(nonanon_file_loc, client)

    for key, value in anon_json.items():
        anon_json[key] = "[" + value + "]"

    # Fill out the output PDF with the anonymized fields
    anon_file_loc = parent + "/public/anonpdfs/" + file_stored

    edit_fields(anon_json, nonanon_file_loc, anon_file_loc)

    return file_stored


def anonymize_pdf(file_name, client):
    """
    Anonymizes a public PDF file and updates the corresponding anonymized PDF.

    Args:
    - public_pdf_path: Path to the non-anonymized PDF file.
    - configs: Configuration settings required for the anonymization process.
    - client: The OpenAI client instance used to interact with GPT for anonymization.

    Returns:
    - Path to the updated anonymized PDF file.
    """

    # Define the parent directory path
    parent = str(Path(__file__).parent.parent.parent)

    # Get public PDF location
    nonanon_file_loc = parent + "/public/pdfs/" + file_name

    # Get anonymized fields
    anon_json = anonpdf(nonanon_file_loc, client)

    for key, value in anon_json.items():
        anon_json[key] = "[" + value + "]"

    # Fill out the output PDF with the anonymized fields
    anon_file_loc = parent + "/public/anonpdfs/" + file_name

    try:
        edit_fields(anon_json, nonanon_file_loc, anon_file_loc)
    except (IOError, OSError) as e:
        print(f"Error editing fields in PDF: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


# config = {
#     "FIRSTNAME": "Roshan",
#     "LASTNAME": "Bellary",
#     "DOB": "January 1st 1990",
#     "DRFIRSTNAME": "Pulkith",
#     "DRLASTNAME": "Paruchuri",
#     "ADDRESS": "1234 Main St, San Francisco, CA 94105",
#     "PHONE": "669-350-7502",
#     "SSN_1": "123",
#     "SSN_2": "45",
#     "SSN_3": "6789",
#     "LICENSE NUMBER": "123456789",
#     "DATE": "October 6th 2024",
#     "PATIENT_DATA": """
#     The patient has symptoms of diarrhea, fevers, and fatigue. In addition, they have an opportunistic infection of PCP the date of which was on October 1st 2024

#     The current symptoms related to HIV disease present with the patient are the rashes the patient has around the rectum and others.

#     For lab data, the patient’s CD4 cell count is 75 to 80 while their percentage is 70% as of October 1st 2024

#     The patient does have other illnesses too such as Covid-19

#     The patient is Stage II(60) on the karnofsky scale
#     The patient does meet the requirement for nursing care and should be able to receive dental care. The patient does not have tuberculosis based upon screening done
#     """
# }

# create_anon_pdf(config)
