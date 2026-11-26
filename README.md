# PhaseTransition

A desktop app that turns a capture of a real space into a simulation-ready 3D scene: Gaussian Splatting reconstruction, a scene graph of objects and their relations, physics simulation, and USD export for Isaac Sim.

- Project page: https://chanchoen.github.io/PhaseTransition/
- Download: [latest release](https://github.com/chanchoen/PhaseTransition/releases/latest) (Windows 10/11 x64)

This repository holds the releases and the project page (`docs/`). The source code is not public.

## Install

1. Download `PhaseTransition_x64-setup.exe` from the latest release.
2. The installer is not signed yet, so Windows SmartScreen may warn you: choose **More info → Run anyway**.
3. Setup offers to download the relation graph AI model (about 5 GB). Every other feature works without it, and you can download it later from the Start menu: **PhaseTransition - Download AI Model**.

Requirements: a GPU with a Vulkan 1.3 driver; about 8 GB of free disk space with the AI model.

## Feedback

Report bugs and requests in [Issues](https://github.com/chanchoen/PhaseTransition/issues).

## License

The app is free for non-commercial use under its [EULA](docs/legal/EULA.txt). Third-party notices: [NOTICE](docs/legal/NOTICE.txt), [app components](docs/legal/THIRD_PARTY_NOTICES_APP.txt), [AI models](docs/legal/MODEL_LICENSES.txt).
