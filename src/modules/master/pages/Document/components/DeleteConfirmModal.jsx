import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
const DeleteConfirmModal = ({ show, onHide, onConfirm, target }) => {
  const { t } = useTranslation(["position"]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("documents:confirm_delete")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{t("documents:delete_msg")}</p>
        {target && (
          <div className="delete-confirm-user">
            <strong>{target.name}</strong>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t("documents:cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t("documents:delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
