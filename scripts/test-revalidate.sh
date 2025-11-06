#!/bin/bash

# Test script for revalidation route using curl
# Usage: ./scripts/test-revalidate.sh [base-url] [secret]

set -e

# Configuration
BASE_URL=${1:-"http://localhost:3000"}
SECRET=${2:-$CONTENTFUL_REVALIDATE_SECRET}

if [ -z "$SECRET" ]; then
    echo "❌ Error: CONTENTFUL_REVALIDATE_SECRET not provided"
    echo "Usage: ./scripts/test-revalidate.sh [base-url] [secret]"
    echo "Or set CONTENTFUL_REVALIDATE_SECRET environment variable"
    exit 1
fi

echo "🚀 Testing revalidation route..."
echo "Base URL: $BASE_URL"
echo "Secret: ***${SECRET: -4}"
echo ""

# Test 1: GET request (manual testing)
echo "🧪 Test 1: GET request"
echo "------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    "$BASE_URL/api/revalidate?secret=$SECRET&path=/")

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" -eq 200 ]; then
    echo "✅ GET request test passed"
else
    echo "❌ GET request test failed"
fi
echo ""

# Test 2: POST request with Bearer token
echo "🧪 Test 2: POST request with Bearer token"
echo "-----------------------------------------"
payload='{
  "sys": {
    "id": "test-entry-id",
    "type": "Entry",
    "contentType": {
      "sys": {
        "id": "Page"
      }
    }
  },
  "fields": {
    "slug": {
      "en-US": "test-page"
    },
    "title": {
      "en-US": "Test Page"
    }
  }
}'

response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SECRET" \
    -d "$payload" \
    "$BASE_URL/api/revalidate")

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" -eq 200 ]; then
    echo "✅ POST request with Bearer test passed"
else
    echo "❌ POST request with Bearer test failed"
fi
echo ""

# Test 2b: POST request with direct token (no Bearer)
echo "🧪 Test 2b: POST request with direct token (no Bearer)"
echo "-----------------------------------------------------"
payload2='{
  "sys": {
    "id": "test-entry-id-2",
    "type": "Entry",
    "contentType": {
      "sys": {
        "id": "Page"
      }
    }
  },
  "fields": {
    "slug": {
      "en-US": "test-page-2"
    },
    "title": {
      "en-US": "Test Page 2"
    }
  }
}'

response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $SECRET" \
    -d "$payload2" \
    "$BASE_URL/api/revalidate")

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" -eq 200 ]; then
    echo "✅ POST request with direct token test passed"
else
    echo "❌ POST request with direct token test failed"
fi
echo ""

# Test 3: Security test (unauthorized)
echo "🧪 Test 3: Security test (unauthorized)"
echo "--------------------------------------"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$BASE_URL/api/revalidate")

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" -eq 401 ]; then
    echo "✅ Security test passed - unauthorized request rejected"
else
    echo "❌ Security test failed - unauthorized request was accepted"
fi
echo ""

# Test 4: Different content types
echo "🧪 Test 4: Different content types"
echo "----------------------------------"

content_types=("Page:about" "PageList:products" "Post:test-post" "Product:test-product" "Header:main-header")

for item in "${content_types[@]}"; do
    IFS=':' read -r type slug <<< "$item"
    echo "Testing $type content type..."
    
    payload="{
      \"sys\": {
        \"id\": \"test-${type,,}-id\",
        \"type\": \"Entry\",
        \"contentType\": {
          \"sys\": {
            \"id\": \"$type\"
          }
        }
      },
      \"fields\": {
        \"slug\": {
          \"en-US\": \"$slug\"
        }
      }
    }"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SECRET" \
        -d "$payload" \
        "$BASE_URL/api/revalidate")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo "  ✅ $type test passed"
        # Extract paths and tags from response if possible
        paths=$(echo "$body" | grep -o '"paths":\[[^]]*\]' || echo "")
        tags=$(echo "$body" | grep -o '"tags":\[[^]]*\]' || echo "")
        if [ ! -z "$paths" ]; then
            echo "     Revalidated paths: $paths"
        fi
        if [ ! -z "$tags" ]; then
            echo "     Revalidated tags: $tags"
        fi
    else
        echo "  ❌ $type test failed (Status: $http_code)"
    fi
done

echo ""
echo "🎉 Revalidation route tests completed!"
echo "Check the logs above to verify all tests passed."
