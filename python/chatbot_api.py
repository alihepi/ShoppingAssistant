from flask import Flask, request, jsonify
from flask_cors import CORS
import requests  # POST isteği göndermek için requests modülünü ekleyelim
from chatbot import EnhancedProductSearchEngine

app = Flask(__name__)
CORS(app)  # CORS izinlerini ekleyerek çapraz alan isteklerine izin ver

chatbot = EnhancedProductSearchEngine('www.hepsiburada.com_products.json')

# "/api/chatbot/" sonundaki "/" ile gelen POST isteklerini doğru URL'ye yönlendirelim
@app.route('/api/chatbot/', methods=['POST'])
def chatbot_redirect():
    # /api/chatbot/ POST isteği için /api/chatbot'a POST isteği gönderelim
    response = requests.post('http://localhost:5025/api/chatbot', json=request.json)
    return jsonify(response.json()), response.status_code

@app.route('/api/chatbot', methods=['POST'])
def chatbot_query():
    data = request.json
    query = data.get("query")
    
    if not query:
        return jsonify({"error": "Query parameter is missing!"}), 400

    # Güvenlik kontrolü
    is_safe, message = chatbot._check_safety(query)
    if not is_safe:
        return jsonify({"error": message}), 400

    # Ürün araması
    product, score, match_details = chatbot.find_best_matching_product(query)
    if product and score > 0.3:
        response = chatbot._generate_response(query, product, match_details)
        return jsonify({"response": response, "product": product, "score": score})

    return jsonify({"error": "No matching product found."}), 404

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5025)
