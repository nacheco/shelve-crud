import React, { useRef, useState, useEffect } from 'react';
import { Camera } from 'react-camera-pro';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReactCameraProps {
  onCapture: (image: string) => void;
}

const ReactCamera: React.FC<ReactCameraProps> = ({ onCapture }) => {
  const camera = useRef<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setCameraPermission(false);
        setError('Camera permission denied. Please allow camera access and refresh the page.');
      }
    };

    requestCameraPermission();
  }, []);

  const capturePhoto = () => {
    try {
      if (camera.current) {
        const imageSrc = camera.current.takePhoto();
        setImage(imageSrc);
        onCapture(imageSrc);
        setError(null);
      } else {
        throw new Error('Camera is not initialized');
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo. Please try again.');
    }
  };

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div className="flex flex-col items-center relative w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="w-full h-[300px] border-2 border-gray-300 rounded-lg relative overflow-hidden mb-4">
        {cameraPermission === true && isCameraOn && (
          <Camera ref={camera} errorMessages={{ noCameraAccessible: 'Camera not accessible', permissionDenied: 'Camera permission denied', switchCamera: 'Failed to switch camera', canvas: 'Canvas error' }} />
        )}
        {(!cameraPermission || !isCameraOn) && (
          <div className="flex justify-center items-center h-full bg-gray-200 text-gray-600">
            {cameraPermission === false ? 'Camera access is required. Please allow camera access in your browser settings and refresh the page.' : 'Camera is off'}
          </div>
        )}
      </div>
      <div className="absolute top-8 right-8 z-10 bg-white p-2 rounded-full shadow-md">
        <div className="flex items-center space-x-2">
          <Switch
            id="camera-toggle"
            checked={isCameraOn}
            onCheckedChange={handleCameraToggle}
          />
          <Label htmlFor="camera-toggle" className="text-gray-700 font-semibold">Camera</Label>
        </div>
      </div>
      <Button 
        onClick={capturePhoto} 
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        disabled={!cameraPermission || !isCameraOn}
      >
        Capture Photo
      </Button>
      {error && (
        <p className="mt-2 text-red-500 font-medium">
          {error}
        </p>
      )}
      {image && (
        <div className="mt-4 border-2 border-gray-300 rounded-lg overflow-hidden">
          <img src={image} alt="Captured" className="max-w-full" />
        </div>
      )}
    </div>
  );
};

export default ReactCamera;
