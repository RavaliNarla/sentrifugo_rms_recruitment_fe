import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import recruiterApiService from "../core/recruiterApiService";

const getExtension = (path = "") => {
  const clean = path.split("?")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

export function useFilePreview() {
  const [show, setShow] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileExtension, setFileExtension] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Document Preview");
  const blobUrlRef = useRef(null);

  const revokeBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const close = useCallback(() => {
    setShow(false);
    setFileUrl(null);
    setFileExtension("");
    revokeBlob();
  }, []);

  const openFile = useCallback(async (relativePath, previewTitle = "Document Preview") => {
    if (!relativePath) {
      toast.error("No document available");
      return;
    }

    const extension = getExtension(relativePath);
    setLoading(true);
    setTitle(previewTitle);
    setFileExtension(extension);
    setShow(true);

    try {
      revokeBlob();
      const blobUrl = await recruiterApiService.fetchFileBlobUrl(relativePath);
      blobUrlRef.current = blobUrl;
      setFileUrl(blobUrl);
    } catch (e) {
      console.error(e);
      toast.error("Failed to open document");
      setShow(false);
      setFileExtension("");
      revokeBlob();
    } finally {
      setLoading(false);
    }
  }, []);

  return { show, fileUrl, fileExtension, loading, title, openFile, close };
}
