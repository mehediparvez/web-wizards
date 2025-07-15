#!/usr/bin/env python3
"""
Test script to verify chatbot functionality after fixes
"""

import requests
import json
import time
import sys


def test_health():
    """Test chatbot health endpoint"""
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False


def test_symptoms():
    """Test symptoms endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/symptoms', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and len(data.get('symptoms', [])) > 0:
                print(f"✅ Symptoms endpoint working ({len(data['symptoms'])} symptoms)")
                return True
            else:
                print("❌ Symptoms endpoint returned empty data")
                return False
        else:
            print(f"❌ Symptoms endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Symptoms endpoint failed: {e}")
        return False


def test_chat():
    """Test chat endpoint"""
    try:
        payload = {"message": "Hello, I have a headache"}
        response = requests.post(
            'http://localhost:5000/api/chat',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Chat endpoint working")
                return True
            else:
                print(f"❌ Chat endpoint failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat endpoint failed: {e}")
        return False


def test_prediction():
    """Test prediction endpoint"""
    try:
        payload = {"symptoms": ["headache", "fever"]}
        response = requests.post(
            'http://localhost:5000/api/predict',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Prediction endpoint working")
                print(f"   Predicted: {data.get('prediction', {}).get('disease', 'Unknown')}")
                return True
            else:
                print(f"❌ Prediction endpoint failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Prediction endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction endpoint failed: {e}")
        return False


def main():
    """Main test function"""
    print("🧪 Testing Chatbot Service")
    print("==========================")
    
    print("\n⏳ Waiting for service to be ready...")
    time.sleep(5)
    
    # Run all tests
    tests = [
        ("Health Check", test_health),
        ("Symptoms API", test_symptoms),
        ("Chat API", test_chat),
        ("Prediction API", test_prediction),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n📊 Test Results:")
    print("================")
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n📈 {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("\n🎉 All tests passed! Chatbot service is working correctly.")
        print("🌐 You can now access the chatbot at: http://localhost:5173/chatbot")
    else:
        print("\n⚠️  Some tests failed. Check the logs:")
        print("   docker-compose logs chatbot")
        sys.exit(1)


if __name__ == "__main__":
    main()
