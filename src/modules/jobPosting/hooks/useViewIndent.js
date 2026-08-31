import { useCallback } from "react";
import masterApiService from "../../master/services/masterApiService";

export default function useViewIndent(existingIndentPath) {
  const viewIndent = useCallback(async () => {
    if (!existingIndentPath) {
      console.error("No indent path provided", existingIndentPath);
      return;
    }

    try {
      const response =
        await masterApiService.getAzureBlobSasUrl(existingIndentPath);
      const sasUrl = response;

      if (!sasUrl) {
        console.error("SAS URL not returned");
        return;
      }

      window.open(sasUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to fetch SAS URL", err);
    }
  }, [existingIndentPath]);

  return viewIndent;
}
