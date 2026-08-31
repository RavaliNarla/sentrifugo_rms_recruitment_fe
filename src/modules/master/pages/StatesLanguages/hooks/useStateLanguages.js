import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import masterApiService from "../../../../master/services/masterApiService";
import { validateStateLanguageForm } from "../../../../../shared/utils/stateLanguageValidations";
import { buildStateLanguageData } from "../../StatesLanguages/mappers/stateLanguageMapper";
export const useStateLanguages = () => {
  const { t } = useTranslation(["stateLanguages", "common"]);
  const [stateLangList, setStateLangList] = useState([]);
  const [states, setStates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    state: "",
    languages: [],
  });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    loadMasterData();
  }, []);
  const loadMasterData = async () => {
    try {
      const [statesRes, langRes, mapRes] = await Promise.all([
        masterApiService.getStates(),
        masterApiService.getAllLanguages(),
        masterApiService.getStateLanguages(),
      ]);
      const states = statesRes?.data || [];
      const languages = langRes?.data || [];
      const mappings = mapRes?.data || [];
      setStates(states);
      setLanguages(languages);
      const initialData = buildStateLanguageData(states, mappings, languages);
      const filteredData = initialData.filter(
        (item) => item.languageNames.length > 0
      );
      setStateLangList(filteredData);
    } catch (err) {
      console.error("API Error:", err);
    }
  };
  const handleChange = (type, payload) => {
    if (type === "state") {
      setFormData((prev) => ({
        ...prev,
        state: payload,
      }));
      setErrors((prev) => ({ ...prev, state: "" }));
    }
    if (type === "setLanguages") {
      setFormData((prev) => ({ ...prev, languages: payload }));
      setErrors((prev) => ({ ...prev, languages: "" }));
    }
  };
  const handleAddClick = () => {
    setFormData({ state: "", languages: [] });
    setErrors({});
    setIsEditMode(false);
    setIsViewing(false);
    setEditIndex(null);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setIsViewing(false);
    setEditIndex(null);
    setErrors({});
    setFormData({ state: "", languages: [] });
  };
  const saveStateLanguage = async () => {
    if (isSubmitting) return;
    const { valid, errors: newErrors } = validateStateLanguageForm(formData, {
      existing: stateLangList,
      currentId: isEditMode ? formData.state : null,
    });
    setErrors(newErrors);
    if (!valid) return;
    try {
        setIsSubmitting(true);
      const payload = {
        stateId: formData.state,
        languageIds: formData.languages,
      };
      const response = await masterApiService.saveStateLanguages(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save state languages");
      }
      toast.success(
        isEditMode
          ? t("stateLanguages:updated_success")
          : t("stateLanguages:saved_success")
      );
      await loadMasterData();
      handleCloseModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("stateLanguages:failed_save")
      );
    }
     finally {
    setIsSubmitting(false);
  }
  };
  const handleEditClick = (item, index) => {
    setFormData({
      state: item.stateId,
      languages: item.languageIds,
    });
    setErrors({});
    setIsEditMode(true);
    setIsViewing(false);
    setEditIndex(index);
    setShowModal(true);
  };
  const handleViewClick = (item) => {
    setFormData({
      state: item.stateId,
      languages: item.languageIds,
    });
    setErrors({});
    setIsEditMode(false);
    setIsViewing(true);
    setShowModal(true);
  };
  const filteredList = stateLangList.filter((item) => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;
    return (
      item.stateName?.toLowerCase().includes(search) ||
      item.languageNames.join(", ").toLowerCase().includes(search)
    );
  });
  return {
    stateLangList: filteredList,
    states,
    languages,
    showModal,
    searchTerm,
    formData,
    errors,
    isEditMode,
    isViewing,
    setSearchTerm,
    handleAddClick,
    handleCloseModal,
    saveStateLanguage,
    handleEditClick,
    handleViewClick,
    handleChange,
    isSubmitting
  };
};
