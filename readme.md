# Installation Guide

## 1. Install Anaconda

Install `Anaconda` from this link `https://www.anaconda.com/download`

## 2. Launch Anaconda and Create Environment

Launch anaconda and create `Python` Environment by executing the following command

```
conda create -n coralscop-lat python=3.8
```

Then activate it by

```
conda activate sat
```

## 3. Install required packages

Move to the source code folder:

```
cd <path to SegmentAnnotator>
```

Install required packages:

```bash
pip install -r requirements.txt
```

## 4. Download Models

Create `models` folder

### Download SAM model

Download two models, `vit_b_decoder_quantized.onnx` and `vit_b_encoder_quantized.onnx`, from [OneDrive](https://hkustconnect-my.sharepoint.com/:f:/g/personal/ykwongaq_connect_ust_hk/EhRCvPn3zYRHjaGm43XYOz8ByFFJr6n9l75Gi7KkoEuVVA?e=PXGTcO), and save them into the models folder.

At the end, the `models` folder should have the following structure:

```
models
|- vit_b_decoder_quantized.onnx
|- vit_b_encoder_quantized.onnx
```

## 5. Launch

Run `python main.py` 
