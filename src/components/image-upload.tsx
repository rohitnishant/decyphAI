'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Camera,
  ClipboardList,
  FileText,
  Package,
  XCircle,
  FileIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (
    fileData: string | File,
    type: 'product' | 'medical' | 'prescription',
    medicalType?: 'blood' | 'ecg' | 'xray' | 'mri'
  ) => void;
  isLoading: boolean;
}

export default function ImageUpload({ onImageUpload, isLoading }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'product' | 'medical' | 'prescription'>('product');
  const [medicalReportType, setMedicalReportType] = useState<'blood' | 'ecg' | 'xray' | 'mri'>('blood');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
    toast({
      title: 'Selection Cleared',
      description: 'The selected file or captured image has been removed.',
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image or PDF file.',
          variant: 'destructive',
        });
        clearSelection();
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }

      if (isCameraOpen) stopCamera();
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile && selectedFile.type.startsWith('image/') && previewUrl) {
      onImageUpload(previewUrl, analysisType, analysisType === 'medical' ? medicalReportType : undefined);
    } else if (selectedFile?.type === 'application/pdf') {
      onImageUpload(selectedFile, analysisType, analysisType === 'medical' ? medicalReportType : undefined);
    } else if (previewUrl) {
      onImageUpload(previewUrl, analysisType, analysisType === 'medical' ? medicalReportType : undefined);
    } else {
      toast({
        title: 'No File Selected',
        description: 'Please upload or capture an image/PDF first.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setHasCameraPermission(false);
      }
    };
    if (hasCameraPermission === null) getCameraPermission();
  }, [hasCameraPermission]);

  const startCamera = async () => {
    if (hasCameraPermission === false) {
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
      return;
    }

    clearSelection();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      toast({
        title: 'Camera Error',
        description: 'Could not access the camera.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setPreviewUrl(dataUri);
        setSelectedFile(null);
        toast({ title: 'Image Captured', description: 'Image captured successfully.' });
      } else {
        toast({ title: 'Capture Failed', description: 'Could not capture image.', variant: 'destructive' });
      }
      stopCamera();
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-4">
          <div>
            <Label htmlFor="analysis-type">Select Analysis Type</Label>
            <Select
              value={analysisType}
              onValueChange={(value) => setAnalysisType(value as any)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product"><Package className="inline-block w-4 h-4 mr-2 text-indigo-600" /> Product Label / Ingredients</SelectItem>
                <SelectItem value="prescription"><ClipboardList className="inline-block w-4 h-4 mr-2 text-indigo-600" /> Prescription</SelectItem>
                <SelectItem value="medical"><FileText className="inline-block w-4 h-4 mr-2 text-indigo-600" /> Medical Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === 'medical' && (
            <div>
              <Label htmlFor="medical-report-type">Medical Report Type</Label>
              <Select
                value={medicalReportType}
                onValueChange={(value) => setMedicalReportType(value as any)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select report type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood Report</SelectItem>
                  <SelectItem value="ecg">ECG</SelectItem>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
              disabled={isLoading || isCameraOpen}
            />
            <Button
              variant="outline"
              className="flex-1"
              onClick={isCameraOpen ? stopCamera : startCamera}
              disabled={isLoading || hasCameraPermission === null || analysisType !== 'product'}
            >
              <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Close Camera' : 'Scan with Camera'}
            </Button>
          </div>

          {(selectedFile || previewUrl) && !isCameraOpen && (
            <div>
              <Label className="block mb-2">Selected:</Label>
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                <div className="flex items-center gap-3 min-w-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-16 w-16 object-contain rounded-md border" />
                  ) : (
                    selectedFile?.type === 'application/pdf' && (
                      <FileIcon className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                    )
                  )}
                  <span className="text-sm font-medium truncate">{selectedFile?.name || 'Captured Image'}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={clearSelection} disabled={isLoading} aria-label="Remove Selection">
                  <XCircle className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyzeClick}
            className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:brightness-110 transition-all duration-300 text-lg font-semibold py-5 rounded-xl shadow-md"
            disabled={isLoading || (!selectedFile && !previewUrl)}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Now'}
          </Button>
        </div>
      </div>
  );

}
