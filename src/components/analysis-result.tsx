'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  Download,
  Info,
  AlertTriangle,
  HeartPulse,
  Pill,
  Microscope,
  Package,
  ClipboardCheck,
  HelpCircle,
  Utensils,
  BookMarked,
  FileDown,
} from 'lucide-react';
import type { AnalyzeProductLabelOutput } from '@/ai/flows/analyze-product-label';
import type { SummarizeMedicalReportOutput } from '@/ai/flows/summarize-medical-report';
import type { AnalyzePrescriptionImageOutput } from '@/ai/flows/explain-prescription';

interface AnalysisResultProps {
  result: AnalyzeProductLabelOutput | SummarizeMedicalReportOutput | AnalyzePrescriptionImageOutput;
  analysisType: 'product' | 'medical' | 'prescription' | null;
}

const ListItem = ({ item }: { item: string }) => (
  <li className="text-sm text-muted-foreground">{item}</li>
);

const IngredientCard = ({ ingredient }: { ingredient: AnalyzeProductLabelOutput['ingredients'][number] }) => {
  
  const hasDetails =
    ingredient.description ||
    ingredient.commonUses ||
    ingredient.prosCons ||
    ingredient.sideEffectsAllergens ||
    ingredient.warningsRegulatory;

  return (
    <Card className={`mb-4 shadow-md ${!hasDetails ? 'bg-secondary/30' : ''}`}>
      <Accordion type="single" collapsible disabled={!hasDetails}>
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-6 py-4">
            <div className="flex items-center gap-2 font-medium">
              <Package className="w-4 h-4 text-accent" />
              {ingredient.name}
            </div>
          </AccordionTrigger>
          {hasDetails && (
            <AccordionContent className="px-6 pb-4 space-y-3">
              {ingredient.description && (
                <div>
                  <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Description</h4>
                  <p className="text-sm text-muted-foreground">{ingredient.description}</p>
                </div>
              )}
              {ingredient.commonUses && (
                <div>
                  <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Common Uses</h4>
                  <p className="text-sm text-muted-foreground">{ingredient.commonUses}</p>
                </div>
              )}
              {ingredient.prosCons && (
                <div>
                  <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Pros & Cons</h4>
                  <p className="text-sm text-muted-foreground">{ingredient.prosCons}</p>
                </div>
              )}
              {ingredient.sideEffectsAllergens && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Side Effects / Allergens
                  </h4>
                  <p className="text-sm text-muted-foreground">{ingredient.sideEffectsAllergens}</p>
                </div>
              )}
              {ingredient.warningsRegulatory && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Warnings / Regulatory
                  </h4>
                  <p className="text-sm text-muted-foreground">{ingredient.warningsRegulatory}</p>
                </div>
              )}
            </AccordionContent>
          )}
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

const MedicineCard = ({ medicine }: { medicine: AnalyzePrescriptionImageOutput['medicines'][number] }) => (
  <Card className="mb-4 shadow-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Pill className="w-5 h-5 text-accent" />
        {medicine.name || 'Unnamed Medicine'}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div>
        <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Description / Use</h4>
        <p className="text-sm text-muted-foreground">{medicine.description || 'Not provided'}</p>
      </div>
      <div>
        <h4 className="font-medium flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" /> Side Effects
        </h4>
        <p className="text-sm text-muted-foreground">{medicine.sideEffects || 'Not provided'}</p>
      </div>
      <div>
        <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Precautions / Warnings</h4>
        <p className="text-sm text-muted-foreground">{medicine.precautions || 'Not provided'}</p>
      </div>
    </CardContent>
  </Card>
);

const MedicalReportCard = ({ report }: { report: SummarizeMedicalReportOutput }) => (
  <Card className="mb-4 shadow-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <HeartPulse className="h-5 w-5 text-accent" />
        Medical Report Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {report.summary && <p className="text-sm text-muted-foreground italic">{report.summary}</p>}

      {report.keyFindings?.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2"><Microscope className="h-4 w-4" /> Key Findings</h4>
          <ul className="list-disc ml-5 space-y-1">
            {report.keyFindings.map((item, i) => <ListItem key={i} item={item} />)}
          </ul>
        </div>
      )}

      {report.abnormalResults?.length > 0 && (
        <div>
          <h4 className="font-medium text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Abnormal Results</h4>
          <ul className="list-disc ml-5 space-y-1">
            {report.abnormalResults.map((item, i) => <li key={i} className="text-sm text-destructive">{item}</li>)}
          </ul>
        </div>
      )}

      {report.recommendations?.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Recommendations</h4>
          <ul className="list-disc ml-5 space-y-1">
            {report.recommendations.map((item, i) => <ListItem key={i} item={item} />)}
          </ul>
        </div>
      )}

      {report.disclaimer && (
        <Alert variant="destructive" className="mt-6 bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4 !text-destructive" />
          <AlertDescription className="text-destructive">{report.disclaimer}</AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
);

export default function AnalysisResult({ result, analysisType }: AnalysisResultProps) {

  const formatContentForHtmlDownload = (result: any, analysisType: string | null): string => {
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InsightScan Analysis Report</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: auto; }
        h1, h2, h3, h4 { color: #333; }
        h1 { font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 1.5em; margin-top: 30px; }
        h3 { font-size: 1.2em; color: #555; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .card-header { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; }
        .section-title { font-weight: bold; margin-top: 10px; color: #444; }
        ul { list-style-type: disc; margin-left: 20px; }
        li { margin-bottom: 5px; }
        .disclaimer { border: 1px solid #e44; background-color: #fee; color: #a33; padding: 10px; border-radius: 5px; margin-top: 20px; font-size: 0.9em; }
        .text-muted { color: #666; }
        .text-destructive { color: #c00; }
    </style>
</head>
<body>
    <h1>InsightScan Analysis Report</h1>
    <p><strong>Type:</strong> ${analysisType || 'Unknown'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <hr>
`;

    if (analysisType === 'product' && result.ingredients) {
        htmlContent += "<h2>Ingredients Analysis</h2>";
        if (result.ingredients.length === 0) {
            htmlContent += "<p>No ingredients were identified by the AI.</p>";
        } else {
            result.ingredients.forEach((ing: AnalyzeProductLabelOutput['ingredients'][number], index: number) => {
                htmlContent += `<div class="card">`;
                htmlContent += `<div class="card-header">${index + 1}. ${ing.name}</div>`;
                if (ing.description) htmlContent += `<p><span class="section-title">Description:</span> <span class="text-muted">${ing.description}</span></p>`;
                if (ing.commonUses) htmlContent += `<p><span class="section-title">Common Uses:</span> <span class="text-muted">${ing.commonUses}</span></p>`;
                if (ing.prosCons) htmlContent += `<p><span class="section-title">Pros/Cons:</span> <span class="text-muted">${ing.prosCons}</span></p>`;
                if (ing.sideEffectsAllergens) htmlContent += `<p><span class="section-title text-destructive">Side Effects/Allergens:</span> <span class="text-muted">${ing.sideEffectsAllergens}</span></p>`;
                if (ing.warningsRegulatory) htmlContent += `<p><span class="section-title text-destructive">Warnings/Regulatory:</span> <span class="text-muted">${ing.warningsRegulatory}</span></p>`;
                 if (!ing.description && !ing.commonUses && !ing.prosCons && !ing.sideEffectsAllergens && !ing.warningsRegulatory) {
                    htmlContent += `<p class="text-muted">(Detailed information not provided by AI for this ingredient)</p>`;
                 }
                htmlContent += `</div>`;
            });
        }
         // Product-specific disclaimer
        htmlContent += `<div class="disclaimer"><strong>Disclaimer:</strong> This ingredient analysis is AI-generated for informational purposes. Verify information, especially regarding allergies or sensitivities. It is not medical or dietary advice.</div>`;

    } else if (analysisType === 'prescription' && result.medicines) {
        htmlContent += "<h2>Prescription Analysis</h2>";
         if (result.medicines.length === 0) {
            htmlContent += "<p>No medicines were identified by the AI.</p>";
        } else {
            result.medicines.forEach((med: AnalyzePrescriptionImageOutput['medicines'][number], index: number) => {
                 htmlContent += `<div class="card">`;
                 htmlContent += `<div class="card-header">${index + 1}. ${med.name}</div>`;
                 htmlContent += `<p><span class="section-title">Description/Use:</span> <span class="text-muted">${med.description || 'N/A'}</span></p>`;
                 htmlContent += `<p><span class="section-title text-destructive">Side Effects:</span> <span class="text-muted">${med.sideEffects || 'N/A'}</span></p>`;
                 htmlContent += `<p><span class="section-title">Precautions/Warnings:</span> <span class="text-muted">${med.precautions || 'N/A'}</span></p>`;
                 htmlContent += `</div>`;
            });
        }
        // Prescription-specific disclaimer
        htmlContent += `<div class="disclaimer"><strong>Disclaimer:</strong> This prescription analysis is AI-generated and may not be fully accurate or complete. It is NOT a substitute for advice from your doctor or pharmacist. Always follow your healthcare provider's instructions.</div>`;

    } else if (analysisType === 'medical' && result.summary) {
        htmlContent += `<h2>Medical Report Summary</h2>`;
        htmlContent += `<div class="card">`;
        htmlContent += `<div class="card-header">Summary</div>`;
        htmlContent += `<p class="text-muted">${result.summary}</p>`;
        htmlContent += `</div>`;


        // Function to format array items for HTML download
        const formatHtmlList = (title: string, items: string[] | undefined, emptyMessage: string, titleClass: string = ''): string => {
            let section = '';
            if (items && items.length > 0) {
                section += `<div class="card">`;
                section += `<h3 class="${titleClass}">${title}</h3><ul>`;
                items.forEach((item: string) => {
                    section += `<li><span class="text-muted">${item}</span></li>`;
                });
                section += `</ul></div>`;
            } else {
                // Optionally display a message if the section is empty, or just omit it
                 // section += `<div class="card"><h3 class="${titleClass}">${title}</h3><p class="text-muted">${emptyMessage}</p></div>`;
            }
            return section;
        }

        htmlContent += formatHtmlList("Key Findings", result.keyFindings, "None extracted by AI.");
        htmlContent += formatHtmlList("Abnormal Results", result.abnormalResults, "None highlighted by AI.", "text-destructive");
        htmlContent += formatHtmlList("Recommendations (from report)", result.recommendations, "None extracted by AI.");
        htmlContent += formatHtmlList("Possible Causes (General Info)", result.possibleCauses, "Not provided by AI.");
        htmlContent += formatHtmlList("Dietary Recommendations (General Info)", result.dietaryRecommendations, "Not provided by AI.");
        htmlContent += formatHtmlList("Common Medications (Examples, Informational Only)", result.commonMedications, "Not provided by AI.");

        // Medical report disclaimer (should exist in result.disclaimer)
        if (result.disclaimer) {
            htmlContent += `<div class="disclaimer"><strong>Disclaimer:</strong> ${result.disclaimer}</div>`;
        }

    } else {
        htmlContent += "<p>No specific analysis data was found or the analysis type is unsupported for download.</p>";
    }

     // Add a generic fallback disclaimer if one wasn't added specifically above
     if (!result.disclaimer && analysisType !== 'product' && analysisType !== 'prescription') {
         htmlContent += `<div class="disclaimer"><strong>Disclaimer:</strong> This analysis is AI-generated and for informational purposes only. It is not a substitute for professional advice. Consult with a qualified healthcare provider or expert for any health concerns or decisions.</div>`;
     }

    htmlContent += `
</body>
</html>`;
    return htmlContent;
};

const downloadHtmlContent = (content: string, filename: string) => {
  console.log("Generating HTML for:", filename);
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.html`; // Download as HTML
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};



  const handleDownload = () => {
    // Note: This generates a basic HTML structure. Applying the exact Tailwind/ShadCN styles
    // would require embedding CSS or using a library for HTML-to-image/PDF conversion.
    const content = formatContentForHtmlDownload(result, analysisType);
    const filename = `${analysisType || 'analysis'}_report_${new Date().toISOString().split('T')[0]}`;
    downloadHtmlContent(content, filename); // Use updated function name
  };
  const hasProductData = analysisType === 'product' && (result as AnalyzeProductLabelOutput).ingredients?.length > 0;
  const hasPrescriptionData = analysisType === 'prescription' && (result as AnalyzePrescriptionImageOutput).medicines?.length > 0;
  const hasMedicalData = analysisType === 'medical' && (result as SummarizeMedicalReportOutput).summary;
  const hasAnyData = hasProductData || hasPrescriptionData || hasMedicalData;

  return (
    <div id="analysis-result-section" className="w-full max-w-4xl mx-auto space-y-6">

      <h2 className="text-center text-3xl font-extrabold tracking-tight text-indigo-800 mt-8">Analysis Results</h2>

      {hasProductData &&
        (result as AnalyzeProductLabelOutput).ingredients.map((ingredient, index) => (
          <IngredientCard key={index} ingredient={ingredient} />
        ))}

      {hasPrescriptionData &&
        (result as AnalyzePrescriptionImageOutput).medicines.map((medicine, index) => (
          <MedicineCard key={index} medicine={medicine} />
        ))}

      {hasMedicalData && <MedicalReportCard report={result as SummarizeMedicalReportOutput} />}

      {!hasAnyData && (
        <div className="text-center text-muted-foreground italic">
          No results extracted by AI for this document.
        </div>
      )}

      {hasAnyData && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleDownload}>
            <FileDown className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>
      )}
    </div>
  );
}
