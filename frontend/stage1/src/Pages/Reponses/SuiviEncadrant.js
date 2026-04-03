import "../../style/InternalPages.css";

function SuiviEncadrant() {
  return (
    <div className="internal-page">
      <div className="internal-shell">
        <div className="internal-header">
          <p className="internal-eyebrow">Archive</p>
          <h1 className="internal-title">Suivi encadrant archive</h1>
          <p className="internal-subtitle">
            Cette partie est conservee dans le projet mais n&apos;est plus
            visible dans l&apos;interface courante.
          </p>
        </div>
        <div className="internal-empty">
          Le suivi encadrant a ete archive et retire de la navigation.
        </div>
      </div>
    </div>
  );
}

export default SuiviEncadrant;
