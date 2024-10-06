import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Assuming you already have a DataFrame `df` with 20-dimensional data

# Example: If you don't have the data, you can simulate it like this:
# df = pd.DataFrame(np.random.rand(100, 20), columns=[f'feature_{i}' for i in range(20)])

df = pd.read_csv('main_synth_data.csv')  # Load your data here

# Step 1: Clustering with KMeans
kmeans = KMeans(n_clusters=3, random_state=42)  # Choose the number of clusters
df['cluster'] = kmeans.fit_predict(df)

# Step 2: Dimensionality reduction using PCA
pca = PCA(n_components=2)
# Drop cluster column for PCA
df_pca = pca.fit_transform(df.drop('cluster', axis=1))

# Step 3: Plotting the clusters
plt.figure(figsize=(8, 6))
plt.scatter(df_pca[:, 0], df_pca[:, 1], c=df['cluster'], cmap='viridis')
plt.title('Clusters Visualized in 2D using PCA')
plt.xlabel('PCA Component 1')
plt.ylabel('PCA Component 2')
plt.colorbar(label='Cluster Label')
plt.show()
