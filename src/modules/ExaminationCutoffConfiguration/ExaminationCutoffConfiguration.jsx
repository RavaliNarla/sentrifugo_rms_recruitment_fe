import React, { useEffect, useMemo, useState } from "react";

import "../../style/css/ExaminationCutoffConfiguration.css";
import "../../style/css/CandidateVerification.css";
import "../../style/css/CandidateScreening.css";

import { useTranslation } from "react-i18next";


import { useLocation } from "react-router-dom";

import DropdownStrip from "../candidatePreview/components/DropdownStrip";

import RequisitionStrip from "../candidatePreview/components/RequisitionStrip";

import ExaminationCutoffTable from "./components/ExaminationCutoffTable";

import AddExaminationCutoffModal from "./components/AddExaminationCutoffModal";
import jobPositionApiService from "../jobPosting/services/jobPositionApiService";
import { toast } from "react-toastify";

export default function ExaminationCutoffConfiguration() {
  
  const [showModal, setShowModal] = useState(false);

  const [editingData, setEditingData] = useState(null);

  const [viewOnly, setViewOnly] = useState(false);

  /* ================= DROPDOWN STATES ================= */

  const [requisitions, setRequisitions] = useState([]);

  const [canAddConfiguration, setCanAddConfiguration] = useState(true);

  const [positions, setPositions] = useState([]);

  const [selectedRequisitionId, setSelectedRequisitionId] = useState("");

  const [selectedPositionId, setSelectedPositionId] = useState([]);

  const [loadingRequisitions, setLoadingRequisitions] = useState(false);

  const [hasExistingConfiguration, setHasExistingConfiguration] = useState(false);

  const [loadingPositions, setLoadingPositions] = useState(false);
  const [configurations, setConfigurations] = useState([]);

const { t } = useTranslation("examconfiguration");

  useEffect(() => {
    fetchRequisitions();
    //  loadConfigurations();
  }, []);

  const [statusFilter, setStatusFilter] = useState([]);

  const fetchRequisitions = async (searchText = "") => {
    try {
      setLoadingRequisitions(true);

      const res = await jobPositionApiService.getRequisitions(searchText);

      setRequisitions(res?.data || []);
    } catch (err) {
      console.error("Failed to load requisitions", err);
    } finally {
      setLoadingRequisitions(false);
    }
  };

  /* ================= FETCH POSITIONS ================= */

  const fetchPositions = async (requisitionId) => {
    try {
      setLoadingPositions(true);

      const res = await jobPositionApiService.getPositionsByReqId({
        requisitionId,
      });

      setPositions(res?.data || []);
    } catch (err) {
      console.error("Failed to load positions", err);
    } finally {
      setLoadingPositions(false);
    }
  };
  const loadConfigurations = async (
    positionIds = [],
    positionsData = positions
  ) => {
    try {
      if (!positionIds.length) {
        setConfigurations([]);

        setHasExistingConfiguration(false);

        return;
      }

      const res = await jobPositionApiService.getExamConfigurationsByPositions(
        positionIds.join(",")
      );

      const data = res?.data || [];

      /* MAP POSITION NAME */

      const mappedData = data.map((item) => {
        const matchedPosition = positionsData.find(
          (pos) =>
            String(pos.jobPositions?.positionId) === String(item.positionId)
        );

        return {
          ...item,

          positionName: matchedPosition?.masterPositions?.positionName || "",
        };
      });

      setConfigurations(mappedData);

      /* CHECK CONFIG EXISTS */

      setHasExistingConfiguration(mappedData.length > 0);

      return mappedData;
    } catch (err) {
      console.error("Failed to load configurations", err);
    }
  };

  /* ================= SEARCH ================= */

  const handleRequisitionSearch = (inputValue) => {
    fetchRequisitions(inputValue);
  };

  /* ================= REQUISITION CHANGE ================= */

  const handleRequisitionChange = async (e) => {
    const reqId = e.target.value;

    setSelectedRequisitionId(reqId);

    setSelectedPositionId([]);

    setConfigurations([]);
    setHasExistingConfiguration(false);

    if (!reqId) {
      setPositions([]);
      return;
    }

    fetchPositions(reqId);
  };



const validateExamConfiguration = async (
  positionId,
  hasConfiguration
) => {
  try {
    const res =
      await jobPositionApiService.validateExamConfiguration(positionId);

    const isAllowed = res?.data === false;

    setCanAddConfiguration(isAllowed);

    // Show toast only when:
    // 1. Interview process started (data === true)
    // 2. No exam configuration exists

    if (res?.data === true && !hasConfiguration) {
     toast.warning(t("interview_process_started"));
    }
  } catch (error) {
    console.error("Validation API failed", error);
    setCanAddConfiguration(false);
  }
};

  /* ================= POSITION CHANGE ================= */

  // const handlePositionChange = async (ids) => {
  //   const formattedIds = ids.map(String);

  //   setSelectedPositionId(formattedIds);

  //   const configs = await loadConfigurations(formattedIds);
  // };


const handlePositionChange = async (ids) => {
  const formattedIds = ids.map(String);

  setSelectedPositionId(formattedIds);

  const configs = await loadConfigurations(formattedIds);

  const hasConfiguration =
    configs && configs.length > 0;

  if (formattedIds.length > 0) {
    await validateExamConfiguration(
      formattedIds[0],
      hasConfiguration
    );
  } else {
    setCanAddConfiguration(false);
  }
};

  const selectedRequisition = requisitions.find(
    (r) => r.id === selectedRequisitionId
  );


  const normalizedRequisition = selectedRequisition
    ? {
        requisition_id: selectedRequisition.id,

        requisition_code: selectedRequisition.requisitionCode,

        requisition_title: selectedRequisition.requisitionTitle,

        registration_start_date: selectedRequisition.startDate,

        registration_end_date: selectedRequisition.endDate,
      }
    : null;
  const selectedPosition = positions
    .filter((p) =>
      selectedPositionId.includes(String(p.jobPositions?.positionId))
    )
    .map((p) => ({
      positionId: String(p.jobPositions?.positionId),

      positionName: p?.masterPositions?.positionName,
    }));

  const location = useLocation();
  const fromCandidateScreening = location.state?.fromCandidateScreening;

  useEffect(() => {
    const state = location.state;

    if (!state?.openEditModal) {
      return;
    }

    const initialize = async () => {
      const reqId = state?.requisitionId;

      const positionIds = state?.positionIds || [];

      if (!reqId) return;

      setSelectedRequisitionId(reqId);

      /* FETCH POSITIONS */

      const res = await jobPositionApiService.getPositionsByReqId({
        requisitionId: reqId,
      });

      const fetchedPositions = res?.data || [];

      setPositions(fetchedPositions);

      /* SET SELECTED POSITION */

      const formattedIds = positionIds.map(String);

      setSelectedPositionId(formattedIds);

      /* LOAD CONFIGS */

      /* LOAD CONFIGS */

      const configs =
        (await loadConfigurations(formattedIds, fetchedPositions)) || [];

      /* AUTO OPEN EDIT */

      setTimeout(() => {
        const matchedConfig = configs.find((item) =>
          formattedIds.includes(String(item.positionId))
        );

        if (matchedConfig) {
          setEditingData(matchedConfig);

          setViewOnly(false);

          setShowModal(true);
        } else {
          /* OPEN EMPTY ADD MODAL */

          setEditingData(null);

          setShowModal(true);
        }

        window.history.replaceState({}, document.title);
      }, 500);
    };

    initialize();
  }, [location.state]);

  /* ================= FILTER TABLE ================= */

  const filteredConfigurations = useMemo(() => {
    let data = [...configurations];

    /* POSITION FILTER */

    if (selectedPositionId.length) {
      data = data.filter((item) =>
        selectedPositionId.includes(String(item.positionId))
      );
    }

    /* STATUS FILTER */

    if (statusFilter.length) {
      data = data.filter((item) => statusFilter.includes(item.status));
    }

    return data;
  }, [configurations, selectedPositionId, statusFilter]);

  /* ================= PAGINATION DATA ================= */



  /* ================= EDIT ================= */

  const handleEdit = (row) => {
    setViewOnly(false);

    setEditingData(row);

    setShowModal(true);
  };
  const handleView = (row) => {
    setViewOnly(true);

    setEditingData(row);

    setShowModal(true);
  };
  const handleSuccess = async () => {
    setShowModal(false);

    setEditingData(null);

    setViewOnly(false);

    await loadConfigurations(selectedPositionId);
  };

  /* ================= UI ================= */

  return (
    <div className="container-fluid px-4 py-4 exam-config-page">
      {/* ================= PAGE TITLE ================= */}

      <div className="mb-4">
        <h2 className="exam-page-title">
  {t("written_exam_section_cutoff_configuration")}
</h2>

       <p className="exam-page-subtitle">
  {t("configure_written_exam_parameters")}
</p>
      </div>
      <div className="card mb-4 border-0 exam-top-card">
        <div className="card-body p-0">
          {/* FILTERS */}
          <div className="row g-2 align-items-end exam-filter-section">
            <DropdownStrip
              requisitions={requisitions}
              positions={positions}
              selectedRequisitionId={selectedRequisitionId}
              selectedPositionId={selectedPositionId?.[0] || ""}
              loadingRequisitions={loadingRequisitions}
              loadingPositions={loadingPositions}
              onRequisitionChange={handleRequisitionChange}
              onPositionChange={(id) => handlePositionChange(id ? [id] : [])}
              onRequisitionSearch={handleRequisitionSearch}
            />

            {/* BUTTONS */}
            <div className="col-md-6 col-12 text-md-end">
              <button
               className={`btn fs-14 ${
  hasExistingConfiguration || !canAddConfiguration
    ? "btn-secondary"
    : "text-white orange-bg"
}`}
            disabled={hasExistingConfiguration || !canAddConfiguration}
                onClick={() => {
                  /* REQUISITION VALIDATION */

                  if (!selectedRequisitionId) {
  toast.warning(t("please_select_requisition_first"));

                    return;
                  }

                  /* POSITION VALIDATION */

                  if (!selectedPositionId.length) {
    toast.warning(t("please_select_position_first"));

                    return;
                  }

                  setViewOnly(false);

                  setEditingData(null);

                  setShowModal(true);
                }}
              >
               + {t("add_configuration")}
              </button>
            </div>
          </div>

          {/* STRIP */}
          <div className="exam-strip-section">
            {normalizedRequisition && selectedPosition?.length > 0 && (
              <RequisitionStrip
                requisition={normalizedRequisition}
                position={selectedPosition?.[0]}
                isCardBg={false}
                isSaveEnabled={false}
                isSaveBtn={false}
                saveButton={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}

      <div className="card border-0 rounded-4 shadow-sm exam-table-card">
        {/* ================= HEADER ================= */}

        {/* ================= TABLE ================= */}

        <div className="exam-table-inner">
       <ExaminationCutoffTable
  rows={filteredConfigurations}
  onView={handleView}
  onEdit={handleEdit}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
/>
        </div>
      </div>

      {/* ================= MODAL ================= */}

      <AddExaminationCutoffModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingData(null);
          setViewOnly(false);
        }}
        editData={editingData}
        onSuccess={handleSuccess}
        viewOnly={viewOnly}
        selectedRequisition={selectedRequisition}
        selectedPosition={selectedPosition}
        fromCandidateScreening={fromCandidateScreening}
      />
    </div>
  );
}
