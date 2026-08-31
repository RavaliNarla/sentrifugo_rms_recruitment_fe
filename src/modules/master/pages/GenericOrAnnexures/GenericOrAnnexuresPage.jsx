import React, { useRef, useEffect, useState } from "react";
import { Container, Card } from "react-bootstrap";
import FileStatusCard from "./components/UploadField";
import { useGenericOrAnnexures } from "./hooks/useGenericOrAnnexures";
import masterApiService from "../../services/masterApiService";
import bulbIcon from "../../../../assets/bulb-icon.png";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const GenericOrAnnexuresPage = () => {
  const { t } = useTranslation(["genericOrAnnexures"]);

  const { items, addItem } = useGenericOrAnnexures();
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const genericRef = useRef();
  const annexureRef = useRef();

  const genericDoc = localItems.find((i) => i.type === "Generic");
  const annexureDoc = localItems.find((i) => i.type === "Annexures");

  /* ================= UPLOAD ================= */
  const handleUpload = async (type, file) => {
  if (!file) {
    toast.error(t("no_file_selected"));
    return;
  }

  if (file.type !== "application/pdf") {
    toast.error(t("only_pdf_allowed"));
    return;
  }

  await addItem({ type, file });
};

  /* ================= VIEW ================= */
  const handleView = async (fileUrl) => {
    if (!fileUrl) return;

    try {
      const sasUrl = await masterApiService.getAzureBlobSasUrl(fileUrl);
      if (!sasUrl) {
        toast.error(t("view_failed"));
        return;
      }

      window.open(sasUrl, "_blank");
    } catch (error) {
      toast.error(t("view_failed"));
    }
  };

  /* ================= DELETE ================= */
  const handleLocalDelete = (type) => {
    try {
      setLocalItems((prev) => prev.filter((i) => i.type !== type));
     // toast.success(t("delete_success")); // ✅ SUCCESS
    } catch (error) {
      toast.error(t("delete_error")); // ❌ FAIL
    }
  };

  return (
    <Container className="mt-4" style={{ minHeight: "calc(100vh - 120px)" }}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          {/* Info Section */}
          <div className="d-flex align-items-start mb-4">
            <img
              src={bulbIcon}
              alt="Info"
              style={{
                width: "22px",
                height: "22px",
                marginRight: "8px",
                marginTop: "2px",
              }}
            />
            <p className="orange_text mb-0">{t("upload_instruction")}</p>
          </div>

          {/* Generic Upload */}
          <div className="row justify-content-center mb-4">
            <FileStatusCard
              label={t("generic")}
              required
              file={
                genericDoc
                  ? {
                      name: genericDoc.fileName,
                      url: genericDoc.fileUrl,
                    }
                  : null
              }
              ref={genericRef}
              onBrowse={() => genericRef.current.click()}
              onChange={(e) => handleUpload("Generic", e.target.files[0])}
              onView={() => handleView(genericDoc?.fileUrl)}
              onDelete={() => handleLocalDelete("Generic")}
            />
          </div>

          {/* Annexures Upload */}
          <div className="row justify-content-center mb-4">
            <FileStatusCard
              label={t("annexures")}
              required
              file={
                annexureDoc
                  ? {
                      name: annexureDoc.fileName,
                      url: annexureDoc.fileUrl,
                    }
                  : null
              }
              ref={annexureRef}
              onBrowse={() => annexureRef.current.click()}
              onChange={(e) => handleUpload("Annexures", e.target.files[0])}
              onView={() => handleView(annexureDoc?.fileUrl)}
              onDelete={() => handleLocalDelete("Annexures")}
            />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GenericOrAnnexuresPage;
