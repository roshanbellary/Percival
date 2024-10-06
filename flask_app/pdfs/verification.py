from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

reader = PdfReader("filled-out.pdf")
writer = PdfWriter()

page = reader.pages[0]
fields = reader.get_fields()

print(fields)