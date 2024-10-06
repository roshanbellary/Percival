import pickle
import pandas as pd
import numpy as np


def find_cluster(row: pd.Series, model="clustering.pkl"):
    # Load the clustering model
    kmeans = pickle.load(open(model, 'rb'))

    # Predict the cluster for the given row
    cluster = kmeans.predict(row.values.reshape(1, -1))[0]

    return cluster


def get_data_of_same_cluster(cluster_num):
    df = pd.read_csv('main_synth_data_cluster.csv')
    return df[df['cluster'] == cluster_num]


def find_closest_of_same_cluster(row: pd.Series, clusterData, num):

    # use cosine difference to find the closest rows
    # return the top num rows of clusterData which is a dataframe

    # calculate cosine similarity between row and all rows in clusterData

    # convert row to a df
    row_df = pd.DataFrame(row).T
    print(clusterData.shape)
    # find cosines
    cosines = clusterData.apply(lambda x: np.dot(row_df.values[0], x.values) /
                                (np.linalg.norm(row_df.values) * np.linalg.norm(x)), axis=1)
    elucidians = clusterData.apply(lambda x: np.dot(row_df.values[0], x.values) /
                                   (np.linalg.norm(row_df.values) * np.linalg.norm(x)), axis=1)
    # calculate distance based on (1 - cosine similarity) * euclidean distance

    # sort the distances and return the top num rows

    return clusterData.iloc[cosines.argsort()[:num]]


def list_treatments(cloest_df):
    # use only last 41 rows
    treatments = cloest_df.iloc[:, -41:]

    # create new DF with sum of each column
    # sums = treatments.sum() <- Dont do this
    sums = treatments.sum(axis=0)

    # get rid of key '-1'
    sums = sums.drop('-1')

    # sort the sums, and find the cutoff value of the top 5, except any treatment called '-1'
    sorted = sums.sort_values(ascending=False)
    cutoff = sorted[5]

    # include only sorted (a series) values that are greater than cutoff
    top5 = sorted[sorted > cutoff]
    return top5


def find_closest_pipeline(row: pd.Series):
    df = pd.read_csv('main_synth_data.csv')

    cluster = find_cluster(row)
    data_cluster = get_data_of_same_cluster(cluster)

    # get rid of the last 41 columns
    df_for_merge = df.iloc[:, :-41]

    # merge df and data_cluster on 'id' column, and only keep the column if 'id' is in data_cluster. Make sure to reset the index of the merged df
    merged_df = pd.merge(df_for_merge, data_cluster, on='id', how='inner').reset_index(
        drop=True).drop('cluster', axis=1)

    closest = find_closest_of_same_cluster(row, merged_df, 5)

    # get list of 'id' column of closest
    closest_ids = closest['id'].tolist()

    # print rows of df with 'id' in closest_ids
    closest_treat_data = df[df['id'].isin(closest_ids)]

    treatments = list_treatments(closest_treat_data)

    return treatments


df = pd.read_csv('main_synth_data.csv')
row10 = df.iloc[10]
row10 = row10[:-41]

print(find_closest_pipeline(row10))
