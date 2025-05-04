'use client';

import { useState } from 'react';
import type {
  AnalyzeProductLabelOutput,
  AnalyzeProductLabelInput,
} from '@/ai/flows/analyze-product-label';
import { analyzeProductLabel } from '@/ai/flows/analyze-product-label';
import type {
  SummarizeMedicalReportOutput,
  SummarizeMedicalReportInput,
} from '@/ai/flows/summarize-medical-report';
import { summarizeMedicalReport } from '@/ai/flows/summarize-medical-report';
import type {
  AnalyzePrescriptionImageOutput,
  AnalyzePrescriptionImageInput,
} from '@/ai/flows/explain-prescription';
import { analyzePrescriptionImage } from '@/ai/flows/explain-prescription';

import ImageUpload from '@/components/image-upload';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fileToDataUri } from '@/lib/utils';

type AnalysisResultType =
  | AnalyzeProductLabelOutput
  | SummarizeMedicalReportOutput
  | AnalyzePrescriptionImageOutput;

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'product' | 'medical' | 'prescription' | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (
    fileData: string | File,
    type: 'product' | 'medical' | 'prescription',
    medicalType?: 'blood' | 'ecg' | 'xray' | 'mri'
  ) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisType(type);

    try {
      let result: AnalysisResultType;
      const dataUri = typeof fileData === 'string' ? fileData : await fileToDataUri(fileData);
      
      // Ensure it's a data URI
      if (!dataUri.startsWith('data:')) {
        throw new Error('Invalid file data format.');
      }
      
      const isImage = dataUri.startsWith('data:image/');
      const isPDF = dataUri.startsWith('data:application/pdf');
      
      if (!isImage && !isPDF) {
        toast({
          title: "Unsupported File",
          description: "This file type may not work as expected. Please use an image or PDF if possible.",
          variant: "destructive",
        });
        throw new Error("Only image or PDF files are supported.");
      }
      
      // Handle each analysis type
      if (type === 'product') {
        result = await analyzeProductLabel({ productLabelImage: dataUri });
      } else if (type === 'prescription') {
        result = await analyzePrescriptionImage({ prescriptionImageDataUri: dataUri });
      } else if (type === 'medical' && medicalType) {
        result = await summarizeMedicalReport({ reportImage: dataUri, reportType: medicalType });
      } else {
        throw new Error('Invalid analysis type or missing medical report type.');
      }

      if (!result) throw new Error('AI returned no result.');

      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete',
        description: `Your ${typeof fileData === 'string' ? 'image' : fileData.type} has been successfully analyzed.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(`Analysis failed: ${errorMessage}`);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
  className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 flex flex-col items-center justify-center px-4 py-10"
>
  <div className="text-center mb-8 animate-fade-in">
    <h1 className="text-6xl font-extrabold text-indigo-800 drop-shadow-md">
      decyph<span className="text-purple-500 animate-pulse">.ai</span>
    </h1>
    <p className="mt-1 text-lg font-medium italic bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%] bg-clip-text text-transparent animate-gradient animate-fade-in-delay">
          Decode the Unseen
        </p>
  </div>

  <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-slide-up">
    <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />

    {isLoading && (
      <div className="flex justify-center items-center space-x-2 text-accent mt-4 animate-fade-in">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Analyzing document...</span>
      </div>
    )}

    {error && (
      <div className="text-destructive text-center p-4 border border-destructive rounded-md bg-destructive/10 mt-4 animate-fade-in">
        {error}
      </div>
    )}

    {analysisResult && !isLoading && (
      <div className="mt-6 animate-fade-in-delay">
        <AnalysisResult result={analysisResult} analysisType={analysisType} />
      </div>
    )}
  </div>
</div>

  );
}
