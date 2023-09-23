import heartpy as hp
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

from sklearn.svm import SVR
from sklearn.model_selection import train_test_split
from tqdm import tqdm
from sklearn.metrics import mean_absolute_error, mean_squared_error

import time

#dataset
ppg_data = [...]

sys_data = [120,121,111,120,110,130,123,130,118,130,110,115,139,111,124,127,129,128,114,119,112,102,123,115,128,129,122,121,130,129,110]
dia_data = [68,70,73,86,59,67,83,81,68,82,72,65,59,61,81,89,89,89,98,80,65,83,85,78,83,53,45,88,64,63,78]

features = []
for ppg in ppg_data:
  # contoh extraction
  wd, m = hp.process(np.array(ppg), sample_rate = 100.0)
  hp.plotter(wd, m)
  features.append([m["bpm"],m["ibi"],m["sdnn"],m["rmssd"],m["hr_mad"]])

#extract all dataset
extracted_ppg = []
for i, ppg in enumerate(ppg_data):
  wd, m = hp.process(np.array(ppg), sample_rate = 100.0)
  for measure in m.keys():
    try:
      extracted_ppg[i].append(m[measure])
    except:
      extracted_ppg.append([])
      extracted_ppg[i].append(m[measure])

#plot sebaran data
for i, value in enumerate(extracted_ppg[0]):
  plt.plot([x[i] for x in extracted_ppg])
  plt.show()

# training systole
X = extracted_ppg
y = dia_data
C_range = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000]
gamma_range = [0.000000001, 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

mae_list = []
time_list = []
result = []

for C in tqdm(C_range):
  temp_mae = []
  temp_time = []
  for gamma in tqdm(gamma_range):
    model = SVR(kernel="rbf", C=C, gamma=gamma).fit(X_train,y_train)
    start_time = time.time()
    y_pred = model.predict(X_test)
    end_time = time.time()
    execution_time = end_time - start_time
    mae = mean_absolute_error(y_test,y_pred)
    temp_mae.append(mae)
    temp_time.append(execution_time)
    result.append([C, gamma, mae, execution_time, model])
  mae_list.append(temp_mae)
  time_list.append(temp_time)

  maes = [x[2] for x in result]
  min_idx = maes.index(min(maes))

  scores = {
    'len_train': len(X_train),
    'best_idx': min_idx,
    'mae_list': mae_list,
    'time_list': time_list
  }

#heatmap
plt.figure(figsize=(8, 6))
plt.subplots_adjust(left=0.2, right=0.95, bottom=0.15, top=0.95)
plt.imshow(
    scores['mae_list'],
    interpolation="nearest",
    cmap=plt.cm.Reds,
)
plt.xlabel("gamma")
plt.ylabel("C")
plt.colorbar()
plt.xticks(np.arange(len(gamma_range)), gamma_range, rotation=45)
plt.yticks(np.arange(len(C_range)), C_range)
plt.title(f"Validation accuracy ({scores['len_train']} train data)")
plt.show()

plt.figure(figsize=(8, 6))
plt.subplots_adjust(left=0.2, right=0.95, bottom=0.15, top=0.95)
plt.imshow(
    scores['time_list'],
    interpolation="nearest",
    cmap=plt.cm.Oranges,
)
plt.xlabel("gamma")
plt.ylabel("C")
plt.colorbar()
plt.xticks(np.arange(len(gamma_range)), gamma_range, rotation=45)
plt.yticks(np.arange(len(C_range)), C_range)
plt.title(f"Execution Time ({scores['len_train']} train data)")
plt.show()

# C, gamma, mae, execution_time, model

model = result[scores["best_idx"]][4]
time = result[scores["best_idx"]][3]
mae = result[scores["best_idx"]][2]
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
gamma = result[scores["best_idx"]][1]
c = result[scores["best_idx"]][0]
mpe = np.mean(abs((y_test - y_pred) / y_test)) * 100

print(f"~~~~ SYSTOLE RESULT ~~~~")
print(f"gamma: {gamma}")
print(f"C: {c}")
print(f"mae: {mae}")
print(f"rmse: {rmse}")
print(f"mpe: {mpe}%")