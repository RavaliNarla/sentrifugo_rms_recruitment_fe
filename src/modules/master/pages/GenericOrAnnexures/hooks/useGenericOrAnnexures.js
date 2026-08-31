import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import masterApiService from "../../../services/masterApiService";
import { mapGenericDocsFromApi } from "../mappers/genericOrAnnexuresMapper";

export const useGenericOrAnnexures = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchItems = async () => {
    try {
      const res = await masterApiService.getAllGenericDocuments();

      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setItems(mapGenericDocsFromApi(list));
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= ADD ================= */
 
 const addItem = async (payload) => {
  try {
    setLoading(true);

    const res = await masterApiService.saveGenericDocument(
      payload.type,
      payload.file
    );

    if (res?.success === false) {
      toast.error(res.message);
      return false;
    }


    await fetchItems();

    toast.success("File uploaded successfully");
    return true;
  } catch (e) {
    console.error(e);

    toast.error(
      e?.response?.data?.message ||
      e?.message ||
      "Upload failed"
    );

    return false;
  } finally {
    setLoading(false);
  }
};


  /* ================= DELETE ================= */
  const deleteItem = async (id) => {
    try {
      await masterApiService.deleteGenericDocument(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return {
    items,
    loading,
    addItem,
    deleteItem,
  };
};
