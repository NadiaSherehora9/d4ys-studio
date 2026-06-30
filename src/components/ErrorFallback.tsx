import { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Щось пішло не так
          </h2>
          <p className="text-muted-foreground">
            Вибачте, сталася неочікувана помилка. Ми вже працюємо над її виправленням.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="w-full overflow-hidden rounded-lg bg-muted p-4 text-left">
            <p className="font-mono text-xs text-red-500 break-words">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        <Button 
          onClick={resetErrorBoundary} 
          className="w-full gap-2 font-semibold"
          size="lg"
        >
          <RefreshCw className="h-4 w-4" />
          Спробувати ще раз
        </Button>
      </div>
    </div>
  );
};
