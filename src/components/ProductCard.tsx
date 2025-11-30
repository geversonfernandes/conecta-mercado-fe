import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const img = product.images?.[0]?.url || "/placeholder.png";

  return (
    <Card className="overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition">
      <img
        src={img}
        alt={product.title}
        className="w-full h-48 object-cover"
      />

      <CardHeader>
        <CardTitle className="text-lg">{product.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
        <p className="text-primary font-semibold mt-2">
          R$ {Number(product.price).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;