import pandas as pd
from sdv.metadata import SingleTableMetadata
from sdv.single_table import CTGANSynthesizer

# Assuming you have your original healthcare data in a DataFrame called 'data'
# data = pd.read_csv("your_data.csv")  # Example to load your original data

# Sample original healthcare data (replace with your actual data)
# data = pd.DataFrame({ ... })

data = pd.read_csv("main_sample_data.csv")

metadata = SingleTableMetadata()
metadata.detect_from_dataframe(data)
metadata.set_primary_key(column_name='id')

# Initialize CTGAN model
# model = CTGANSynthesizer()

model = CTGANSynthesizer(metadata)
model.fit(data)

model.save("synth-model.pkl")
new_data = model.sample(10000)
new_data.head()

new_data.to_csv("main_synth_data.csv", index=False)

# Fit the model to the original data
# model.fit(data)

# # Generate 500 new synthetic rows
# synthetic_data = model.sample(500)

# # Save the synthetic data to a CSV or use it directly
# synthetic_data.to_csv('synthetic_healthcare_data.csv', index=False)

# # Display the first few rows of the synthetic data
# print(synthetic_data.head())

# # save the data
# synthetic_data.to_csv('synthetic_healthcare_data.csv', index=False)

# # Save the model to disk
# model.save('healthcare_model.pkl')
