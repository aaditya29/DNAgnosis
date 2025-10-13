# Hardware for AI: How we Deploy Serverless GPUs on Modal

Building AI systems that require GPU computation traditionally means managing expensive and complex infrastructure. For this project we take a **modern, serverless approach** deploying our Evo2 powered AI backend using **Modal’s serverless GPU platform**.

Now we break down both the **traditional EC2 approach** and the **Modal workflow** and see why serverless GPUs simplify development dramatically.

---

## Traditional Approach: EC2 (AWS)

Before services like Modal existed AI workloads typically ran on **AWS EC2 GPU instances**.

Here’s what that process looked like step-by-step:

1. **Write our code** locally.
2. **Building a Docker image** which packages our code and dependencies.
3. **Pushing that image to AWS ECR** (Elastic Container Registry).
4. **Launching an EC2 instance** a virtual GPU machine.
5. **Pulling the image** from ECR to EC2.
6. **Installing dependencies and configuring the instance** and finally run our model.
7. When done **shut down the instance** to stop billing otherwise you will be homeless.

That’s a lot of steps. Each training or inference job means:

- We pay per **hour of uptime** (even idle time).
- **No free GPU tier** hence every test costs money.
- **Significant overhead** managing Docker builds and EC2 setup.

AWS does offer **Lambda** which is serverless but it only supports **CPUs** not GPUs.
For deep learning workloads that’s a dealbreaker.

## Serverless Approach: Modal

Enter **Modal** a platform that provides **serverless GPU compute**.
It automates all the painful parts of GPU deployment.

Here is what happens behind the scenes:

1. We write our code as usual locally.
2. Instead of building and uploading Docker images manually we just run:

   ```
   modal run scriptname.py
   ```

3. Modal automatically:

   - Builds the Docker image for our code.
   - Pushes it to the cloud.
   - Allocates a GPU (we can even specify the GPU type in code).
   - Runs our function or script remotely.

4. The output is returned directly to our local environment or stored on the Modal dashboard.

So instead of spending 30 minutes managing infrastructure we’re productive and ready to go in seconds.

## Why This Matters

Using **serverless GPUs** through Modal changes the development experience:

| Feature           | Traditional EC2             | Modal (Serverless)     |
| ----------------- | --------------------------- | ---------------------- |
| Setup             | Manual (Docker + ECR + EC2) | Automatic (1 command)  |
| Cost              | Pay per uptime hour         | Pay per execution      |
| GPU type          | Fixed                       | Selectable in code     |
| Local dev         | Complex                     | Seamless               |
| Build/upload time | High                        | Automatic              |
| Free tier         | None                        | ~$30 free credit/month |

We can even **follow along for free** thanks to Modal’s monthly free credits (around $30).

## Under the Hood: How the Workflow Looks

### AWS EC2 Workflow

```
Code locally → Build Docker image → Push to ECR → Pull to EC2 → Configure → Run → Shutdown
```

Each cycle requires manually managing Docker and AWS services — slow and error-prone.

### Modal Workflow

```
Code locally → modal run → Modal builds Docker automatically → Runs on GPU → Returns results
```

Modal completely **automates containerization and GPU orchestration** providing a **local-like development experience** but with full GPU acceleration in the cloud.

## Developer Experience

That single difference **“avoiding the extra step of building and uploading Docker containers manually”** transforms the development flow.

We can:

- Iterate and test rapidly.
- Request specific GPUs via one line in code.
- Deploy a backend with a single command.
- Scale instantly without managing servers.

The output and logs are visible both in our terminal and on Modal’s dashboard perfect for debugging and monitoring.

## How We Wrap Our Evo2 Prediction Function in Modal

Modal automates this entire process:

- It **builds the Docker image** for us.
- It **runs GPU jobs** on demand only when invoked.
- It **mounts persistent volumes** (like Hugging Face cache) automatically.
- We only **pay for GPU usage time**.
- Everything can be launched via a single command:

  ```
  modal run main.py
  ```

This means **no manual setup** and **no idle billing** with a much faster dev loop.

### **Building the Evo2 Image**

Let’s look at the code that sets up the environment:

```python
evo2_image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.4.0-devel-ubuntu22.04",
        add_python="3.12"
    )
```

We start with **NVIDIA’s official CUDA image** (so GPU dependencies are pre-installed) and add Python 3.12.

Next we install required Linux packages and Python dependencies:

```python
    .apt_install([
        "build-essential", "cmake", "ninja-build",
        "libcudnn8", "libcudnn8-dev", "git", "gcc", "g++"
    ])
```

Then we set environment variables for CUDA compilation and install **PyTorch 2.5.1** (since 2.6+ has stricter weight loading behavior).

```python
    .pip_install("torch==2.5.1", "torchvision", "torchaudio")
```

---

### **Installing Evo2 and Dependencies**

Now we install **flash-attn** and **transformer-engine** both crucial for efficient Transformer inference on modern GPUs:

```python
    .run_commands(
        "pip install flash-attn --no-build-isolation"
    )
```

Then we clone and install the **Evo2 model repository**:

```python
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git",
        "cd evo2 && pip install ."
    )
```

This image now contains everything required to **run large-scale protein variant inference**.

Finally the image is wrapped into a **Modal App**:

```python
app = modal.App("variant-analysis-evo2", image=evo2_image)
```

---

### **Defining the Compute Function**

Modal functions define **what runs on the GPU**.
Here’s how the core analysis function is defined:

```python
@app.function(gpu="H100", volumes={mount_path: volume}, timeout=1000)
def run_brca1_analysis():
```

This means:

- Use **NVIDIA H100** GPU.
- Mount a **Hugging Face cache volume** for models.
- Timeout after 1000 seconds (roughly 16 minutes).

Inside this function, we:

1. **Load the Evo2 model** (`model = Evo2('evo2_7b')`).
2. **Load BRCA1 dataset** (from Excel).
3. **Load reference DNA sequence** (FASTA file).
4. **Create variant windows** around each SNV.
5. **Score both reference and variant sequences** using Evo2.
6. **Compute Δ-score (delta likelihood)** between them.
7. **Visualize and calculate AUROC** (to measure classification quality).

This workflow quantifies **how harmful a given variant** (mutation) might be using an AI model trained on evolutionary sequence data.
