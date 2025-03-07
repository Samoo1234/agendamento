"""
Script simples para testar o webhook do WhatsApp

Este script:
1. Verifica se o webhook está online
2. Testa a verificação do webhook
3. Envia uma mensagem de teste

Autor: Samoel Duarte
Data: 01/03/2025
"""

import requests
import json
from datetime import datetime

# Configurações
WEBHOOK_URL = "https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook"
VERIFY_TOKEN = "oticadavi2024"  # Token de verificação correto
WHATSAPP_TOKEN = "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD"
WHATSAPP_PHONE_ID = "576714648854724"

def verificar_webhook():
    """Verifica se o webhook está online e responde corretamente"""
    print("\n=== VERIFICANDO WEBHOOK DO WHATSAPP ===")
    print(f"Data e hora: {datetime.now().strftime('%d/%m/%Y, %H:%M:%S')}")
    print(f"URL do webhook: {WEBHOOK_URL}")
    print(f"Token de verificação: {VERIFY_TOKEN}")
    
    print("\n1. Verificando se o webhook está online...")
    try:
        response = requests.get(WEBHOOK_URL, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
        
        if response.status_code == 200 or response.status_code == 403:
            print("Webhook está online!")
        else:
            print("Webhook não está respondendo corretamente.")
            return False
    except Exception as e:
        print(f"Erro ao verificar se o webhook está online: {str(e)}")
        return False
    
    print("\n2. Testando verificação (simulando Facebook)...")
    try:
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": VERIFY_TOKEN,
            "hub.challenge": "CHALLENGE_ACCEPTED"
        }
        
        response = requests.get(WEBHOOK_URL, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
        
        if response.status_code == 200 and response.text == "CHALLENGE_ACCEPTED":
            print("Verificação do webhook bem-sucedida!")
        else:
            print("Verificação do webhook falhou.")
            return False
    except Exception as e:
        print(f"Erro ao testar verificação: {str(e)}")
        return False
    
    print("\n3. Testando o endpoint POST com uma mensagem simples...")
    try:
        # Criar payload simulando uma mensagem do WhatsApp
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "123456789",
                    "changes": [
                        {
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {
                                    "display_phone_number": "5566996151550",
                                    "phone_number_id": WHATSAPP_PHONE_ID
                                },
                                "contacts": [
                                    {
                                        "profile": {
                                            "name": "Teste Python"
                                        },
                                        "wa_id": "5566999161540"
                                    }
                                ],
                                "messages": [
                                    {
                                        "from": "5566999161540",
                                        "id": f"wamid.test{datetime.now().timestamp()}",
                                        "timestamp": int(datetime.now().timestamp()),
                                        "text": {
                                            "body": "Teste de mensagem do Python"
                                        },
                                        "type": "text"
                                    }
                                ]
                            },
                            "field": "messages"
                        }
                    ]
                }
            ]
        }
        
        # Enviar para o webhook
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
        
        if response.status_code == 200:
            print("Teste POST bem-sucedido!")
            return True
        else:
            print(f"Teste POST falhou com status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Erro ao testar POST: {str(e)}")
        return False

def enviar_mensagem_whatsapp(telefone, texto):
    """Envia uma mensagem via WhatsApp API"""
    print(f"\n=== ENVIANDO MENSAGEM VIA WHATSAPP ===")
    print(f"Telefone: {telefone}")
    print(f"Mensagem: {texto}")
    
    try:
        url = f"https://graph.facebook.com/v21.0/{WHATSAPP_PHONE_ID}/messages"
        
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": telefone,
            "type": "text",
            "text": {"body": texto}
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Lança exceção para erros HTTP
        
        resposta_json = response.json()
        print(f"Resposta da API: {json.dumps(resposta_json, indent=2)}")
        print(f"Mensagem enviada com sucesso para {telefone}!")
        
        return True
    
    except Exception as e:
        print(f"Erro ao enviar mensagem para {telefone}: {str(e)}")
        
        if hasattr(e, 'response') and e.response:
            print(f"Detalhes do erro da API: status={e.response.status_code}, texto={e.response.text}")
        
        return False

if __name__ == "__main__":
    print("=== TESTE DE WEBHOOK DO WHATSAPP ===")
    print(f"Data e hora: {datetime.now().strftime('%d/%m/%Y, %H:%M:%S')}")
    
    # Verificar webhook
    verificar_webhook()
    
    # Perguntar se deseja enviar uma mensagem direta
    resposta = input("\nDeseja enviar uma mensagem direta via WhatsApp? (s/n): ")
    
    if resposta.lower() == "s":
        telefone = input("Digite o número de telefone (com DDD, sem +55): ")
        if not telefone.startswith("55"):
            telefone = "55" + telefone
            
        mensagem = input("Digite a mensagem a ser enviada: ")
        
        enviar_mensagem_whatsapp(telefone, mensagem)
    
    print("\n=== TESTE CONCLUÍDO ===")
