function iniciarCuentaRegresiva(fechaLimite, idContenedor) {
  const actualizarContador = () => {
	const ahora = new Date();
	const diferencia = new Date(fechaLimite) - ahora;

	if (diferencia <= 0) {
	  document.getElementById(idContenedor).innerHTML = "¡Evento iniciado!";
	  clearInterval(intervalo);
	  return;
	}

	const segundos = Math.floor((diferencia / 1000) % 60);
	const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
	const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
	const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
	const anos = Math.floor(dias / 365);

	// Mostrar en formato string (puedes cambiarlo para inyectar en HTML)
	document.getElementById(idContenedor).textContent = 
	  `${anos} años ${dias % 365} días ${horas} horas ${minutos} minutos ${segundos} segundos`;
  };

  // Ejecutar inmediatamente para evitar el retraso inicial de 1 segundo
  actualizarContador();
  const intervalo = setInterval(actualizarContador, 1000);
}
iniciarCuentaRegresiva('2100-01-01', 'time');