export default function useReserva() {

  const reserva = useState('reserva', () => [{
    open: true,
    step: 1
  }])

  return {
    reserva
  }
}