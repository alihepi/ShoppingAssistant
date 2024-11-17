import json
import sys
from pathlib import Path
from difflib import SequenceMatcher
from typing import Dict, List, Any, Tuple
import re
from datetime import datetime
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline

class ProductSearchEngine:
    def __init__(self, json_path: str):
        """Initialize the base search engine"""
        self.products = self._load_json(json_path)
        self.products = self._filter_valid_products(self.products)
        self.all_features = self._extract_all_features()

    def _load_json(self, json_path: str) -> List[Dict]:
        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except Exception as e:
            print(f"Hata: JSON dosyası yüklenemedi: {e}")
            sys.exit(1)

    def _is_valid_product(self, product: Dict) -> bool:
        if "@type" in product and product["@type"] in ["BreadcrumbList", "WebSite", "Organization"]:
            return False
        
        required_fields = ["name", "price", "url"]
        has_required_fields = all(field in product for field in required_fields)
        
        if "price" in product:
            price = str(product["price"]).strip()
            is_valid_price = price not in ["TL", "", "0", "0.0", "0,0"]
        else:
            is_valid_price = False
            
        if "name" in product:
            name = str(product["name"]).strip().lower()
            is_category = any(category in name for category in [
                "modelleri", "fiyatları", "markaları", "kategorisi", 
                "çeşitleri", "ürünleri", "en ucuz"
            ])
        else:
            is_category = True

        return has_required_fields and is_valid_price and not is_category

    def _filter_valid_products(self, products: List[Dict]) -> List[Dict]:
        return [product for product in products if self._is_valid_product(product)]

    def _extract_all_features(self) -> Dict[str, set]:
        features = {}
        for product in self.products:
            for key, value in product.items():
                if key not in features:
                    features[key] = set()
                features[key].add(str(value))
        return features

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        text1, text2 = str(text1).lower(), str(text2).lower()
        return SequenceMatcher(None, text1, text2).ratio()

    def _tokenize_query(self, query: str) -> List[str]:
        return query.lower().split()

    def _parse_user_query(self, query: str) -> Dict[str, str]:
        tokens = self._tokenize_query(query)
        parsed_features = {}
        
        for feature_name in self.all_features.keys():
            feature_tokens = feature_name.lower().split()
            
            for i, token in enumerate(tokens):
                for feature_token in feature_tokens:
                    if self._calculate_similarity(token, feature_token) > 0.8:
                        value = []
                        j = i + 1
                        while j < len(tokens) and tokens[j] not in [t.lower() for t in self.all_features.keys()]:
                            value.append(tokens[j])
                            j += 1
                        if value:
                            parsed_features[feature_name] = ' '.join(value)
                        break

        return parsed_features

    def find_best_matching_product(self, query: str) -> Tuple[Dict, float, Dict[str, Any]]:
        parsed_query = self._parse_user_query(query)
        best_match = None
        best_score = 0
        match_details = {
            "exact_match": False,
            "missing_features": [],
            "different_features": {}
        }
        
        if not parsed_query:
            query_tokens = set(self._tokenize_query(query))
            
            for product in self.products:
                product_text = ' '.join(str(v) for v in product.values()).lower()
                product_tokens = set(self._tokenize_query(product_text))
                
                matching_tokens = len(query_tokens.intersection(product_tokens))
                if matching_tokens > 0:
                    score = matching_tokens / len(query_tokens)
                    if score > best_score:
                        best_score = score
                        best_match = product
                        match_details["exact_match"] = score > 0.9
        else:
            for product in self.products:
                score = 0
                matches = 0
                current_differences = {}
                
                for query_feature, query_value in parsed_query.items():
                    if query_feature in product:
                        similarity = self._calculate_similarity(
                            str(product[query_feature]),
                            str(query_value)
                        )
                        score += similarity
                        matches += 1
                        
                        if similarity < 1.0:
                            current_differences[query_feature] = {
                                "aradığınız": query_value,
                                "mevcut": product[query_feature]
                            }
                    else:
                        match_details["missing_features"].append(query_feature)
                
                if matches > 0:
                    avg_score = score / matches
                    if avg_score > best_score:
                        best_score = avg_score
                        best_match = product
                        match_details["different_features"] = current_differences
                        match_details["exact_match"] = avg_score > 0.9
                    
        return best_match, best_score, match_details

    def _format_product_output(self, product: Dict) -> Dict:
        important_fields = ['name', 'price', 'brand', 'url']
        formatted_product = {}
        
        for field in important_fields:
            if field in product:
                formatted_product[field] = product[field]
        
        if 'features' in product:
            formatted_product['features'] = product['features']
                
        return formatted_product

    def _format_difference_message(self, match_details: Dict[str, Any]) -> str:
        messages = []
        
        if match_details["missing_features"]:
            features = ", ".join(match_details["missing_features"])
            messages.append(f"Aradığınız '{features}' özelliği bulunamadı.")
            
        if match_details["different_features"]:
            messages.append("Farklılıklar:")
            for feature, diff in match_details["different_features"].items():
                messages.append(f"- {feature}: Aradığınız: {diff['aradığınız']}, Mevcut: {diff['mevcut']}")
                
        return "\n".join(messages)

class EnhancedProductSearchEngine(ProductSearchEngine):
    def __init__(self, json_path: str):
        """
        Initialize the enhanced search engine with additional NLP capabilities
        """
        super().__init__(json_path)
        
        # Yeni NLP ve güvenlik özellikleri
        self.conversation_history = []
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Güvenlik kontrolleri için listeler
        self.blocked_words = self._load_blocked_words()
        self.suspicious_patterns = self._load_suspicious_patterns()
        self.max_conversation_length = 50
        self.user_trust_score = 1.0
        
        # Context yönetimi
        self.current_context = {
            "last_query": None,
            "last_results": None,
            "user_preferences": {},
            "session_start": datetime.now()
        }

    def _load_blocked_words(self) -> set:
        return {
            "hack", "exploit", "attack", "vulnerability", "malware",
            "spam", "scam", "phishing", "illegal", "threat",
            # Türkçe yasaklı kelimeler
            "saldırı", "tehdit", "yasadışı", "dolandırıcılık", "zarar"
        }

    def _load_suspicious_patterns(self) -> List[str]:
        return [
            r"(\d{16})",  # Kredi kartı numarası
            r"(\d{11})",  # TC kimlik no
            r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})",  # Email
            r"((?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])",  # IP
        ]

    def _check_safety(self, text: str) -> Tuple[bool, str]:
        # Yasaklı kelime kontrolü
        words = set(word.lower() for word in word_tokenize(text))
        if words.intersection(self.blocked_words):
            return False, "Yasaklı kelime tespit edildi."
        
        # Şüpheli pattern kontrolü
        for pattern in self.suspicious_patterns:
            if re.search(pattern, text):
                return False, "Hassas bilgi tespit edildi."
        
        # Duygu analizi
        sentiment = self.sentiment_analyzer.polarity_scores(text)
        if sentiment['compound'] < -0.5:  # Çok negatif
            return False, "Uygunsuz içerik tespit edildi."
            
        return True, "Güvenli"

    def _update_context(self, query: str, results: Any = None):
        self.current_context["last_query"] = query
        self.current_context["last_results"] = results
        
        # Kullanıcı tercihlerini çıkar
        tokens = word_tokenize(query.lower())
        for token in tokens:
            if token in self.all_features:
                self.current_context["user_preferences"][token] = True

    def _analyze_intent(self, query: str) -> Dict[str, float]:
        intents = {
            "search": 0.0,
            "compare": 0.0,
            "info": 0.0,
            "buy": 0.0
        }
        
        search_keywords = {"ara", "bul", "göster", "var", "mı"}
        compare_keywords = {"karşılaştır", "fark", "kıyasla", "benzer"}
        info_keywords = {"anlat", "açıkla", "bilgi", "özellik"}
        buy_keywords = {"satın", "al", "sipariş", "fiyat"}
        
        words = set(word.lower() for word in word_tokenize(query))
        
        for word in words:
            if word in search_keywords:
                intents["search"] += 0.3
            if word in compare_keywords:
                intents["compare"] += 0.3
            if word in info_keywords:
                intents["info"] += 0.3
            if word in buy_keywords:
                intents["buy"] += 0.3
                
        return intents

    def _generate_response(self, query: str, product: Dict, match_details: Dict) -> str:
        intents = self._analyze_intent(query)
        primary_intent = max(intents.items(), key=lambda x: x[1])[0]
        
        responses = []
        
        if match_details["exact_match"]:
            responses.append(f"Aradığınız ürünü buldum:")
        else:
            responses.append("Size benzer bir ürün önerebilirim:")
            
        if primary_intent == "info":
            if "description" in product:
                responses.append(f"\nÜrün detayları: {product['description']}")
        elif primary_intent == "compare":
            responses.append("\nBenzer ürünlerle karşılaştırma yapabilirim. İster misiniz?")
        elif primary_intent == "buy":
            responses.append(f"\nGüncel fiyat: {product['price']}")
            responses.append("Satın alma işlemi için ürün sayfasını ziyaret edebilirsiniz.")
            
        if self.current_context["user_preferences"]:
            responses.append("\nTercihlerinize göre başka önerilerim de var.")
            
        return "\n".join(responses)

    def interactive_search(self):
        print("Gelişmiş Ürün Arama Sistemine Hoş Geldiniz!")
        print("Çıkmak için 'q' yazın.")
        
        while True:
            query = input("\nNe aramak istersiniz?: ")
            
            if query.lower() == 'q':
                break
                
            # Güvenlik kontrolü
            is_safe, message = self._check_safety(query)
            if not is_safe:
                print(f"\nUyarı: {message}")
                continue
                
            # Arama ve yanıt oluşturma
            product, score, match_details = self.find_best_matching_product(query)
            
            if product and score > 0.3:
                # Bağlam güncelleme
                self._update_context(query, product)
                
                # Yanıt oluşturma
                response = self._generate_response(query, product, match_details)
                print("\n" + response)
                
                # Ürün detayları
                formatted_product = self._format_product_output(product)
                print("-" * 50)
                for key, value in formatted_product.items():
                    print(f"{key}: {value}")
                print(f"\nEşleşme oranı: {score:.2%}")
                
                # Conversation history güncelleme
                self.conversation_history.append({
                    "timestamp": datetime.now(),
                    "query": query,
                    "response": response,
                    "product": product["name"] if product else None
                })
                
            else:
                print("\nÜzgünüm, aramanızla eşleşen bir ürün bulunamadı.")
                print("Lütfen farklı özelliklerle tekrar deneyin.")
                
            if len(self.conversation_history) > self.max_conversation_length:
                self.conversation_history = self.conversation_history[-self.max_conversation_length:]

def main():
    """
    Ana program - Doğrudan dosya yolu ile çalışan versiyon
    """
    try:
        # Dosya belirt
        json_path = "www.hepsiburada.com_products.json"
        
        if not Path(json_path).exists():
            print(f"Hata: {json_path} dosyası bulunamadı.")
            sys.exit(1)
            
        print(f"'{json_path}' dosyası yükleniyor...")
        search_engine = EnhancedProductSearchEngine(json_path)
        search_engine.interactive_search()
        
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()