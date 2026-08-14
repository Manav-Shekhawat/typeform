import json
import urllib.request
import urllib.error

url = "http://127.0.0.1:8000/api/v1/public/forms/form-mktypm/responses"

payloads = [
    # 1. only required
    {"answers": [
        {"question_id": "25500946-0558-47f2-a444-feed46dca855", "value": "java"},
        {"question_id": "11de81fa-fd0f-4052-86dd-31a495ac7701", "value": "test@test.com"}
    ]},
    # 2. empty answers array
    {"answers": []},
    # 3. YES_NO value true
    {"answers": [
        {"question_id": "25500946-0558-47f2-a444-feed46dca855", "value": "java"},
        {"question_id": "89a336f7-c4c5-47e4-9f43-e2b25f98c862", "value": True},
        {"question_id": "11de81fa-fd0f-4052-86dd-31a495ac7701", "value": "test@test.com"}
    ]},
    # 4. YES_NO value false
    {"answers": [
        {"question_id": "25500946-0558-47f2-a444-feed46dca855", "value": "java"},
        {"question_id": "89a336f7-c4c5-47e4-9f43-e2b25f98c862", "value": False},
        {"question_id": "11de81fa-fd0f-4052-86dd-31a495ac7701", "value": "test@test.com"}
    ]},
    # 5. YES_NO as string "false"
    {"answers": [
        {"question_id": "25500946-0558-47f2-a444-feed46dca855", "value": "java"},
        {"question_id": "89a336f7-c4c5-47e4-9f43-e2b25f98c862", "value": "false"},
        {"question_id": "11de81fa-fd0f-4052-86dd-31a495ac7701", "value": "test@test.com"}
    ]},
]

for p in payloads:
    req = urllib.request.Request(url, data=json.dumps(p).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        r = urllib.request.urlopen(req)
        print("Payload:", p)
        print("Status:", r.status)
        print("Response:", r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print("Payload:", p)
        print("Status:", e.code)
        print("Response:", e.read().decode('utf-8'))
    print("-" * 40)
