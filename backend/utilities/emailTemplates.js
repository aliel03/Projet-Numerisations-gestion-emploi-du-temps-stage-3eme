const transporter = require("../config/mailer");

//pour envoyer les identifiants de connexion
const sendPasswordEmail = (recipientEmail, password) => {
  const mailOptions = {
    from: "DigiFilles <ameladdou123@gmail.com>",
    to: recipientEmail,
    subject: "Vos identifiants pour vous connecter",
    text: `
    Bonjour voici Votre mot de passe pour vous connecter: ${password} 
    Veuillez ne pas le divulguer.
    Vous pourrez vous connecter avec le mail sur lequel vous recevait ce mail
    
    Bien à vous.
    
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Erreur lors de l'envoi de l'e-mail :", error);
    } else {
      console.log("E-mail envoyé avec succès :", info.response);
    }
  });
};

module.exports = {
  sendPasswordEmail,
};
