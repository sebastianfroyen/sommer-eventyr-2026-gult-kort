interface FailImageModalProps {
  failImage: string;
  onClose: () => void;
}

export function FailImageModal({ failImage, onClose }: FailImageModalProps) {
  return (
    <div className="cam-fail-dialog-backdrop" onClick={onClose}>
      <div className="cam-fail-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="cam-fail-dialog-title">Slik så du ut da du bommet 🫵👆</p>
        <img src={failImage} alt="Feilbilde" className="cam-fail-dialog-img" />
        <button className="cam-fail-dialog-close" onClick={onClose}>
          Prøv igjen 💪
        </button>
      </div>
    </div>
  );
}
