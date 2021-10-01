const http = require('http'); //Package de node permettant la création d'un serveur
const app = require('./app'); // Importe le fichier app.js

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}; //Renvoi un port valide, soit un numéro, soit une chaîne de caractères

const port = normalizePort(process.env.PORT || '3000'); // Utilise le port de la variable d'environnement du serveur par défaut sinon on utilise port 3000
app.set('port', port); //Ajoute le port retourné à l'application

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
}; //Recherche les différentes erreurs et les gère de manière appropriée puis enregistrée dans le serveur

const server = http.createServer(app); //Création du serveur avec pour agument la fonction "app"

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port); //Ecouteur d'évènements consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console
