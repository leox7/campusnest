              CAMPUSNEST
**TARGET USER**: University Students near [Near their campuses]

**Problem**: Difficulty finding legit hostels and services.

**Solution**: Simple Listing + contact.

**MVP features**: A simple web app where:
                  o	Hostels are listed near campus 
                  o	Students can view details & contact caretaker 
                  o	Service providers can be listed
                  o	Admin approves listings

## AI Microservice (`ai-service/`)

A Python FastAPI service that powers recommendations (FR-23), review sentiment
(FR-24), and listing fraud/anomaly detection (FR-25/FR-26). It uses lightweight
scikit-learn / NLTK models and is integrated with the Node backend over REST
only. The backend degrades gracefully: if this service is not running, the main
app keeps working and simply skips the AI-enhanced behaviour.

### Setup and run

From the repository root:

```bash
cd ai-service
python -m venv venv                 # only the first time
venv\Scripts\activate               # Windows
# source venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The service then listens on `http://localhost:8000` (health check: `GET /health`).

### Backend wiring

Set `AI_SERVICE_URL` in `backend/.env` to point at the service (defaults to
`http://localhost:8000`):

```
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT_MS=4000
```

Endpoints: `POST /recommend`, `POST /sentiment`, `POST /fraud`.
