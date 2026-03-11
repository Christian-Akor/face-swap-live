# Setup and Run Instructions

### Prerequisites
- Windows 11
- Python 3.8+
- Pip installed

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Christian-Akor/face-swap-live.git
   cd face-swap-live/apps/server
   ```
2. Install Poetry:
   ```bash
   pip install poetry
   ```
3. Install dependencies:
   ```bash
   poetry install
   ```

### Run the Application

To run the FastAPI server:
```bash
uvicorn app.main:app --reload
```