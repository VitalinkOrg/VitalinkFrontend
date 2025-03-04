export default function useReserva() {

  const reserva = useState('reserva', () => [{
    open: false,
    step: 1
  }])


  return {
    reserva
  }
}