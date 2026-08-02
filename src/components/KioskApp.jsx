'use client'
import { useKioskStore }     from '../store/kioskStore'
import { useIdleTimeout }    from '../hooks/useIdleTimeout'
import BootScreen            from '../screens/BootScreen'
import ProvisionScreen       from '../screens/ProvisionScreen'
import IdleScreen            from '../screens/IdleScreen'
import CatalogScreen         from '../screens/CatalogScreen'
import CartScreen            from '../screens/CartScreen'
import UpiPaymentScreen      from '../screens/UpiPaymentScreen'
import CashPaymentScreen     from '../screens/CashPaymentScreen'
import SuccessScreen         from '../screens/SuccessScreen'
import FailedScreen          from '../screens/FailedScreen'
import ErrorScreen           from '../screens/ErrorScreen'

const SCREENS = {
  boot:      BootScreen,
  provision: ProvisionScreen,
  idle:      IdleScreen,
  catalog:   CatalogScreen,
  cart:      CartScreen,
  upi:       UpiPaymentScreen,
  cash:      CashPaymentScreen,
  success:   SuccessScreen,
  failed:    FailedScreen,
  error:     ErrorScreen,
}

export default function KioskApp() {
  const currentScreen = useKioskStore(s => s.currentScreen)
  useIdleTimeout()

  const Screen = SCREENS[currentScreen] ?? ErrorScreen

  return (
    <div id="kiosk-root">
      <Screen />
    </div>
  )
}
