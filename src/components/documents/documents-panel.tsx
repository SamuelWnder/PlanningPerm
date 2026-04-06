"use client";

import { useState } from "react";
import { FileText, Plus, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentEditor } from "./document-editor";
import { DOCUMENT_TYPE_LABELS } from "@/lib/feasibility/document-generator";
import type { DocumentType, FeasibilityReport } from "@/types/database";

interface Document {
  id: string;
  document_type: DocumentType;
  title: string;
  content: string;
  is_final: boolean;
  created_at: string;
}

interface Props {
  projectId: string;
  project: {
    address: string;
    lpa_name: string | null;
    project_type: string;
    property_type: string;
    is_listed: boolean;
    is_conservation_area: boolean;
    description: string;
  };
  report: FeasibilityReport | null;
  existingDocuments: Document[];
}

const AVAILABLE_DOCUMENTS: { type: DocumentType; description: string }[] = [
  {
    type: "design_access_statement",
    description: "Required for most householder applications. Explains the design rationale and how the proposal relates to its setting.",
  },
  {
    type: "planning_statement",
    description: "Sets out why the proposal complies with planning policy. Particularly useful for more complex or sensitive applications.",
  },
  {
    type: "cover_letter",
    description: "A brief letter to the planning officer introducing your application and the supporting documents.",
  },
  {
    type: "appeal_statement",
    description: "If you've been refused, this statement argues the grounds for appeal to the Planning Inspectorate.",
  },
];

export function DocumentsPanel({
  projectId,
  project,
  report,
  existingDocuments: initial,
}: Props) {
  const [documents, setDocuments] = useState<Document[]>(initial);
  const [generatingType, setGeneratingType] = useState<DocumentType | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const hasDocument = (type: DocumentType) =>
    documents.some((d) => d.document_type === type);

  const getDocument = (type: DocumentType) =>
    documents.find((d) => d.document_type === type);

  const generateDocument = async (type: DocumentType) => {
    setGeneratingType(type);
    try {
      const resp = await fetch(`/api/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          document_type: type,
        }),
      });
      if (!resp.ok) throw new Error("Generation failed");
      const doc = await resp.json();
      setDocuments((prev) => [...prev.filter((d) => d.document_type !== type), doc]);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingType(null);
    }
  };

  const saveDocument = async (docId: string, content: string) => {
    const resp = await fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (resp.ok) {
      const updated = await resp.json();
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    }
  };

  if (editingDoc) {
    return (
      <DocumentEditor
        document={editingDoc}
        onSave={async (content) => {
          await saveDocument(editingDoc.id, content);
          setEditingDoc(null);
        }}
        onBack={() => setEditingDoc(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {AVAILABLE_DOCUMENTS.map(({ type, description }) => {
        const existing = getDocument(type);
        const isGenerating = generatingType === type;

        return (
          <Card key={type}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[#1A3A2A]" />
                    {DOCUMENT_TYPE_LABELS[type]}
                    {existing?.is_final && (
                      <Badge variant="success" className="text-xs">Final</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {existing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDoc(existing)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([existing.content], { type: "text/html" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${type}.html`;
                          a.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => generateDocument(type)}
                      disabled={isGenerating}
                      className="gap-1"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {existing && (
              <CardContent>
                <div
                  className="prose prose-sm max-w-none text-[#374151] line-clamp-3 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: existing.content.slice(0, 400) + "...",
                  }}
                />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
