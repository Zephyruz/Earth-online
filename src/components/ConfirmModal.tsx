interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ title, message, onConfirm, onCancel }: Props) => (
  <div className="modal-backdrop" onMouseDown={onCancel}>
    <div className="modal confirm" onMouseDown={(event) => event.stopPropagation()}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="ghost" onClick={onCancel}>取消</button>
        <button className="danger" onClick={onConfirm}>确认</button>
      </div>
    </div>
  </div>
);
