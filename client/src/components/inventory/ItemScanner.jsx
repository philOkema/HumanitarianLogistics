import React, { useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';

const ItemScanner = ({ onScan, onImageUpload }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const startScanner = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrcodeScanner.render((decodedText) => {
      onScan(decodedText);
      stopScanner();
    }, (error) => {
      console.warn(`QR code scanning failed: ${error}`);
    });

    setScanner(html5QrcodeScanner);
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size should be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={isScanning ? stopScanner : startScanner}
          className={`px-4 py-2 rounded-lg ${
            isScanning
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isScanning ? 'Stop Scanner' : 'Start Scanner'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {isScanning && (
        <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
      )}
    </div>
  );
};

export default ItemScanner; 