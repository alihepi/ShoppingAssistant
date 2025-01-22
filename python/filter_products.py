import json

def filter_product_entries(json_data):
    # Ürün bilgilerini içeren girişleri filtrelemek için bir fonksiyon
    def is_product_entry(entry):
        # 'features' anahtarı varsa ve boş değilse bu bir ürün girişidir
        return 'features' in entry and entry['features'] is not None and len(entry['features']) > 0

    # JSON verilerinden yalnızca ürün girişlerini filtrele
    product_entries = list(filter(is_product_entry, json_data))
    
    return product_entries

# JSON dosyasını oku
with open('www.hepsiburada.com_products.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Ürün girişlerini filtrele
filtered_products = filter_product_entries(data)

# Filtrelenmiş ürünleri yeni bir JSON dosyasına kaydet
with open('filtered_products.json', 'w', encoding='utf-8') as output_file:
    json.dump(filtered_products, output_file, ensure_ascii=False, indent=4)

print(f"Toplam {len(filtered_products)} ürün bulundu ve filtered_products.json dosyasına kaydedildi.")