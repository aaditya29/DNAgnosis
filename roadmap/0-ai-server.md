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

The output and logs are visible both in your terminal and on Modal’s dashboard — perfect for debugging and monitoring.
