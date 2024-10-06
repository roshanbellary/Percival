from fillpdf import fillpdfs

fields = fillpdfs.get_form_fields("namedform.pdf")
print(fields)
# returns a dictionary of fields
# Set the returned dictionary values a save to a variable
# For radio boxes ('Off' = not filled, 'Yes' = filled)

data_dict = {
# 'hiv_asymptomatic': 'Name',
# 'hiv_asymptomatic': 'LastName',
'hiv_asymptomatic': 'On',
}

fillpdfs.write_fillable_pdf('namedform.pdf', 'named2.pdf', data_dict)

# If you want it flattened:
# fillpdfs.flatten_pdf('new.pdf', 'newflat.pdf')

# import pypdf
# from pypdf import generic as pypdf_generic


# file = "namedform.pdf"
# output_file = "outputtest.pdf"

# reader = pypdf.PdfReader(file)
# writer = pypdf.PdfWriter()

# writer.set_need_appearances_writer()

# for page_nr, page in enumerate(reader.pages):
#     form_fields = page.get('/Annots')
#     if form_fields:
#         for field in form_fields.get_object():
#             field_object = field.get_object()

#             # any other logic
#             field_object.update({
#                 pypdf_generic.NameObject('/V'): pypdf_generic.create_string_object("/On"),
#                 pypdf_generic.NameObject('/DV'): pypdf_generic.create_string_object("/On"),
#                 pypdf_generic.NameObject('/AV'): pypdf_generic.create_string_object("/On")
#             })
#     writer.add_page(page)

# # create your output file or stream
# writer.write(output_file)

# from pypdf import PdfWriter, PdfReader
# from pypdf.generic import BooleanObject, NameObject, IndirectObject

# def set_need_appearances_writer(writer: PdfWriter):
#     # See 12.7.2 and 7.7.2 for more information: http://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/PDF32000_2008.pdf
#     try:
#         catalog = writer._root_object
#         # get the AcroForm tree
#         if "/AcroForm" not in catalog:
#             writer._root_object.update({
#                 NameObject("/AcroForm"): IndirectObject(len(writer._objects), 0, writer)})

#         need_appearances = NameObject("/NeedAppearances")
#         writer._root_object["/AcroForm"][need_appearances] = BooleanObject(True)
#         return writer

#     except Exception as e:
#         print('set_need_appearances_writer() catch : ', repr(e))
#         return writer

# infile = "namedform.pdf"
# outfile = "outputtest.pdf"

# reader = PdfReader(open(infile, "rb"), strict=False)
# if "/AcroForm" in reader.trailer["/Root"]:
#     reader.trailer["/Root"]["/AcroForm"].update(
#         {NameObject("/NeedAppearances"): BooleanObject(True)})

# writer = PdfWriter()
# set_need_appearances_writer(writer)
# if "/AcroForm" in writer._root_object:
#     writer._root_object["/AcroForm"].update(
#         {NameObject("/NeedAppearances"): BooleanObject(True)})

# field_dictionary = {
#     "fatigue_checkbox": "/Yes",
# }

# writer.add_page(reader.get_page(0))
# writer.update_page_form_field_values(writer.get_page(0), field_dictionary)

# with open(outfile, "wb") as fp:
#     writer.write(fp)