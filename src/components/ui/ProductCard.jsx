import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <Link to={`/product/${product.id}`} className="block">
            <article className="bg-bg-card rounded-std shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-hover group h-full">
                <div className="w-full aspect-square overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 font-heading">{product.title}</h3>
                    <p className="text-xl font-bold text-brand-secondary mb-3">{product.price}</p>
                    <div className="flex items-center gap-2.5">
                        <img
                            src={product.artist.avatar}
                            alt={product.artist.name}
                            className="w-[30px] h-[30px] rounded-full object-cover"
                        />
                        <span className="text-sm text-text-light">{product.artist.name}</span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default ProductCard;
