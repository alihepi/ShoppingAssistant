import React from 'react';

const FavoriteProduct = ({ product, index, onRemove }) => {
    const { img, name, seller, url } = product;

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-all">
            {/* Header with Image and Remove Button */}
            <div className="d-flex justify-content-center items-start mb-3">
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                    <img src={img} id='fav-prod-img-set' className="max-w-full max-h-full object-contain" alt={name} />
                </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-2">
                <h5 className="text-base font-medium text-gray-800 line-clamp-2">{name}</h5>
                <span className="text-sm text-gray-600">
                    <span className="font-medium">Satıcı:</span> {seller}
                </span>
                <br/>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-800 mt-1 inline-flex items-center"
                >
                    Ürüne Git
                    <i className="bi bi-arrow-right text-sm ml-1"></i>
                </a>
            </div>

            <button
                className="mt-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => onRemove(index)}
                title="Sil"
            >
                <i className="bi bi-trash3 text-lg"></i>
            </button>
        </div>
    );
};

export default FavoriteProduct;