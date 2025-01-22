import React from 'react';

const ChatProduct = ({ productData, onAddToFavorites }) => {
    const { img, name, features, seller, url } = productData;

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
            {/* Product Header */}
            <div className="d-flex items-start p-4 gap-4 float left">
                {/* Image Container */}
                <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                    <img src={img} id='chat-prod-img-set' className="max-w-full max-h-full object-contain" alt={name} />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Satıcı:</span> {seller}
                    </p>

                    {/* Features Section */}
                    {features && (
                        <div className="">
                            <div className="bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Özellikler: </span>
                                    {features}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Footer */}
            <div className="px-4 py-4 bg-gray-50 mt-auto">
                <div className="flex gap-2 justify-end">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <span>Ürüne Git</span>
                        <i className="bi bi-arrow-right-short ml-1"></i>
                    </a>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4">
                    <button
                        onClick={() => onAddToFavorites(productData)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors"
                        title="Favorilere Ekle"
                    >
                        <i className="bi bi-star text-lg"></i>
                    </button>
                </div>
            </div>


        </div>
    );
};

export default ChatProduct;