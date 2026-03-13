import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# App Configs
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
DATABASE_URL_SG = os.getenv("DATABASE_URL_SG", "mysql+mysqlconnector://cafe_user:cafe_password@localhost/cafe_db")
DATABASE_URL_RJK = os.getenv("DATABASE_URL_RJK", "")
DATABASE_URL_CAFE = os.getenv("DATABASE_URL_CAFE", "")
FOTOS_PATH = os.getenv("FOTOS_PATH", "/fotos")
