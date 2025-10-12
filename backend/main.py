import sys
import modal

evo2_image = (
    modal.Image.from_registry(
        # Using official CUDA image with Python 3.12
        "nvidia/cuda:12.4.0-devel-ubuntu22.04",
        add_python="3.12"
    )
    .apt_install([
        "build-essential",
        "cmake",
        "ninja-build",
        "libcudnn8",
        "libcudnn8-dev",
        "git",
        "gcc",
        "g++"
    ])
    # Install build dependencies first
    .pip_install("wheel", "setuptools")
    .pip_install("packaging")  # Install packaging separately before flash-attn
    .env({
        "CC": "/usr/bin/gcc",
        "CXX": "/usr/bin/g++",
        "CUDA_HOME": "/usr/local/cuda",
    })
    # Install PyTorch first with CUDA support
    .pip_install(
        "torch>=2.0.0",
        "torchvision",
        "torchaudio"
    )
    # Install flash-attn
    .pip_install("ninja")  # Required for flash-attn compilation
    .run_commands(
        "pip install flash-attn --no-build-isolation"
    )
    # Clone and install evo2
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git",
        "cd evo2 && pip install ."
    )
    # Uninstall any existing versions of transformer_engine
    .run_commands("pip uninstall -y transformer-engine transformer_engine || true")
    # Install transformer_engine with proper dependencies
    .run_commands(
        "pip install 'transformer_engine[pytorch]==1.13' --no-build-isolation || echo 'transformer_engine installation skipped'"
    )
    .pip_install_from_requirements("requirements.txt")
)

# building variant analysis app with evo2 image
app = modal.App("variant-analysis-evo2", image=evo2_image)


@app.function(gpu="H100")
def test():
    print("TESTING EVO2 INSTALLATION!!!")
    # Adding a simple test to verify imports work
    try:
        import torch
        print(f"PyTorch version: {torch.__version__}")
        print(f"CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"CUDA version: {torch.version.cuda}")
    except Exception as e:
        print(f"Error importing torch: {e}")


@app.local_entrypoint()
def main():
    test.remote()
