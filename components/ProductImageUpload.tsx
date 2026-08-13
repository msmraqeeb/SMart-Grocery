import React, { useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { api } from '../lib/api';

const ProductImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const authenticator = async () => {
    try {
      const response = await fetch('/api/imagekit-auth');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error: any) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const onSuccess = async (res: any) => {
    setUploading(false);
    const imageUrl = res.url; 
    
    try {
      await api.post('/products', {
        name: 'New Product',
        image_url: imageUrl,
        price: 0
      });
      alert("Image uploaded and saved successfully!");
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const onError = (err: any) => {
    setUploading(false);
    console.error("Upload Error:", err);
    alert("Image upload failed!");
  };

  const onUploadStart = () => {
    setUploading(true);
  };

  return (
    <div>
      <h2>Upload Product Image</h2>
      <IKContext 
        publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as any} 
        urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as any} 
        authenticator={authenticator}
      >
        <IKUpload
          fileName="product-image.jpg"
          tags={["ecommerce", "product"]}
          useUniqueFileName={true}
          onUploadStart={onUploadStart}
          onError={onError}
          onSuccess={onSuccess}
          accept="image/*"
        />
      </IKContext>
      {uploading && <p>Uploading to ImageKit...</p>}
    </div>
  );
};

export default ProductImageUpload;