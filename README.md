# hackaton-2025-import-luck
Структура проекта:
```
our-project/
│
├── backend/ # Backend (Python — FastAPI / Flask / Django)
│ ├── main.py # Entry point for the backend application
│ ├── model.cbm # CBM model file (e.g., trained model or configuration)
│ └── req.txt # Python dependencies (consider renaming to requirements.txt)
│
├── frontend/ # Frontend (React, JavaScript / TypeScript)
│
├── docker-compose.yml # Docker Compose configuration for local deployment
└── README.md
```
Для начала работы необходимо добавить в папку backend два файла из https://drive.google.com/drive/folders/1ahWQL0Y4jHPNP9uJnCHcfLSonjWHvJul?usp=sharing после чего запустить docker-compose
```
 -- docker-compose up
```
Приложение будет доступно на локал хосте на 80 порту.
