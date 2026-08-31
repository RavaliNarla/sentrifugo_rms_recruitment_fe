import React, { useEffect, useMemo, useState } from "react";
import "../../style/css/CandidateVerification.css";
import "../../style/css/CandidateScreening.css";
import "../../style/css/InterviewerSchedule.css";
import "react-datepicker/dist/react-datepicker.css";

import DatePicker from "react-datepicker";
import { addDays, subDays } from "date-fns";
import { toast } from "react-toastify";

import searchIcon from "../../assets/search-icon.png";

import RequisitionStrip from "../candidatePreview/components/RequisitionStrip";
import InterviewerPositionSelector from "../candidatePreview/components/InterviewerPositionSelector";
import InterviewerService from "./service/InterviewerService";
import PdfViewerModal from "../candidatePreview/components/PdfViewerModal";

import masterApiService from "../master/services/masterApiService";
import InterviewDayTable from "./components/InterviewDayTable";
import { mapPanelPositions } from "./mapper/InterviewerScheduleMapper";
import { mapInterviewerCandidates } from "./mapper/InterviewerScheduleMapper";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCalendar } from "react-icons/fi";
import { Modal } from "react-bootstrap";
import InterviewerImportModal from "./components/InterviewerImportModal";

/* ================= SCREEN ================= */

export default function InterviewerSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchText, setSearchText] = useState("");

  const [masterData, setMasterData] = useState(null);
  const [allCandidatesRaw, setAllCandidatesRaw] = useState([]);
  const [rows, setRows] = useState([]);

  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [panelPositions, setPanelPositions] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);

  const { t } = useTranslation("interviewDay");

  /* ===== Pagination ===== */

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  /* ===== PDF ===== */

  const location = useLocation();
  const navState = location.state || {};

  const cameFromPreviewBack =
    sessionStorage.getItem("fromPreviewBack") === "true";

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  /* ================= LOAD MASTERS ================= */

  useEffect(() => {
    masterApiService
      .getMasterDisplayAll()
      .then((res) => setMasterData(res.data || {}))
      .catch(() => setMasterData({}));
  }, []);

  useEffect(() => {
    if (navState.page !== undefined) {
      setPage(navState.page);
    }

    if (navState.pageSize) {
      setPageSize(navState.pageSize);
    }
  }, [navState]);

  useEffect(() => {
    if (
      sessionStorage.getItem("fromPreviewBack") === "true" &&
      navState.selectedDate
    ) {
      setSelectedDate(new Date(navState.selectedDate));
    } else {
      //  Always reset to today on refresh / normal load
      setSelectedDate(new Date());
    }
  }, []);

  /* ================= LOAD CANDIDATES ================= */
  useEffect(() => {
    InterviewerService.getPanelPositions()
      .then((res) => {
        const mapped = mapPanelPositions(res.data || []);
        setPanelPositions(mapped);
      })
      .catch(() => toast.error(t("failed_load_panel_positions")));
  }, []);

  useEffect(() => {
    if (!cameFromPreviewBack) return;
    if (!navState.preloadedCandidates?.length) return;
    if (!selectedPosition) return; //  IMPORTANT

    setAllCandidatesRaw(navState.preloadedCandidates);

    const mapped = mapInterviewerCandidates(navState.preloadedCandidates);
    setRows(mapped);
    setOriginalRows(mapped.map((r) => ({ ...r })));
  }, [selectedPosition]);

  const formatApiDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    //  ADD THIS BLOCK
    if (
      cameFromPreviewBack &&
      navState.preloadedCandidates?.length &&
      selectedPosition
    ) {
      return;
    }

    const posId = selectedPosition?.position?.positionId;

    if (!posId) {
      setRows([]);
      setAllCandidatesRaw([]);
      setPage(0);
      return;
    }

    const load = async () => {
      try {
        const dateStr = formatApiDate(selectedDate || new Date());

        const res = await InterviewerService.getCandidatesByPositionAndDate(
          posId,
          dateStr
        );

        const apiList = res.data || [];

        setAllCandidatesRaw(apiList);

        const mapped = mapInterviewerCandidates(apiList);
        setRows(mapped);
        setOriginalRows(mapped.map((r) => ({ ...r })));
      } catch (err) {
        console.error("Load interviewer candidates failed", err);
        setRows([]);
        setAllCandidatesRaw([]);
      }
    };

    load();
  }, [selectedPosition, selectedDate]);

  useEffect(() => {
    if (!cameFromPreviewBack) return;
    if (!navState.requisition || !navState.position) return;

    const normalizedReq = {
      ...navState.requisition,
      startDate:
        navState.requisition.startDate ??
        navState.requisition.registration_start_date,
      endDate:
        navState.requisition.endDate ??
        navState.requisition.registration_end_date,
    };

    const restored = {
      requisition: normalizedReq,
      position: navState.position,
      masterPosition: {
        positionName: navState.position.positionName,
      },
    };

    //  SET POSITION FIRST
    setSelectedRequisition(restored);
    setSelectedPosition(restored);
  }, [cameFromPreviewBack]);

  useEffect(() => {
    if (cameFromPreviewBack && navState.page !== undefined && rows.length > 0) {
      setPage(navState.page);

      //  NOW clear flag safely
      sessionStorage.removeItem("fromPreviewBack");
    }
  }, [rows]);
  const filteredRows = useMemo(() => {
    const text = searchText.toLowerCase();

    if (!text) return rows;

    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(text) ||
        r.regNo.toLowerCase().includes(text)
    );
  }, [rows, searchText]);

  useEffect(() => {
    if (!selectedPosition) {
      setRows([]);
      setAllCandidatesRaw([]);
      setPage(0);
    }
  }, [selectedPosition]);

  /* ================= PAGINATION ================= */

  const paginatedRows = useMemo(() => {
    const start = page * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  useEffect(() => {
    if (!cameFromPreviewBack) {
      setPage(0);
    }
  }, [filteredRows.length]);

  const toggleAbsent = (id) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const newAbsent = !r.absent;

        return {
          ...r,
          absent: newAbsent,
          score: newAbsent ? "" : r.score, // clear score when absent
        };
      })
    );

  const updateComment = (id, val) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, comment: val } : r))
    );

  const updateScore = (id, val) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, score: val } : r))
    );
  const handleViewFile = async (raw) => {
    if (!raw?.resumeUrl) return toast.error(t("no_document_available"));

    try {
      setLoadingPdf(true);
      const sas = await masterApiService.getAzureBlobSasUrl(
        raw.resumeUrl,
        "candidate"
      );
      setPdfUrl(sas?.trim());
      setShowPdfViewer(true);
    } catch {
      toast.error(t("failed_open_document"));
    } finally {
      setLoadingPdf(false);
    }
  };

  const isRowChanged = (r) => {
    const orig = originalRows.find((o) => o.id === r.id);
    if (!orig) return true;

    return (
      orig.absent !== r.absent ||
      (orig.comment || "") !== (r.comment || "") ||
      Number(orig.score || 0) !== Number(r.score || 0)
    );
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      const changedRows = rows.filter(isRowChanged);

      if (!changedRows.length) {
        toast.info(t("no_changes_to_save"));
        return;
      }
      const payloads = changedRows.map((r) => {
        const raw = r.raw;

        return {
          applicationId: raw.applicationId,
          scheduledInterviewId: raw.interviewScheduleId,
          candidateId: raw.candidateId,
          panelId: raw.panelId,

          //  SCORE NOT MANDATORY
          panelScore: r.absent
            ? null
            : r.score === "" || r.score === null || r.score === undefined
              ? null
              : Number(r.score),

          panelComments: r.comment || "",
          interviewCenterId: raw.interviewCenterId,
          isAbsent: !!r.absent,
        };
      });

      await InterviewerService.setCandidateScoreBatch(payloads);

      toast.success(t("saved_candidates", { count: payloads.length }));

      setOriginalRows(rows.map((r) => ({ ...r })));
    } catch (err) {
      console.error(" SAVE SCORE ERROR:", err);
      toast.error(t("save_failed"));
    }
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const anyChanged = rows.some(isRowChanged);

  const isSelectionDone = selectedRequisition && selectedPosition;

  const DatePill = React.forwardRef(({ value, onClick }, ref) => (
    <div className="date-pill" onClick={onClick} ref={ref}>
      {value}
      <span className="calendar-icon">
        <FiCalendar />
      </span>
    </div>
  ));

  /* ================= UI ================= */

  return (
    <div className="container-fluid px-4 py-3 candidate-verification-page">
      {/* ===== DATE + SEARCH TOOLBAR ===== */}

      <div className="verification-toolbar">
        <div className="date-nav">
          <span
            className="nav-arrow"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
          >
            ‹
          </span>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setIsCalendarOpen(false);
            }}
            open={isCalendarOpen}
            onClickOutside={() => setIsCalendarOpen(false)}
            onInputClick={() => setIsCalendarOpen(true)}
            dateFormat="dd MMMM yyyy"
            customInput={<DatePill />}
            maxDate={new Date()}
            /*  Month + Year Dropdown */
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            yearDropdownItemNumber={15}
            scrollableYearDropdown
          />

          <span
            className="nav-arrow"
            onClick={() => {
              const next = addDays(selectedDate, 1);
              if (next <= new Date()) setSelectedDate(next);
            }}
          >
            ›
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="search-box">
            <img src={searchIcon} width={15} alt="" />
            <input
              placeholder={t("search_placeholder")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* {isSelectionDone && (
  <Button
    onClick={() => setShowImportModal(true)}
    className="add-panels-btn d-flex align-items-center gap-2"
  >
    <FiUpload />
    {t("import_data")}
  </Button>
)} */}
        </div>
      </div>
      <div className="requisition-selector-row">
        <InterviewerPositionSelector
          apiData={panelPositions}
          selectedRequisition={selectedRequisition}
          selectedPosition={selectedPosition}
          onRequisitionChange={(r) => {
            setSelectedRequisition(r);
            setSelectedPosition(null);
          }}
          onPositionChange={(p) => {
            setSelectedPosition(p);
          }}
          closeCalendar={() => setIsCalendarOpen(false)}
          //showImportBtn={isSelectionDone}
          showImportBtn={isSelectionDone && allCandidatesRaw.length > 0}
          onImportClick={() => setShowImportModal(true)}
        />
      </div>

      {/* ===== STRIP — SAME AS VERIFICATION ===== */}

      {isSelectionDone && (
        <div className="requisition-strip">
          <RequisitionStrip
            requisition={{
              requisitionTitle:
                selectedRequisition?.requisition?.requisitionTitle,
              requisitionCode:
                selectedRequisition?.requisition?.requisitionCode,

              registration_start_date:
                selectedRequisition?.requisition?.startDate ??
                selectedRequisition?.requisition?.registration_start_date,

              registration_end_date:
                selectedRequisition?.requisition?.endDate ??
                selectedRequisition?.requisition?.registration_end_date,
            }}
            position={{
              positionId: selectedPosition?.position?.positionId,
              positionName: selectedPosition?.masterPosition?.positionName,
            }}
            isCardBg={false}
            isSaveEnabled={anyChanged}
            onSave={handleSave}
            isSaveBtn={true}
            //            showImportBtn={isSelectionDone}
            // onImportClick={() => setShowImportModal(true)}
          />
        </div>
      )}

      {/* ===== TABLE ===== */}

      <InterviewDayTable
        rows={paginatedRows}
        totalElements={filteredRows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        toggleAbsent={toggleAbsent}
        updateComment={updateComment}
        updateScore={updateScore}
        onViewFile={handleViewFile}
        requisition={{
          requisitionTitle: selectedRequisition?.requisition?.requisitionTitle,
          requisitionCode: selectedRequisition?.requisition?.requisitionCode,
          registration_start_date: selectedRequisition?.requisition?.startDate,
          registration_end_date: selectedRequisition?.requisition?.endDate,
        }}
        position={{
          positionId: selectedPosition?.position?.positionId,
          positionName: selectedPosition?.masterPosition?.positionName,
        }}
        selectedDate={selectedDate}
        allCandidatesRaw={allCandidatesRaw}
      />

      {/* ===== PDF VIEWER ===== */}

      <PdfViewerModal
        show={showPdfViewer}
        onHide={() => {
          setShowPdfViewer(false);
          setPdfUrl(null);
        }}
        fileUrl={pdfUrl}
        loading={loadingPdf}
        title={t("candidate_resume")}
      />

      <Modal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="header-title">{t("import_data")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <InterviewerImportModal
            onClose={() => setShowImportModal(false)}
            onSuccess={async () => {
              setShowImportModal(false);

              try {
                const res = await InterviewerService.getPanelPositions();

                const mapped = mapPanelPositions(res.data || []);
                setPanelPositions(mapped);

                // 🔥 OPTIONAL (recommended)
                // reload candidates also
                if (selectedPosition?.position?.positionId) {
                  const dateStr = formatApiDate(selectedDate);

                  const candRes =
                    await InterviewerService.getCandidatesByPositionAndDate(
                      selectedPosition.position.positionId,
                      dateStr
                    );

                  const mappedRows = mapInterviewerCandidates(
                    candRes.data || []
                  );
                  setRows(mappedRows);
                  setOriginalRows(mappedRows.map((r) => ({ ...r })));
                }
              } catch (err) {
                console.error("Refresh failed", err);
                toast.error("Failed to refresh data");
              }
            }}
            positionId={selectedPosition?.position?.positionId}
            selectedDate={selectedDate}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}
