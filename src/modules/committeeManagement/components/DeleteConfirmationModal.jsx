import { Modal, Button } from "react-bootstrap";
import pos_delete_icon from "../../../assets/pos_delete_icon.png";
import { useTranslation } from "react-i18next";

const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  itemLabel,
  loading = false,
}) => {
  const { t } = useTranslation(["common"]);
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      className="modalimport"
    >
      <Modal.Header closeButton>
        <Modal.Title className="f16 bluecol">
          {title || t("delete_title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center f14">
        <img
          src={pos_delete_icon}
          alt="delete"
          className="mb-3"
          style={{ width: 30 }}
        />
        <p className="mb-1"> {message || t("delete_message")}</p>
        {itemLabel && (
          <strong className="text-danger d-block wrap">{itemLabel}</strong>
        )}
        {/* <p className="text-muted mt-2"> {t("importModal:delete_cannot_undo")}</p> */}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
          className="f14"
        >
          {t("common:cancel")}
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
          className="f14"
        >
          {loading ? t("deleting") : t("delete_button")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
