export interface QCIssue {
  type: "error" | "warning" | "suggestion";
  title: string;
  description: string;
  codeSnippet?: string;
  fix?: string;
}

export interface QCResult {
  summary: string;
  score: number; // 0-100
  issues: QCIssue[];
  suggestedOptimizations: string[];
}

export async function analysisCode(code: string): Promise<QCResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    let errorMsg = 'Analysis failed due to a server error.';
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

