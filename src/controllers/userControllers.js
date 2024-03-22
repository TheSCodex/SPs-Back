import connection from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "leann.pfeffer@ethereal.email",
    pass: "wj6wWWAxhaPUSxjTFH",
  },
});

function generateRecoveryCode() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return code;
}

// Controlador para enviar el correo de recuperación de contraseña (POST)
export const sendPasswordRecoveryCode = (req, res) => {
  const { userEmail } = req.body;

  connection.query(
    "SELECT id FROM users WHERE email = ?",
    [userEmail],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const resetCode = generateRecoveryCode(); // Genera un nuevo código
      const userId = results[0].id;

      connection.query(
        "UPDATE users SET recoveryCode = ? WHERE id = ?",
        [resetCode, userId],
        (updateCodeErr, updateCodeResults) => {
          if (updateCodeErr) {
            console.error(updateCodeErr);
            return res.status(500).json({ message: "Error Interno" });
          }

          const mailOptions = {
            from: process.env.GKAN,
            to: userEmail,
            subject: "Recuperación de Contraseña",
            html: `<!DOCTYPE html>
            <html lang="en" >
            <head>
              <meta charset="UTF-8">
              <title>CodePen - OTP Email Template</title>
              
            
            </head>
            <body>
            <!-- partial:index.partial.html -->
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Smart Parking System</a>
                </div>
                <p style="font-size:1.1em">Hola,</p>
                <p>Gracias por escoger SPs. Usa el siguiente código para reestablecer tu contraseña</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${resetCode}</h2>
                <p style="font-size:0.9em;">Saludos,<br />SPs</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                </div>
              </div>
            </div>
            <!-- partial -->
              
            </body>
            </html>`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              return res.status(500).json({
                message:
                  "Error al enviar el correo electrónico de recuperación",
              });
            }
            console.log(
              `Correo electrónico de recuperación enviado: ${info.response}`
            );
            res
              .status(200)
              .json({ message: "Correo de recuperación enviado con éxito" });
          });
        }
      );
    }
  );
};

// Controlador para validar el código (POST)
export const validateRecoveryCode = (req, res) => {
  const { email, recoveryCode } = req.body;
  console.log("Email:", email);
  console.log("Recovery Code:", recoveryCode);

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Correo electrónico o nombre de usuario incorrectos",
        });
      }
      const user = results[0];
      const storedRecoveryCode = user.recoveryCode;
      const concatenatedRecoveryCode = parseInt(recoveryCode.join(""), 10);

      if (concatenatedRecoveryCode === storedRecoveryCode) {
        res
          .status(200)
          .json({ message: "Código de recuperación válido", email });
      } else {
        return res
          .status(400)
          .json({ message: "Código de recuperación incorrecto" });
      }
    }
  );
};

// Controlador para recuperar la contraseña (PATCH)
export const resetPassword = (req, res) => {
  const { email, newPassword } = req.body;
  console.log("Email en resetPassword:", email);

  const saltRounds = 10;
  bcrypt.hash(newPassword, saltRounds, (hashErr, hash) => {
    if (hashErr) {
      console.error(hashErr);
      return res.status(500).json({ message: "Error Interno" });
    }
    connection.query(
      "UPDATE users SET password = ?, recoveryCode = NULL WHERE email = ?",
      [hash, email],
      (updateErr, updateResults) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ message: "Error Interno" });
        }
        res
          .status(200)
          .json({ message: "Contraseña restablecida exitosamente" });
      }
    );
  });
};

function generateAuthToken(user) {
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    "clave_secreta",
    {
      expiresIn: "1h",
    }
  );

  return token;
}

// Controlador para recibir todos los usuarios (GET)
export const getAllUsers = (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }
    res.status(200).json(results);
  });
};

// Controlador para recibir un solo usuario (GET)
export const getUserById = (req, res) => {
  const userId = req.params.id;

  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User no encontrado" });
      }

      res.status(200).json(results[0]);
    }
  );
};

// Controlador para crear un nuevo usuario (POST)
export const createUser = (req, res) => {
  const { userName, email, password } = req.body;
  // Generar un salt  para agregar seguridad
  const saltRounds = 10; // Número de rondas de hashing
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error Interno" });
    }
    connection.query(
      "INSERT INTO users (userName, email, password) VALUES (?, ?, ?)",
      [userName, email, hash],
      (dbErr, results) => {
        if (dbErr) {
          console.error(dbErr);
          return res.status(500).json({ message: "Error Interno" });
        }

        res.status(201).json({ message: "Usuario creado exitosamente" });
      }
    );
  });
};

// Controlador para editar un usuario (PUT)
export const updateUser = (req, res) => {
  const userId = req.params.id;
  const { userName, email, password, name } = req.body;

  connection.query(
    "UPDATE users SET userName = ?, email = ?, password = ?, name = ? WHERE id = ?",
    [userName, email, password, name, userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      res.status(200).json({ message: "Usuario modificado exitosamente" });
    }
  );
};

// Controlador para eliminar un usuario (DELETE)
export const deleteUser = (req, res) => {
  const userId = req.params.id;

  connection.query(
    "DELETE FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    }
  );
};

//Controlador para Login (POST)
export const loginUser = (req, res) => {
  const { email, password } = req.body;
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Interno" });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
      const user = results[0];

      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error(bcryptErr);
          return res.status(500).json({ message: "Error Interno" });
        }
        if (!isMatch) {
          return res.status(401).json({ message: "Credenciales incorrectas" });
        }
        const token = generateAuthToken(user);
        res.status(200).json({ token, user });
      });
    }
  );
};
