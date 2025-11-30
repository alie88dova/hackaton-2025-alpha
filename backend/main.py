import json
import uuid
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from catboost import CatBoostRegressor


app = FastAPI(title="hackaton-2025-import-luck")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = None
FEATURES_CONFIG = None
DATABASE = None

@app.on_event("startup")
def load_artifacts():
    global MODEL, FEATURES_CONFIG, DATABASE
    
    print("Загрузка модели...")
    MODEL = CatBoostRegressor()
    MODEL.load_model("income_model_full.cbm")
    
    print("Загрузка конфига признаков...")
    with open("model_features.json", "r", encoding='utf-8') as f:
        FEATURES_CONFIG = json.load(f)

    print("Загрузка базы клиентов (hackathon_income_test.csv)...")

    DATABASE = pd.read_csv('hackathon_income_test.csv', decimal=',', low_memory=False,sep=";")
    
    DATABASE.columns = DATABASE.columns.str.strip()
    
    if 'id' in DATABASE.columns:
        DATABASE.set_index('id', inplace=True)


def backend_preprocessing(df):
    """
    Полная копия твоей функции production_preprocessing
    """
    df_out = df.copy()
    
    if 'dp_ils_avg_salary_1y' in df_out.columns:
        df_out['has_digital_profile'] = df_out['dp_ils_avg_salary_1y'].notna().astype(int)
    
    if 'hdb_bki_total_cnt' in df_out.columns:
        df_out['has_bki_data'] = df_out['hdb_bki_total_cnt'].notna().astype(int)

    cat_cols_names = FEATURES_CONFIG["cat_features"]
    
    for col in cat_cols_names:
        if col in df_out.columns:
            df_out[col] = df_out[col].fillna("MISSING").astype(str)
        else:
            df_out[col] = "MISSING"
            
    return df_out


def generate_offer(predicted_income, features):

    debt_other = features.get('hdb_other_outstand_sum') or 0
    travel_spend = features.get('avg_6m_travel') or 0
    official_salary = features.get('dp_ils_avg_salary_1y') or 0

    offer_id = str(uuid.uuid4())
    offer_list = []
    if debt_other > 100000:
        max_amount = int(debt_other * 1.1)
        max_amount = (max_amount // 1000) * 1000
        
        offer_list.append({
            "id": offer_id,
            "kind": "Рефинансирование",
            "title": "Платите в 2 раза меньше",
            "subtitle": "Объединение кредитов",
            "description": f"Клиент имеет долг в других банках свыше 100 000 ₽ ({int(debt_other):,} ₽). Предлагаем рефинансировать под 12.5% для снижения ежемесячного платежа.",
            "highlight": "Выгодно",
            "rate": 12.5,
            "termMonths": 60,
            "amountFrom": 50000,
            "amountTo": max_amount
        })

    if predicted_income > 150000 and (official_salary < 30000 or pd.isna(official_salary)):
        offer_list.append( {
            "id": offer_id,
            "kind": "Бизнес",
            "title": "Альфа-Бизнес + Премиум",
            "subtitle": "Пакет услуг для ИП",
            "description": "Прогнозируемый доход превышает 150 000 ₽, но официальная зарплата ниже 30 000 ₽ или отсутствует. Вероятно, клиент — самозанятый или ИП. Предлагаем бизнес-пакет для легализации дохода.",
            "highlight": "Для профи",
            "rate": 0.0,
            "termMonths": 12,
            "amountFrom": 0,
            "amountTo": 10000000 
        })


    if travel_spend > 5000 or predicted_income > 200000:
        # Лимит карты = 3 реальных дохода
        limit = int(predicted_income * 3)
        limit = (limit // 1000) * 1000
        
        offer_list.append({
            "id": offer_id,
            "kind": "Кредитная карта",
            "title": "Alfa Travel",
            "subtitle": "Путешествия бесплатно",
            "description": f"Клиент подходит по признаку: высокий прогнозируемый доход. Предлагаем карту с лимитом до трёх месячных доходов ({limit:,} ₽) и повышенным кэшбэком за поездки.",
            "highlight": "Кэшбэк милями",
            "rate": 11.99,
            "termMonths": 36,
            "amountFrom": 10000,
            "amountTo": limit
        })

    if predicted_income < 60000:
        limit = int(predicted_income * 1.5)
        limit = (limit // 1000) * 1000
        
        offer_list.append( {
            "id": offer_id,
            "kind": "Кредитная карта",
            "title": "Целый год без %",
            "subtitle": "Бесплатное обслуживание",
            "description": f"Прогнозируемый доход ниже 60 000 ₽ ({int(predicted_income):,} ₽). Предлагаем стартовую карту с льготным периодом до 365 дней и лимитом до 1.5× дохода.",
            "highlight": "Хит продаж",
            "rate": 0.0,
            "termMonths": 24,
            "amountFrom": 5000,
            "amountTo": max(30000, limit)
        })

    max_loan = int(predicted_income * 12)
    max_loan = (max_loan // 10000) * 10000
    
    return offer_list if offer_list != [] else [{
        "id": offer_id,
        "kind": "Кредит наличными",
        "title": "Деньги на любые цели",
        "subtitle": "Одобрение за 2 минуты",
        "description": f"Предлагаем стандартный потребкредит до 12× прогнозируемого годового дохода ({max_loan:,} ₽).",
        "highlight": "Быстро",
        "rate": 15.9,
        "termMonths": 60,
        "amountFrom": 50000,
        "amountTo": max_loan             
    }]


@app.get("/api/predict/{client_id}")
def predict_client(client_id: int):
    if client_id not in DATABASE.index:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    
    client_row = DATABASE.loc[client_id]

    input_df = pd.DataFrame([client_row])

    processed_df = backend_preprocessing(input_df)
    
    required_cols = FEATURES_CONFIG["columns"]

    for col in required_cols:
        if col not in processed_df.columns:
            processed_df[col] = 0
            
    model_input = processed_df[required_cols]

    pred_log = MODEL.predict(model_input)[0]

    pred_rub = np.expm1(pred_log)
    pred_rub = 1.05*max(0, int(pred_rub))
    
    features_dict = client_row.to_dict()
    
    features_dict = {k: (v if pd.notna(v) else None) for k, v in features_dict.items()}
    
    offer = generate_offer(pred_rub, features_dict)
    
    return {
        "client_id": client_id,
        "predicted_income": pred_rub,
        "offer": offer,
        "client_info": {
            "age": int(features_dict.get('age', 0)) if pd.notna(features_dict.get('age')) else 0,
            "region": str(features_dict.get('adminarea', 'Unknown')),
            "official_salary": features_dict.get('dp_ils_avg_salary_1y')
        }
    }
