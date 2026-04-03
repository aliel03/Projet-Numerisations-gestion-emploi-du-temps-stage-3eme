const MOMENT_METADATA = [
  { dayLabel: "Lundi", dayOffset: 0, time: "9:00 - 12:00" },
  { dayLabel: "Lundi", dayOffset: 0, time: "13:30 - 16:30" },
  { dayLabel: "Mardi", dayOffset: 1, time: "9:00 - 12:00" },
  { dayLabel: "Mardi", dayOffset: 1, time: "13:30 - 16:30" },
  { dayLabel: "Mercredi", dayOffset: 2, time: "9:00 - 12:00" },
  { dayLabel: "Mercredi", dayOffset: 2, time: "13:30 - 16:30" },
  { dayLabel: "Jeudi", dayOffset: 3, time: "9:00 - 12:00" },
  { dayLabel: "Jeudi", dayOffset: 3, time: "13:30 - 16:30" },
  { dayLabel: "Vendredi", dayOffset: 4, time: "9:00 - 12:00" },
  { dayLabel: "Vendredi", dayOffset: 4, time: "13:30 - 16:30" },
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normaliseFileNamePart = (value) => {
  return String(value || "parcours")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getDateLabel = (weekStart, dayOffset, dayLabel) => {
  if (!weekStart) {
    return "Pas encore repertorie";
  }

  const date = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Pas encore repertorie";
  }

  date.setDate(date.getDate() + dayOffset);

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
};

const buildRows = (activites, weekStart) => {
  return [...(activites || [])]
    .sort((left, right) => left.indexMoment - right.indexMoment)
    .map((association) => {
      const meta = MOMENT_METADATA[association.indexMoment] || {};
      const activite = association.activite || {};
      const contact = activite.professeur
        ? `${activite.professeur.prenom || ""} ${activite.professeur.nom || ""}`.trim()
        : "Pas encore repertorie";

      return {
        date: getDateLabel(weekStart, meta.dayOffset || 0, meta.dayLabel || ""),
        heure: meta.time || "Pas encore repertorie",
        activite: activite.nom || "Pas encore repertorie",
        contact,
        telephone: activite.professeur?.numero_tel || "Pas encore repertorie",
        email: activite.professeur?.email || "Pas encore repertorie",
        lieuRdv: activite.lieu_rdv || "Pas encore repertorie",
        informations: activite.description || "Pas encore repertorie",
        commentaire: activite.commentaire_admin || "",
      };
    });
};

export const downloadEleveParcoursSpreadsheet = ({
  eleve,
  tuteur,
  activites,
  weekStart,
  parcoursLabel,
}) => {
  const rows = buildRows(activites, weekStart);
  const safeFileName = normaliseFileNamePart(
    `${parcoursLabel}-${eleve?.nom || ""}-${eleve?.prenom || ""}`
  );

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Calibri, Arial, sans-serif; padding: 24px; }
          table { border-collapse: collapse; width: 100%; margin-top: 18px; }
          th, td { border: 1px solid #cfcfcf; padding: 10px; vertical-align: top; text-align: left; }
          th { background: #0c7b56; color: #ffffff; }
          .meta { margin-bottom: 18px; }
          .meta p { margin: 4px 0; }
          .title { font-size: 22px; font-weight: 700; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="meta">
          <div class="title">${escapeHtml(parcoursLabel || "Parcours")}</div>
          <p><strong>Eleve :</strong> ${escapeHtml(
            `${eleve?.prenom || ""} ${eleve?.nom || ""}`.trim()
          )}</p>
          <p><strong>Email eleve :</strong> ${escapeHtml(
            eleve?.email || "Pas encore repertorie"
          )}</p>
          <p><strong>Tuteur :</strong> ${escapeHtml(
            tuteur
              ? `${tuteur.prenom || ""} ${tuteur.nom || ""}`.trim()
              : "Pas encore repertorie"
          )}</p>
          <p><strong>Telephone tuteur :</strong> ${escapeHtml(
            tuteur?.numero_tel || "Pas encore repertorie"
          )}</p>
          <p><strong>Email tuteur :</strong> ${escapeHtml(
            tuteur?.email || "Pas encore repertorie"
          )}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Activite</th>
              <th>Contact</th>
              <th>Telephone</th>
              <th>Email</th>
              <th>Lieu rendez-vous</th>
              <th>Informations</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                    .map(
                      (row) => `
                        <tr>
                          <td>${escapeHtml(row.date)}</td>
                          <td>${escapeHtml(row.heure)}</td>
                          <td>${escapeHtml(row.activite)}</td>
                          <td>${escapeHtml(row.contact)}</td>
                          <td>${escapeHtml(row.telephone)}</td>
                          <td>${escapeHtml(row.email)}</td>
                          <td>${escapeHtml(row.lieuRdv)}</td>
                          <td>${escapeHtml(row.informations)}</td>
                          <td>${escapeHtml(row.commentaire)}</td>
                        </tr>
                      `
                    )
                    .join("")
                : `
                  <tr>
                    <td colspan="9">Aucune activite n'est encore associee a ce parcours.</td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeFileName || "parcours"}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
