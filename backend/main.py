import sys
import modal

evo2_image = (
    modal.Image.from_registry(
        # Use official CUDA image with Python 3.12
        "nvidia/cuda:12.4.0-devel-ubuntu22.04",
        add_python="3.12",
        force_build=True
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
    # Install wheel and setuptools first for building packages
    .pip_install("wheel", "setuptools")
    .env({
        "CC": "/usr/bin/gcc",
        "CXX": "/usr/bin/g++",
        "CUDA_HOME": "/usr/local/cuda",
    })
    # Clone and install evo2
    .run_commands(
        "git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git",
        "cd evo2 && pip install ."
    )
    # Uninstall any existing versions of transformer_engine
    .run_commands("pip uninstall -y transformer-engine transformer_engine || true")
    # Install transformer_engine with proper dependencies
    .pip_install("packaging")  # Required dependency
    .run_commands(
        "pip install wheel setuptools",
        "pip install 'transformer_engine[pytorch]==1.13' --no-build-isolation"
    )
    .pip_install_from_requirements("requirements.txt")
)

app = modal.App("variant-analysis-evo2", image=evo2_image)


@app.function(gpu="H100")
def test():
    print("TESTING EVO2 INSTALLATION!!!")
    # Add a simple test to verify imports work
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
